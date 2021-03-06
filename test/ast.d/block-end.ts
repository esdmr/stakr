import { test } from 'tap';
import * as ast from '#src/ast.js';
import * as messages from '#src/messages.js';
import { createAssets, SourceState } from '#test/test-util/stakr.js';

await test('offset', async (t) => {
	const instance = new ast.BlockEnd();

	t.throws(
		() => instance.startOffset,
		new Error(messages.blockEndNotInit),
		'expected to throw if not initialized',
	);

	instance._startOffset = 123;

	t.equal(instance.startOffset, instance._startOffset,
		'expected to preserve offset');
});

await test('assemble', async (t) => {
	const start = new ast.BlockStart();
	const instance = new ast.BlockEnd();

	const { source, lib, assembleData } = await createAssets({
		source: [start, instance],
		lib: [{}, instance],
		state: SourceState.raw,
	});

	t.throws(
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

	t.throws(
		() => {
			instance.assemble({
				source: lib,
				blockStack: [0],
				data: assembleData,
				offset: 1,
			});
		},
		new TypeError(messages.startIsNotBlockStart),
		'expected to throw if start of block is not a BlockStart',
	);

	source.assemble();

	t.equal(instance._startOffset, 0,
		'expected to correctly set start offset');

	t.equal(start._endOffset, 2,
		'expected to correctly set end offset');
});
