import * as ast from 'src/ast.js';
import { ExecuteArg } from 'src/types.js';
import * as _ from 'tap';
import { createAssets, SourceState } from '../test-util/stakr.js';

await _.test('name', async (_) => {
	const instance = new ast.Refer('test');

	_.equal(instance.name, 'test',
		'expected to preserve name');

	_.end();
});

await _.test('execute', async (_) => {
	await _.test('label', async (_) => {
		const instance = new ast.Refer('test-label');

		const { context, source, data } = createAssets({
			source: [
				new ast.Label('test-label', false),
				instance,
			],
			offset: 2,
		});

		const arg: ExecuteArg = {
			context,
			source,
			data,
		};

		instance.execute(arg);

		_.strictSame(data.stack.toNewArray(), [0],
			'expected to push onto the stack');

		_.end();
	});

	await _.test('function', async (_) => {
		const instance = new ast.Refer('test-function');

		const { context, source, data } = createAssets({
			source: [
				new ast.BlockStart(),
				new ast.FunctionStatement('test-function', false),
				new ast.FunctionEnd(),
				instance,
			],
			offset: 4,
		});

		const arg: ExecuteArg = {
			context,
			source,
			data,
		};

		instance.execute(arg);

		_.equal(data.offset, 2,
			'expected to jump to function');

		_.strictSame(data.aux.toNewArray(), [4],
			'expected to push onto the aux stack');

		_.end();
	});

	await _.test('import', async (_) => {
		const instance = new ast.Refer('lib:test-function');

		const { context, source, data } = createAssets({
			lib: [
				new ast.BlockStart(),
				new ast.FunctionStatement('test-function', true),
				new ast.FunctionEnd(),
			],
			source: [
				new ast.ImportStatement('lib', 'test-lib'),
				instance,
			],
			state: SourceState.ADDED,
			offset: 2,
		});

		_.throws(
			() => {
				context.execute([source.name], data);
			},
			'expected to throw if function is not found',
		);

		context.link(new Set([source.name]));

		const arg: ExecuteArg = {
			context,
			source,
			data,
		};

		instance.execute(arg);

		_.equal(data.halted, false,
			'expected to clear halted flag');

		_.equal(data.sourceName, 'test-lib',
			'expected to jump to source');

		_.equal(data.offset, 2,
			'expected to jump to function');

		_.strictSame(data.aux.toNewArray(), [2, source.name],
			'expected to push onto the aux stack');

		_.end();
	});

	_.end();
});
