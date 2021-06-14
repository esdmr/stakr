import * as _ from 'tap';
import * as AST from 'src/ast.js';
import * as Stakr from 'src/stakr.js';
import { AssembleArg } from 'src/types.d';

await _.test('Label', async (_) => {
	await _.test('name', async (_) => {
		_.equal(new AST.Label('test', false).name, 'test', 'expected to preserve name');
		_.end();
	});

	await _.test('assemble', async (_) => {
		const instance = new AST.Label('test-label', false);
		const source = new Stakr.Source('test', [instance]);
		const arg: AssembleArg = {
			source,
			data: new Stakr.AssembleData(),
			blockStack: [],
			offset: 0,
		};

		instance.assemble(arg);

		const definition = arg.data.identifiers.get('test-label');
		_.strictSame(definition, {
			offset: 0,
			sourceName: 'test',
			implicitlyCalled: false,
			exported: false,
		}, 'expected to correctly add a definition');

		_.throws(() => {
			instance.assemble(arg);
		}, 'expected to throw if identifier already exists');

		_.end();
	});

	_.end();
});
