import { test } from 'tap';
import { set_ } from '#src/stdlib/commands.js';
import { createAssets } from '#test/test-util/stakr.js';

await test('set', async (t) => {
	const { data, arg } = await createAssets();
	data.stack.push(true, false, true, 1);

	set_(arg);

	t.strictSame(data.stack.toNewArray(), [true, true],
		'expected to set the item from the stack');

	data.stack.push(false, -1);

	set_(arg);

	t.strictSame(data.stack.toNewArray(), [true, false],
		'expected to set with negative address');

	data.stack.push(true, 0.5);

	t.throws(
		() => {
			set_(arg);
		},
		'expected to throw if the address is not a integer',
	);

	data.stack.clear();
	data.stack.push(true, 0);

	t.throws(
		() => {
			set_(arg);
		},
		'expected to throw if accessing past the address',
	);

	data.stack.clear();
	data.stack.push(0);

	t.throws(
		() => {
			set_(arg);
		},
		'expected to throw if no value is provided',
	);

	data.stack.clear();

	t.throws(
		() => {
			set_(arg);
		},
		'expected to throw if the stack is empty',
	);

	data.stack.push(null, null);

	t.throws(
		() => {
			set_(arg);
		},
		'expected to throw if address is null',
	);

	data.stack.push(null, true);

	t.throws(
		() => {
			set_(arg);
		},
		'expected to throw if address is boolean',
	);

	data.stack.push(null, 'test');

	t.throws(
		() => {
			set_(arg);
		},
		'expected to throw if address is a string',
	);
});
