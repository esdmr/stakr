import { test } from 'tap';
import * as ast from '#src/ast.js';
import { createAssets } from '#test/test-util/stakr.js';

await test('static instance', async (t) => {
	t.ok(ast.Halt.instance instanceof ast.Halt,
		'expected to be an instance of Halt');
});

await test('execute', async (t) => {
	const { instance } = ast.Halt;

	const { context, source, data } = await createAssets({
		source: [instance],
	});

	instance.execute({
		context,
		source,
		data,
	});

	t.strictSame(data.halted, true,
		'expected to halt');
});
