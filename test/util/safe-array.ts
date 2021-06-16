import * as _ from 'tap';
import SafeArray, { ErrorMessage as Message } from 'src/util/safe-array.js';

const error = (message: string) => new RangeError(message);

const assertIndex = (fn: (index: number) => void, length: number) => async (_: Tap.Test) => {
	_.throws(
		() => {
			fn(Number.EPSILON);
		},
		error(Message.INDEX_IS_NOT_INT),
		'expected to throw if index is not an integer',
	);

	_.throws(
		() => {
			fn(Number.MAX_SAFE_INTEGER + 1);
		},
		error(Message.INDEX_IS_NOT_INT),
		'expected to throw if index is not a safe integer',
	);

	_.throws(
		() => {
			fn(Number.NaN);
		},
		error(Message.INDEX_IS_NOT_INT),
		'expected to throw if index is NaN',
	);

	_.throws(
		() => {
			fn(Number.POSITIVE_INFINITY);
		},
		error(Message.INDEX_IS_NOT_INT),
		'expected to throw if index is +∞',
	);

	_.throws(
		() => {
			fn(-1);
		},
		error(Message.INDEX_IS_NEGATIVE),
		'expected to throw if index is negative',
	);

	_.throws(
		() => {
			fn(length);
		},
		error(Message.INDEX_OUT_OF_BOUNDS),
		'expected to throw if index is after the last element',
	);

	const skipIfArrayIsEmpty = {
		skip: length > 0 ? undefined : 'Array is empty',
	};

	_.doesNotThrow(
		() => {
			fn(0);
		},
		'expected to not throw if index is a safe integer',
		skipIfArrayIsEmpty,
	);

	_.doesNotThrow(
		() => {
			fn(-0);
		},
		'expected to ignore the sign of zero',
		skipIfArrayIsEmpty,
	);

	_.doesNotThrow(
		() => {
			for (let i = 0; i < length; i++) {
				fn(i);
			}
		},
		'expected to not throw if index is a valid element',
		skipIfArrayIsEmpty,
	);
};

await _.test('constructor', async (_) => {
	_.throws(
		() => new SafeArray(Number.EPSILON),
		error(Message.MAX_IS_NOT_INT),
		'expected to throw if maximum length is not an integer',
	);

	_.throws(
		() => new SafeArray(Number.MAX_SAFE_INTEGER + 1),
		error(Message.MAX_IS_NOT_INT),
		'expected to throw if maximum length is not a safe integer',
	);

	_.throws(
		() => new SafeArray(Number.NaN),
		error(Message.MAX_IS_NOT_INT),
		'expected to throw if maximum length is NaN',
	);

	_.throws(
		() => new SafeArray(-1),
		error(Message.MAX_IS_NEGATIVE),
		'expected to throw if maximum length is negative',
	);

	_.doesNotThrow(() => new SafeArray(0),
		'expected to not throw if maximum length is a safe integer');

	_.doesNotThrow(() => new SafeArray(Number.POSITIVE_INFINITY),
		'expected to not throw if maximum length is +∞');

	_.doesNotThrow(() => new SafeArray(),
		'expected to not throw if maximum length is not set');

	_.same(new SafeArray().toNewArray(), [],
		'expected to return an empty safe-array');

	_.end();
});

await _.test('length', async (_) => {
	_.equal(new SafeArray().length, 0,
		'expected to return correct length if empty');

	_.equal(SafeArray.from([1]).length, 1,
		'expected to return correct length if not empty');

	_.equal(SafeArray.from([1, 2], 2).length, 2,
		'expected to return correct length if full');

	_.end();
});

await _.test('static from', async (_) => {
	_.throws(
		() => SafeArray.from([1], 0),
		error(Message.LARGER_THAN_MAX),
		'expected to throw if maximum length is less than array length',
	);

	_.doesNotThrow(() => SafeArray.from([1], 1),
		'expected to not throw if maximum length is equal to array length');

	_.doesNotThrow(() => SafeArray.from([1], 2),
		'expected to not throw if maximum length is more than array length');

	_.doesNotThrow(() => SafeArray.from([1]),
		'expected to not throw if maximum length is not set');

	_.ok(new SafeArray() instanceof SafeArray,
		'expected to return a safe-array');

	_.same(SafeArray.from([1, 2]).toNewArray(), [1, 2],
		'expected to copy array onto safe-array');

	_.end();
});

await _.test('toNewArray', async (_) => {
	_.ok(Array.isArray(new SafeArray().toNewArray()),
		'expected to return an array');

	_.same(new SafeArray(), [],
		'expected to return an empty array if empty');

	const instance = new SafeArray();
	_.not(instance.toNewArray(), instance.toNewArray(),
		'expected to return a new array on every call');

	_.same(SafeArray.from([1, 2]).toNewArray(), [1, 2],
		'expected to copy items');

	_.same(SafeArray.from([undefined]), [undefined],
		'expected to copy undefined as an item');

	const old = instance.toNewArray();
	instance.push(1, 2, 3);
	_.not(old, instance.toNewArray(),
		'expected to return a new array after modification');

	_.same(instance.toNewArray(), [1, 2, 3],
		'expected to return up-to-date array');

	_.end();
});

await _.test('push', async (_) => {
	_.throws(
		() => {
			new SafeArray(0).push(1);
		},
		error(Message.ARRAY_IS_FULL),
		'expected to throw if full',
	);

	_.throws(
		() => {
			new SafeArray(1).push(1, 2);
		},
		error(Message.LARGER_THAN_MAX),
		'expected to throw on too many items',
	);

	_.doesNotThrow(
		() => {
			new SafeArray().push();
			new SafeArray(0).push();
		},
		'expected to not throw with no inputs',
	);

	_.doesNotThrow(
		() => {
			new SafeArray(1).push(1);
		},
		'expected to not throw if full after action',
	);

	const instance = new SafeArray();
	instance.push();

	_.same(instance.toNewArray(), [],
		'expected to not change safe-array with no inputs');

	_.equal(instance.length, 0,
		'expected to not update length with no inputs');

	instance.push(1);
	_.same(instance.toNewArray(), [1],
		'expected to push inputs');

	_.equal(instance.length, 1,
		'expected to update length');

	_.end();
});

await _.test('pop', async (_) => {
	_.throws(
		() => {
			new SafeArray().pop();
		},
		error(Message.ARRAY_IS_EMPTY),
		'expected to throw if safe-array is empty',
	);

	const instance = SafeArray.from([undefined, 1]);
	_.equal(instance.pop(), 1,
		'expected to return last element of array');

	_.equal(instance.pop(), undefined,
		'expected to return undefined as last element of array');

	_.equal(instance.length, 0,
		'expected to update length');

	_.end();
});

await _.test('get', async (_) => {
	const instance = SafeArray.from([0, undefined, 2]);

	await _.test('expected to assert index',
		assertIndex((index) => instance.get(index), instance.length));

	_.equal(instance.get(2), 2,
		'expected to return correct element');

	_.equal(instance.get(1), undefined,
		'expected to return undefined as correct element');

	_.end();
});

await _.test('set', async (_) => {
	const instance = SafeArray.from([0, undefined, 2]);

	instance.set(0, 1);
	_.equal(instance.get(0), 1,
		'expected to set correct value');

	instance.set(0, undefined);
	_.equal(instance.get(0), undefined,
		'expected to set undefined as an element');

	await _.test('expected to assert index', assertIndex((index) => {
		instance.set(index, 3);
	}, instance.length));

	_.end();
});

await _.test('clear', async (_) => {
	const instance = SafeArray.from([1, 2]);
	instance.clear();

	_.same(instance.toNewArray(), [], 'expected to clear the array');
	_.equal(instance.length, 0, 'expected to update the length');

	_.end();
});

await _.test('toString', async (_) => {
	_.equal(SafeArray.from([1, 2]).toString(), [1, 2].toString(),
		'expected to return the correct value');

	_.end();
});

await _.test('toLocaleString', async (_) => {
	_.equal(SafeArray.from([1, 2]).toLocaleString(), [1, 2].toLocaleString(),
		'expected to return the correct value');

	_.end();
});

await _.test('@@iterator', async (_) => {
	_.same([...SafeArray.from([1, 2])], [1, 2],
		'expected to match the array');

	_.end();
});

_.end();
