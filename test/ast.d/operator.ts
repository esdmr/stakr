import * as ast from 'src/ast.js';
import * as stakr from 'src/stakr.js';
import { ExecuteArg } from 'src/types.js';
import * as _ from 'tap';

await _.test('Operator', async (_) => {
	await _.test('name', async (_) => {
		_.equal(new ast.Operator('test').name, 'test', 'expected to preserve name');
		_.end();
	});

	await _.test('execute', async (_) => {
		const instance = new ast.Operator('test-operator');
		const context = new stakr.ExecutionContext();
		const source = new stakr.Source('test', [instance]);
		const arg: ExecuteArg = {
			context,
			source,
			data: new stakr.ExecuteData(),
			offset: 1,
		};
		let operatorCalled = false;

		context.addSource(source);

		_.throws(() => {
			instance.execute(arg);
		}, 'expected to throw if command is undefined');

		arg.data.commandMap.set('test-operator', () => {
			operatorCalled = true;
		});

		instance.execute(arg);
		_.ok(operatorCalled, 'expected to call operator in context.command');
		_.end();
	});

	_.end();
});
