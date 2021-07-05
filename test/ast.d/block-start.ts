import * as _ from 'tap';
import * as ast from '#src/ast.js';
import { ASTMessage } from '#test-util/message.js';
import { createAssets, SourceState } from '#test-util/stakr.js';

await _.test('offset', async (_) => {
	const instance = new ast.BlockStart();

	_.throws(
		() => instance.endOffset,
		new Error(ASTMessage.BLOCK_START_NOT_INIT),
		'expected to throw if not initialized',
	);

	instance._endOffset = 123;

	_.equal(instance.endOffset, instance._endOffset,
		'expected to preserve offset');

	_.end();
});

await _.test('assemble', async (_) => {
	const instance = new ast.BlockStart();

	const { assembleArg: arg } = await createAssets({
		source: [instance],
		state: SourceState.RAW,
	});

	instance.assemble(arg);

	_.strictSame(arg.blockStack, [0],
		'expected to push offset');

	_.end();
});

await _.test('execute', async (_) => {
	const instance = new ast.BlockStart();

	const { context, source, data } = await createAssets({
		source: [instance, new ast.BlockEnd()],
	});

	instance._endOffset = 123;
	await context.execute(source.name, data);

	_.strictSame(data.stack.toNewArray(), [123, source.name],
		'expected to push offset');

	_.end();
});
