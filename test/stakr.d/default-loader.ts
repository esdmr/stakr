import * as _ from 'tap';
import * as stakr from '#src/stakr.js';
import { StakrMessage } from '#test-util/message.js';
import { createAssets } from '#test-util/stakr.js';

const loader = new stakr.DefaultLoader();

await _.test('resolve', async (_) => {
	_.throws(
		() => loader.resolve('%2f', ''),
		new stakr.ResolutionError(StakrMessage.LOADER_INVALID),
		'expected to throw on invalid character %2f',
	);

	_.throws(
		() => loader.resolve('%2F', ''),
		new stakr.ResolutionError(StakrMessage.LOADER_INVALID),
		'expected to throw on invalid character %2F',
	);

	_.throws(
		() => loader.resolve('%5c', ''),
		new stakr.ResolutionError(StakrMessage.LOADER_INVALID),
		'expected to throw on invalid character %5c',
	);

	_.throws(
		() => loader.resolve('%5C', ''),
		new stakr.ResolutionError(StakrMessage.LOADER_INVALID),
		'expected to throw on invalid character %5C',
	);

	await _.test('relative', async (_) => {
		_.throws(
			() => loader.resolve('./a', 'b'),
			new stakr.ResolutionError(StakrMessage.LOADER_NO_RELATIVE),
			'expected to throw on relative . if parent is not absolute',
		);

		_.throws(
			() => loader.resolve('../a', 'b'),
			new stakr.ResolutionError(StakrMessage.LOADER_NO_RELATIVE),
			'expected to throw on relative .. if parent is not absolute',
		);

		_.equal(loader.resolve('./a', '/b/c'), '/b/a',
			'expected to resolve relative . path');

		_.equal(loader.resolve('../a', '/b/c/d'), '/b/a',
			'expected to resolve relative .. path');

		_.end();
	});

	await _.test('absolute', async (_) => {
		_.equal(loader.resolve('/a', '/b/c'), '/a',
			'expected to resolve absolute path');

		_.end();
	});

	await _.test('bare specifier', async (_) => {
		_.equal(loader.resolve('stdlib:commands', '/b/c'), 'stdlib:commands',
			'expected to resolve bare specifier');

		_.end();
	});

	_.end();
});

await _.test('getSource', async (_) => {
	const { context, source } = await createAssets();

	let callSourceName;

	context.getSource = (sourceName: string) => {
		callSourceName = sourceName;
		return source;
	};

	_.equal(await loader.getSource('abc', context), source,
		'expected to return the result of ExecutionContext.getSource');

	_.equal(callSourceName, 'abc',
		'expected to call ExecutionContext.getSource');

	_.end();
});
