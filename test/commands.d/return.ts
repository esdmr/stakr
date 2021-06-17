import { return_ } from 'src/commands.js';
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

_.throws(return_.bind(null, arg), 'expected to throw if aux is empty');
data.aux.push(true);
_.throws(return_.bind(null, arg), 'expected to throw if poped value is not a number or string');

await _.test('internal', async (_) => {
	data.aux.clear();
	data.aux.push(123);
	return_(arg);
	_.equal(arg.offset, 123, 'expected to jump to given offset');
	_.strictSame(data.aux.toNewArray(), [], 'expected to pop from the aux');
	_.end();
});

await _.test('external', async (_) => {
	data.aux.push(true, 'test-lib');
	_.throws(return_.bind(null, arg), 'expected to throw if poped value is not a number');

	data.stack.clear();
	data.aux.clear();
	arg.offset = 0;
	data.aux.push(123, 'test-lib');
	return_(arg);
	_.strictSame(data.aux.toNewArray(), [], 'expected to pop offset from aux');
	_.equal(data.nextSource, 'test-lib', 'expected to set next source');
	_.equal(data.nextOffset, 123, 'expected to set next offset');
	_.equal(data.halted, false, 'expected to clear halted flag');
	_.end();
});

_.end();
