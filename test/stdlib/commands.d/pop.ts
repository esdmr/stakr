import { test } from 'tap';
import { pop } from '#src/stdlib/commands.js';
import { createAssets } from '#test/test-util/stakr.js';

await test('pop', async (t) => {
	const { data, arg } = await createAssets();
	data.stack.push(null);

	pop(arg);

	t.strictSame(data.stack.toNewArray(), [],
		'expected to pop the last item from the stack');

	t.throws(
		() => {
			pop(arg);
		},
		'expected to throw if stack is empty',
	);
});
