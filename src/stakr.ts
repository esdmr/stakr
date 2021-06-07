import { DepGraph } from 'dependency-graph';
import commandMap from './commands.js';
import * as Types from './types.d';

export class ExecutionContext {
	readonly stack: Types.StackItem[] = [];
	readonly aux: Types.StackItem[] = [];
	readonly sourceMap = new Map<string, Source>();
	nextSource?: string = undefined;
	nextOffset?: number = undefined;
	halted = true;
	readonly commandMap = new Map(commandMap);

	push (...items: Types.StackItem[]) {
		this.stack.push(...items);
	}

	pop () {
		const value = this.stack.pop();

		if (value === undefined) {
			throw new RangeError('Can not pop empty stack');
		}

		return value;
	}

	assemble (sources: Set<string>) {
		const deps = new DepGraph<Source>();

		if (sources.size === 0) {
			throw new Error('Empty source list');
		}

		for (const sourceName of sources) {
			const source = this.resolveSource(sourceName);
			deps.addNode(sourceName, source);
			source.assemble();

			for (const target of source.imports) {
				sources.add(target);
			}
		}

		for (const sourceName of sources) {
			const source = deps.getNodeData(sourceName);
			source.link(this);

			for (const target of source.imports) {
				deps.addDependency(sourceName, target);
			}
		}

		return deps.overallOrder();
	}

	execute (sourceList: string[]) {
		if (sourceList.length === 0) {
			throw new Error('Empty source list');
		}

		for (const sourceName of sourceList) {
			this.nextSource = sourceName;
			this.nextOffset = 0;
			this.halted = false;

			while (!this.halted) {
				const source = this.resolveSource(this.nextSource);

				this.halted = true;
				source.execute(this, this.nextOffset);
			}
		}
	}

	addSource (source: Source) {
		if (this.sourceMap.has(source.name) &&
			this.sourceMap.get(source.name) !== source) {
			throw new Error(`The same name '${source.name}' was registered with a different source`);
		}

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
	readonly identifiers = new Map<string, Types.Definition>();
	readonly exports = new Map<string, Types.Definition>();
	readonly imports = new Set<string>();
	readonly namespaces = new Set<string>();
	isAssembled = false;
	isLinked = false;
	constructor (readonly name: string, readonly ast: Types.ASTTree) {}

	assemble () {
		if (this.isAssembled) {
			return this;
		}

		const blockStack: number[] = [];
		const arg = {
			source: this,
			blockStack,
			offset: 0,
		};

		for (const [offset, item] of this.ast.entries()) {
			arg.offset = offset;
			item.assemble?.(arg);
		}

		const lastBlock = blockStack.pop();

		if (lastBlock !== undefined) {
			throw new Error(`Extraneous start of block at ${lastBlock}`);
		}

		this.isAssembled = true;
		return this;
	}

	link (context: ExecutionContext) {
		if (!this.isAssembled) {
			throw new Error('Called link before assemble');
		}

		if (this.isLinked) {
			return this;
		}

		const arg: Types.ExecuteArg = {
			context,
			source: this,
			offset: 0,
		};

		for (const [offset, item] of this.ast.entries()) {
			arg.offset = offset;
			item.link?.(arg);
		}

		this.isLinked = true;
		return this;
	}

	execute (context: ExecutionContext, offset: number) {
		const arg: Types.ExecuteArg = {
			context,
			source: this,
			get offset () {
				return offset;
			},
			set offset (value) {
				if (!Number.isSafeInteger(value) || value < 0) {
					throw new RangeError(`'${value}' is not a valid offset.`);
				}

				offset = value;
			},
		};

		while (arg.context.halted) {
			const item = this.ast[offset++];

			if (item === undefined) {
				break;
			}

			item.execute?.(arg);
		}
	}
}
