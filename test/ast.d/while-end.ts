import * as _ from 'tap';
import * as AST from 'src/ast.js';
import * as Stakr from 'src/stakr.js';

void _.test('WhileEnd', (_) => {
	void _.test('execute', (_) => {
		const instance = new AST.WhileEnd();
		const context = new Stakr.ExecutionContext();

		const source = new Stakr.Source('test', [
			new AST.BlockStart(),
			instance,
		]);

		const arg: Stakr.ExecuteArg = { context, source, offset: 2 };

		context.addSource(source);
		source.assemble();
		instance.execute(arg);
		_.equal(arg.offset, 0, 'expected to jump to start');
		_.end();
	});

	_.end();
});
