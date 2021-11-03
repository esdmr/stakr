import { test } from 'tap';
import * as ast from '#src/ast.js';
import testGoto from '#test/test-util/goto.js';
import { createAssets } from '#test/test-util/stakr.js';

await test('execute', async (t) => {
	const instance = new ast.FunctionEnd();

	const { data, arg } = await createAssets({
		source: [
			new ast.BlockStart(),
			instance,
		],
		offset: 2,
	});

	testGoto(t, (...items) => {
		data.aux.clear();
		data.aux.push(...items);
		instance.execute(arg);

		return {
			stack: data.aux,
			offset: data.offset,
			sourceName: data.sourceName,
		};
	});
});
