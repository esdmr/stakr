import { test } from 'tap';
import { enter_ } from '#src/commands.js';
import { createAssets } from '#test/test-util/stakr.js';

await test('enter', async (t) => {
	const { data, arg } = await createAssets();
	const array = [1, 2, 3];

	data.stack.push(...array);
	data.framePointer = 123;

	enter_(arg);

	t.strictSame(data.aux.toNewArray(), [123],
		'expected to push previous frame pointer to the aux');

	t.strictSame(data.stack.toNewArray(), array,
		'expected to not change the stack');

	t.equal(data.framePointer, array.length,
		'expected to update frame pointer to the end of the stack');
});
