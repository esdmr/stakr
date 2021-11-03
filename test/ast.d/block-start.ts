import { test } from 'tap';
import * as ast from '#src/ast.js';
import * as messages from '#src/messages.js';
import { createAssets, SourceState } from '#test/test-util/stakr.js';

await test('offset', async (t) => {
	const instance = new ast.BlockStart();

	t.throws(
		() => instance.endOffset,
		new Error(messages.blockStartNotInit),
		'expected to throw if not initialized',
	);

	instance._endOffset = 123;

	t.equal(instance.endOffset, instance._endOffset,
		'expected to preserve offset');
});

await test('assemble', async (t) => {
	const instance = new ast.BlockStart();

	const { assembleArg: arg } = await createAssets({
		source: [instance],
		state: SourceState.raw,
	});

	instance.assemble(arg);

	t.strictSame(arg.blockStack, [0],
		'expected to push offset');
});

await test('execute', async (t) => {
	const instance = new ast.BlockStart();

	const { context, source, data } = await createAssets({
		source: [instance, new ast.BlockEnd()],
	});

	instance._endOffset = 123;
	context.execute(source.name, data);

	t.strictSame(data.stack.toNewArray(), [123, source.name],
		'expected to push offset');
});
