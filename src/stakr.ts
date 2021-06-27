import { DepGraph } from 'dependency-graph';
import commandMap from './commands.js';
import * as types from './types.js';
import SafeArray from './util/safe-array.js';

const AUX_MAX_LENGTH = 1024;

export class AssembleData {
	readonly identifiers = new Map<string, types.Definition>();
	readonly imports = new Set<string>();
	readonly namespaces = new Set<string>();
}

export class LinkData {
	readonly identifiers = new Map<string, types.Definition>();
}

export class ExecuteData {
	readonly stack = new SafeArray<types.StackItem>();
	readonly aux = new SafeArray<types.StackItem>(AUX_MAX_LENGTH);
	readonly commandMap = new Map(commandMap);
	sourceName = '';
	halted = true;
	private _offset = 0;

	get offset () {
		return this._offset;
	}

	set offset (value) {
		if (!Number.isSafeInteger(value) || value < 0) {
			throw new RangeError(`'${value}' is not a valid offset.`);
		}

		this._offset = value;
	}
}

export class ExecutionContext {
	readonly sourceMap = new Map<string, Source>();

	link (sources: Set<string>) {
		const deps = new DepGraph<Source>();

		if (sources.size === 0) {
			throw new Error('Empty source list');
		}

		for (const sourceName of sources) {
			const source = this.resolveSource(sourceName);
			deps.addNode(sourceName, source);

			for (const target of source.assemble().imports) {
				sources.add(target);
			}
		}

		for (const sourceName of sources) {
			const source = deps.getNodeData(sourceName);
			source.link(this);

			for (const target of source.assemble().imports) {
				deps.addDependency(sourceName, target);
			}
		}

		return deps.overallOrder();
	}

	execute (sourceList: string[], data: ExecuteData) {
		if (sourceList.length === 0) {
			throw new Error('Empty source list');
		}

		for (const sourceName of sourceList) {
			data.sourceName = sourceName;
			data.offset = 0;
			data.halted = false;

			while (!data.halted) {
				const source = this.resolveSource(data.sourceName);
				source.execute(this, data);
			}
		}
	}

	addSource (source: Source) {
		if (this.sourceMap.has(source.name) &&
			this.sourceMap.get(source.name) !== source) {
			throw new Error(`The same name '${source.name}' was registered with a different source`);
		}

		source.assemble();
		this.sourceMap.set(source.name, source);
	}

	resolveSource (sourceName: string) {
		const source = this.sourceMap.get(sourceName);

		if (source === undefined) {
			throw new Error(`Undefined source '${sourceName}'`);
		}

		return source;
	}
}

export class Source {
	readonly linkData = new WeakMap<ExecutionContext, LinkData>();
	private assembleData?: AssembleData = undefined;

	constructor (readonly name: string, readonly ast: types.ASTTree) {}

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

	link (context: ExecutionContext) {
		if (this.linkData.has(context)) {
			return this.linkData.get(context);
		}

		this.assemble();

		const arg: types.Writable<types.LinkArg> = {
			context,
			source: this,
			data: new LinkData(),
			offset: 0,
		};

		for (const [offset, item] of this.ast.entries()) {
			arg.offset = offset;
			item.link?.(arg);
		}

		this.linkData.set(context, arg.data);
		return arg.data;
	}

	execute (
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
