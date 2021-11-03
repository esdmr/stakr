import { DepGraph } from 'dependency-graph';
import type * as types from './types.js';
import SafeArray from './util/safe-array.js';
import * as messages from './messages.js';

const auxMaxLength = 1024;

/** @public */
export class AssembleData {
	readonly identifiers = new Map<string, types.Definition>();
	readonly imports = new Set<string>();
	readonly namespaces = new Set<string>();

	addIdentifier (name: string, definition: types.Definition) {
		if (this.identifiers.has(name)) {
			throw new Error(`Identifier '${name}' is already defined`);
		}

		this.identifiers.set(name, definition);
	}
}

/** @public */
export class LinkData {
	readonly identifiers = new Map<string, types.Definition>();

	importSource (otherSource: Source, prefix: string) {
		for (const [key, value] of otherSource.assemble().identifiers) {
			if (value.exported) {
				this.identifiers.set(`${prefix}${key}`, value);
			}
		}
	}
}

/** @public */
export class ExecuteData {
	readonly stack = new SafeArray<types.StackItem>();
	readonly aux = new SafeArray<types.StackItem>(auxMaxLength);
	framePointer = -1;
	sourceName = '';
	halted = true;
	private _offset = 0;

	get offset () {
		return this._offset;
	}

	set offset (value) {
		if (!Number.isSafeInteger(value) || value < 0) {
			throw new RangeError(`'${value}' is not a valid offset`);
		}

		this._offset = value;
	}
}

/** @public */
export class Source {
	readonly linkData = new WeakMap<ExecutionContext, LinkData>();
	private assembleData?: AssembleData = undefined;

	/** @internal */
	get _isAssembled () {
		return this.assembleData !== undefined;
	}

	constructor (readonly name: string, readonly ast: types.AstTree) {}

	assemble () {
		if (this.assembleData) {
			return this.assembleData;
		}

		const arg: types.Writable<types.AssembleArg> = {
			source: this,
			blockStack: [] as number[],
			data: new AssembleData(),
			offset: 0,
		};

		for (const [offset, item] of this.ast.entries()) {
			arg.offset = offset;
			item.assemble?.(arg);
		}

		const lastBlock = arg.blockStack.pop();

		if (lastBlock !== undefined) {
			throw new Error(`Extraneous start of block at ${lastBlock}`);
		}

		this.assembleData = arg.data;
		return this.assembleData;
	}

	/** @internal */
	_link (context: ExecutionContext) {
		if (this.linkData.has(context)) {
			return this.linkData.get(context);
		}

		this.assemble();

		const data = new LinkData();

		const arg: types.Writable<types.LinkArg> = {
			context,
			source: this,
			data,
			offset: 0,
		};

		for (const sourceName of context.persistentSources) {
			const otherSource = context.getSource(sourceName);

			data.importSource(otherSource, '');
		}

		for (const [offset, item] of this.ast.entries()) {
			arg.offset = offset;
			item.link?.(arg);
		}

		this.linkData.set(context, arg.data);
		return arg.data;
	}

	/** @internal */
	_execute (
		context: ExecutionContext,
		data: ExecuteData,
	) {
		const arg: types.ExecuteArg = {
			context,
			source: this,
			data,
		};

		while (!data.halted && data.sourceName === this.name) {
			const item = this.ast[data.offset++];

			if (item === undefined) {
				data.halted = true;
				break;
			}

			item.execute?.(arg);
		}
	}
}

/** @public */
export class ResolutionError extends Error {
	name = ResolutionError.name;
}

/** @public */
export class DefaultLoader implements types.Loader {
	resolve (specifier: string, parentName: string) {
		let resolved;

		if (specifier.startsWith('./') || specifier.startsWith('../')) {
			if (!parentName.startsWith('/')) {
				throw new ResolutionError(messages.loaderNoRelative);
			}

			resolved = this.resolvePath(parentName, specifier);
		} else if (specifier.startsWith('/')) {
			resolved = this.resolvePath('/', specifier);
		} else {
			// `specifier` is now a bare specifier.
			resolved = specifier;
		}

		if (/%2f|%5c/ui.test(resolved)) {
			throw new ResolutionError(messages.loaderInvalid);
		}

		return resolved;
	}

	async getSource (url: string, context: ExecutionContext) {
		return context.getSource(url);
	}

	private resolvePath (from: string, to: string) {
		return new URL(to, new URL(from, 'resolve://')).pathname;
	}
}

const defaultLoader = new DefaultLoader();

/** @public */
export class ExecutionContext {
	readonly sourceMap = new Map<string, Source>();
	readonly persistentSources: string[] = [];
	readonly loader: types.Loader;

	constructor ({ loader = defaultLoader }: { loader?: types.Loader } = {}) {
		this.loader = loader;
	}

	async link (...sources: readonly string[]) {
		const deps = new DepGraph<Source>();
		const sourceSet = new Set(sources);

		if (sourceSet.size === 0) {
			throw new Error(messages.emptySourceList);
		}

		for (const sourceName of sourceSet) {
			const source = await this.loader.getSource(sourceName, this);
			deps.addNode(sourceName, source);

			for (const target of source.assemble().imports) {
				sourceSet.add(target);
			}
		}

		for (const sourceName of sourceSet) {
			const source = deps.getNodeData(sourceName);
			source._link(this);

			for (const target of source.assemble().imports) {
				deps.addDependency(sourceName, target);
			}
		}

		return deps.overallOrder();
	}

	executeAll (sourceList: readonly string[], data: ExecuteData) {
		if (sourceList.length === 0) {
			throw new Error(messages.emptySourceList);
		}

		for (const sourceName of sourceList) {
			this.execute(sourceName, data);
		}
	}

	execute (sourceName: string, data: ExecuteData) {
		data.sourceName = sourceName;
		data.offset = 0;
		data.halted = false;

		while (!data.halted) {
			const source = this.getSource(data.sourceName);
			source._execute(this, data);
		}

		// In stakr, Assertions can happen by forcefully halting the execution.
		// The following condition will try to detect if such assertions have
		// been made. In addition, the following condition will also detect
		// missing returns in functions which have exited their boundaries.
		if (data.sourceName !== sourceName) {
			throw new Error(messages.haltedInWrongSource);
		}
	}

	addSource (source: Source) {
		if (this.sourceMap.has(source.name)
			&& this.sourceMap.get(source.name) !== source) {
			throw new Error(`The same name '${source.name}' was registered with a different source`);
		}

		source.assemble();
		this.sourceMap.set(source.name, source);
	}

	getSource (sourceName: string) {
		const source = this.sourceMap.get(sourceName);

		if (source === undefined) {
			throw new Error(`Undefined source '${sourceName}'`);
		}

		return source;
	}
}
