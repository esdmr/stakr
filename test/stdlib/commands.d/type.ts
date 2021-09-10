import { test } from 'tap';
import { type_, ValueType } from '#src/stdlib/commands.js';
import { createAssets } from '#test/test-util/stakr.js';

await test('type', async (t) => {
	const { data, arg } = await createAssets();

	t.throws(
		() => {
			type_(arg);
		},
		'expected to throw if the stack is empty',
	);

	data.stack.clear();
	data.stack.push('test');
	type_(arg);

	t.strictSame(data.stack.toNewArray(), [ValueType.STRING],
		'expected to correctly return for strings');

	data.stack.clear();
	data.stack.push(123);
	type_(arg);

	t.strictSame(data.stack.toNewArray(), [ValueType.NUMBER],
		'expected to correctly return for numbers');

	data.stack.clear();
	data.stack.push(true);
	type_(arg);

	t.strictSame(data.stack.toNewArray(), [ValueType.BOOLEAN],
		'expected to correctly return for boolean');

	data.stack.clear();
	data.stack.push(null);
	type_(arg);

	t.strictSame(data.stack.toNewArray(), [ValueType.NULL],
		'expected to correctly return for null');
});
