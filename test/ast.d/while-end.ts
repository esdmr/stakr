import * as _ from 'tap';
import * as ast from 'src/ast.js';
import * as stakr from 'src/stakr.js';
import { ExecuteArg } from 'src/types.d';

await _.test('WhileEnd', async (_) => {
	await _.test('execute', async (_) => {
		const instance = new ast.WhileEnd();
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
		source.assemble();
		instance.execute(arg);
		_.equal(arg.offset, 0, 'expected to jump to start');
		_.end();
	});

	_.end();
});
