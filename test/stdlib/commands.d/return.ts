import { test } from 'tap';
import { return_ } from '#src/stdlib/commands.js';
import testGoto from '#test/test-util/goto.js';
import { createAssets } from '#test/test-util/stakr.js';

await test('return', async (t) => {
	const { data, arg } = await createAssets();

	testGoto(t, (...items) => {
		data.aux.clear();
		data.aux.push(...items);
		return_(arg);

		return {
			stack: data.aux,
			offset: data.offset,
			sourceName: data.sourceName,
		};
	});
});
