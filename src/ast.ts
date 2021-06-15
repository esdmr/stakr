import * as commands from './commands.js';
import * as types from './types.d';

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
			throw new Error(`Identifier '${this.name}' already defined.`);
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
	constructor (readonly name: string) {}

	execute (arg: types.ExecuteArg) {
		const definition = arg.source.assemble().identifiers.get(this.name) ??
			arg.source.linkData.get(arg.context)?.identifiers.get(this.name);

		if (definition === undefined) {
			throw new Error(`Undefined identifier '${this.name}'`);
		}

		arg.data.stack.push(definition.offset);

		if (definition.sourceName !== arg.source.name) {
			arg.data.stack.push(definition.sourceName);
		}

		if (definition.implicitlyCalled) {
			commands.call_(arg);
		}
	}
}

export class BlockStart implements types.ASTNode {
	endOffset?: number;

	get offset () {
		if (this.endOffset === undefined) {
			throw new Error('Block does not have a end offset');
		}

		return this.endOffset;
	}

	assemble ({ blockStack, offset }: types.AssembleArg) {
		blockStack.push(offset);
	}

	execute ({ data }: types.ExecuteArg) {
		data.stack.push(this.offset);
	}
}

export class BlockEnd implements types.ASTNode {
	startOffset?: number;

	get offset () {
		if (this.startOffset === undefined) {
			throw new Error('Block does not have a start offset');
		}

		return this.startOffset;
	}

	assemble ({ source, blockStack, offset }: types.AssembleArg) {
		const startOffset = blockStack.pop();

		if (startOffset === undefined) {
			throw new Error(`Extraneous end of block at ${offset}`);
		}

		this.startOffset = startOffset;
		(source.ast[startOffset] as BlockStart).endOffset = offset + 1;
	}
}

export class WhileEnd extends BlockEnd implements types.ASTNode {
	execute (arg: types.ExecuteArg) {
		arg.offset = this.offset;
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
