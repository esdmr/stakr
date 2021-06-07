import * as _ from 'tap';
import * as AST from 'src/ast.js';
import * as Stakr from 'src/stakr.js';

void _.test('push', (_) => {
	const instance = new Stakr.ExecutionContext();
	instance.push(123, 456);
	_.strictSame(instance.stack, [123, 456], 'expected to push onto the stack');
	_.end();
});

void _.test('pop', (_) => {
	const instance = new Stakr.ExecutionContext();
	instance.push(123);
	const item = instance.pop();
	_.strictSame({ item, stack: instance.stack }, { item: 123, stack: [] }, 'expected to pop from stack');
	_.throws(() => instance.pop(), 'expected to throw if stack is empty');
	_.end();
});

void _.test('assemble', (_) => {
	const context = new Stakr.ExecutionContext();

	const lib = new Stakr.Source('test-lib', [
		new AST.FunctionStatement('test-function', true),
	]);

	const source = new Stakr.Source('test', [
		new AST.ImportStatement('lib', 'test-lib'),
	]);

	context.addSource(lib);
	context.addSource(source);

	_.throws(() => {
		context.assemble(new Set());
	}, 'expected to throw if given no source');

	_.strictSame(context.assemble(new Set(['test'])), ['test-lib', 'test'], 'expected to return dependency graph');
	_.equal(lib.isAssembled, true, 'expected to assemble library');
	_.equal(lib.isAssembled, true, 'expected to assemble source');
	_.equal(lib.isLinked, true, 'expected to link library');
	_.equal(lib.isLinked, true, 'expected to link source');

	_.end();
});

void _.test('execute', (_) => {
	const instance = new Stakr.ExecutionContext();

	const source = new Stakr.Source('test', [
		{
			execute () {
				called = true;
			},
		},
	]);

	let called = false;

	_.throws(() => {
		instance.execute([]);
	}, 'expected to throw if given no source');

	instance.addSource(source);
	instance.execute(['test']);
	_.ok(called, 'expected to execute sources');
	_.end();
});

void _.test('addSource', (_) => {
	const source = new Stakr.Source('test', []);
	const context = new Stakr.ExecutionContext();
	context.addSource(source);
	_.strictSame(context.sourceMap, new Map([['test', source]]), 'expected to add source to sourceMap');
	const source2 = new Stakr.Source('test', []);

	_.throws(() => {
		context.addSource(source2);
	}, 'expected to throw if a different source with same name is added');

	_.end();
});

void _.test('resolveSource', (_) => {
	const context = new Stakr.ExecutionContext();
	const source = new Stakr.Source('test', []);

	_.throws(() => {
		context.resolveSource('test');
	}, 'expected to throw if source is not found');

	context.addSource(source);
	_.equal(context.resolveSource('test'), source, 'expected to return the source');
	_.end();
});

_.end();
