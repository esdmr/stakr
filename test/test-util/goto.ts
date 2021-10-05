import * as messages from '#src/messages.js';
import SafeArray, { Message as SafeArrayMessage } from '#src/util/safe-array.js';
import { ExecuteData } from '#src/stakr.js';
import type { StackItem } from '#src/types.js';

type Command = (...items: StackItem[]) => Promise<{
	stack: SafeArray<StackItem>;
	offset: number;
	sourceName: string;
}>;

export default async function testGoto (
	t: Tap.Test,
	command: Command,
): Promise<void> {
	await t.rejects(
		async () => command(),
		new RangeError(SafeArrayMessage.arrayIsEmpty),
		'expected to throw if stack is empty',
	);

	await t.rejects(
		async () => command('abc'),
		new RangeError(SafeArrayMessage.arrayIsEmpty),
		'expected to throw if there is not enough parameters',
	);

	await t.rejects(
		async () => command(123),
		new RangeError(SafeArrayMessage.arrayIsEmpty),
		'expected to throw if only given a number',
	);

	await t.rejects(
		async () => command(true, false),
		new TypeError(messages.sourceNameIsNotString),
		'expected to throw if poped value is not string',
	);

	await t.rejects(
		async () => command(true, 'abc'),
		new RangeError(messages.offsetIsNotInt),
		'expected to throw if poped value is not a safe integer',
	);

	const { stack, offset, sourceName } = await command(123, 'test-source');

	t.equal(offset, 123,
		'expected to jump to given offset');

	t.equal(sourceName, 'test-source',
		'expected to jump to given source');

	t.strictSame(stack.toNewArray(), [],
		'expected to pop from the stack');
}

export async function testCall (
	t: Tap.Test,
	data: ExecuteData,
	command: () => Promise<void>,
): Promise<void> {
	return testGoto(t, async (...items) => {
		data.sourceName = 'test-source';
		data.offset = 1;
		data.aux.clear();
		data.stack.clear();
		data.stack.push(...items);
		await command();

		t.strictSame(data.aux.toNewArray(), [1, 'test-source'],
			'expected to push to the aux');

		return data;
	});
}
