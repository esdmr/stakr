import * as ast from './ast.js';
import * as stakr from './stakr.js';
import commands_ from './stdlib/commands.js';

export const commands = new stakr.Source(
	'stdlib:commands',
	ast.NativeFunction.createArray(commands_),
);

const stdlib = [commands];

export function addLibrary (context: stakr.ExecutionContext) {
	for (const source of stdlib) {
		context.addSource(source);
	}

	context.persistentSources.push(commands.name);
}

export default stdlib;
