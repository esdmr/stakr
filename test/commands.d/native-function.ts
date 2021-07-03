import { NativeFunction } from 'src/commands.js';
import * as _ from 'tap';
import testGoto from '../test-util/goto.js';
import { createAssets } from '../test-util/stakr.js';

await _.test('name', async (_) => {
	const instance = new NativeFunction('test', () => undefined, true);

	_.equal(instance.name, 'test',
		'expected to preserve name');

	_.end();
});

await _.test('executable', async (_) => {
	const executable = () => undefined;
	const instance = new NativeFunction('test', executable, true);

	_.equal(instance.executable, executable,
		'expected to preserve executable');

	_.end();
});

await _.test('exported', async (_) => {
	const instance = new NativeFunction('test', () => undefined, true);

	_.equal(instance.exported, true,
		'expected to preserve exported flag');

	_.end();
});

await _.test('assemble', async (_) => {
	const instance = new NativeFunction('test-function', () => undefined, false);

	const { source, assembleArg: arg } = createAssets({
		source: [instance],
	});

	instance.assemble(arg);

	const definition = arg.data.identifiers.get('test-function');

	_.strictSame(
		definition,
		{
			offset: 0,
			sourceName: source.name,
			implicitlyCalled: true,
			exported: false,
		},
		'expected to correctly add a definition',
	);

	_.throws(
		() => {
			instance.assemble(arg);
		},
		'expected to throw if identifier already exists',
	);

	_.end();
});

await _.test('execute', async (_) => {
	let called = false;

	const instance = new NativeFunction('test-function', () => {
		called = true;
	}, false);

	const { data, arg } = createAssets();

	data.aux.push(123, 'test-lib');
	instance.execute(arg);

	_.ok(called,
		'expected to call the given function');

	_.equal(data.sourceName, 'test-lib',
		'expected to return to source');

	_.equal(data.offset, 123,
		'expected to return to offset');

	_.strictSame(data.aux.toNewArray(), [],
		'expected to pop from aux');

	await _.test('return', async (_) => {
		testGoto(_, (...items) => {
			data.aux.clear();
			data.aux.push(...items);
			instance.execute(arg);

			return {
				stack: data.aux,
				offset: data.offset,
				sourceName: data.sourceName,
			};
		});

		_.end();
	});

	_.end();
});
