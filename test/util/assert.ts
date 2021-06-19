import assert, { AssertionError } from 'src/util/assert.js';
import * as _ from 'tap';

const error = (message: string) => new AssertionError(message);

_.doesNotThrow(() => {
	assert(true, 'This should not throw');
}, 'expected to not throw if condition is true');

_.throws(() => {
	assert(false, 'This should throw');
}, 'expected to throw if condition is true');

_.throws(() => {
	assert(false);
}, error(AssertionError.defaultMessage));

_.throws(() => {
	assert(false, 'Custom message (arity 0)');
}, error('Custom message (arity 0)'));

_.throws(() => {
	assert(false, '1{}3 (arity 1)', '(2)');
}, error('1(2)3 (arity 1)'));

_.throws(() => {
	assert(false, '1{}3{}5 (arity 2)', '(2)', '(4)');
}, error('1(2)3(4)5 (arity 2)'));
