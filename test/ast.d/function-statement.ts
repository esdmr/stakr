import { test } from 'tap';
import * as ast from '#src/ast.js';
import * as stakr from '#src/stakr.js';
import testGoto from '#test/test-util/goto.js';
import { createAssets } from '#test/test-util/stakr.js';

await test('name', async (t) => {
	const instance = new ast.FunctionStatement('test', false);

	t.equal(instance.name, 'test',
		'expected to preserve name');
});

await test('exported', async (t) => {
	const instance = new ast.FunctionStatement('test', true);

	t.equal(instance.exported, true,
		'expected to preserve exported flag');
});

await test('assemble', async (t) => {
	const instance = new ast.FunctionStatement('test-function', true);
	const source = new stakr.Source('test', [instance]);
	const definition = source.assemble().identifiers.get('test-function');

	t.strictSame(
		definition,
		{
			offset: 1,
			sourceName: 'test',
			implicitlyCalled: true,
			exported: true,
		},
		'expected to correctly add a definition',
	);

	const sourceDup = new stakr.Source('test', [instance, instance]);

	t.throws(() => {
		sourceDup.assemble();
	}, 'expected to throw if identifier already exists');
});

await test('execute', async (t) => {
	const instance = new ast.FunctionStatement('test-function', false);

	const { data, arg } = await createAssets({
		source: [instance],
		offset: 1,
	});

	await testGoto(t, async (...items) => {
		data.stack.clear();
		data.stack.push(...items);
		instance.execute(arg);

		return data;
	});
});
