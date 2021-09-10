import { inspect, InspectOptions } from 'node:util';
import t, { test } from 'tap';
import { isNotUndefined } from '@esdmr/assert/nullables';
import commands_ from '#src/stdlib/commands.js';
import { createAssets } from '#test/test-util/stakr.js';
import { CommandsMessage } from '#test/test-util/message.js';

// `node-tap`'s `tcompare.format` converts Infinities and possibly NaNs into
// nulls. This is less than ideal, so we replace it with `util.inspect`.
const inspectOptions: InspectOptions = {
	depth: Number.POSITIVE_INFINITY,
	maxArrayLength: Number.POSITIVE_INFINITY,
	maxStringLength: Number.POSITIVE_INFINITY,
	breakLength: Number.POSITIVE_INFINITY,
	compact: true,
	sorted: true,
};

t.formatSnapshot = (object: unknown) => inspect(object, inspectOptions);

// All standard libraries must be constructed first before use. Standard command
// does not take any parameters, so it returns the same library every time.
const commands = commands_();

const integerValues = [-1, 0, 1, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER];
const booleanValues = [false, true];
const nonFloatValues = ['text', true, null];
const nonIntegerValues = ['text', 0.5, true, null];
const nonBooleanValues = ['text', 0, null];

const floatValues = [
	-1,
	-0.5,
	0,
	0.5,
	1,
	Number.NEGATIVE_INFINITY,
	Number.POSITIVE_INFINITY,
	Number.NaN,
];

const anyValues = [
	'',
	'text',
	0,
	Number.POSITIVE_INFINITY,
	Number.NaN,
	...booleanValues,
	null,
];

// Arithmetic binary
for (const key of ['+', '-', '*', '/', '%', '**']) {
	await test(key, async (t) => {
		const { arg, data } = await createAssets();
		const func = commands.get(key);

		isNotUndefined(func);

		for (const a of floatValues) {
			for (const b of floatValues) {
				data.stack.clear();
				data.stack.push(b, a);
				await func(arg);
				t.matchSnapshot(data.stack.toNewArray(),
					`expected to match snapshot: ${a} ${key} ${b}`);
			}
		}

		for (const a of nonFloatValues) {
			data.stack.clear();
			data.stack.push(0, a);

			await t.rejects(
				async () => func(arg),
				new TypeError(CommandsMessage.PARAM_IS_NOT_NUMBER),
				'expected to throw if the first parameter is invalid',
			);

			data.stack.clear();
			data.stack.push(a, 0);

			await t.rejects(
				async () => func(arg),
				new TypeError(CommandsMessage.PARAM_IS_NOT_NUMBER),
				'expected to throw if the second parameter is invalid',
			);
		}
	});
}

// Logical binary
for (const key of ['and', 'or']) {
	await test(key, async (t) => {
		const { arg, data } = await createAssets();
		const func = commands.get(key);

		isNotUndefined(func);

		for (const a of booleanValues) {
			for (const b of booleanValues) {
				data.stack.clear();
				data.stack.push(b, a);
				await func(arg);
				t.matchSnapshot(data.stack.toNewArray(),
					`expected to match snapshot: ${String(a)} ${key} ${String(b)}`);
			}
		}

		for (const a of nonBooleanValues) {
			data.stack.clear();
			data.stack.push(true, a);

			await t.rejects(
				async () => func(arg),
				new TypeError(CommandsMessage.PARAM_IS_NOT_BOOLEAN),
				'expected to throw if the first parameter is invalid',
			);

			data.stack.clear();
			data.stack.push(a, true);

			await t.rejects(
				async () => func(arg),
				new TypeError(CommandsMessage.PARAM_IS_NOT_BOOLEAN),
				'expected to throw if the second parameter is invalid',
			);
		}
	});
}

// Logical unary
await test('not', async (t) => {
	const { arg, data } = await createAssets();
	const func = commands.get('not');

	isNotUndefined(func);

	for (const a of booleanValues) {
		data.stack.clear();
		data.stack.push(a);
		await func(arg);
		t.matchSnapshot(data.stack.toNewArray(),
			`expected to match snapshot: not ${String(a)}`);
	}

	for (const a of nonBooleanValues) {
		data.stack.clear();
		data.stack.push(a);

		await t.rejects(
			async () => func(arg),
			new TypeError(CommandsMessage.PARAM_IS_NOT_BOOLEAN),
			'expected to throw if the parameter is invalid',
		);
	}
});

// Equality binary
for (const key of ['==', '!=']) {
	await test(key, async (t) => {
		const { arg, data } = await createAssets();
		const func = commands.get(key);

		isNotUndefined(func);

		for (const a of anyValues) {
			for (const b of anyValues) {
				data.stack.clear();
				data.stack.push(b, a);
				await func(arg);
				t.matchSnapshot(data.stack.toNewArray(),
					`expected to match snapshot: (${String(a)}) ${key} (${String(b)})`);
			}
		}

		// Equality takes any input. None of the input types are invalid.
	});
}

// Inequality binary
for (const key of ['>', '>=', '<', '<=']) {
	await test(key, async (t) => {
		const { arg, data } = await createAssets();
		const func = commands.get(key);

		isNotUndefined(func);

		for (const a of floatValues) {
			for (const b of floatValues) {
				data.stack.clear();
				data.stack.push(b, a);
				await func(arg);
				t.matchSnapshot(data.stack.toNewArray(),
					`expected to match snapshot: ${a} ${key} ${b}`);
			}
		}

		for (const a of nonFloatValues) {
			data.stack.clear();
			data.stack.push(0, a);

			await t.rejects(
				async () => func(arg),
				new TypeError(CommandsMessage.PARAM_IS_NOT_NUMBER),
				'expected to throw if the first parameter is invalid',
			);

			data.stack.clear();
			data.stack.push(a, 0);

			await t.rejects(
				async () => func(arg),
				new TypeError(CommandsMessage.PARAM_IS_NOT_NUMBER),
				'expected to throw if the second parameter is invalid',
			);
		}
	});
}

// Bitwise binary
for (const key of ['&', '|', '^', '<<', '>>', '>>>', '<<|', '|>>']) {
	await test(key, async (t) => {
		const { arg, data } = await createAssets();
		const func = commands.get(key);

		isNotUndefined(func);

		for (const a of integerValues) {
			for (const b of integerValues) {
				data.stack.clear();
				data.stack.push(b, a);
				await func(arg);
				t.matchSnapshot(data.stack.toNewArray(),
					`expected to match snapshot: ${a} ${key} ${b}`);
			}
		}

		for (const a of nonIntegerValues) {
			data.stack.clear();
			data.stack.push(0, a);

			await t.rejects(
				async () => func(arg),
				new TypeError(CommandsMessage.PARAM_IS_NOT_SAFE_INT),
				'expected to throw if the first parameter is invalid',
			);

			data.stack.clear();
			data.stack.push(a, 0);

			await t.rejects(
				async () => func(arg),
				new TypeError(CommandsMessage.PARAM_IS_NOT_SAFE_INT),
				'expected to throw if the second parameter is invalid',
			);
		}
	});
}

// Bitwise unary
await test('~', async (t) => {
	const { arg, data } = await createAssets();
	const func = commands.get('~');

	isNotUndefined(func);

	for (const a of integerValues) {
		data.stack.clear();
		data.stack.push(a);
		await func(arg);
		t.matchSnapshot(data.stack.toNewArray(),
			`expected to match snapshot: ~ ${a}`);
	}

	for (const a of nonIntegerValues) {
		data.stack.clear();
		data.stack.push(a);

		await t.rejects(
			async () => func(arg),
			new TypeError(CommandsMessage.PARAM_IS_NOT_SAFE_INT),
			'expected to throw if the parameter is invalid',
		);
	}
});
