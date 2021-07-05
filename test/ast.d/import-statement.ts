import * as _ from 'tap';
import * as ast from '#src/ast.js';
import { createAssets, SourceState } from '#test-util/stakr.js';

await _.test('prefix', async (_) => {
	const instance = new ast.ImportStatement('lib', 'test-lib');

	_.equal(instance.namespace, 'lib',
		'expected to preserve prefix');

	_.end();
});

await _.test('source', async (_) => {
	const instance = new ast.ImportStatement('lib', 'test-lib');

	_.equal(instance.source, 'test-lib',
		'expected to preserve source');

	_.end();
});

await _.test('assemble', async (_) => {
	const instance = new ast.ImportStatement('lib', 'test-lib');

	const { assembleData, assembleArg: arg } = await createAssets({
		source: [instance],
		state: SourceState.RAW,
	});

	instance.assemble(arg);

	_.strictSame(assembleData.imports, new Set(['test-lib']),
		'expected to add to import list');

	_.strictSame(assembleData.namespaces, new Set(['lib']),
		'expected to add to namespace list');

	_.throws(
		() => {
			instance.assemble(arg);
		},
		'expected to throw if source is already imported',
	);

	const instance2 = new ast.ImportStatement('lib', 'test-lib2');

	_.throws(
		() => {
			instance2.assemble(arg);
		},
		'expected to throw if namespace is already defined',
	);

	_.end();
});

await _.test('link', async (_) => {
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
		state: SourceState.ADDED,
	});

	const { identifiers: libExports } = lib.assemble();
	context.sourceMap.delete('test-lib');

	_.throws(
		() => {
			instance.link(arg);
		},
		'expected to throw if target source is not found',
	);

	context.addSource(lib);
	await context.link(source.name);

	_.strictSame(
		source.linkData.get(context)?.identifiers.get('lib:test-function'),
		libExports.get('test-function'),
		'expected to copy definition for exported function',
	);

	_.equal(
		source.linkData.get(context)?.identifiers.get('lib:test-internal'),
		undefined,
		'expected to not copy unexported identifiers',
	);

	_.end();
});
