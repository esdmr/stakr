import * as ast from './ast.js';
import * as stakr from './stakr.js';
import commands_ from './stdlib/commands.js';
import log_ from './stdlib/log.js';
import * as types from './types.js';

/** @public */
export const commands = new stakr.Source(
	'stdlib:commands',
	ast.NativeFunction.createArray(commands_()),
);

const librariesWithoutParameters: readonly stakr.Source[] = [commands];

/** @public */
export function addLibrary (arg: types.StandardLibraryArg) {
	const { context } = arg;

	for (const source of librariesWithoutParameters) {
		context.addSource(source);
	}

	const log = new stakr.Source(
		'stdlib:log',
		ast.NativeFunction.createArray(log_(arg.logger)),
	);

	context.addSource(log);
	context.persistentSources.push(commands.name);
}
