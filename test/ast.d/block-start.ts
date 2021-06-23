import * as ast from 'src/ast.js';
import * as types from 'src/types.js';
import * as _ from 'tap';
import { createAssets, SourceState } from '../test-util/stakr.js';

await _.test('offset', async (_) => {
	const instance = new ast.BlockStart();

	_.throws(() => instance.offset,
		'expected to throw if not initialized');

	instance.endOffset = 123;

	_.equal(instance.offset, instance.endOffset,
		'expected to preserve offset');

	_.end();
});

await _.test('assemble', async (_) => {
	const instance = new ast.BlockStart();

	const { source, assembleData } = createAssets({
		source: [instance],
		state: SourceState.RAW,
	});

	const arg: types.AssembleArg = {
		source,
		blockStack: [],
		data: assembleData,
		offset: 0,
	};

	instance.assemble(arg);

	_.strictSame(arg.blockStack, [0],
		'expected to push offset');

	_.end();
});

await _.test('execute', async (_) => {
	const instance = new ast.BlockStart();

	const { context, source, data } = createAssets({
		source: [instance, new ast.BlockEnd()],
	});

	instance.endOffset = 123;
	context.execute([source.name], data);

	_.strictSame(data.stack.toNewArray(), [123],
		'expected to push offset');

	_.end();
});
