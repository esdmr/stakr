import { test } from 'tap';
import { if_ } from '#src/stdlib/commands.js';
import testGoto from '#test/test-util/goto.js';
import * as messages from '#src/messages.js';
import { Message as SafeArrayMessage } from '#src/util/safe-array.js';
import { createAssets } from '#test/test-util/stakr.js';

await test('if', async (t) => {
	const { source, lib, data, arg } = await createAssets();

	t.throws(
		() => {
			if_(arg);
		},
		new RangeError(SafeArrayMessage.arrayIsEmpty),
		'expected to throw if stack is empty',
	);

	data.stack.push('abc');

	t.throws(
		() => {
			if_(arg);
		},
		new TypeError(messages.conditionIsNotBoolean),
		'expected to throw if poped value is not a boolean',
	);

	data.stack.clear();
	data.stack.push(123, lib.name, true);
	if_(arg);

	t.equal(data.offset, 0,
		'expected to not jump to offset if poped value is true');

	t.equal(data.sourceName, source.name,
		'expected to not jump to source if poped value is true');

	t.strictSame(data.stack.toNewArray(), [],
		'expected to pop twice from the stack even if the condition is true');

	await t.test('goto', async (t) => {
		testGoto(t, (...items) => {
			data.stack.clear();
			data.stack.push(...items, false);
			if_(arg);

			return data;
		});
	});
});
