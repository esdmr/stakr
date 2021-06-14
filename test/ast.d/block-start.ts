import * as _ from 'tap';
import * as AST from 'src/ast.js';
import * as Stakr from 'src/stakr.js';
import { AssembleArg } from 'src/types.d';

await _.test('BlockStart', async (_) => {
	await _.test('offset', async (_) => {
		const instance = new AST.BlockStart();

		_.throws(() => instance.offset, 'expected to throw if not initialized');
		instance.endOffset = 123;
		_.equal(instance.offset, instance.endOffset, 'expected to preserve offset');
		_.end();
	});

	await _.test('assemble', async (_) => {
		const instance = new AST.BlockStart();
		const source = new Stakr.Source('test', [instance]);
		const arg: AssembleArg = {
			source,
			blockStack: [],
			data: new Stakr.AssembleData(),
			offset: 0,
		};

		instance.assemble(arg);
		_.strictSame(arg.blockStack, [0], 'expected to push offset');
		_.end();
	});

	await _.test('execute', async (_) => {
		const instance = new AST.BlockStart();
		const context = new Stakr.ExecutionContext();
		const data = new Stakr.ExecuteData();
		context.addSource(new Stakr.Source('test', [instance, new AST.BlockEnd()]));

		instance.endOffset = 123;
		context.execute(['test'], data);
		_.strictSame(data.stack.toNewArray(), [123], 'expected to push offset');
		_.end();
	});

	_.end();
});
