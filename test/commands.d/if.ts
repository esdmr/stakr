import * as _ from 'tap';
import * as Stakr from 'src/stakr.js';
import { if_ } from 'src/commands.js';
import { ExecuteArg } from 'src/types.js';
import { testGoto } from '../util/goto.js';

const command = if_();
const context = new Stakr.ExecutionContext();
const source = new Stakr.Source('test', []);
const data = new Stakr.ExecuteData();
const arg: ExecuteArg = {
	context,
	source,
	data,
	offset: 0,
};

_.throws(command.bind(null, arg), 'expected to throw if stack is empty');
data.stack.push('abc');
_.throws(command.bind(null, arg), 'expected to throw if poped value is not a boolean');
data.stack.clear();
data.stack.push(123, true);
command(arg);
_.equal(arg.offset, 0, 'expected to not jump if poped value is true');
_.strictSame(data.stack.toNewArray(), [], 'expected to pop twice from the stack even if the condition is true');

await _.test('goto', async (_) => {
	testGoto(_, () => {
		data.stack.push(false);
		command(arg);
	}, arg);

	_.end();
});

_.end();
