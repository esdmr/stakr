import * as _ from 'tap';
import * as Stakr from 'src/stakr.js';
import { call_ } from 'src/commands.js';
import { ExecuteArg } from 'src/types.d';

const context = new Stakr.ExecutionContext();
const source = new Stakr.Source('test', []);
const arg: ExecuteArg = { context, source, offset: 0 };

_.throws(call_.bind(null, arg), 'expected to throw if stack is empty');
context.push(true);
_.throws(call_.bind(null, arg), 'expected to throw if poped value is not a number or string');

void _.test('internal', (_) => {
	context.stack.length = 0;
	context.push(123);
	call_(arg);
	_.equal(arg.offset, 123, 'expected to jump to given offset');
	_.strictSame(context.stack, [], 'expected to pop from the stack');
	_.strictSame(context.aux, [0], 'expected to push offset onto aux');
	_.end();
});

void _.test('external', (_) => {
	context.push(true, 'test-lib');
	_.throws(call_.bind(null, arg), 'expected to throw if poped value is not a number');

	context.stack.length = 0;
	context.aux.length = 0;
	arg.offset = 0;
	context.push(123, 'test-lib');
	call_(arg);
	_.strictSame(context.aux, [0, 'test'], 'expected to push offset onto aux');
	_.equal(context.nextSource, 'test-lib', 'expected to set next source');
	_.equal(context.nextOffset, 123, 'expected to set next offset');
	_.equal(context.halted, false, 'expected to clear halted flag');
	_.end();
});

_.end();
