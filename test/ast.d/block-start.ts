import * as ast from 'src/ast.js';
import * as stakr from 'src/stakr.js';
import { AssembleArg } from 'src/types.d';
import * as _ from 'tap';

await _.test('BlockStart', async (_) => {
	await _.test('offset', async (_) => {
		const instance = new ast.BlockStart();

		_.throws(() => instance.offset, 'expected to throw if not initialized');
		instance.endOffset = 123;
		_.equal(instance.offset, instance.endOffset, 'expected to preserve offset');
		_.end();
	});

	await _.test('assemble', async (_) => {
		const instance = new ast.BlockStart();
		const source = new stakr.Source('test', [instance]);
		const arg: AssembleArg = {
			source,
			blockStack: [],
			data: new stakr.AssembleData(),
			offset: 0,
		};

		instance.assemble(arg);
		_.strictSame(arg.blockStack, [0], 'expected to push offset');
		_.end();
	});

	await _.test('execute', async (_) => {
		const instance = new ast.BlockStart();
		const context = new stakr.ExecutionContext();
		const data = new stakr.ExecuteData();
		context.addSource(new stakr.Source('test', [instance, new ast.BlockEnd()]));

		instance.endOffset = 123;
		context.execute(['test'], data);
		_.strictSame(data.stack.toNewArray(), [123], 'expected to push offset');
		_.end();
	});

	_.end();
});
