import * as _ from 'tap';
import * as AST from 'src/ast.js';
import * as Stakr from 'src/stakr.js';
import { AssembleArg, ExecuteArg } from 'src/types';

void _.test('FunctionStatement', (_) => {
	void _.test('name', (_) => {
		_.equal(new AST.FunctionStatement('test', false).name, 'test', 'expected to preserve name');
		_.end();
	});

	void _.test('exported', (_) => {
		_.equal(new AST.FunctionStatement('test', true).exported, true, 'expected to preserve exported flag');
		_.end();
	});

	void _.test('assemble', (_) => {
		const instance = new AST.FunctionStatement('test-function', true);
		const source = new Stakr.Source('test', [instance]);
		const arg: AssembleArg = { source, blockStack: [], offset: 0 };

		instance.assemble(arg);

		const definition = source.identifiers.get('test-function');
		const exported = source.exports.get('test-function');

		_.strictSame(definition, { call: true, offset: 0 + 1 }, 'expected to correctly add a definition');
		_.strictSame(exported, { call: true, offset: 0 + 1, source: 'test' }, 'expected to correctly add a export');

		_.throws(() => {
			instance.assemble(arg);
		}, 'expected to throw if identifier already exists');

		_.end();
	});

	void _.test('execute', (_) => {
		const instance = new AST.FunctionStatement('test-function', false);
		const context = new Stakr.ExecutionContext();
		const source = new Stakr.Source('test', [instance]);
		const arg: ExecuteArg = { context, source, offset: 1 };

		context.addSource(source);
		source.assemble();
		context.push(123);
		instance.execute(arg);
		_.equal(arg.offset, 123, 'expected to jump');
		_.end();
	});

	_.end();
});
