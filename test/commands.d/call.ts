import { call_ } from 'src/commands.js';
import * as _ from 'tap';
import { createAssets } from '../test-util/stakr.js';

const { source, data, arg } = createAssets();

_.throws(
	() => {
		call_(arg);
	},
	'expected to throw if stack is empty',
);

data.stack.push(true);

_.throws(
	() => {
		call_(arg);
	},
	'expected to throw if poped value is not a number or string',
);

await _.test('internal', async (_) => {
	data.stack.clear();
	data.stack.push(123);
	call_(arg);

	_.equal(data.offset, 123,
		'expected to jump to given offset');

	_.strictSame(data.stack.toNewArray(), [],
		'expected to pop from the stack');

	_.strictSame(data.aux.toNewArray(), [0],
		'expected to push offset onto aux');

	_.end();
});

await _.test('external', async (_) => {
	data.stack.push(true, 'test-lib');

	_.throws(
		() => {
			call_(arg);
		},
		'expected to throw if poped value is not a number',
	);

	data.stack.clear();
	data.aux.clear();
	data.offset = 0;
	data.stack.push(123, 'test-lib');
	call_(arg);

	_.strictSame(data.aux.toNewArray(), [0, source.name],
		'expected to push offset onto aux');

	_.equal(data.sourceName, 'test-lib',
		'expected to set next source');

	_.equal(data.offset, 123,
		'expected to set next offset');

	_.equal(data.halted, false,
		'expected to clear halted flag');

	_.end();
});
