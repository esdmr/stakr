import { test } from 'tap';
import { call } from '#src/stdlib/commands.js';
import { testCall } from '#test/test-util/goto.js';
import { createAssets } from '#test/test-util/stakr.js';

await test('call', async (t) => {
	const { data, arg } = await createAssets();

	testCall(t, data, () => {
		call(arg);
	});
});
