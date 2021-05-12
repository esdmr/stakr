import * as _ from 'tap';
import * as Stakr from 'src/stakr.js';
import url from 'url';
import { goto_ } from 'src/commands.js';

export function testGoto (
	_: Tap.Test,
	command: () => void,
	arg: Stakr.ExecuteArg,
) {
	const { context } = arg;
	context.stack.length = 0;
	arg.offset = 0;
	_.throws(command, 'expected to throw if stack is empty');
	context.push('abc');
	_.throws(command, 'expected to throw if poped value is a string');
	context.push(true);
	_.throws(command, 'expected to throw if poped value is not a number');
	context.stack.length = 0;
	context.push(123);
	command();
	_.equal(arg.offset, 123, 'expected to jump to given offset');
	_.strictSame(context.stack, [], 'expected to pop from the stack');
}

if (process.argv[1] === url.fileURLToPath(import.meta.url)) {
	const context = new Stakr.ExecutionContext();
	const source = new Stakr.Source('test', []);
	const arg: Stakr.ExecuteArg = { context, source, offset: 0 };

	testGoto(_, () => {
		goto_(arg);
	}, arg);

	_.end();
}
