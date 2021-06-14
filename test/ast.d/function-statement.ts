import * as AST from 'src/ast.js';
import * as Stakr from 'src/stakr.js';
import { ExecuteArg } from 'src/types.d';
import * as _ from 'tap';

await _.test('FunctionStatement', async (_) => {
	await _.test('name', async (_) => {
		_.equal(new AST.FunctionStatement('test', false).name, 'test', 'expected to preserve name');
		_.end();
	});

	await _.test('exported', async (_) => {
		_.equal(new AST.FunctionStatement('test', true).exported, true, 'expected to preserve exported flag');
		_.end();
	});

	await _.test('assemble', async (_) => {
		const instance = new AST.FunctionStatement('test-function', true);
		const source = new Stakr.Source('test', [instance]);
		const definition = source.assemble().identifiers.get('test-function');

		_.strictSame(definition, {
			offset: 1,
			sourceName: 'test',
			implicitlyCalled: true,
			exported: true,
		}, 'expected to correctly add a definition');

		const sourceDup = new Stakr.Source('test', [instance, instance]);

		_.throws(() => {
			sourceDup.assemble();
		}, 'expected to throw if identifier already exists');

		_.end();
	});

	await _.test('execute', async (_) => {
		const instance = new AST.FunctionStatement('test-function', false);
		const context = new Stakr.ExecutionContext();
		const source = new Stakr.Source('test', [instance]);
		const arg: ExecuteArg = {
			context,
			source,
			data: new Stakr.ExecuteData(),
			offset: 1,
		};

		context.addSource(source);
		source.assemble();
		arg.data.stack.push(123);
		instance.execute(arg);
		_.equal(arg.offset, 123, 'expected to jump');
		_.end();
	});

	_.end();
});
