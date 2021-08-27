import { test } from 'tap';
import * as ast from '#src/ast.js';
import { createAssets } from '#test/test-util/stakr.js';

await test('execute', async (t) => {
	const instance = new ast.WhileEnd();

	const { data, arg } = await createAssets({
		source: [
			new ast.BlockStart(),
			instance,
		],
		offset: 2,
	});

	instance.execute(arg);

	t.equal(data.offset, 0,
		'expected to jump to start');

	t.end();
});
