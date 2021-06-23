import { ExecuteArg, StackItem } from 'src/types.js';

export default function testGoto (
	_: Tap.Test,
	command: (stackValue?: StackItem) => ExecuteArg,
) {
	_.throws(() => command(),
		'expected to throw if stack is empty');

	_.throws(() => command('abc'),
		'expected to throw if poped value is a string');

	_.throws(() => command(true),
		'expected to throw if poped value is not a number');

	const arg = command(123);

	_.equal(arg.offset, 123,
		'expected to jump to given offset');

	_.strictSame(arg.data.stack.toNewArray(), [],
		'expected to pop from the stack');
}
