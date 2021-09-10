import * as assert from '@esdmr/assert';
import * as types from '#src/types.js';
import { ReadonlyMap } from '#src/util/readonly.js';

/** @internal */
export const name = 'stdlib:commands';

/**
 * Creates the standard log library.
 *
 * @internal
 * @param logger - The logger to output the messages to.
 * @returns The `stdlib:log` library.
 */
export default function log_ (logger: types.Logger) {
	async function log_ ({ data }: types.ExecuteArg) {
		const message = data.stack.pop();
		assert.isString(message);

		const maybePromise = logger.log(message);

		if (maybePromise !== undefined) {
			await maybePromise;
		}
	}

	async function error_ ({ data }: types.ExecuteArg) {
		const message = data.stack.pop();
		assert.isString(message);

		const maybePromise = logger.error(message);

		if (maybePromise !== undefined) {
			await maybePromise;
		}
	}

	return new ReadonlyMap<string, types.Executable>([
		['log', log_],
		['info', log_],
		['warning', error_],
		['error', error_],
	]);
}
