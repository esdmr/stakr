import { test } from 'tap';
import * as stdlib from '#src/stdlib.js';
import { createAssets } from '#test/test-util/stakr.js';
import * as commands_ from '#src/stdlib/commands.js';
import * as log_ from '#src/stdlib/log.js';

await test('addStdLib', async (t) => {
	const { context } = await createAssets();

	stdlib.addLibrary({
		context,
		logger: console,
	});

	const libraries = [
		commands_.name,
		log_.name,
	];

	for (const source of libraries) {
		t.ok(context.sourceMap.has(source),
			`expected to add library to the context: ${source}`);
	}

	t.strictSame(context.persistentSources, [commands_.name],
		'expected to mark necessary libraries as persistent');
});
