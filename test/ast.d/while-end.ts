import * as _ from 'tap';
import * as AST from 'src/ast.js';
import * as Stakr from 'src/stakr.js';
import { ExecuteArg } from 'src/types.d';

await _.test('WhileEnd', async (_) => {
	await _.test('execute', async (_) => {
		const instance = new AST.WhileEnd();
		const context = new Stakr.ExecutionContext();

		const source = new Stakr.Source('test', [
			new AST.BlockStart(),
			instance,
		]);

		const arg: ExecuteArg = {
			context,
			source,
			data: new Stakr.ExecuteData(),
			offset: 2,
		};

		context.addSource(source);
		source.assemble();
		instance.execute(arg);
		_.equal(arg.offset, 0, 'expected to jump to start');
		_.end();
	});

	_.end();
});
