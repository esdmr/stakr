import * as ast from 'src/ast.js';
import * as stakr from 'src/stakr.js';
import * as _ from 'tap';

await _.test('Literal', async (_) => {
	await _.test('value', async (_) => {
		_.equal(new ast.Literal(123).value, 123, 'expected to preserve value');
		_.end();
	});

	await _.test('execute', async (_) => {
		const instance = new ast.Literal(123);
		const context = new stakr.ExecutionContext();
		const source = new stakr.Source('test', [instance]);
		const data = new stakr.ExecuteData();

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
