import { test } from 'tap';
import * as ast from '#src/ast.js';
import { createAssets, SourceState } from '#test/test-util/stakr.js';

await test('prefix', async (t) => {
	const instance = new ast.ImportStatement('lib', 'test-lib');

	t.equal(instance.namespace, 'lib',
		'expected to preserve prefix');
});

await test('source', async (t) => {
	const instance = new ast.ImportStatement('lib', 'test-lib');

	t.equal(instance.source, 'test-lib',
		'expected to preserve source');
});

await test('assemble', async (t) => {
	const instance = new ast.ImportStatement('lib', 'test-lib');

	const { assembleData, assembleArg: arg } = await createAssets({
		source: [instance],
		state: SourceState.raw,
	});

	instance.assemble(arg);

	t.strictSame(assembleData.imports, new Set(['test-lib']),
		'expected to add to import list');

	t.strictSame(assembleData.namespaces, new Set(['lib']),
		'expected to add to namespace list');

	t.throws(
		() => {
			instance.assemble(arg);
		},
		'expected to throw if source is already imported',
	);

	const instance2 = new ast.ImportStatement('lib', 'test-lib2');

	t.throws(
		() => {
			instance2.assemble(arg);
		},
		'expected to throw if namespace is already defined',
	);
});

await test('link', async (t) => {
	const instance = new ast.ImportStatement('lib', 'test-lib');

	const { context, source, lib, linkArg: arg } = await createAssets({
		lib: [
			new ast.BlockStart(),
			new ast.FunctionStatement('test-internal', false),
			new ast.FunctionEnd(),
			new ast.BlockStart(),
			new ast.FunctionStatement('test-function', true),
			new ast.FunctionEnd(),
		],
		source: [instance],
		state: SourceState.added,
	});

	const { identifiers: libExports } = lib.assemble();
	context.sourceMap.delete('test-lib');

	t.throws(
		() => {
			instance.link(arg);
		},
		'expected to throw if target source is not found',
	);

	context.addSource(lib);
	await context.link(source.name);

	t.strictSame(
		source.linkData.get(context)?.identifiers.get('lib:test-function'),
		libExports.get('test-function'),
		'expected to copy definition for exported function',
	);

	t.equal(
		source.linkData.get(context)?.identifiers.get('lib:test-internal'),
		undefined,
		'expected to not copy unexported identifiers',
	);
});
