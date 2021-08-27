import { test } from 'tap';
import assert, { AssertionError } from '#src/util/assert.js';

const error = (message: string) => new AssertionError(message);

await test('assert', async (t) => {
	t.doesNotThrow(() => {
		assert(true, 'This should not throw');
	}, 'expected to not throw if condition is true');

	t.throws(() => {
		assert(false, 'This should throw');
	}, 'expected to throw if condition is true');

	t.throws(() => {
		assert(false);
	}, error(AssertionError._defaultMessage));

	t.throws(() => {
		assert(false, 'Custom message (arity 0)');
	}, error('Custom message (arity 0)'));

	t.throws(() => {
		assert(false, '1{}3 (arity 1)', '(2)');
	}, error('1(2)3 (arity 1)'));

	t.throws(() => {
		assert(false, '1{}3{}5 (arity 2)', '(2)', '(4)');
	}, error('1(2)3(4)5 (arity 2)'));
});
