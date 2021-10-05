import { test } from 'tap';
import { ctos } from '#src/stdlib/commands.js';
import { createAssets } from '#test/test-util/stakr.js';

await test('ctos', async (t) => {
	const { data, arg } = await createAssets();

	t.throws(
		() => {
			ctos(arg);
		},
		'expected to throw if the stack is empty',
	);

	data.stack.push('abc');

	t.throws(
		() => {
			ctos(arg);
		},
		'expected to throw if the value is a string',
	);

	data.stack.push(true);

	t.throws(
		() => {
			ctos(arg);
		},
		'expected to throw if the value is a boolean',
	);

	data.stack.push(null);

	t.throws(
		() => {
			ctos(arg);
		},
		'expected to throw if the value is null',
	);

	data.stack.push(-1);

	t.throws(
		() => {
			ctos(arg);
		},
		'expected to throw if the length is not positive',
	);

	data.stack.push(0.5);

	t.throws(
		() => {
			ctos(arg);
		},
		'expected to throw if the length is not a integer',
	);

	data.stack.push(-1, 1);

	t.throws(
		() => {
			ctos(arg);
		},
		'expected to throw if a codepoint is not positive',
	);

	data.stack.push(0.5, 1);

	t.throws(
		() => {
			ctos(arg);
		},
		'expected to throw if a codepoint is not a integer',
	);

	data.stack.clear();
	data.stack.push(0);
	ctos(arg);

	t.strictSame(data.stack.toNewArray(), [''],
		'expected to decode an empty string');

	data.stack.clear();
	data.stack.push(116, 115, 101, 116, 4);
	ctos(arg);

	t.strictSame(data.stack.toNewArray(), ['test'],
		'expected to decode the string from its codepoints');

	data.stack.clear();
	data.stack.push(0x1_F9_14, 1);
	ctos(arg);

	t.strictSame(data.stack.toNewArray(), ['🤔'],
		'expected to decode an emoji from its codepoint');
});
