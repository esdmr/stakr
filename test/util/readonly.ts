import { test } from 'tap';
import { ReadonlyMap, ReadonlySet } from '#src/util/readonly.js';

await test('ReadonlyMap', async (t) => {
	t.equal(ReadonlyMap, Map,
		'expected to be the exact same as the Map constructor');
});

await test('ReadonlySet', async (t) => {
	t.equal(ReadonlySet, Set,
		'expected to be the exact same as the Set constructor');
});
