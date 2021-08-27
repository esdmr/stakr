import { promisify } from 'node:util';
import * as process from 'node:process';
import { test } from 'tap';
import { NativeFunction } from '#src/commands.js';
import testGoto from '#test/test-util/goto.js';
import { createAssets } from '#test/test-util/stakr.js';

const nextTick: () => Promise<void> = promisify(process.nextTick);

await test('name', async (t) => {
	const instance = new NativeFunction('test', () => undefined, true);

	t.equal(instance.name, 'test',
		'expected to preserve name');

	t.end();
});

await test('executable', async (t) => {
	const executable = () => undefined;
	const instance = new NativeFunction('test', executable, true);

	t.equal(instance.executable, executable,
		'expected to preserve executable');

	t.end();
});

await test('exported', async (t) => {
	const instance = new NativeFunction('test', () => undefined, true);

	t.equal(instance.exported, true,
		'expected to preserve exported flag');

	t.end();
});

await test('assemble', async (t) => {
	const instance = new NativeFunction('test-function', () => undefined, false);

	const { source, assembleArg: arg } = await createAssets({
		source: [instance],
	});

	instance.assemble(arg);

	const definition = arg.data.identifiers.get('test-function');

	t.strictSame(
		definition,
		{
			offset: 0,
			sourceName: source.name,
			implicitlyCalled: true,
			exported: false,
		},
		'expected to correctly add a definition',
	);

	t.throws(
		() => {
			instance.assemble(arg);
		},
		'expected to throw if identifier already exists',
	);

	t.end();
});

await test('execute', async (t) => {
	let called = false;

	const instance = new NativeFunction('test-function', () => {
		called = true;
	}, false);

	const { data, arg } = await createAssets();

	data.aux.push(123, 'test-lib');
	await instance.execute(arg);

	t.ok(called,
		'expected to call the given function');

	t.equal(data.sourceName, 'test-lib',
		'expected to return to source');

	t.equal(data.offset, 123,
		'expected to return to offset');

	t.strictSame(data.aux.toNewArray(), [],
		'expected to pop from aux');

	await t.test('return', async (t) => {
		await testGoto(t, async (...items) => {
			data.aux.clear();
			data.aux.push(...items);
			await instance.execute(arg);

			return {
				stack: data.aux,
				offset: data.offset,
				sourceName: data.sourceName,
			};
		});

		t.end();
	});

	await t.test('async', async (t) => {
		let called = false;

		const instance = new NativeFunction('test-function', async () => {
			await nextTick();
			called = true;
		}, false);

		const { data, arg } = await createAssets();

		data.aux.push(123, 'test-lib');
		await instance.execute(arg);

		t.ok(called,
			'expected to call the given function');

		t.equal(data.sourceName, 'test-lib',
			'expected to return to source');

		t.equal(data.offset, 123,
			'expected to return to offset');

		t.strictSame(data.aux.toNewArray(), [],
			'expected to pop from aux');

		t.end();
	});

	t.end();
});
