import { CommandsMessage, SafeArrayMessage } from './message.js';
import { ExecuteData } from '#src/stakr.js';
import { StackItem } from '#src/types.js';
import SafeArray from '#src/util/safe-array.js';

type Command = (...items: StackItem[]) => Promise<{
	stack: SafeArray<StackItem>;
	offset: number;
	sourceName: string;
}>;

export default async function testGoto (
	_: Tap.Test,
	command: Command,
): Promise<void> {
	await _.rejects(
		async () => command(),
		new RangeError(SafeArrayMessage.ARRAY_IS_EMPTY),
		'expected to throw if stack is empty',
	);

	await _.rejects(
		async () => command('abc'),
		new RangeError(SafeArrayMessage.ARRAY_IS_EMPTY),
		'expected to throw if there is not enough parameters',
	);

	await _.rejects(
		async () => command(123),
		new RangeError(SafeArrayMessage.ARRAY_IS_EMPTY),
		'expected to throw if only given a number',
	);

	await _.rejects(
		async () => command(true, false),
		new TypeError(CommandsMessage.SOURCE_NAME_IS_NOT_STRING),
		'expected to throw if poped value is not string',
	);

	await _.rejects(
		async () => command(true, 'abc'),
		new TypeError(CommandsMessage.OFFSET_IS_NOT_NUMBER),
		'expected to throw if poped value is not number',
	);

	const { stack, offset, sourceName } = await command(123, 'test-source');

	_.equal(offset, 123,
		'expected to jump to given offset');

	_.equal(sourceName, 'test-source',
		'expected to jump to given source');

	_.strictSame(stack.toNewArray(), [],
		'expected to pop from the stack');
}

export async function testCall (
	_: Tap.Test,
	data: ExecuteData,
	command: () => Promise<void>,
): Promise<void> {
	return testGoto(_, async (...items) => {
		data.sourceName = 'test-source';
		data.offset = 1;
		data.aux.clear();
		data.stack.clear();
		data.stack.push(...items);
		await command();

		_.strictSame(data.aux.toNewArray(), [1, 'test-source'],
			'expected to push to the aux');

		return data;
	});
}
