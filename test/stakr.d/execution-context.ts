import { test } from 'tap';
import * as ast from '#src/ast.js';
import * as messages from '#src/messages.js';
import * as stakr from '#src/stakr.js';
import type * as types from '#src/types.js';
import { createAssets, SourceState } from '#test/test-util/stakr.js';

await test('link', async (t) => {
	const { context, lib, source } = await createAssets({
		lib: [new ast.FunctionStatement('test-function', true)],
		source: [new ast.ImportStatement('lib', 'test-lib')],
		state: SourceState.added,
	});

	await t.rejects(
		async () => context.link(),
		new Error(messages.emptySourceList),
		'expected to throw if given no source',
	);

	t.strictSame(await context.link(source.name), [lib.name, source.name],
		'expected to return dependency graph');

	await t.resolves(async () => context.link(source.name),
		'expected to not throw if linked twice');

	t.ok(lib._isAssembled,
		'expected to assemble library');

	t.ok(source._isAssembled,
		'expected to assemble source');

	t.ok(lib.linkData.get(context) instanceof stakr.LinkData,
		'expected to link library');

	t.ok(source.linkData.get(context) instanceof stakr.LinkData,
		'expected to link source');

	await t.test('persistentSources', async (t) => {
		const { context, lib, source } = await createAssets({
			lib: [new ast.FunctionStatement('test-function', true)],
			source: [],
			state: SourceState.added,
		});

		context.persistentSources.push(lib.name);
		await context.link(source.name);

		t.equal(
			source.linkData.get(context)?.identifiers.get('test-function'),
			lib.assemble().identifiers.get('test-function'),
			'expected to import all persistent sources without a prefix',
		);
	});
});

await test('executeAll', async (t) => {
	class MockExecutionContext extends stakr.ExecutionContext {
		async execute (sourceName: string, data: stakr.ExecuteData) {
			data.sourceName = sourceName;
			data.offset = 0;
			data.halted = true;
		}
	}

	const context = new MockExecutionContext();

	const { source, data } = await createAssets();

	t.throws(
		() => {
			context.executeAll([], data);
		},
		new Error(messages.emptySourceList),
		'expected to throw if given no source',
	);

	await t.test('execute', async (t) => {
		context.executeAll([source.name], data);

		t.equal(data.sourceName, source.name,
			'expected to jump to source');
	});
});

void test('execute', async (t) => {
	let called = false;
	let jumped = true;

	const { context, data, source } = await createAssets({
		state: SourceState.assembled,
		source: [
			{
				execute (arg: types.ExecuteArg) {
					called = true;

					t.strictSame(
						arg,
						{
							context,
							source,
							data,
						},
						'expected to provide an execute argument',
					);

					data.offset = 2;

					t.equal(data.offset, 2,
						'expected to preserve offset');
				},
			},
			{
				execute () {
					jumped = false;
				},
			},
			{
				execute ({ data }: types.ExecuteArg) {
					t.ok(jumped,
						'expected to jump on set offset');

					t.throws(
						() => {
							data.offset = -1;
						},
						'expected to throw if offset is set to a negative value',
					);

					t.throws(
						() => {
							data.offset = 1.1;
						},
						'expected to throw if offset is set to a fractional value',
					);

					t.throws(
						() => {
							data.offset = Number.NaN;
						},
						'expected to throw if offset is set to NaN',
					);

					t.throws(
						() => {
							data.offset = Number.POSITIVE_INFINITY;
						},
						'expected to throw if offset is set to Infinity',
					);

					t.throws(
						() => {
							data.offset = Number.MAX_SAFE_INTEGER + 1;
						},
						'expected to throw if offset is set to a non-safe integer',
					);
				},
			},
			{},
		],
	});

	t.throws(
		() => {
			context.execute(source.name, data);
		},
		'expected to throw if given source is not added',
	);

	context.addSource(source);
	context.execute(source.name, data);

	t.ok(called,
		'expected to execute source');

	await t.test('halt in wrong source', async (t) => {
		const { context, source, lib, data } = await createAssets({
			lib: [],
			source: [{
				execute ({ data }) {
					data.sourceName = lib.name;
					data.offset = 0;
				},
			}],
		});

		t.throws(
			() => {
				context.execute(source.name, data);
			},
			new Error(messages.haltedInWrongSource),
			'expected to throw if halted or reached EOF in the wrong file',
		);
	});
});

await test('addSource', async (t) => {
	const { source, context } = await createAssets();

	const source2 = new stakr.Source(source.name, []);

	t.strictSame(context.sourceMap, new Map([[source.name, source]]),
		'expected to add source to sourceMap');

	t.throws(
		() => {
			context.addSource(source2);
		},
		'expected to throw if a different source with same name is added',
	);
});

await test('getSource', async (t) => {
	const { context, source } = await createAssets({
		state: SourceState.assembled,
	});

	t.throws(
		() => context.getSource(source.name),
		'expected to throw if source is not found',
	);

	context.addSource(source);

	t.equal(context.getSource(source.name), source,
		'expected to return the source');
});
