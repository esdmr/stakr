import { promisify } from 'node:util';
import * as _ from 'tap';
import * as ast from '#src/ast.js';
import * as stakr from '#src/stakr.js';
import * as types from '#src/types.js';
import { StakrMessage } from '#test-util/message.js';
import { createAssets, SourceState } from '#test-util/stakr.js';

const nextTick: () => Promise<void> = promisify(process.nextTick);

await _.test('link', async (_) => {
	const { context, lib, source } = createAssets({
		lib: [new ast.FunctionStatement('test-function', true)],
		source: [new ast.ImportStatement('lib', 'test-lib')],
		state: SourceState.ADDED,
	});

	_.throws(
		() => context.link(),
		new Error(StakrMessage.EMPTY_SOURCE_LIST),
		'expected to throw if given no source',
	);

	_.strictSame(context.link(source.name), [lib.name, source.name],
		'expected to return dependency graph');

	_.doesNotThrow(() => context.link(source.name),
		'expected to not throw if linked twice');

	// @ts-expect-error Accessing private property
	_.ok(lib.assembleData instanceof stakr.AssembleData,
		'expected to assemble library');

	// @ts-expect-error Accessing private property
	_.ok(source.assembleData instanceof stakr.AssembleData,
		'expected to assemble source');

	_.ok(lib.linkData.get(context) instanceof stakr.LinkData,
		'expected to link library');

	_.ok(source.linkData.get(context) instanceof stakr.LinkData,
		'expected to link source');

	_.end();
});

void _.test('executeAll', async (_) => {
	let called = false;
	let jumped = true;

	const { context, data, source } = createAssets({
		state: SourceState.ASSEMBLED,
		source: [
			{
				execute (arg: types.ExecuteArg) {
					called = true;

					_.strictSame(
						arg,
						{
							context,
							source,
							data,
						},
						'expected to provide an execute argument',
					);

					data.offset = 2;

					_.equal(data.offset, 2,
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
					_.ok(jumped,
						'expected to jump on set offset');

					_.throws(
						() => {
							data.offset = -1;
						},
						'expected to throw if offset is set to a negative value',
					);

					_.throws(
						() => {
							data.offset = 1.1;
						},
						'expected to throw if offset is set to a fractional value',
					);

					_.throws(
						() => {
							data.offset = Number.NaN;
						},
						'expected to throw if offset is set to NaN',
					);

					_.throws(
						() => {
							data.offset = Number.POSITIVE_INFINITY;
						},
						'expected to throw if offset is set to Infinity',
					);

					_.throws(
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

	await _.rejects(
		async () => context.executeAll([], data),
		new Error(StakrMessage.EMPTY_SOURCE_LIST),
		'expected to throw if given no source',
	);

	await _.rejects(
		async () => context.executeAll([source.name], data),
		'expected to throw if given source is not added',
	);

	context.addSource(source);
	await context.executeAll([source.name], data);

	_.ok(called,
		'expected to execute sources');

	await _.test('async', async (_) => {
		let called = false;

		const { context, source, data } = createAssets({
			source: [{
				async execute () {
					await nextTick();
					called = true;
				},
			}],
		});

		await context.execute(source.name, data);

		_.ok(called,
			'expected to await all ast items when executing them');

		_.end();
	});

	_.end();
});

await _.test('addSource', async (_) => {
	const { source, context } = createAssets({
		context: false,
	});

	const source2 = new stakr.Source(source.name, []);

	_.strictSame(context.sourceMap, new Map([[source.name, source]]),
		'expected to add source to sourceMap');

	_.throws(
		() => {
			context.addSource(source2);
		},
		'expected to throw if a different source with same name is added',
	);

	_.end();
});

await _.test('resolveSource', async (_) => {
	const { context, source } = createAssets({
		state: SourceState.ASSEMBLED,
	});

	_.throws(() => context.resolveSource(source.name),
		'expected to throw if source is not found');

	context.addSource(source);

	_.equal(context.resolveSource(source.name), source,
		'expected to return the source');

	_.end();
});
