import * as ast from 'src/ast.js';
import * as stakr from 'src/stakr.js';
import * as types from 'src/types.js';
import * as _ from 'tap';

await _.test('name', async (_) => {
	_.equal(new stakr.Source('test', []).name, 'test', 'expected to preserve name');
	_.end();
});

await _.test('source', async (_) => {
	const source = [] as const;
	_.equal(new stakr.Source('test', source).ast, source, 'expected to preserve source list');
	_.end();
});

await _.test('assemble', async (_) => {
	let called = false;
	const source = new stakr.Source('test', [
		{
			assemble (arg: types.AssembleArg) {
				called = true;
				_.strictSame(arg, {
					source,
					offset: 0,
					data: new stakr.AssembleData(),
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

	const source2 = new stakr.Source('test', [new ast.BlockStart()]);

	_.throws(() => {
		source2.assemble();
	}, 'expected to throw on extraneous start blocks');

	_.end();
});

_.end();
