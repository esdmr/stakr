import { call_ } from 'src/commands.js';
import * as stakr from 'src/stakr.js';
import { ExecuteArg } from 'src/types.d';
import * as _ from 'tap';

const context = new stakr.ExecutionContext();
const source = new stakr.Source('test', []);
const data = new stakr.ExecuteData();
const arg: ExecuteArg = {
	context,
	source,
	data,
	offset: 0,
};

_.throws(call_.bind(null, arg), 'expected to throw if stack is empty');
data.stack.push(true);
_.throws(call_.bind(null, arg), 'expected to throw if poped value is not a number or string');

await _.test('internal', async (_) => {
	data.stack.clear();
	data.stack.push(123);
	call_(arg);
	_.equal(arg.offset, 123, 'expected to jump to given offset');
	_.strictSame(data.stack.toNewArray(), [], 'expected to pop from the stack');
	_.strictSame(data.aux.toNewArray(), [0], 'expected to push offset onto aux');
	_.end();
});

await _.test('external', async (_) => {
	data.stack.push(true, 'test-lib');
	_.throws(call_.bind(null, arg), 'expected to throw if poped value is not a number');

	data.stack.clear();
	data.aux.clear();
	arg.offset = 0;
	data.stack.push(123, 'test-lib');
	call_(arg);
	_.strictSame(data.aux.toNewArray(), [0, 'test'], 'expected to push offset onto aux');
	_.equal(data.nextSource, 'test-lib', 'expected to set next source');
	_.equal(data.nextOffset, 123, 'expected to set next offset');
	_.equal(data.halted, false, 'expected to clear halted flag');
	_.end();
});

_.end();
