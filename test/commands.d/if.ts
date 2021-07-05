import * as _ from 'tap';
import { if_ } from '#src/commands.js';
import testGoto from '#test-util/goto.js';
import { CommandsMessage, SafeArrayMessage } from '#test-util/message.js';
import { createAssets } from '#test-util/stakr.js';

const { source, lib, data, arg } = createAssets();

_.throws(
	() => {
		if_(arg);
	},
	new RangeError(SafeArrayMessage.ARRAY_IS_EMPTY),
	'expected to throw if stack is empty',
);

data.stack.push('abc');

_.throws(
	() => {
		if_(arg);
	},
	new TypeError(CommandsMessage.CONDITION_IS_NOT_BOOLEAN),
	'expected to throw if poped value is not a boolean',
);

data.stack.clear();
data.stack.push(123, lib.name, true);
if_(arg);

_.equal(data.offset, 0,
	'expected to not jump to offset if poped value is true');

_.equal(data.sourceName, source.name,
	'expected to not jump to source if poped value is true');

_.strictSame(data.stack.toNewArray(), [],
	'expected to pop twice from the stack even if the condition is true');

await _.test('goto', async (_) => {
	await testGoto(_, async (...items) => {
		data.stack.clear();
		data.stack.push(...items, false);
		if_(arg);

		return data;
	});

	_.end();
});
