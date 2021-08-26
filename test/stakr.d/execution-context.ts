import { promisify } from 'node:util';
import * as process from 'node:process';
import { test } from 'tap';
import * as ast from '#src/ast.js';
import * as stakr from '#src/stakr.js';
import * as types from '#src/types.js';
import { StakrMessage } from '#test/test-util/message.js';
import { createAssets, SourceState } from '#test/test-util/stakr.js';

const nextTick: () => Promise<void> = promisify(process.nextTick);

await test('link', async (t) => {
	const { context, lib, source } = await createAssets({
		lib: [new ast.FunctionStatement('test-function', true)],
		source: [new ast.ImportStatement('lib', 'test-lib')],
		state: SourceState.ADDED,
	});

	await t.rejects(
		async () => context.link(),
		new Error(StakrMessage.EMPTY_SOURCE_LIST),
		'expected to throw if given no source',
	);

	t.strictSame(await context.link(source.name), [lib.name, source.name],
		'expected to return dependency graph');

	await t.resolves(async () => context.link(source.name),
		'expected to not throw if linked twice');

	// @ts-expect-error Accessing private property
	t.ok(lib.assembleData instanceof stakr.AssembleData,
		'expected to assemble library');

	// @ts-expect-error Accessing private property
	t.ok(source.assembleData instanceof stakr.AssembleData,
		'expected to assemble source');

	t.ok(lib.linkData.get(context) instanceof stakr.LinkData,
		'expected to link library');

	t.ok(source.linkData.get(context) instanceof stakr.LinkData,
		'expected to link source');

	t.end();
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

	await t.rejects(
		async () => context.executeAll([], data),
		new Error(StakrMessage.EMPTY_SOURCE_LIST),
		'expected to throw if given no source',
	);

	await t.test('execute', async (t) => {
		await context.executeAll([source.name], data);

		t.equal(data.sourceName, source.name,
			'expected to jump to source');

		t.end();
	});

	t.end();
});

void test('execute', async (t) => {
	let called = false;
	let jumped = true;

	const { context, data, source } = await createAssets({
		state: SourceState.ASSEMBLED,
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

	await t.rejects(
		async () => context.execute(source.name, data),
		'expected to throw if given source is not added',
	);

	context.addSource(source);
	await context.execute(source.name, data);

	t.ok(called,
		'expected to execute source');

	await t.test('async', async (t) => {
		let called = false;

		const { context, source, data } = await createAssets({
			source: [{
				async execute () {
					await nextTick();
					called = true;
				},
			}],
		});

		await context.execute(source.name, data);

		t.ok(called,
			'expected to await all ast items when executing them');

		t.end();
	});

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

		await t.rejects(
			async () => context.execute(source.name, data),
			new Error(StakrMessage.HALTED_IN_WRONG_SOURCE),
			'expected to throw if halted or reached EOF in the wrong file',
		);

		t.end();
	});

	t.end();
});

await test('addSource', async (t) => {
	const { source, context } = await createAssets({
		context: {
			addStandardLibrary: false,
		},
	});

	const source2 = new stakr.Source(source.name, []);

	t.strictSame(context.sourceMap, new Map([[source.name, source]]),
		'expected to add source to sourceMap');

	t.throws(
		() => {
			context.addSource(source2);
		},
		'expected to throw if a different source with same name is added',
	);

	t.end();
});

await test('getSource', async (t) => {
	const { context, source } = await createAssets({
		state: SourceState.ASSEMBLED,
	});

	t.throws(() => context.getSource(source.name),
		'expected to throw if source is not found');

	context.addSource(source);

	t.equal(context.getSource(source.name), source,
		'expected to return the source');

	t.end();
});
