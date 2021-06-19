import * as ast from 'src/ast.js';
import * as stakr from 'src/stakr.js';
import { ExecuteArg } from 'src/types.js';
import * as _ from 'tap';

await _.test('name', async (_) => {
	_.equal(new ast.FunctionStatement('test', false).name, 'test', 'expected to preserve name');
	_.end();
});

await _.test('exported', async (_) => {
	_.equal(new ast.FunctionStatement('test', true).exported, true, 'expected to preserve exported flag');
	_.end();
});

await _.test('assemble', async (_) => {
	const instance = new ast.FunctionStatement('test-function', true);
	const source = new stakr.Source('test', [instance]);
	const definition = source.assemble().identifiers.get('test-function');

	_.strictSame(definition, {
		offset: 1,
		sourceName: 'test',
		implicitlyCalled: true,
		exported: true,
	}, 'expected to correctly add a definition');

	const sourceDup = new stakr.Source('test', [instance, instance]);

	_.throws(() => {
		sourceDup.assemble();
	}, 'expected to throw if identifier already exists');

	_.end();
});

await _.test('execute', async (_) => {
	const instance = new ast.FunctionStatement('test-function', false);
	const context = new stakr.ExecutionContext();
	const source = new stakr.Source('test', [instance]);
	const arg: ExecuteArg = {
		context,
		source,
		data: new stakr.ExecuteData(),
		offset: 1,
	};

	context.addSource(source);
	source.assemble();
	arg.data.stack.push(123);
	instance.execute(arg);
	_.equal(arg.offset, 123, 'expected to jump');
	_.end();
});
