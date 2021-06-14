import * as AST from 'src/ast.js';
import * as Stakr from 'src/stakr.js';
import { AssembleArg, LinkArg } from 'src/types.d';
import * as _ from 'tap';

await _.test('ImportStatement', async (_) => {
	await _.test('prefix', async (_) => {
		_.equal(new AST.ImportStatement('lib', 'test-lib').namespace, 'lib', 'expected to preserve prefix');
		_.end();
	});

	await _.test('source', async (_) => {
		_.equal(new AST.ImportStatement('lib', 'test-lib').source, 'test-lib', 'expected to preserve source');
		_.end();
	});

	await _.test('assemble', async (_) => {
		const instance = new AST.ImportStatement('lib', 'test-lib');
		const source = new Stakr.Source('test', [instance]);

		const arg: AssembleArg = {
			source,
			blockStack: [],
			data: new Stakr.AssembleData(),
			offset: 0,
		};

		instance.assemble(arg);

		_.strictSame(arg.data.imports, new Set(['test-lib']), 'expected to add to import list');
		_.strictSame(arg.data.namespaces, new Set(['lib']), 'expected to add to namespace list');

		_.throws(() => {
			instance.assemble(arg);
		}, 'expected to throw if source is already imported');

		const instance2 = new AST.ImportStatement('lib', 'test-lib2');

		_.throws(() => {
			instance2.assemble(arg);
		}, 'expected to throw if namespace is already defined');

		_.end();
	});

	await _.test('link', async (_) => {
		const instance = new AST.ImportStatement('lib', 'test-lib');
		const context = new Stakr.ExecutionContext();
		const source = new Stakr.Source('test', [instance]);
		const arg: LinkArg = {
			context,
			source,
			data: new Stakr.LinkData(),
			offset: 0,
		};

		const lib = new Stakr.Source('test-lib', [
			new AST.BlockStart(),
			new AST.FunctionStatement('test-internal', false),
			new AST.FunctionEnd(),
			new AST.BlockStart(),
			new AST.FunctionStatement('test-function', true),
			new AST.FunctionEnd(),
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
