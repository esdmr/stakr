import * as _ from 'tap';
import * as Stakr from 'src/stakr.js';
import { return_ } from 'src/commands.js';
import { ExecuteArg } from 'src/types';

const context = new Stakr.ExecutionContext();
const source = new Stakr.Source('test', []);
const arg: ExecuteArg = { context, source, offset: 0 };

_.throws(return_.bind(null, arg), 'expected to throw if aux is empty');
context.aux.push(true);
_.throws(return_.bind(null, arg), 'expected to throw if poped value is not a number or string');

void _.test('internal', (_) => {
	context.aux.length = 0;
	context.aux.push(123);
	return_(arg);
	_.equal(arg.offset, 123, 'expected to jump to given offset');
	_.strictSame(context.aux, [], 'expected to pop from the aux');
	_.end();
});

void _.test('external', (_) => {
	context.aux.push(true, 'test-lib');
	_.throws(return_.bind(null, arg), 'expected to throw if poped value is not a number');

	context.stack.length = 0;
	context.aux.length = 0;
	arg.offset = 0;
	context.aux.push(123, 'test-lib');
	return_(arg);
	_.strictSame(context.aux, [], 'expected to pop offset from aux');
	_.equal(context.nextSource, 'test-lib', 'expected to set next source');
	_.equal(context.nextOffset, 123, 'expected to set next offset');
	_.equal(context.halted, false, 'expected to clear halted flag');
	_.end();
});

_.end();
