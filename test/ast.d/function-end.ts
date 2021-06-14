import * as _ from 'tap';
import * as AST from 'src/ast.js';
import * as Stakr from 'src/stakr.js';
import { ExecuteArg } from 'src/types';

await _.test('FunctionEnd', async (_) => {
	await _.test('execute', async (_) => {
		const instance = new AST.FunctionEnd();
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
		arg.data.aux.push(123);
		source.assemble();
		instance.execute(arg);
		_.equal(arg.offset, 123, 'expected to return');
		_.strictSame(arg.data.aux.toNewArray(), [], 'expected to pop value from aux');
		_.end();
	});

	_.end();
});
