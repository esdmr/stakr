import * as AST from 'src/ast.js';
import * as Stakr from 'src/stakr.js';
import * as _ from 'tap';

void _.test('Literal', (_) => {
	void _.test('value', (_) => {
		_.equal(new AST.Literal(123).value, 123, 'expected to preserve value');
		_.end();
	});

	void _.test('execute', (_) => {
		const instance = new AST.Literal(123);
		const context = new Stakr.ExecutionContext();
		const source = new Stakr.Source('test', [instance]);

		context.addSource(source);
		instance.execute({ context, source, offset: 0 });
		_.strictSame(context.stack, [instance.value], 'expected to push onto the stack');
		_.end();
	});

	_.end();
});
