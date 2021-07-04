import * as _ from 'tap';
import * as ast from '#src/ast.js';
import { createAssets } from '#test-util/stakr.js';

await _.test('name', async (_) => {
	const instance = new ast.Label('test', false);

	_.equal(instance.name, 'test',
		'expected to preserve name');

	_.end();
});

await _.test('assemble', async (_) => {
	const instance = new ast.Label('test-label', false);

	const { source, assembleArg: arg } = createAssets({
		source: [instance],
	});

	instance.assemble(arg);

	const definition = arg.data.identifiers.get('test-label');

	_.strictSame(
		definition,
		{
			offset: 0,
			sourceName: source.name,
			implicitlyCalled: false,
			exported: false,
		},
		'expected to correctly add a definition',
	);

	_.throws(
		() => {
			instance.assemble(arg);
		},
		'expected to throw if identifier already exists',
	);

	_.end();
});
