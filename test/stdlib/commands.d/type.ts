import { test } from 'tap';
import { type, ValueType } from '#src/stdlib/commands.js';
import { createAssets } from '#test/test-util/stakr.js';

await test('type', async (t) => {
	const { data, arg } = await createAssets();

	t.throws(
		() => {
			type(arg);
		},
		'expected to throw if the stack is empty',
	);

	data.stack.clear();
	data.stack.push('test');
	type(arg);

	t.strictSame(data.stack.toNewArray(), [ValueType.string],
		'expected to correctly return for strings');

	data.stack.clear();
	data.stack.push(123);
	type(arg);

	t.strictSame(data.stack.toNewArray(), [ValueType.number],
		'expected to correctly return for numbers');

	data.stack.clear();
	data.stack.push(true);
	type(arg);

	t.strictSame(data.stack.toNewArray(), [ValueType.boolean],
		'expected to correctly return for boolean');

	data.stack.clear();
	data.stack.push(null);
	type(arg);

	t.strictSame(data.stack.toNewArray(), [ValueType.null],
		'expected to correctly return for null');
});
