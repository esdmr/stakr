import { test } from 'tap';
import { goto_ } from '#src/stdlib/commands.js';
import testGoto from '#test/test-util/goto.js';
import { createAssets } from '#test/test-util/stakr.js';

await test('goto', async (t) => {
	const { data, arg } = await createAssets();

	await testGoto(t, async (...items) => {
		data.stack.clear();
		data.stack.push(...items);
		goto_(arg);

		return data;
	});
});
