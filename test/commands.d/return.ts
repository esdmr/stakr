import { return_ } from 'src/commands.js';
import * as _ from 'tap';
import { createAssets } from '../test-util/stakr.js';

const { data, arg } = createAssets();

_.throws(
	() => {
		return_(arg);
	},
	'expected to throw if aux is empty',
);

data.aux.push(true);

_.throws(
	() => {
		return_(arg);
	},
	'expected to throw if poped value is not a number or string',
);

await _.test('internal', async (_) => {
	data.aux.clear();
	data.aux.push(123);

	return_(arg);

	_.equal(data.offset, 123,
		'expected to jump to given offset');

	_.strictSame(data.aux.toNewArray(), [],
		'expected to pop from the aux');

	_.end();
});

await _.test('external', async (_) => {
	data.aux.push(true, 'test-lib');

	_.throws(
		() => {
			return_(arg);
		},
		'expected to throw if poped value is not a number',
	);

	data.stack.clear();
	data.aux.clear();
	data.offset = 0;
	data.aux.push(123, 'test-lib');

	return_(arg);

	_.strictSame(data.aux.toNewArray(), [],
		'expected to pop offset from aux');

	_.equal(data.sourceName, 'test-lib',
		'expected to set next source');

	_.equal(data.offset, 123,
		'expected to set next offset');

	_.equal(data.halted, false,
		'expected to clear halted flag');

	_.end();
});
