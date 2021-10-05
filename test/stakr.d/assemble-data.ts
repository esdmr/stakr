import { test } from 'tap';
import * as stakr from '#src/stakr.js';
import type * as types from '#src/types.js';

await test('addIdentifier', async (t) => {
	const instance = new stakr.AssembleData();

	const definition: types.Definition = {
		sourceName: 'test-source',
		offset: 0,
		implicitlyCalled: true,
		exported: true,
	};

	instance.addIdentifier('test', definition);

	t.strictSame(instance.identifiers, new Map([['test', definition]]),
		'expected to add identifier');

	t.throws(
		() => {
			instance.addIdentifier('test', definition);
		},
		'expected to throw if identifier already exists',
	);
});
