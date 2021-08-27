import { test } from 'tap';
import { Label } from '#src/ast.js';
import * as types from '#src/types.js';
import { createAssets } from '#test/test-util/stakr.js';

await test('importSource', async (t) => {
	const { source, linkData } = await createAssets({
		source: [
			new Label('test-label', false),
			new Label('test-label2', true),
		],
	});

	linkData.importSource(source, '');

	t.strictSame(
		linkData.identifiers,
		new Map<string, types.Definition>([
			['test-label2', {
				sourceName: source.name,
				offset: 1,
				implicitlyCalled: false,
				exported: true,
			}],
		]),
		'expected to import all exported identifiers given no prefix',
	);

	linkData.identifiers.clear();
	linkData.importSource(source, 'lib:');

	t.strictSame(
		linkData.identifiers,
		new Map<string, types.Definition>([
			['lib:test-label2', {
				sourceName: source.name,
				offset: 1,
				implicitlyCalled: false,
				exported: true,
			}],
		]),
		'expected to import all exported identifiers given prefix',
	);

	t.end();
});
