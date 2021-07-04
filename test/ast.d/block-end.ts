import * as ast from 'src/ast.js';
import * as _ from 'tap';
import { ASTMessage } from '../test-util/message.js';
import { createAssets, SourceState } from '../test-util/stakr.js';

await _.test('offset', async (_) => {
	const instance = new ast.BlockEnd();

	_.throws(
		() => instance.startOffset,
		new Error(ASTMessage.BLOCK_END_NOT_INIT),
		'expected to throw if not initialized',
	);

	instance._startOffset = 123;

	_.equal(instance.startOffset, instance._startOffset,
		'expected to preserve offset');

	_.end();
});

await _.test('assemble', async (_) => {
	const start = new ast.BlockStart();
	const instance = new ast.BlockEnd();

	const { source, lib, assembleData } = createAssets({
		source: [start, instance],
		lib: [{}, instance],
		state: SourceState.RAW,
	});

	_.throws(
		() => {
			instance.assemble({
				source,
				blockStack: [],
				data: assembleData,
				offset: 1,
			});
		},
		'expected to throw if extraneous',
	);

	_.throws(
		() => {
			instance.assemble({
				source: lib,
				blockStack: [0],
				data: assembleData,
				offset: 1,
			});
		},
		new TypeError(ASTMessage.START_IS_NOT_BLOCK_START),
		'expected to throw if start of block is not a BlockStart',
	);

	source.assemble();

	_.equal(instance._startOffset, 0,
		'expected to correctly set start offset');

	_.equal(start._endOffset, 2,
		'expected to correctly set end offset');

	_.end();
});
