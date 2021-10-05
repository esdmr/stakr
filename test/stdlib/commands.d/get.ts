import { test } from 'tap';
import { get } from '#src/stdlib/commands.js';
import { createAssets } from '#test/test-util/stakr.js';

await test('get', async (t) => {
	const { data, arg } = await createAssets();
	data.stack.push(true, false, true, 1);

	get(arg);

	t.strictSame(data.stack.toNewArray(), [true, false, true, false],
		'expected to get the item from the stack');

	data.stack.push(-1);

	get(arg);

	t.strictSame(data.stack.toNewArray(), [true, false, true, false, false],
		'expected to get with negative address');

	data.stack.push(0.5);

	t.throws(
		() => {
			get(arg);
		},
		'expected to throw if the address is not a integer',
	);

	data.stack.clear();
	data.stack.push(0);

	t.throws(
		() => {
			get(arg);
		},
		'expected to throw if accessing past the address',
	);

	data.stack.clear();

	t.throws(
		() => {
			get(arg);
		},
		'expected to throw if the stack is empty',
	);

	data.stack.push(null);

	t.throws(
		() => {
			get(arg);
		},
		'expected to throw if address is null',
	);

	data.stack.push(true);

	t.throws(
		() => {
			get(arg);
		},
		'expected to throw if address is boolean',
	);

	data.stack.push('test');

	t.throws(
		() => {
			get(arg);
		},
		'expected to throw if address is a string',
	);
});
