import { test } from 'tap';
import { halt } from '#src/stdlib/commands.js';
import { createAssets } from '#test/test-util/stakr.js';

await test('halt', async (t) => {
	const { data, arg } = await createAssets();

	halt(arg);

	t.equal(data.halted, true,
		'expected to halt');
});
