import * as ast from 'src/ast.js';
import * as _ from 'tap';
import { createAssets, SourceState } from '../test-util/stakr.js';

await _.test('name', async (_) => {
	const instance = new ast.Refer('test', false);

	_.equal(instance.name, 'test',
		'expected to preserve name');

	_.end();
});

await _.test('referOnly', async (_) => {
	const instance = new ast.Refer('test', true);

	_.equal(instance.referOnly, true,
		'expected to preserve referOnly flag');

	_.end();
});

await _.test('execute', async (_) => {
	for (const referOnly of [false, true]) {
		const referOnlyState = referOnly ? ' referOnly' : '';

		await _.test(`label${referOnlyState}`, async (_) => {
			const instance = new ast.Refer('test-label', referOnly);

			const { source, data, arg } = createAssets({
				source: [
					new ast.Label('test-label', false),
					instance,
				],
				offset: 2,
			});

			instance.execute(arg);

			_.strictSame(data.stack.toNewArray(), [0, source.name],
				'expected to push onto the stack');

			_.strictSame(data.aux.toNewArray(), [],
				'expected to not touch the aux');

			_.strictSame(data.offset, 2,
				'expected to not jump');

			_.strictSame(data.sourceName, source.name,
				'expected to not change source');

			_.end();
		});

		await _.test(`import label${referOnlyState}`, async (_) => {
			const instance = new ast.Refer('lib:test-label', referOnly);

			const { context, source, lib, data, arg } = createAssets({
				lib: [new ast.Label('test-label', true)],
				source: [
					new ast.ImportStatement('lib', 'test-lib'),
					instance,
				],
				state: SourceState.ADDED,
				offset: 2,
			});

			_.throws(
				() => {
					context.execute(source.name, data);
				},
				'expected to throw if function is not found',
			);

			context.link(source.name);

			instance.execute(arg);

			_.strictSame(data.stack.toNewArray(), [0, lib.name],
				'expected to push onto the stack');

			_.strictSame(data.aux.toNewArray(), [],
				'expected to not touch the aux');

			_.strictSame(data.offset, 2,
				'expected to not jump');

			_.strictSame(data.sourceName, source.name,
				'expected to not change source');

			_.end();
		});
	}

	await _.test('function', async (_) => {
		const instance = new ast.Refer('test-function', false);

		const { source, data, arg } = createAssets({
			source: [
				new ast.BlockStart(),
				new ast.FunctionStatement('test-function', false),
				new ast.FunctionEnd(),
				instance,
			],
			offset: 4,
		});

		instance.execute(arg);

		_.equal(data.offset, 2,
			'expected to jump to function');

		_.equal(data.sourceName, source.name,
			'expected to not change the source');

		_.strictSame(data.stack.toNewArray(), [],
			'expected to not push anything onto the stack');

		_.strictSame(data.aux.toNewArray(), [4, source.name],
			'expected to push onto the aux stack');

		_.end();
	});

	await _.test('import function', async (_) => {
		const instance = new ast.Refer('lib:test-function', false);

		const { context, source, lib, data, arg } = createAssets({
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
				context.execute(source.name, data);
			},
			'expected to throw if function is not found',
		);

		context.link(source.name);

		instance.execute(arg);

		_.equal(data.sourceName, lib.name,
			'expected to jump to source');

		_.equal(data.offset, 2,
			'expected to jump to function');

		_.strictSame(data.stack.toNewArray(), [],
			'expected to not push anything onto the stack');

		_.strictSame(data.aux.toNewArray(), [2, source.name],
			'expected to push onto the aux stack');

		_.end();
	});

	await _.test('function referOnly', async (_) => {
		const instance = new ast.Refer('test-function', true);

		const { source, data, arg } = createAssets({
			source: [
				new ast.BlockStart(),
				new ast.FunctionStatement('test-function', false),
				new ast.FunctionEnd(),
				instance,
			],
			offset: 4,
		});

		instance.execute(arg);

		_.strictSame(data.stack.toNewArray(), [2, source.name],
			'expected to push onto the stack');

		_.strictSame(data.aux.toNewArray(), [],
			'expected to not touch the aux');

		_.strictSame(data.offset, 4,
			'expected to not jump');

		_.end();
	});

	await _.test('import function referOnly', async (_) => {
		const instance = new ast.Refer('lib:test-function', true);

		const { context, source, lib, data, arg } = createAssets({
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
				context.execute(source.name, data);
			},
			'expected to throw if function is not found',
		);

		context.link(source.name);

		instance.execute(arg);

		_.strictSame(data.stack.toNewArray(), [2, lib.name],
			'expected to push onto the stack');

		_.strictSame(data.aux.toNewArray(), [],
			'expected to not touch the aux');

		_.strictSame(data.offset, 2,
			'expected to not jump');

		_.strictSame(data.sourceName, source.name,
			'expected to not change source');

		_.end();
	});

	_.end();
});
