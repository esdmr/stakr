import * as _ from 'tap';
import * as AST from 'src/ast.js';
import * as Stakr from 'src/stakr.js';
import { ExecuteArg } from 'src/types.d';

await _.test('Operator', async (_) => {
	await _.test('name', async (_) => {
		_.equal(new AST.Operator('test').name, 'test', 'expected to preserve name');
		_.end();
	});

	await _.test('execute', async (_) => {
		const instance = new AST.Operator('test-operator');
		const context = new Stakr.ExecutionContext();
		const source = new Stakr.Source('test', [instance]);
		const arg: ExecuteArg = {
			context,
			source,
			data: new Stakr.ExecuteData(),
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
