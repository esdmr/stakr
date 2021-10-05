import { test } from 'tap';
import SafeArray, { Message } from '#src/util/safe-array.js';

const error = (message: string) => new RangeError(message);

const assertIndex = (fn: (index: number) => void, length: number) => async (t: Tap.Test) => {
	t.throws(
		() => {
			fn(Number.EPSILON);
		},
		error(Message.indexIsNotInt),
		'expected to throw if index is not an integer',
	);

	t.throws(
		() => {
			fn(Number.MAX_SAFE_INTEGER + 1);
		},
		error(Message.indexIsNotInt),
		'expected to throw if index is not a safe integer',
	);

	t.throws(
		() => {
			fn(Number.NaN);
		},
		error(Message.indexIsNotInt),
		'expected to throw if index is NaN',
	);

	t.throws(
		() => {
			fn(Number.POSITIVE_INFINITY);
		},
		error(Message.indexIsNotInt),
		'expected to throw if index is +∞',
	);

	t.throws(
		() => {
			fn(-1);
		},
		error(Message.indexIsNegative),
		'expected to throw if index is negative',
	);

	t.throws(
		() => {
			fn(length);
		},
		error(Message.indexOutOfBounds),
		'expected to throw if index is after the last element',
	);

	const skipIfArrayIsEmpty = {
		skip: length > 0 ? undefined : 'Array is empty',
	};

	t.doesNotThrow(
		() => {
			fn(0);
		},
		'expected to not throw if index is a safe integer',
		skipIfArrayIsEmpty,
	);

	t.doesNotThrow(
		() => {
			fn(-0);
		},
		'expected to ignore the sign of zero',
		skipIfArrayIsEmpty,
	);

	t.doesNotThrow(
		() => {
			for (let i = 0; i < length; i++) {
				fn(i);
			}
		},
		'expected to not throw if index is a valid element',
		skipIfArrayIsEmpty,
	);
};

await test('constructor', async (t) => {
	t.throws(
		() => new SafeArray(Number.EPSILON),
		error(Message.maxIsNotInt),
		'expected to throw if maximum length is not an integer',
	);

	t.throws(
		() => new SafeArray(Number.MAX_SAFE_INTEGER + 1),
		error(Message.maxIsNotInt),
		'expected to throw if maximum length is not a safe integer',
	);

	t.throws(
		() => new SafeArray(Number.NaN),
		error(Message.maxIsNotInt),
		'expected to throw if maximum length is NaN',
	);

	t.throws(
		() => new SafeArray(-1),
		error(Message.maxIsNegative),
		'expected to throw if maximum length is negative',
	);

	t.doesNotThrow(() => new SafeArray(0),
		'expected to not throw if maximum length is a safe integer');

	t.doesNotThrow(() => new SafeArray(Number.POSITIVE_INFINITY),
		'expected to not throw if maximum length is +∞');

	t.doesNotThrow(() => new SafeArray(),
		'expected to not throw if maximum length is not set');

	t.strictSame(new SafeArray().toNewArray(), [],
		'expected to return an empty safe-array');
});

await test('length', async (t) => {
	t.equal(new SafeArray().length, 0,
		'expected to return correct length if empty');

	t.equal(SafeArray.from([1]).length, 1,
		'expected to return correct length if not empty');

	t.equal(SafeArray.from([1, 2], 2).length, 2,
		'expected to return correct length if full');
});

await test('static from', async (t) => {
	t.throws(
		() => SafeArray.from([1], 0),
		error(Message.largerThanMax),
		'expected to throw if maximum length is less than array length',
	);

	t.doesNotThrow(() => SafeArray.from([1], 1),
		'expected to not throw if maximum length is equal to array length');

	t.doesNotThrow(() => SafeArray.from([1], 2),
		'expected to not throw if maximum length is more than array length');

	t.doesNotThrow(() => SafeArray.from([1]),
		'expected to not throw if maximum length is not set');

	t.ok(new SafeArray() instanceof SafeArray,
		'expected to return a safe-array');

	t.strictSame(SafeArray.from([1, 2]).toNewArray(), [1, 2],
		'expected to copy array onto safe-array');
});

await test('toNewArray', async (t) => {
	t.ok(Array.isArray(new SafeArray().toNewArray()),
		'expected to return an array');

	t.strictSame(new SafeArray().toNewArray(), [],
		'expected to return an empty array if empty');

	const instance = new SafeArray();
	t.not(instance.toNewArray(), instance.toNewArray(),
		'expected to return a new array on every call');

	t.strictSame(SafeArray.from([1, 2]).toNewArray(), [1, 2],
		'expected to copy items');

	t.strictSame(SafeArray.from([undefined]).toNewArray(), [undefined],
		'expected to copy undefined as an item');

	const old = instance.toNewArray();
	instance.push(1, 2, 3);
	t.not(old, instance.toNewArray(),
		'expected to return a new array after modification');

	t.strictSame(instance.toNewArray(), [1, 2, 3],
		'expected to return up-to-date array');
});

await test('push', async (t) => {
	t.throws(
		() => {
			new SafeArray(0).push(1);
		},
		error(Message.arrayIsFull),
		'expected to throw if full',
	);

	t.throws(
		() => {
			new SafeArray(1).push(1, 2);
		},
		error(Message.largerThanMax),
		'expected to throw on too many items',
	);

	t.doesNotThrow(
		() => {
			new SafeArray().push();
			new SafeArray(0).push();
		},
		'expected to not throw with no inputs',
	);

	t.doesNotThrow(
		() => {
			new SafeArray(1).push(1);
		},
		'expected to not throw if full after action',
	);

	const instance = new SafeArray();
	instance.push();

	t.strictSame(instance.toNewArray(), [],
		'expected to not change safe-array with no inputs');

	t.equal(instance.length, 0,
		'expected to not update length with no inputs');

	instance.push(1);
	t.strictSame(instance.toNewArray(), [1],
		'expected to push inputs');

	t.equal(instance.length, 1,
		'expected to update length');
});

await test('pop', async (t) => {
	t.throws(
		() => {
			new SafeArray().pop();
		},
		error(Message.arrayIsEmpty),
		'expected to throw if safe-array is empty',
	);

	const instance = SafeArray.from([undefined, 1]);
	t.equal(instance.pop(), 1,
		'expected to return last element of array');

	t.equal(instance.pop(), undefined,
		'expected to return undefined as last element of array');

	t.equal(instance.length, 0,
		'expected to update length');
});

await test('get', async (t) => {
	const instance = SafeArray.from([0, undefined, 2]);

	await t.test('expected to assert index',
		assertIndex((index) => instance.get(index), instance.length));

	t.equal(instance.get(2), 2,
		'expected to return correct element');

	t.equal(instance.get(1), undefined,
		'expected to return undefined as correct element');
});

await test('set', async (t) => {
	const instance = SafeArray.from([0, undefined, 2]);

	instance.set(0, 1);
	t.equal(instance.get(0), 1,
		'expected to set correct value');

	instance.set(0, undefined);
	t.equal(instance.get(0), undefined,
		'expected to set undefined as an element');

	await t.test('expected to assert index', assertIndex((index) => {
		instance.set(index, 3);
	}, instance.length));
});

await test('clear', async (t) => {
	const instance = SafeArray.from([1, 2]);
	instance.clear();

	t.strictSame(instance.toNewArray(), [], 'expected to clear the array');
	t.equal(instance.length, 0, 'expected to update the length');
});

await test('toString', async (t) => {
	t.equal(SafeArray.from([1, 2]).toString(), [1, 2].toString(),
		'expected to return the correct value');
});

await test('toLocaleString', async (t) => {
	t.equal(SafeArray.from([1, 2]).toLocaleString(), [1, 2].toLocaleString(),
		'expected to return the correct value');
});

await test('@@iterator', async (t) => {
	t.strictSame([...SafeArray.from([1, 2])], [1, 2],
		'expected to match the array');
});
