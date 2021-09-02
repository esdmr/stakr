import { test } from 'tap';
import * as ast from '#src/ast.js';
import * as stakr from '#src/stakr.js';
import * as types from '#src/types.js';

await test('name', async (t) => {
	t.equal(new stakr.Source('test', []).name, 'test',
		'expected to preserve name');
});

await test('source', async (t) => {
	const ast = [] as const;

	t.equal(new stakr.Source('test', ast).ast, ast,
		'expected to preserve source list');
});

await test('assemble', async (t) => {
	let called = false;

	const source = new stakr.Source('test-source', [
		{
			assemble (arg: types.AssembleArg) {
				called = true;

				t.strictSame(
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

	t.ok(called,
		'expected to call assemble');

	t.ok(source._isAssembled,
		'expected to cache assembled data');

	called = false;
	source.assemble();

	t.notOk(called,
		'expected to not call assemble again');

	t.throws(() => source2.assemble(),
		'expected to throw on extraneous start blocks');
});
