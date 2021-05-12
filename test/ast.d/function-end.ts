import * as _ from 'tap';
import * as AST from 'src/ast.js';
import * as Stakr from 'src/stakr.js';

void _.test('FunctionEnd', (_) => {
	void _.test('execute', (_) => {
		const instance = new AST.FunctionEnd();
		const context = new Stakr.ExecutionContext();

		const source = new Stakr.Source('test', [
			new AST.BlockStart(),
			instance,
		]);

		const arg = { context, source, offset: 2 };

		context.addSource(source);
		context.aux.push(123);
		source.assemble();
		instance.execute(arg);
		_.equal(arg.offset, 123, 'expected to return');
		_.strictSame(context.aux, [], 'expected to pop value from aux');
		_.end();
	});

	_.end();
});
