import * as ast from 'src/ast.js';
import * as stakr from 'src/stakr.js';
import { ExecuteArg } from 'src/types.d';
import * as _ from 'tap';

await _.test('FunctionEnd', async (_) => {
	await _.test('execute', async (_) => {
		const instance = new ast.FunctionEnd();
		const context = new stakr.ExecutionContext();

		const source = new stakr.Source('test', [
			new ast.BlockStart(),
			instance,
		]);

		const arg: ExecuteArg = {
			context,
			source,
			data: new stakr.ExecuteData(),
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
