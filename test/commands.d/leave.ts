import { leave_ } from 'src/commands.js';
import * as _ from 'tap';
import { createAssets } from '../test-util/stakr.js';

const { data, arg } = createAssets();
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
	'expected to throw if frame pointer is not a number',
);

data.aux.push(0.3);

_.throws(
	() => {
		leave_(arg);
	},
	'expected to throw if frame pointer is not an integer',
);

data.aux.push(Number.MAX_VALUE);

_.throws(
	() => {
		leave_(arg);
	},
	'expected to throw if frame pointer is not a safe integer',
);

data.aux.push(-1);

_.throws(
	() => {
		leave_(arg);
	},
	'expected to throw if frame pointer is negative',
);
