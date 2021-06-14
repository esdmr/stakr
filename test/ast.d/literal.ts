import * as AST from 'src/ast.js';
import * as Stakr from 'src/stakr.js';
import * as _ from 'tap';

await _.test('Literal', async (_) => {
	await _.test('value', async (_) => {
		_.equal(new AST.Literal(123).value, 123, 'expected to preserve value');
		_.end();
	});

	await _.test('execute', async (_) => {
		const instance = new AST.Literal(123);
		const context = new Stakr.ExecutionContext();
		const source = new Stakr.Source('test', [instance]);
		const data = new Stakr.ExecuteData();

		context.addSource(source);
		instance.execute({
			context,
			source,
			data,
			offset: 0,
		});
		_.strictSame(data.stack.toNewArray(), [instance.value], 'expected to push onto the stack');
		_.end();
	});

	_.end();
});
