import * as commands from './commands.js';
import type * as Stakr from './stakr.js';

export type Item =
	| Literal
	| Label
	| Operator
	| Refer
	| BlockStart
	| BlockEnd
	| WhileEnd
	| FunctionEnd
	| FunctionStatement
	| ImportStatement;

export type Source = readonly Item[];

export class Literal implements Stakr.Executable {
	constructor (readonly value: Stakr.StackItem) {}

	execute ({ context }: Stakr.ExecuteArg) {
		context.push(this.value);
	}
}

export class Label implements Stakr.Assemblable {
	constructor (readonly name: string) {}

	assemble ({ source, offset }: Stakr.AssembleArg) {
		if (source.identifiers.has(this.name)) {
			throw new Error(`Identifier '${this.name}' already defined.`);
		}

		source.identifiers.set(this.name, { call: false, offset });
	}
}

export class Operator implements Stakr.Executable {
	constructor (readonly name: string) {}

	execute (arg: Stakr.ExecuteArg) {
		const operator = arg.context.commandMap.get(this.name);

		if (operator === undefined) {
			throw new Error(`Undefined operator '${this.name}'`);
		}

		operator(arg);
	}
}

export class Refer implements Stakr.Executable {
	constructor (readonly name: string) {}

	execute (arg: Stakr.ExecuteArg) {
		const definition = arg.source.identifiers.get(this.name);

		if (definition === undefined) {
			throw new Error(`Undefined identifier '${this.name}'`);
		}

		arg.context.push(definition.offset);

		if (definition.source !== undefined) {
			if (!definition.call) {
				throw new Error('Uncallable external label referred');
			}

			arg.context.push(definition.source);
		}

		if (definition.call) {
			commands.call_(arg);
		}
	}
}

export class BlockStart implements Stakr.Assemblable, Stakr.Executable {
	endOffset?: number;

	get offset () {
		if (this.endOffset === undefined) {
			throw new Error('Block does not have a end offset');
		}

		return this.endOffset;
	}

	assemble ({ blockStack, offset }: Stakr.AssembleArg) {
		blockStack.push(offset);
	}

	execute ({ context }: Stakr.ExecuteArg) {
		context.push(this.offset);
	}
}

export class BlockEnd implements Stakr.Assemblable {
	startOffset?: number;

	get offset () {
		if (this.startOffset === undefined) {
			throw new Error('Block does not have a start offset');
		}

		return this.startOffset;
	}

	assemble ({ source, blockStack, offset }: Stakr.AssembleArg) {
		const startOffset = blockStack.pop();

		if (startOffset === undefined) {
			throw new Error(`Extraneous end of block at ${offset}`);
		}

		this.startOffset = startOffset;
		(source.source[startOffset] as BlockStart).endOffset = offset + 1;
	}
}

export class WhileEnd extends BlockEnd implements Stakr.Executable {
	execute (arg: Stakr.ExecuteArg) {
		arg.offset = this.offset;
	}
}

export class FunctionEnd extends BlockEnd implements Stakr.Executable {
	execute (arg: Stakr.ExecuteArg) {
		commands.return_(arg);
	}
}

export class FunctionStatement implements Stakr.Assemblable, Stakr.Executable {
	constructor (readonly name: string, readonly exported: boolean) {}

	assemble ({ source, offset }: Stakr.AssembleArg) {
		if (source.identifiers.has(this.name)) {
			throw new Error(`Identifier '${this.name}' is already defined`);
		}

		const definition = { call: true, offset: offset + 1 };
		source.identifiers.set(this.name, definition);

		if (this.exported) {
			source.exports.set(this.name, { ...definition, source: source.name });
		}
	}

	execute (arg: Stakr.ExecuteArg) {
		commands.goto_(arg);
	}
}

export class ImportStatement implements Stakr.Assemblable, Stakr.PostAssemblable {
	constructor (readonly prefix: string, readonly source: string) {}

	assemble ({ source }: Stakr.AssembleArg) {
		if (source.imports.has(this.source)) {
			throw new Error(`Source '${this.source}' already imported`);
		}

		source.imports.add(this.source);
	}

	postAssemble ({ context, source }: Readonly<Stakr.ExecuteArg>) {
		const other = context.sourceMap.get(this.source);

		if (other === undefined) {
			throw new Error(`Undefined source '${this.source}'`);
		}

		if (!other.isAssembled) {
			throw new Error(`Importing unassembled source '${this.source}'`);
		}

		if (source.namespaces.has(this.prefix)) {
			throw new Error(`Namespace '${this.prefix}' is already defined`);
		}

		source.namespaces.add(this.prefix);

		for (const [key, value] of other.exports) {
			source.identifiers.set(`${this.prefix}:${key}`, value);
		}
	}
}
