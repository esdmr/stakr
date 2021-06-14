import * as commands from './commands.js';
import * as Types from './types.d';

export class Literal implements Types.ASTNode {
	constructor (readonly value: Types.StackItem) {}

	execute ({ data }: Types.ExecuteArg) {
		data.stack.push(this.value);
	}
}

export class Label implements Types.ASTNode {
	constructor (readonly name: string, readonly exported: boolean) {}

	assemble ({ source, data, offset }: Types.AssembleArg) {
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

export class Operator implements Types.ASTNode {
	constructor (readonly name: string) {}

	execute (arg: Types.ExecuteArg) {
		const operator = arg.data.commandMap.get(this.name);

		if (operator === undefined) {
			throw new Error(`Undefined operator '${this.name}'`);
		}

		operator(arg);
	}
}

export class Refer implements Types.ASTNode {
	constructor (readonly name: string) {}

	execute (arg: Types.ExecuteArg) {
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

export class BlockStart implements Types.ASTNode {
	endOffset?: number;

	get offset () {
		if (this.endOffset === undefined) {
			throw new Error('Block does not have a end offset');
		}

		return this.endOffset;
	}

	assemble ({ blockStack, offset }: Types.AssembleArg) {
		blockStack.push(offset);
	}

	execute ({ data }: Types.ExecuteArg) {
		data.stack.push(this.offset);
	}
}

export class BlockEnd implements Types.ASTNode {
	startOffset?: number;

	get offset () {
		if (this.startOffset === undefined) {
			throw new Error('Block does not have a start offset');
		}

		return this.startOffset;
	}

	assemble ({ source, blockStack, offset }: Types.AssembleArg) {
		const startOffset = blockStack.pop();

		if (startOffset === undefined) {
			throw new Error(`Extraneous end of block at ${offset}`);
		}

		this.startOffset = startOffset;
		(source.ast[startOffset] as BlockStart).endOffset = offset + 1;
	}
}

export class WhileEnd extends BlockEnd implements Types.ASTNode {
	execute (arg: Types.ExecuteArg) {
		arg.offset = this.offset;
	}
}

export class FunctionEnd extends BlockEnd implements Types.ASTNode {
	execute (arg: Types.ExecuteArg) {
		commands.return_(arg);
	}
}

export class FunctionStatement implements Types.ASTNode {
	constructor (readonly name: string, readonly exported: boolean) {}

	assemble ({ source, data, offset }: Types.AssembleArg) {
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

	execute (arg: Types.ExecuteArg) {
		commands.goto_(arg);
	}
}

export class ImportStatement implements Types.ASTNode {
	constructor (readonly namespace: string, readonly source: string) {}

	assemble ({ data }: Types.AssembleArg) {
		if (data.imports.has(this.source)) {
			throw new Error(`Source '${this.source}' already imported`);
		}

		if (data.namespaces.has(this.namespace)) {
			throw new Error(`Namespace '${this.namespace}' is already defined`);
		}

		data.imports.add(this.source);
		data.namespaces.add(this.namespace);
	}

	link ({ context, data }: Types.LinkArg) {
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
