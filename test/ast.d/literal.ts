import { test } from 'tap';
import * as ast from '#src/ast.js';
import { createAssets } from '#test/test-util/stakr.js';

await test('value', async (t) => {
	const instance = new ast.Literal(123);

	t.equal(instance.value, 123,
		'expected to preserve value');

	t.end();
});

await test('execute', async (t) => {
	const instance = new ast.Literal(123);

	const { context, source, data } = await createAssets({
		source: [instance],
	});

	instance.execute({
		context,
		source,
		data,
	});

	t.strictSame(data.stack.toNewArray(), [instance.value],
		'expected to push onto the stack');

	t.end();
});
