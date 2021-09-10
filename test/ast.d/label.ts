import { test } from 'tap';
import * as ast from '#src/ast.js';
import { createAssets } from '#test/test-util/stakr.js';

await test('name', async (t) => {
	const instance = new ast.Label('test', false);

	t.equal(instance.name, 'test',
		'expected to preserve name');
});

await test('assemble', async (t) => {
	const instance = new ast.Label('test-label', false);

	const { source, assembleArg: arg } = await createAssets({
		source: [instance],
	});

	instance.assemble(arg);

	const definition = arg.data.identifiers.get('test-label');

	t.strictSame(
		definition,
		{
			offset: 0,
			sourceName: source.name,
			implicitlyCalled: false,
			exported: false,
		},
		'expected to correctly add a definition',
	);

	t.throws(
		() => {
			instance.assemble(arg);
		},
		'expected to throw if identifier already exists',
	);
});
