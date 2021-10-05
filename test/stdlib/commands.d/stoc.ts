import { test } from 'tap';
import { stoc } from '#src/stdlib/commands.js';
import { createAssets } from '#test/test-util/stakr.js';

await test('stoc', async (t) => {
	const { data, arg } = await createAssets();

	t.throws(
		() => {
			stoc(arg);
		},
		'expected to throw if the stack is empty',
	);

	data.stack.push(123);

	t.throws(
		() => {
			stoc(arg);
		},
		'expected to throw if the value is a number',
	);

	data.stack.push(true);

	t.throws(
		() => {
			stoc(arg);
		},
		'expected to throw if the value is a boolean',
	);

	data.stack.push(null);

	t.throws(
		() => {
			stoc(arg);
		},
		'expected to throw if the value is null',
	);

	data.stack.clear();
	data.stack.push('');
	stoc(arg);

	t.strictSame(data.stack.toNewArray(), [0],
		'expected to encode an empty string');

	data.stack.clear();
	data.stack.push('test');
	stoc(arg);

	t.strictSame(data.stack.toNewArray(), [116, 115, 101, 116, 4],
		'expected to encode the string into its codepoints');

	data.stack.clear();
	data.stack.push('🤔');
	stoc(arg);

	t.strictSame(data.stack.toNewArray(), [0x1_F9_14, 1],
		'expected to encode an emoji into its codepoint');
});
