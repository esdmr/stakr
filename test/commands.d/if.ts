import * as _ from 'tap';
import * as Stakr from 'src/stakr.js';
import { if_ } from 'src/commands.js';
import { testGoto } from './goto.js';

const command = if_();
const context = new Stakr.ExecutionContext();
const source = new Stakr.Source('test', []);
const arg: Stakr.ExecuteArg = { context, source, offset: 0 };

_.throws(command.bind(null, arg), 'expected to throw if stack is empty');
context.push('abc');
_.throws(command.bind(null, arg), 'expected to throw if poped value is not a boolean');
context.stack.length = 0;
context.push(123, true);
command(arg);
_.equal(arg.offset, 0, 'expected to not jump if poped value is true');
_.strictSame(arg.context.stack, [], 'expected to pop twice from the stack even if the condition is true');

void _.test('goto', (_) => {
	testGoto(_, () => {
		context.push(false);
		command(arg);
	}, arg);

	_.end();
});

_.end();
