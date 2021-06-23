import * as ast from 'src/ast.js';
import * as _ from 'tap';
import { createAssets, SourceState } from '../test-util/stakr.js';

await _.test('offset', async (_) => {
	const instance = new ast.BlockEnd();

	_.throws(() => instance.offset,
		'expected to throw if not initialized');

	instance.startOffset = 123;

	_.equal(instance.offset, instance.startOffset,
		'expected to preserve offset');

	_.end();
});

await _.test('assemble', async (_) => {
	const start = new ast.BlockStart();
	const instance = new ast.BlockEnd();

	const { source, assembleData } = createAssets({
		source: [start, instance],
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

	source.assemble();

	_.equal(instance.startOffset, 0,
		'expected to correctly set start offset');

	_.equal(start.endOffset, 2,
		'expected to correctly set end offset');

	_.end();
});
