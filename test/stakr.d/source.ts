import * as _ from 'tap';
import * as ast from '#src/ast.js';
import * as stakr from '#src/stakr.js';
import * as types from '#src/types.js';

await _.test('name', async (_) => {
	_.equal(new stakr.Source('test', []).name, 'test',
		'expected to preserve name');

	_.end();
});

await _.test('source', async (_) => {
	const ast = [] as const;

	_.equal(new stakr.Source('test', ast).ast, ast,
		'expected to preserve source list');

	_.end();
});

await _.test('assemble', async (_) => {
	let called = false;

	const source = new stakr.Source('test-source', [
		{
			assemble (arg: types.AssembleArg) {
				called = true;

				_.strictSame(
					arg,
					{
						source,
						blockStack: [],
						data: new stakr.AssembleData(),
						offset: 0,
					},
					'expected to provide an assemble argument',
				);
			},
		},
		{},
	]);

	const source2 = new stakr.Source('test-source2', [new ast.BlockStart()]);

	source.assemble();

	_.ok(called,
		'expected to call assemble');

	called = false;
	source.assemble();

	_.notOk(called,
		'expected to not call assemble again');

	_.throws(() => source2.assemble(),
		'expected to throw on extraneous start blocks');

	_.end();
});
