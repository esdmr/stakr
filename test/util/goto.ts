import { ExecuteArg } from 'src/types.js';

export function testGoto (
	_: Tap.Test,
	command: () => void,
	arg: ExecuteArg,
) {
	const { data } = arg;
	data.stack.clear();
	arg.offset = 0;
	_.throws(command, 'expected to throw if stack is empty');
	data.stack.push('abc');
	_.throws(command, 'expected to throw if poped value is a string');
	data.stack.push(true);
	_.throws(command, 'expected to throw if poped value is not a number');
	data.stack.clear();
	data.stack.push(123);
	command();
	_.equal(arg.offset, 123, 'expected to jump to given offset');
	_.strictSame(data.stack.toNewArray(), [], 'expected to pop from the stack');
}
