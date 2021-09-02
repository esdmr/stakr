import { test } from 'tap';
import { call_ } from '#src/stdlib/commands.js';
import { testCall } from '#test/test-util/goto.js';
import { createAssets } from '#test/test-util/stakr.js';

const { data, arg } = await createAssets();

await test('call', async (t) => {
	await testCall(t, data, async () => {
		call_(arg);
	});
});
