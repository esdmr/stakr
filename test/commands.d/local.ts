import * as _ from 'tap';
import { local_ } from '#src/commands.js';
import { CommandsMessage } from '#test-util/message.js';
import { createAssets } from '#test-util/stakr.js';

const { data, arg } = createAssets();
const array = [1, 2, 3];

data.stack.push(...array);
data.framePointer = 2;
local_(arg);

_.strictSame(data.stack.toNewArray(), [...array, data.framePointer],
	'expected to push to the stack');

data.stack.clear();
data.stack.push(...array);
data.framePointer = 0;
local_(arg);

_.strictSame(data.stack.toNewArray(), [...array, data.framePointer],
	'expected to push to the stack even if frame pointer is zero');

data.framePointer = 0.3;

_.throws(
	() => {
		local_(arg);
	},
	new RangeError(CommandsMessage.FRAME_POINTER_IS_NOT_VALID),
	'expected to throw if frame pointer is not an integer',
);

data.framePointer = Number.MAX_VALUE;

_.throws(
	() => {
		local_(arg);
	},
	new RangeError(CommandsMessage.FRAME_POINTER_IS_NOT_VALID),
	'expected to throw if frame pointer is not a safe integer',
);

data.framePointer = -1;

_.throws(
	() => {
		local_(arg);
	},
	new RangeError(CommandsMessage.FRAME_POINTER_IS_NOT_VALID),
	'expected to throw if frame pointer is negative',
);

data.framePointer = data.stack.length + 1;

_.throws(
	() => {
		local_(arg);
	},
	new RangeError(CommandsMessage.FRAME_POINTER_IS_PAST_END),
	'expected to throw if frame pointer is more than stack length',
);
