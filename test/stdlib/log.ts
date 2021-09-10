import { test } from 'tap';
import { isNotUndefined } from '@esdmr/assert/nullables';
import log_ from '#src/stdlib/log.js';
import { createAssets } from '#test/test-util/stakr.js';

const lastLog: {
	message: string;
	level: 'log' | 'error' | 'notLoggedYet';
} = {
	message: '',
	level: 'notLoggedYet',
};

const log = log_({
	log (message: string) {
		lastLog.message = message;
		lastLog.level = 'log';
	},
	error (message: string) {
		lastLog.message = message;
		lastLog.level = 'error';
	},
});

const asyncLog = log_({
	async log (message: string) {
		lastLog.message = message;
		lastLog.level = 'log';
	},
	async error (message: string) {
		lastLog.message = message;
		lastLog.level = 'error';
	},
});

await test('info', async (t) => {
	t.equal(log.get('info'), log.get('log'),
		'expected to be the same as the log');
});

await test('warning', async (t) => {
	t.equal(log.get('warning'), log.get('error'),
		'expected to be the same as the error');
});

for (const level of ['log', 'error']) {
	await test(level, async (t) => {
		const { data, arg } = await createAssets();
		const func = log.get(level);
		const asyncFunc = asyncLog.get(level);

		isNotUndefined(func);
		isNotUndefined(asyncFunc);

		await t.rejects(async () => func(arg),
			'expected to throw if the stack is empty');

		data.stack.push(123);

		await t.rejects(async () => func(arg),
			'expected to throw if the value is a number');

		data.stack.push(true);

		await t.rejects(async () => func(arg),
			'expected to throw if the value is a boolean');

		data.stack.push(null);

		await t.rejects(async () => func(arg),
			'expected to throw if the value is null');

		data.stack.clear();
		data.stack.push('test');
		await func(arg);

		t.strictSame(
			lastLog,
			{
				message: 'test',
				level,
			},
			'expected to log the message',
		);

		t.strictSame(data.stack.toNewArray(), [],
			'expected to pop the stack');

		data.stack.clear();
		data.stack.push('async');
		await asyncFunc(arg);

		t.strictSame(
			lastLog,
			{
				message: 'async',
				level,
			},
			'expected to asynchronously log the message',
		);

		t.strictSame(data.stack.toNewArray(), [],
			'expected to pop the stack');
	});
}
