import * as _ from 'tap';
import * as AST from 'src/ast.js';
import * as Stakr from 'src/stakr.js';

void _.test('BlockStart', (_) => {
	void _.test('offset', (_) => {
		const instance = new AST.BlockStart();

		_.throws(() => instance.offset, 'expected to throw if not initialized');
		instance.endOffset = 123;
		_.equal(instance.offset, instance.endOffset, 'expected to preserve offset');
		_.end();
	});

	void _.test('assemble', (_) => {
		const instance = new AST.BlockStart();
		const source = new Stakr.Source('test', [instance]);
		const arg: Stakr.AssembleArg = { source, blockStack: [], offset: 0 };

		instance.assemble(arg);
		_.strictSame(arg.blockStack, [0], 'expected to push offset');
		_.end();
	});

	void _.test('execute', (_) => {
		const instance = new AST.BlockStart();
		const context = new Stakr.ExecutionContext();
		const source = new Stakr.Source('test', [instance]);

		instance.endOffset = 123;
		source.execute(context, 0);
		_.strictSame(context.stack, [123], 'expected to push offset');
		_.end();
	});

	_.end();
});
