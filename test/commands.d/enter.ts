import * as _ from 'tap';
import { enter_ } from '#src/commands.js';
import { createAssets } from '#test-util/stakr.js';

const { data, arg } = await createAssets();
const array = [1, 2, 3];

data.stack.push(...array);
data.framePointer = 123;

enter_(arg);

_.strictSame(data.aux.toNewArray(), [123],
	'expected to push previous frame pointer to the aux');

_.strictSame(data.stack.toNewArray(), array,
	'expected to not change the stack');

_.equal(data.framePointer, array.length,
	'expected to update frame pointer to the end of the stack');
