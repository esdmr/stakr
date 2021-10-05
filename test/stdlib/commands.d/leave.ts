import { test } from 'tap';
import { leave } from '#src/stdlib/commands.js';
import * as messages from '#src/messages.js';
import { createAssets } from '#test/test-util/stakr.js';

await test('leave', async (t) => {
	const { data, arg } = await createAssets();
	const array = [1, 2, 3];

	data.stack.push(...array);
	data.framePointer = 123;
	data.aux.push(456);
	leave(arg);

	t.strictSame(data.stack.toNewArray(), array,
		'expected to not change the stack');

	t.equal(data.framePointer, 456,
		'expected to update frame pointer');

	t.strictSame(data.aux.toNewArray(), [],
		'expected to pop from aux');

	data.aux.push('abc');

	t.throws(
		() => {
			leave(arg);
		},
		new RangeError(messages.framePointerIsNotValid),
		'expected to throw if frame pointer is not a safe integer',
	);

	data.aux.push(0.3);

	t.throws(
		() => {
			leave(arg);
		},
		new RangeError(messages.framePointerIsNotValid),
		'expected to throw if frame pointer is not an integer',
	);

	data.aux.push(Number.MAX_VALUE);

	t.throws(
		() => {
			leave(arg);
		},
		new RangeError(messages.framePointerIsNotValid),
		'expected to throw if frame pointer is not a safe integer',
	);

	data.aux.push(-1);

	t.throws(
		() => {
			leave(arg);
		},
		new RangeError(messages.framePointerIsNotValid),
		'expected to throw if frame pointer is negative',
	);
});
