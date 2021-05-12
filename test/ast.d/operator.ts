import * as _ from 'tap';
import * as AST from 'src/ast.js';
import * as Stakr from 'src/stakr.js';

void _.test('Operator', (_) => {
	void _.test('name', (_) => {
		_.equal(new AST.Operator('test').name, 'test', 'expected to preserve name');
		_.end();
	});

	void _.test('execute', (_) => {
		const instance = new AST.Operator('test-operator');
		const context = new Stakr.ExecutionContext();
		const source = new Stakr.Source('test', [instance]);
		const arg: Stakr.ExecuteArg = { context, source, offset: 1 };
		let operatorCalled = false;

		context.addSource(source);

		_.throws(() => {
			instance.execute(arg);
		}, 'expected to throw if command is undefined');

		context.commandMap.set('test-operator', () => {
			operatorCalled = true;
		});

		instance.execute(arg);
		_.ok(operatorCalled, 'expected to call operator in context.command');
		_.end();
	});

	_.end();
});
