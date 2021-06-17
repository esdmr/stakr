import * as ast from 'src/ast.js';
import * as stakr from 'src/stakr.js';
import { AssembleArg, LinkArg } from 'src/types.js';
import * as _ from 'tap';

await _.test('ImportStatement', async (_) => {
	await _.test('prefix', async (_) => {
		_.equal(new ast.ImportStatement('lib', 'test-lib').namespace, 'lib', 'expected to preserve prefix');
		_.end();
	});

	await _.test('source', async (_) => {
		_.equal(new ast.ImportStatement('lib', 'test-lib').source, 'test-lib', 'expected to preserve source');
		_.end();
	});

	await _.test('assemble', async (_) => {
		const instance = new ast.ImportStatement('lib', 'test-lib');
		const source = new stakr.Source('test', [instance]);

		const arg: AssembleArg = {
			source,
			blockStack: [],
			data: new stakr.AssembleData(),
			offset: 0,
		};

		instance.assemble(arg);

		_.strictSame(arg.data.imports, new Set(['test-lib']), 'expected to add to import list');
		_.strictSame(arg.data.namespaces, new Set(['lib']), 'expected to add to namespace list');

		_.throws(() => {
			instance.assemble(arg);
		}, 'expected to throw if source is already imported');

		const instance2 = new ast.ImportStatement('lib', 'test-lib2');

		_.throws(() => {
			instance2.assemble(arg);
		}, 'expected to throw if namespace is already defined');

		_.end();
	});

	await _.test('link', async (_) => {
		const instance = new ast.ImportStatement('lib', 'test-lib');
		const context = new stakr.ExecutionContext();
		const source = new stakr.Source('test', [instance]);
		const arg: LinkArg = {
			context,
			source,
			data: new stakr.LinkData(),
			offset: 0,
		};

		const lib = new stakr.Source('test-lib', [
			new ast.BlockStart(),
			new ast.FunctionStatement('test-internal', false),
			new ast.FunctionEnd(),
			new ast.BlockStart(),
			new ast.FunctionStatement('test-function', true),
			new ast.FunctionEnd(),
		]);

		context.addSource(source);
		context.addSource(lib);

		const { identifiers: libExports } = lib.assemble();
		source.assemble();
		context.sourceMap.delete('test-lib');

		_.throws(() => {
			instance.link(arg);
		}, 'expected to throw if target source is not found');

		context.addSource(lib);
		context.link(new Set(['test']));

		_.strictSame(source.linkData.get(context)?.identifiers.get('lib:test-function'), libExports.get('test-function'), 'expected to copy definition for exported function');
		_.equal(source.linkData.get(context)?.identifiers.get('lib:test-internal'), undefined, 'expected to not copy unexported identifiers');

		_.end();
	});

	_.end();
});
