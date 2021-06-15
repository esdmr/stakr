import * as _ from 'tap';
import * as ast from 'src/ast.js';
import * as stakr from 'src/stakr.js';
import { ExecuteArg } from 'src/types.d';

await _.test('Refer', async (_) => {
	await _.test('name', async (_) => {
		_.equal(new ast.Refer('test').name, 'test', 'expected to preserve name');
		_.end();
	});

	await _.test('execute', async (_) => {
		await _.test('label', async (_) => {
			const instance = new ast.Refer('test-label');
			const context = new stakr.ExecutionContext();

			const source = new stakr.Source('test', [
				new ast.Label('test-label', false),
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
			_.strictSame(arg.data.stack.toNewArray(), [0], 'expected to push onto the stack');
			_.end();
		});

		await _.test('function', async (_) => {
			const instance = new ast.Refer('test-function');
			const context = new stakr.ExecutionContext();

			const source = new stakr.Source('test', [
				new ast.BlockStart(),
				new ast.FunctionStatement('test-function', false),
				new ast.FunctionEnd(),
				instance,
			]);

			const arg: ExecuteArg = {
				context,
				source,
				data: new stakr.ExecuteData(),
				offset: 4,
			};

			context.addSource(source);

			source.assemble();
			instance.execute(arg);
			_.equal(arg.offset, 2, 'expected to jump to function');
			_.strictSame(arg.data.aux.toNewArray(), [4], 'expected to push onto the aux stack');
			_.end();
		});

		await _.test('import', async (_) => {
			const context = new stakr.ExecutionContext();
			const instance = new ast.Refer('lib:test-function');

			const source = new stakr.Source('test', [
				new ast.ImportStatement('lib', 'test-lib'),
				instance,
			]);

			context.addSource(new stakr.Source('test-lib', [
				new ast.BlockStart(),
				new ast.FunctionStatement('test-function', true),
				new ast.FunctionEnd(),
			]));

			context.addSource(source);

			_.throws(() => {
				context.execute(['test'], new stakr.ExecuteData());
			}, 'expected to throw if function is not found');

			context.link(new Set(['test']));
			const data = new stakr.ExecuteData();

			const arg: ExecuteArg = {
				context,
				source,
				data,
				offset: 2,
			};

			instance.execute(arg);

			_.equal(data.halted, false, 'expected to clear halted flag');
			_.equal(data.nextSource, 'test-lib', 'expected to jump to source');
			_.equal(data.nextOffset, 2, 'expected to jump to function');
			_.strictSame(data.aux.toNewArray(), [2, 'test'], 'expected to push onto the aux stack');
			_.end();
		});

		_.end();
	});

	_.end();
});
