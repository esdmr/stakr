import { test } from 'tap';
import * as stdlib from '#src/stdlib.js';
import { createAssets } from '#test/test-util/stakr.js';

await test('addStdLib', async (t) => {
	const { context } = await createAssets();

	stdlib.addLibrary(context);

	for (const source of stdlib.default) {
		t.equal(context.sourceMap.get(source.name), source,
			`expected to add library to the context: ${source.name}`);
	}

	t.strictSame(context.persistentSources, [stdlib.commands.name],
		'expected to mark necessary libraries as persistent');
});
