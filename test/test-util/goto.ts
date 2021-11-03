import * as messages from '#src/messages.js';
import SafeArray, { Message as SafeArrayMessage } from '#src/util/safe-array.js';
import { ExecuteData } from '#src/stakr.js';
import type { StackItem } from '#src/types.js';

type Command = (...items: StackItem[]) => {
	stack: SafeArray<StackItem>;
	offset: number;
	sourceName: string;
};

export default function testGoto (
	t: Tap.Test,
	command: Command,
): void {
	t.throws(
		() => command(),
		new RangeError(SafeArrayMessage.arrayIsEmpty),
		'expected to throw if stack is empty',
	);

	t.throws(
		() => command('abc'),
		new RangeError(SafeArrayMessage.arrayIsEmpty),
		'expected to throw if there is not enough parameters',
	);

	t.throws(
		() => command(123),
		new RangeError(SafeArrayMessage.arrayIsEmpty),
		'expected to throw if only given a number',
	);

	t.throws(
		() => command(true, false),
		new TypeError(messages.sourceNameIsNotString),
		'expected to throw if poped value is not string',
	);

	t.throws(
		() => command(true, 'abc'),
		new RangeError(messages.offsetIsNotInt),
		'expected to throw if poped value is not a safe integer',
	);

	const { stack, offset, sourceName } = command(123, 'test-source');

	t.equal(offset, 123,
		'expected to jump to given offset');

	t.equal(sourceName, 'test-source',
		'expected to jump to given source');

	t.strictSame(stack.toNewArray(), [],
		'expected to pop from the stack');
}

export function testCall (
	t: Tap.Test,
	data: ExecuteData,
	command: () => void,
): void {
	testGoto(t, (...items) => {
		data.sourceName = 'test-source';
		data.offset = 1;
		data.aux.clear();
		data.stack.clear();
		data.stack.push(...items);
		command();

		t.strictSame(data.aux.toNewArray(), [1, 'test-source'],
			'expected to push to the aux');

		return data;
	});
}
