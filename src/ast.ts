import * as commands from './stdlib/commands.js';
import type * as types from './types.js';

/** @internal */
export const enum _Message {
	BLOCK_START_NOT_INIT = 'Block does not have a end offset',
	BLOCK_END_NOT_INIT = 'Block does not have a start offset',
	START_IS_NOT_BLOCK_START = 'Start of block is not a BlockStart',
}

/** @public */
export class Halt implements types.ASTNode {
	static readonly instance = new Halt();

	execute (arg: types.ExecuteArg) {
		commands.halt_(arg);
	}
}

/** @public */
export class Literal implements types.ASTNode {
	constructor (readonly value: types.StackItem) {}

	execute ({ data }: types.ExecuteArg) {
		data.stack.push(this.value);
	}
}

/** @public */
export class Label implements types.ASTNode {
	constructor (readonly name: string, readonly exported: boolean) {}

	assemble ({ source, data, offset }: types.AssembleArg) {
		data.addIdentifier(this.name, {
			offset,
			sourceName: source.name,
			exported: this.exported,
			implicitlyCalled: false,
		});
	}
}

/** @public */
export class Refer implements types.ASTNode {
	constructor (readonly name: string, readonly referOnly: boolean) {}

	execute (arg: types.ExecuteArg) {
		const definition = arg.source.assemble().identifiers.get(this.name)
			?? arg.source.linkData.get(arg.context)?.identifiers.get(this.name);

		if (definition === undefined) {
			throw new Error(`Undefined identifier '${this.name}'`);
		}

		arg.data.stack.push(definition.offset, definition.sourceName);

		if (!this.referOnly && definition.implicitlyCalled) {
			commands.call_(arg);
		}
	}
}

/** @public */
export class BlockStart implements types.ASTNode {
	/** @internal */
	_endOffset?: number;

	get endOffset () {
		if (this._endOffset === undefined) {
			throw new Error(_Message.BLOCK_START_NOT_INIT);
		}

		return this._endOffset;
	}

	assemble ({ blockStack, offset }: types.AssembleArg) {
		blockStack.push(offset);
	}

	execute ({ data }: types.ExecuteArg) {
		data.stack.push(this.endOffset, data.sourceName);
	}
}

/** @public */
export class BlockEnd implements types.ASTNode {
	/** @internal */
	_startOffset?: number;

	get startOffset () {
		if (this._startOffset === undefined) {
			throw new Error(_Message.BLOCK_END_NOT_INIT);
		}

		return this._startOffset;
	}

	assemble ({ source, blockStack, offset }: types.AssembleArg) {
		const startOffset = blockStack.pop();

		if (startOffset === undefined) {
			throw new Error(`Extraneous end of block at ${offset}`);
		}

		this._startOffset = startOffset;
		const start = source.ast[startOffset];

		if (!(start instanceof BlockStart)) {
			throw new TypeError(_Message.START_IS_NOT_BLOCK_START);
		}

		// Skip BlockEnd itself
		start._endOffset = offset + 1;
	}
}

/** @public */
export class WhileEnd extends BlockEnd implements types.ASTNode {
	execute (arg: types.ExecuteArg) {
		arg.data.offset = this.startOffset;
	}
}

/** @public */
export class FunctionEnd extends BlockEnd implements types.ASTNode {
	execute (arg: types.ExecuteArg) {
		commands.return_(arg);
	}
}

/** @public */
export class FunctionStatement implements types.ASTNode {
	constructor (readonly name: string, readonly exported: boolean) {}

	assemble ({ source, data, offset }: types.AssembleArg) {
		data.addIdentifier(this.name, {
			sourceName: source.name,
			// Skip FunctionStatement itself.
			offset: offset + 1,
			exported: this.exported,
			implicitlyCalled: true,
		});
	}

	execute (arg: types.ExecuteArg) {
		commands.goto_(arg);
	}
}

/** @public */
export class ImportStatement implements types.ASTNode {
	constructor (readonly namespace: string, readonly source: string) {}

	assemble ({ data }: types.AssembleArg) {
		if (data.imports.has(this.source)) {
			throw new Error(`Source '${this.source}' already imported`);
		}

		if (data.namespaces.has(this.namespace)) {
			throw new Error(`Namespace '${this.namespace}' is already defined`);
		}

		data.imports.add(this.source);
		data.namespaces.add(this.namespace);
	}

	link ({ context, source, data }: types.LinkArg) {
		const resolved = context.loader.resolve(this.source, source.name);
		const otherSource = context.getSource(resolved);

		data.importSource(otherSource, `${this.namespace}:`);
	}
}

/** @public */
export class NativeFunction implements types.ASTNode {
	constructor (
		readonly name: string,
		readonly executable: types.Executable,
	) {}

	static createArray (
		map: ReadonlyMap<string, types.Executable>,
	): types.ASTTree {
		const ast: types.ASTNode[] = [...map].map(([name, executable]) =>
			new NativeFunction(name, executable));

		ast.unshift(Halt.instance);

		return ast;
	}

	assemble ({ source, data, offset }: types.AssembleArg) {
		data.addIdentifier(this.name, {
			sourceName: source.name,
			offset,
			exported: true,
			implicitlyCalled: true,
		});
	}

	async execute (arg: types.ExecuteArg) {
		const value = this.executable(arg);

		if (value !== undefined) {
			await value;
		}

		commands.return_(arg);
	}
}
