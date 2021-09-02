import { test } from 'tap';
import { frame_ } from '#src/stdlib/commands.js';
import { CommandsMessage } from '#test/test-util/message.js';
import { createAssets } from '#test/test-util/stakr.js';

await test('frame', async (t) => {
	const { data, arg } = await createAssets();
	const array = [1, 2, 3];

	data.stack.push(...array);
	data.framePointer = 2;
	frame_(arg);

	t.strictSame(data.stack.toNewArray(), [...array, -1],
		'expected to push to the stack');

	data.framePointer = 0.3;

	t.throws(
		() => {
			frame_(arg);
		},
		new RangeError(CommandsMessage.FRAME_POINTER_IS_NOT_VALID),
		'expected to throw if frame pointer is not an integer',
	);

	data.framePointer = Number.MAX_VALUE;

	t.throws(
		() => {
			frame_(arg);
		},
		new RangeError(CommandsMessage.FRAME_POINTER_IS_NOT_VALID),
		'expected to throw if frame pointer is not a safe integer',
	);

	data.framePointer = -1;

	t.throws(
		() => {
			frame_(arg);
		},
		new RangeError(CommandsMessage.FRAME_POINTER_IS_NOT_VALID),
		'expected to throw if frame pointer is negative',
	);

	data.framePointer = 0;

	t.throws(
		() => {
			frame_(arg);
		},
		new RangeError(CommandsMessage.FRAME_POINTER_IS_AT_START),
		'expected to throw if frame pointer is zero',
	);

	data.framePointer = data.stack.length + 1;

	t.throws(
		() => {
			frame_(arg);
		},
		new RangeError(CommandsMessage.FRAME_POINTER_IS_PAST_END),
		'expected to throw if frame pointer is more than stack length',
	);
});
