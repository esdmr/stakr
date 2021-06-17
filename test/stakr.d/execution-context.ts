import * as ast from 'src/ast.js';
import * as stakr from 'src/stakr.js';
import { ExecuteArg } from 'src/types.js';
import * as _ from 'tap';

await _.test('link', async (_) => {
	const context = new stakr.ExecutionContext();
	const source = new stakr.Source('test', []);
	context.addSource(source);
	context.link(new Set(['test']));

	_.doesNotThrow(() => {
		context.link(new Set(['test']));
	}, 'expected to not throw if linked twice');
});

await _.test('assemble', async (_) => {
	const context = new stakr.ExecutionContext();

	const lib = new stakr.Source('test-lib', [
		new ast.FunctionStatement('test-function', true),
	]);

	const source = new stakr.Source('test', [
		new ast.ImportStatement('lib', 'test-lib'),
	]);

	context.addSource(lib);
	context.addSource(source);

	_.throws(() => {
		context.link(new Set());
	}, 'expected to throw if given no source');

	_.strictSame(context.link(new Set(['test'])), ['test-lib', 'test'], 'expected to return dependency graph');
	// @ts-expect-error Accessing private property
	_.ok(lib.assembleData, 'expected to assemble library');
	// @ts-expect-error Accessing private property
	_.ok(source.assembleData, 'expected to assemble source');
	_.ok(lib.linkData.has(context), 'expected to link library');
	_.ok(source.linkData.has(context), 'expected to link source');

	_.end();
});

void _.test('execute', (_) => {
	let called = false;
	let jumped = true;
	const data = new stakr.ExecuteData();
	const instance = new stakr.ExecutionContext();

	const source = new stakr.Source('test', [
		{
			execute (arg: ExecuteArg) {
				called = true;
				_.strictSame(arg, {
					context: instance,
					source,
					data,
					offset: 1,
				}, 'expected to provide an execute argument');
				arg.offset = 2;
				_.equal(arg.offset, 2, 'expected to preserve offset');
			},
		},
		{
			execute () {
				jumped = false;
			},
		},
		{
			execute (arg: ExecuteArg) {
				_.ok(jumped, 'expected to jump on set offset');

				_.throws(() => {
					arg.offset = -1;
				}, 'expected to throw if offset is set to a negative value');

				_.throws(() => {
					arg.offset = 1.1;
				}, 'expected to throw if offset is set to a fractional value');

				_.throws(() => {
					arg.offset = Number.NaN;
				}, 'expected to throw if offset is set to NaN');

				_.throws(() => {
					arg.offset = Number.POSITIVE_INFINITY;
				}, 'expected to throw if offset is set to Infinity');

				_.throws(() => {
					arg.offset = Number.MAX_SAFE_INTEGER + 1;
				}, 'expected to throw if offset is set to a non-safe integer');
			},
		},
		{},
	]);

	_.throws(() => {
		instance.execute([], data);
	}, 'expected to throw if given no source');

	instance.addSource(source);
	instance.execute(['test'], data);
	_.ok(called, 'expected to execute sources');
	_.end();
});

await _.test('addSource', async (_) => {
	const source = new stakr.Source('test', []);
	const context = new stakr.ExecutionContext();
	context.addSource(source);
	_.strictSame(context.sourceMap, new Map([['test', source]]), 'expected to add source to sourceMap');
	const source2 = new stakr.Source('test', []);

	_.throws(() => {
		context.addSource(source2);
	}, 'expected to throw if a different source with same name is added');

	_.end();
});

await _.test('resolveSource', async (_) => {
	const context = new stakr.ExecutionContext();
	const source = new stakr.Source('test', []);

	_.throws(() => {
		context.resolveSource('test');
	}, 'expected to throw if source is not found');

	context.addSource(source);
	_.equal(context.resolveSource('test'), source, 'expected to return the source');
	_.end();
});

_.end();
