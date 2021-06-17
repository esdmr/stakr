import * as ast from 'src/ast.js';
import * as stakr from 'src/stakr.js';
import * as _ from 'tap';

await _.test('BlockEnd', async (_) => {
	await _.test('offset', async (_) => {
		const instance = new ast.BlockEnd();

		_.throws(() => instance.offset, 'expected to throw if not initialized');
		instance.startOffset = 123;
		_.equal(instance.offset, instance.startOffset, 'expected to preserve offset');
		_.end();
	});

	await _.test('assemble', async (_) => {
		const start = new ast.BlockStart();
		const instance = new ast.BlockEnd();
		const source = new stakr.Source('test', [start, instance]);

		_.throws(() => {
			instance.assemble({
				source,
				blockStack: [],
				data: new stakr.AssembleData(),
				offset: 1,
			});
		}, 'expected to throw if extraneous');

		source.assemble();
		_.equal(instance.startOffset, 0, 'expected to correctly set start offset');
		_.equal(start.endOffset, 2, 'expected to correctly set end offset');
		_.end();
	});

	_.end();
});
