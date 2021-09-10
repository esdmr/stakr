import { test } from 'tap';
import * as ast from '#src/ast.js';
import { createAssets, SourceState } from '#test/test-util/stakr.js';

await test('name', async (t) => {
	const instance = new ast.Refer('test', false);

	t.equal(instance.name, 'test',
		'expected to preserve name');
});

await test('referOnly', async (t) => {
	const instance = new ast.Refer('test', true);

	t.equal(instance.referOnly, true,
		'expected to preserve referOnly flag');
});

await test('execute', async (t) => {
	for (const referOnly of [false, true]) {
		const referOnlyState = referOnly ? ' referOnly' : '';

		await t.test(`label${referOnlyState}`, async (t) => {
			const instance = new ast.Refer('test-label', referOnly);

			const { source, data, arg } = await createAssets({
				source: [
					new ast.Label('test-label', false),
					instance,
				],
				offset: 2,
			});

			instance.execute(arg);

			t.strictSame(data.stack.toNewArray(), [0, source.name],
				'expected to push onto the stack');

			t.strictSame(data.aux.toNewArray(), [],
				'expected to not touch the aux');

			t.strictSame(data.offset, 2,
				'expected to not jump');

			t.strictSame(data.sourceName, source.name,
				'expected to not change source');
		});

		await t.test(`import label${referOnlyState}`, async (t) => {
			const instance = new ast.Refer('lib:test-label', referOnly);

			const { context, source, lib, data, arg } = await createAssets({
				lib: [new ast.Label('test-label', true)],
				source: [
					new ast.ImportStatement('lib', 'test-lib'),
					instance,
				],
				state: SourceState.ADDED,
				offset: 2,
			});

			await t.rejects(
				async () => context.execute(source.name, data),
				'expected to throw if function is not found',
			);

			await context.link(source.name);

			instance.execute(arg);

			t.strictSame(data.stack.toNewArray(), [0, lib.name],
				'expected to push onto the stack');

			t.strictSame(data.aux.toNewArray(), [],
				'expected to not touch the aux');

			t.strictSame(data.offset, 2,
				'expected to not jump');

			t.strictSame(data.sourceName, source.name,
				'expected to not change source');
		});
	}

	await t.test('function', async (t) => {
		const instance = new ast.Refer('test-function', false);

		const { source, data, arg } = await createAssets({
			source: [
				new ast.BlockStart(),
				new ast.FunctionStatement('test-function', false),
				new ast.FunctionEnd(),
				instance,
			],
			offset: 4,
		});

		instance.execute(arg);

		t.equal(data.offset, 2,
			'expected to jump to function');

		t.equal(data.sourceName, source.name,
			'expected to not change the source');

		t.strictSame(data.stack.toNewArray(), [],
			'expected to not push anything onto the stack');

		t.strictSame(data.aux.toNewArray(), [4, source.name],
			'expected to push onto the aux stack');
	});

	await t.test('import function', async (t) => {
		const instance = new ast.Refer('lib:test-function', false);

		const { context, source, lib, data, arg } = await createAssets({
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

		await t.rejects(
			async () => context.execute(source.name, data),
			'expected to throw if function is not found',
		);

		await context.link(source.name);

		instance.execute(arg);

		t.equal(data.sourceName, lib.name,
			'expected to jump to source');

		t.equal(data.offset, 2,
			'expected to jump to function');

		t.strictSame(data.stack.toNewArray(), [],
			'expected to not push anything onto the stack');

		t.strictSame(data.aux.toNewArray(), [2, source.name],
			'expected to push onto the aux stack');
	});

	await t.test('function referOnly', async (t) => {
		const instance = new ast.Refer('test-function', true);

		const { source, data, arg } = await createAssets({
			source: [
				new ast.BlockStart(),
				new ast.FunctionStatement('test-function', false),
				new ast.FunctionEnd(),
				instance,
			],
			offset: 4,
		});

		instance.execute(arg);

		t.strictSame(data.stack.toNewArray(), [2, source.name],
			'expected to push onto the stack');

		t.strictSame(data.aux.toNewArray(), [],
			'expected to not touch the aux');

		t.strictSame(data.offset, 4,
			'expected to not jump');
	});

	await t.test('import function referOnly', async (t) => {
		const instance = new ast.Refer('lib:test-function', true);

		const { context, source, lib, data, arg } = await createAssets({
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

		await t.rejects(
			async () => context.execute(source.name, data),
			'expected to throw if function is not found',
		);

		await context.link(source.name);

		instance.execute(arg);

		t.strictSame(data.stack.toNewArray(), [2, lib.name],
			'expected to push onto the stack');

		t.strictSame(data.aux.toNewArray(), [],
			'expected to not touch the aux');

		t.strictSame(data.offset, 2,
			'expected to not jump');

		t.strictSame(data.sourceName, source.name,
			'expected to not change source');
	});
});
