import * as AST from 'src/ast.js';
import * as Stakr from 'src/stakr.js';
import * as _ from 'tap';

void _.test('name', (_) => {
	_.equal(new Stakr.Source('test', []).name, 'test', 'expected to preserve name');
	_.end();
});

void _.test('source', (_) => {
	const source = [] as const;
	_.equal(new Stakr.Source('test', source).source, source, 'expected to preserve source list');
	_.end();
});

void _.test('assemble', (_) => {
	let called = false;
	const source = new Stakr.Source('test', [
		// @ts-expect-error
		{
			assemble (arg: Stakr.AssembleArg) {
				called = true;
				_.strictSame(arg, {
					source,
					offset: 0,
					blockStack: [],
				}, 'expected to provide an assemble argument');
			},
		},
		// @ts-expect-error
		{},
	]);

	source.assemble();
	_.ok(called, 'expected to call assemble');
	called = false;
	source.assemble();
	_.notOk(called, 'expected to not call assemble again');

	const source2 = new Stakr.Source('test', [new AST.BlockStart()]);

	_.throws(() => {
		source2.assemble();
	}, 'expected to throw on extraneous start blocks');

	_.end();
});

void _.test('postAssemble', (_) => {
	let called = false;
	const context = new Stakr.ExecutionContext();
	const source = new Stakr.Source('test', [
		// @ts-expect-error
		{
			postAssemble (arg: Readonly<Stakr.ExecuteArg>) {
				called = true;
				_.strictSame(arg, {
					context,
					source,
					offset: 0,
				}, 'expected to provide an post-assemble argument');
			},
		},
		// @ts-expect-error
		{},
	]);

	_.throws(() => {
		source.postAssemble(context);
	}, 'expected to throw if not assembled');

	source.assemble();
	source.postAssemble(context);
	_.ok(called, 'expected to call postAssemble');
	called = false;
	source.postAssemble(context);
	_.notOk(called, 'expected to not call postAssemble again');
	_.end();
});

void _.test('execute', (_) => {
	let called = false;
	let jumped = true;
	const context = new Stakr.ExecutionContext();
	const source = new Stakr.Source('test', [
		// @ts-expect-error
		{
			execute (arg: Stakr.ExecuteArg) {
				called = true;
				_.strictSame(arg, {
					context,
					source,
					offset: 1,
				}, 'expected to provide an execute argument');
				arg.offset = 2;
				_.equal(arg.offset, 2, 'expected to preserve offset');
			},
		},
		// @ts-expect-error
		{
			execute () {
				jumped = false;
			},
		},
		// @ts-expect-error
		{
			execute (arg: Stakr.ExecuteArg) {
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
		// @ts-expect-error
		{},
	]);

	source.execute(context, 0);
	_.ok(called, 'expected to call execute');
	_.end();
});

_.end();
