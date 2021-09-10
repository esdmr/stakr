import { test } from 'tap';
import { halt_ } from '#src/stdlib/commands.js';
import { createAssets } from '#test/test-util/stakr.js';

await test('halt', async (t) => {
	const { data, arg } = await createAssets();

	halt_(arg);

	t.equal(data.halted, true,
		'expected to halt');
});
