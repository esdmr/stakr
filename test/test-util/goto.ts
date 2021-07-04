import { CommandsMessage, SafeArrayMessage } from './message.js';
import { ExecuteData } from '#src/stakr.js';
import { StackItem } from '#src/types.js';
import SafeArray from '#src/util/safe-array.js';

type Command = (...items: StackItem[]) => {
	stack: SafeArray<StackItem>;
	offset: number;
	sourceName: string;
};

export default function testGoto (
	_: Tap.Test,
	command: Command,
): void {
	_.throws(
		() => command(),
		new RangeError(SafeArrayMessage.ARRAY_IS_EMPTY),
		'expected to throw if stack is empty',
	);

	_.throws(
		() => command('abc'),
		new RangeError(SafeArrayMessage.ARRAY_IS_EMPTY),
		'expected to throw if there is not enough parameters',
	);

	_.throws(
		() => command(123),
		new RangeError(SafeArrayMessage.ARRAY_IS_EMPTY),
		'expected to throw if only given a number',
	);

	_.throws(
		() => command(true, false),
		new TypeError(CommandsMessage.SOURCE_NAME_IS_NOT_STRING),
		'expected to throw if poped value is not string',
	);

	_.throws(
		() => command(true, 'abc'),
		new TypeError(CommandsMessage.OFFSET_IS_NOT_NUMBER),
		'expected to throw if poped value is not number',
	);

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
