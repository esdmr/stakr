import { test } from 'tap';
import * as stakr from '#src/stakr.js';
import { StakrMessage } from '#test/test-util/message.js';
import { createAssets } from '#test/test-util/stakr.js';

const loader = new stakr.DefaultLoader();

await test('resolve', async (t) => {
	t.throws(
		() => loader.resolve('%2f', ''),
		new stakr.ResolutionError(StakrMessage.LOADER_INVALID),
		'expected to throw on invalid character %2f',
	);

	t.throws(
		() => loader.resolve('%2F', ''),
		new stakr.ResolutionError(StakrMessage.LOADER_INVALID),
		'expected to throw on invalid character %2F',
	);

	t.throws(
		() => loader.resolve('%5c', ''),
		new stakr.ResolutionError(StakrMessage.LOADER_INVALID),
		'expected to throw on invalid character %5c',
	);

	t.throws(
		() => loader.resolve('%5C', ''),
		new stakr.ResolutionError(StakrMessage.LOADER_INVALID),
		'expected to throw on invalid character %5C',
	);

	await t.test('relative', async (t) => {
		t.throws(
			() => loader.resolve('./a', 'b'),
			new stakr.ResolutionError(StakrMessage.LOADER_NO_RELATIVE),
			'expected to throw on relative . if parent is not absolute',
		);

		t.throws(
			() => loader.resolve('../a', 'b'),
			new stakr.ResolutionError(StakrMessage.LOADER_NO_RELATIVE),
			'expected to throw on relative .. if parent is not absolute',
		);

		t.equal(loader.resolve('./a', '/b/c'), '/b/a',
			'expected to resolve relative . path');

		t.equal(loader.resolve('../a', '/b/c/d'), '/b/a',
			'expected to resolve relative .. path');
	});

	await t.test('absolute', async (t) => {
		t.equal(loader.resolve('/a', '/b/c'), '/a',
			'expected to resolve absolute path');
	});

	await t.test('bare specifier', async (t) => {
		t.equal(loader.resolve('stdlib:commands', '/b/c'), 'stdlib:commands',
			'expected to resolve bare specifier');
	});
});

await test('getSource', async (t) => {
	const { context, source } = await createAssets();

	let callSourceName;

	context.getSource = (sourceName: string) => {
		callSourceName = sourceName;
		return source;
	};

	t.equal(await loader.getSource('abc', context), source,
		'expected to return the result of ExecutionContext.getSource');

	t.equal(callSourceName, 'abc',
		'expected to call ExecutionContext.getSource');
});
