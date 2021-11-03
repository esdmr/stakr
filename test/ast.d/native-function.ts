import { test } from 'tap';
import { Halt, NativeFunction } from '#src/ast.js';
import testGoto from '#test/test-util/goto.js';
import { createAssets } from '#test/test-util/stakr.js';

await test('name', async (t) => {
	const instance = new NativeFunction('test', () => undefined);

	t.equal(instance.name, 'test',
		'expected to preserve name');
});

await test('executable', async (t) => {
	const executable = () => undefined;
	const instance = new NativeFunction('test', executable);

	t.equal(instance.executable, executable,
		'expected to preserve executable');
});

await test('static createArray', async (t) => {
	t.strictSame(NativeFunction.createArray(new Map([])), [new Halt()],
		'expected to return an empty array if input was empty');

	const arg = ['test-function', () => undefined] as const;

	t.strictSame(
		NativeFunction.createArray(new Map([arg])),
		[
			new Halt(),
			new NativeFunction(...arg),
		],
		'expected to convert all elements to a native function',
	);
});

await test('assemble', async (t) => {
	const instance = new NativeFunction('test-function', () => undefined);

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
			exported: true,
		},
		'expected to correctly add a definition',
	);

	t.throws(
		() => {
			instance.assemble(arg);
		},
		'expected to throw if identifier already exists',
	);
});

await test('execute', async (t) => {
	let called = false;

	const instance = new NativeFunction('test-function', () => {
		called = true;
	});

	const { data, arg } = await createAssets();

	data.aux.push(123, 'test-lib');
	instance.execute(arg);

	t.ok(called,
		'expected to call the given function');

	t.equal(data.sourceName, 'test-lib',
		'expected to return to source');

	t.equal(data.offset, 123,
		'expected to return to offset');

	t.strictSame(data.aux.toNewArray(), [],
		'expected to pop from aux');

	await t.test('return', async (t) => {
		testGoto(t, (...items) => {
			data.aux.clear();
			data.aux.push(...items);
			instance.execute(arg);

			return {
				stack: data.aux,
				offset: data.offset,
				sourceName: data.sourceName,
			};
		});
	});
});
