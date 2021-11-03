import * as assert from '@esdmr/assert';
import type * as types from '#src/types.js';
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
	function log_ ({ data }: types.ExecuteArg) {
		const message = data.stack.pop();
		assert.isString(message);
		logger.log(message);
	}

	function error_ ({ data }: types.ExecuteArg) {
		const message = data.stack.pop();
		assert.isString(message);
		logger.error(message);
	}

	return new ReadonlyMap<string, types.Executable>([
		['log', log_],
		['info', log_],
		['warning', error_],
		['error', error_],
	]);
}
