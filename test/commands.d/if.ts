import { if_ } from 'src/commands.js';
import * as stakr from 'src/stakr.js';
import { ExecuteArg } from 'src/types.js';
import * as _ from 'tap';
import { testGoto } from '../test-util/goto.js';

const context = new stakr.ExecutionContext();
const source = new stakr.Source('test', []);
const data = new stakr.ExecuteData();
const arg: ExecuteArg = {
	context,
	source,
	data,
	offset: 0,
};

_.throws(if_.bind(null, arg), 'expected to throw if stack is empty');
data.stack.push('abc');
_.throws(if_.bind(null, arg), 'expected to throw if poped value is not a boolean');
data.stack.clear();
data.stack.push(123, true);
if_(arg);
_.equal(arg.offset, 0, 'expected to not jump if poped value is true');
_.strictSame(data.stack.toNewArray(), [], 'expected to pop twice from the stack even if the condition is true');

await _.test('goto', async (_) => {
	testGoto(_, () => {
		data.stack.push(false);
		if_(arg);
	}, arg);

	_.end();
});
