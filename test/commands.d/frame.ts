import { frame_ } from 'src/commands.js';
import * as _ from 'tap';
import { createAssets } from '../test-util/stakr.js';

const { data, arg } = createAssets();
const array = [1, 2, 3];

data.stack.push(...array);
data.framePointer = 2;
frame_(arg);

_.strictSame(data.stack.toNewArray(), [...array, -1],
	'expected to push to the stack');

data.framePointer = 0.3;

_.throws(
	() => {
		frame_(arg);
	},
	'expected to throw if frame pointer is not an integer',
);

data.framePointer = Number.MAX_VALUE;

_.throws(
	() => {
		frame_(arg);
	},
	'expected to throw if frame pointer is not a safe integer',
);

data.framePointer = -1;

_.throws(
	() => {
		frame_(arg);
	},
	'expected to throw if frame pointer is negative',
);

data.framePointer = 0;

_.throws(
	() => {
		frame_(arg);
	},
	'expected to throw if frame pointer is zero',
);

data.framePointer = data.stack.length + 1;

_.throws(
	() => {
		frame_(arg);
	},
	'expected to throw if frame pointer is more than stack length',
);
