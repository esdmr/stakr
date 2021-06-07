import * as _ from 'tap';
import * as AST from 'src/ast.js';
import * as Stakr from 'src/stakr.js';
import { AssembleArg, ExecuteArg } from 'src/types';

void _.test('ImportStatement', (_) => {
	void _.test('prefix', (_) => {
		_.equal(new AST.ImportStatement('lib', 'test-lib').prefix, 'lib', 'expected to preserve prefix');
		_.end();
	});

	void _.test('source', (_) => {
		_.equal(new AST.ImportStatement('lib', 'test-lib').source, 'test-lib', 'expected to preserve source');
		_.end();
	});

	void _.test('assemble', (_) => {
		const instance = new AST.ImportStatement('lib', 'test-lib');
		const source = new Stakr.Source('test', [instance]);
		const arg: AssembleArg = { source, blockStack: [], offset: 0 };

		instance.assemble(arg);
		_.ok(source.imports.has('test-lib'), 'expected to add to import list');

		_.throws(() => {
			instance.assemble(arg);
		}, 'expected to throw if source is already imported');

		_.end();
	});

	void _.test('link', (_) => {
		const instance = new AST.ImportStatement('lib', 'test-lib');
		const context = new Stakr.ExecutionContext();
		const source = new Stakr.Source('test', [instance]);
		const arg: ExecuteArg = { context, source, offset: 0 };

		const lib = new Stakr.Source('test-lib', [
			new AST.BlockStart(),
			new AST.FunctionStatement('test-function', true),
			new AST.FunctionEnd(),
		]);

		context.addSource(source);
		context.addSource(lib);

		_.throws(() => {
			instance.link(arg);
		}, 'expected to throw if target source is not assembled');

		lib.assemble();
		source.assemble();
		context.sourceMap.delete('test-lib');

		_.throws(() => {
			instance.link(arg);
		}, 'expected to throw if target source is not found');

		context.addSource(lib);
		instance.link(arg);

		_.strictSame(source.identifiers.get('lib:test-function'), lib.exports.get('test-function'), 'expected to copy definition for exported function');
		_.ok(source.namespaces.has('lib'), 'expected to register namespace');

		_.throws(() => {
			instance.link(arg);
		}, 'expected to throw if namespace is already defined');

		_.end();
	});

	_.end();
});
