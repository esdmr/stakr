import * as commands from './stdlib/commands.js';
import type * as types from './types.js';
import * as messages from './messages.js';

/** @public */
export class Halt implements types.AstNode {
	static readonly instance = new Halt();

	execute (arg: types.ExecuteArg) {
		commands.halt(arg);
	}
}

/** @public */
export class Literal implements types.AstNode {
	constructor (readonly value: types.StackItem) {}

	execute ({ data }: types.ExecuteArg) {
		data.stack.push(this.value);
	}
}

/** @public */
export class Label implements types.AstNode {
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
export class Refer implements types.AstNode {
	constructor (readonly name: string, readonly referOnly: boolean) {}

	execute (arg: types.ExecuteArg) {
		const definition = arg.source.assemble().identifiers.get(this.name)
			?? arg.source.linkData.get(arg.context)?.identifiers.get(this.name);

		if (definition === undefined) {
			throw new Error(`Undefined identifier '${this.name}'`);
		}

		arg.data.stack.push(definition.offset, definition.sourceName);

		if (!this.referOnly && definition.implicitlyCalled) {
			commands.call(arg);
		}
	}
}

/** @public */
export class BlockStart implements types.AstNode {
	/** @internal */
	_endOffset?: number;

	get endOffset () {
		if (this._endOffset === undefined) {
			throw new Error(messages.blockStartNotInit);
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
export class BlockEnd implements types.AstNode {
	/** @internal */
	_startOffset?: number;

	get startOffset () {
		if (this._startOffset === undefined) {
			throw new Error(messages.blockEndNotInit);
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
			throw new TypeError(messages.startIsNotBlockStart);
		}

		// Skip BlockEnd itself
		start._endOffset = offset + 1;
	}
}

/** @public */
export class WhileEnd extends BlockEnd implements types.AstNode {
	execute (arg: types.ExecuteArg) {
		arg.data.offset = this.startOffset;
	}
}

/** @public */
export class FunctionEnd extends BlockEnd implements types.AstNode {
	execute (arg: types.ExecuteArg) {
		commands.return_(arg);
	}
}

/** @public */
export class FunctionStatement implements types.AstNode {
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
		commands.goto(arg);
	}
}

/** @public */
export class ImportStatement implements types.AstNode {
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
export class NativeFunction implements types.AstNode {
	static createArray (
		map: ReadonlyMap<string, types.Executable>,
	): types.AstTree {
		const ast: types.AstNode[] = [...map].map(([name, executable]) =>
			new NativeFunction(name, executable));

		ast.unshift(Halt.instance);

		return ast;
	}

	constructor (
		readonly name: string,
		readonly executable: types.Executable,
	) {}

	assemble ({ source, data, offset }: types.AssembleArg) {
		data.addIdentifier(this.name, {
			sourceName: source.name,
			offset,
			exported: true,
			implicitlyCalled: true,
		});
	}

	execute (arg: types.ExecuteArg) {
		this.executable(arg);
		commands.return_(arg);
	}
}
