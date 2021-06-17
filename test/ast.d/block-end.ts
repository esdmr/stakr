import * as AST from 'src/ast.js';
import * as Stakr from 'src/stakr.js';
import * as _ from 'tap';

void _.test('BlockEnd', (_) => {
	void _.test('offset', (_) => {
		const instance = new AST.BlockEnd();

		_.throws(() => instance.offset, 'expected to throw if not initialized');
		instance.startOffset = 123;
		_.equal(instance.offset, instance.startOffset, 'expected to preserve offset');
		_.end();
	});

	void _.test('assemble', (_) => {
		const start = new AST.BlockStart();
		const instance = new AST.BlockEnd();
		const source = new Stakr.Source('test', [start, instance]);

		_.throws(() => {
			instance.assemble({ source, blockStack: [], offset: 1 });
		}, 'expected to throw if extraneous');

		source.assemble();
		_.equal(instance.startOffset, 0, 'expected to correctly set start offset');
		_.equal(start.endOffset, 2, 'expected to correctly set end offset');
		_.end();
	});

	_.end();
});
