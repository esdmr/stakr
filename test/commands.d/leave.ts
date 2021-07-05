import * as _ from 'tap';
import { leave_ } from '#src/commands.js';
import { CommandsMessage } from '#test-util/message.js';
import { createAssets } from '#test-util/stakr.js';

const { data, arg } = await createAssets();
const array = [1, 2, 3];

data.stack.push(...array);
data.framePointer = 123;
data.aux.push(456);
leave_(arg);

_.strictSame(data.stack.toNewArray(), array,
	'expected to not change the stack');

_.equal(data.framePointer, 456,
	'expected to update frame pointer');

_.strictSame(data.aux.toNewArray(), [],
	'expected to pop from aux');

data.aux.push('abc');

_.throws(
	() => {
		leave_(arg);
	},
	new TypeError(CommandsMessage.FRAME_POINTER_IS_NOT_NUMBER),
	'expected to throw if frame pointer is not a number',
);

data.aux.push(0.3);

_.throws(
	() => {
		leave_(arg);
	},
	new RangeError(CommandsMessage.FRAME_POINTER_IS_NOT_VALID),
	'expected to throw if frame pointer is not an integer',
);

data.aux.push(Number.MAX_VALUE);

_.throws(
	() => {
		leave_(arg);
	},
	new RangeError(CommandsMessage.FRAME_POINTER_IS_NOT_VALID),
	'expected to throw if frame pointer is not a safe integer',
);

data.aux.push(-1);

_.throws(
	() => {
		leave_(arg);
	},
	new RangeError(CommandsMessage.FRAME_POINTER_IS_NOT_VALID),
	'expected to throw if frame pointer is negative',
);
