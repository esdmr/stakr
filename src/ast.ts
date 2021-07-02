import * as commands from './commands.js';
import * as types from './types.js';

export class Literal implements types.ASTNode {
	constructor (readonly value: types.StackItem) {}

	execute ({ data }: types.ExecuteArg) {
		data.stack.push(this.value);
	}
}

export class Label implements types.ASTNode {
	constructor (readonly name: string, readonly exported: boolean) {}

	assemble ({ source, data, offset }: types.AssembleArg) {
		if (data.identifiers.has(this.name)) {
			throw new Error(`Identifier '${this.name}' already defined`);
		}

		data.identifiers.set(this.name, {
			offset,
			sourceName: source.name,
			exported: this.exported,
			implicitlyCalled: false,
		});
	}
}

export class Operator implements types.ASTNode {
	constructor (readonly name: string) {}

	execute (arg: types.ExecuteArg) {
		const operator = arg.data.commandMap.get(this.name);

		if (operator === undefined) {
			throw new Error(`Undefined operator '${this.name}'`);
		}

		operator(arg);
	}
}

export class Refer implements types.ASTNode {
	constructor (readonly name: string, readonly referOnly: boolean) {}

	execute (arg: types.ExecuteArg) {
		const definition = arg.source.assemble().identifiers.get(this.name) ??
			arg.source.linkData.get(arg.context)?.identifiers.get(this.name);

		if (definition === undefined) {
			throw new Error(`Undefined identifier '${this.name}'`);
		}

		arg.data.stack.push(definition.offset, definition.sourceName);

		if (!this.referOnly && definition.implicitlyCalled) {
			commands.call_(arg);
		}
	}
}

export class BlockStart implements types.ASTNode {
	/** @internal */
	_endOffset?: number;

	get endOffset () {
		if (this._endOffset === undefined) {
			throw new Error('Block does not have a end offset');
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

export class BlockEnd implements types.ASTNode {
	/** @internal */
	_startOffset?: number;

	get startOffset () {
		if (this._startOffset === undefined) {
			throw new Error('Block does not have a start offset');
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
			throw new TypeError('Start of block is not a BlockStart.');
		}

		// Skip BlockEnd itself
		start._endOffset = offset + 1;
	}
}

export class WhileEnd extends BlockEnd implements types.ASTNode {
	execute (arg: types.ExecuteArg) {
		arg.data.offset = this.startOffset;
	}
}

export class FunctionEnd extends BlockEnd implements types.ASTNode {
	execute (arg: types.ExecuteArg) {
		commands.return_(arg);
	}
}

export class FunctionStatement implements types.ASTNode {
	constructor (readonly name: string, readonly exported: boolean) {}

	assemble ({ source, data, offset }: types.AssembleArg) {
		if (data.identifiers.has(this.name)) {
			throw new Error(`Identifier '${this.name}' is already defined`);
		}

		data.identifiers.set(this.name, {
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

	link ({ context, data }: types.LinkArg) {
		const other = context.sourceMap.get(this.source);

		if (other === undefined) {
			throw new Error(`Undefined source '${this.source}'`);
		}

		for (const [key, value] of other.assemble().identifiers) {
			if (value.exported) {
				data.identifiers.set(`${this.namespace}:${key}`, value);
			}
		}
	}
}
