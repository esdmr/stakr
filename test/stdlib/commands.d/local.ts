import { test } from 'tap';
import { local } from '#src/stdlib/commands.js';
import * as messages from '#src/messages.js';
import { createAssets } from '#test/test-util/stakr.js';

await test('local', async (t) => {
	const { data, arg } = await createAssets();
	const array = [1, 2, 3];

	data.stack.push(...array);
	data.framePointer = 2;
	local(arg);

	t.strictSame(data.stack.toNewArray(), [...array, data.framePointer],
		'expected to push to the stack');

	data.stack.clear();
	data.stack.push(...array);
	data.framePointer = 0;
	local(arg);

	t.strictSame(data.stack.toNewArray(), [...array, data.framePointer],
		'expected to push to the stack even if frame pointer is zero');

	data.framePointer = 0.3;

	t.throws(
		() => {
			local(arg);
		},
		new RangeError(messages.framePointerIsNotValid),
		'expected to throw if frame pointer is not an integer',
	);

	data.framePointer = Number.MAX_VALUE;

	t.throws(
		() => {
			local(arg);
		},
		new RangeError(messages.framePointerIsNotValid),
		'expected to throw if frame pointer is not a safe integer',
	);

	data.framePointer = -1;

	t.throws(
		() => {
			local(arg);
		},
		new RangeError(messages.framePointerIsNotValid),
		'expected to throw if frame pointer is negative',
	);

	data.framePointer = data.stack.length + 1;

	t.throws(
		() => {
			local(arg);
		},
		new RangeError(messages.framePointerIsPastEnd),
		'expected to throw if frame pointer is more than stack length',
	);
});
