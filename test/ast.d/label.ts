import * as _ from 'tap';
import * as AST from 'src/ast.js';
import * as Stakr from 'src/stakr.js';

void _.test('Label', (_) => {
	void _.test('name', (_) => {
		_.equal(new AST.Label('test').name, 'test', 'expected to preserve name');
		_.end();
	});

	void _.test('assemble', (_) => {
		const instance = new AST.Label('test-label');
		const source = new Stakr.Source('test', [instance]);
		const arg: Stakr.AssembleArg = { source, blockStack: [], offset: 0 };

		instance.assemble(arg);

		const definition = source.identifiers.get('test-label');
		_.strictSame(definition, { call: false, offset: 0 }, 'expected to correctly add a definition');

		_.throws(() => {
			instance.assemble(arg);
		}, 'expected to throw if identifier already exists');

		_.end();
	});

	_.end();
});
