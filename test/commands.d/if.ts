import { if_ } from 'src/commands.js';
import * as _ from 'tap';
import testGoto from '../test-util/goto.js';
import { createAssets } from '../test-util/stakr.js';

const { data, arg } = createAssets();

_.throws(
	() => {
		if_(arg);
	},
	'expected to throw if stack is empty',
);

data.stack.push('abc');

_.throws(
	() => {
		if_(arg);
	},
	'expected to throw if poped value is not a boolean',
);

data.stack.clear();
data.stack.push(123, true);
if_(arg);

_.equal(data.offset, 0,
	'expected to not jump if poped value is true');

_.strictSame(data.stack.toNewArray(), [],
	'expected to pop twice from the stack even if the condition is true');

await _.test('goto', async (_) => {
	testGoto(_, (value) => {
		data.stack.clear();

		if (value !== undefined) {
			data.stack.push(value);
		}

		data.stack.push(false);
		if_(arg);
		return arg;
	});

	_.end();
});
