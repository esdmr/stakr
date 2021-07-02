import { ExecuteData } from 'src/stakr';
import { StackItem } from 'src/types.js';
import SafeArray from 'src/util/safe-array.js';

type Command = (...items: StackItem[]) => {
	stack: SafeArray<StackItem>;
	offset: number;
	sourceName: string;
};

export default function testGoto (
	_: Tap.Test,
	command: Command,
): void {
	_.throws(() => command(),
		'expected to throw if stack is empty');

	_.throws(() => command('abc'),
		'expected to throw if there is not enough parameters');

	_.throws(() => command(123),
		'expected to throw if only given a number');

	_.throws(() => command(true, false),
		'expected to throw if poped value is not string');

	_.throws(() => command(true, 'abc'),
		'expected to throw if poped value is not number');

	const { stack, offset, sourceName } = command(123, 'test-source');

	_.equal(offset, 123,
		'expected to jump to given offset');

	_.equal(sourceName, 'test-source',
		'expected to jump to given source');

	_.strictSame(stack.toNewArray(), [],
		'expected to pop from the stack');
}

export function testCall (
	_: Tap.Test,
	data: ExecuteData,
	command: () => void,
): void {
	testGoto(_, (...items) => {
		data.sourceName = 'test-source';
		data.offset = 1;
		data.aux.clear();
		data.stack.clear();
		data.stack.push(...items);
		command();

		_.strictSame(data.aux.toNewArray(), [1, 'test-source'],
			'expected to push to the aux');

		return data;
	});
}
