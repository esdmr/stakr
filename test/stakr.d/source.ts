import * as _ from 'tap';
import * as AST from 'src/ast.js';
import * as Stakr from 'src/stakr.js';
import * as Types from 'src/types.d';

await _.test('name', async (_) => {
	_.equal(new Stakr.Source('test', []).name, 'test', 'expected to preserve name');
	_.end();
});

await _.test('source', async (_) => {
	const source = [] as const;
	_.equal(new Stakr.Source('test', source).ast, source, 'expected to preserve source list');
	_.end();
});

await _.test('assemble', async (_) => {
	let called = false;
	const source = new Stakr.Source('test', [
		{
			assemble (arg: Types.AssembleArg) {
				called = true;
				_.strictSame(arg, {
					source,
					offset: 0,
					data: new Stakr.AssembleData(),
					blockStack: [],
				}, 'expected to provide an assemble argument');
			},
		},
		{},
	]);

	source.assemble();
	_.ok(called, 'expected to call assemble');
	called = false;
	source.assemble();
	_.notOk(called, 'expected to not call assemble again');

	const source2 = new Stakr.Source('test', [new AST.BlockStart()]);

	_.throws(() => {
		source2.assemble();
	}, 'expected to throw on extraneous start blocks');

	_.end();
});

_.end();
