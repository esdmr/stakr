import * as _ from 'tap';
import * as stakr from '#src/stakr.js';
import * as types from '#src/types.js';

await _.test('addIdentifier', async (_) => {
	const instance = new stakr.AssembleData();

	const definition: types.Definition = {
		sourceName: 'test-source',
		offset: 0,
		implicitlyCalled: true,
		exported: true,
	};

	instance.addIdentifier('test', definition);

	_.strictSame(instance.identifiers, new Map([['test', definition]]),
		'expected to add identifier');

	_.throws(
		() => {
			instance.addIdentifier('test', definition);
		},
		'expected to throw if identifier already exists',
	);

	_.end();
});
