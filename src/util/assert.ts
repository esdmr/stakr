/** @public */
export class AssertionError extends Error {
	name = 'AssertionError';

	/** @internal */
	static get _defaultMessage () {
		return 'Assertion failed';
	}
}

/**
 * Asserts that a given condition is true.
 *
 * @public
 * @throws {@link AssertionError}
 * @param condition - The given condition.
 * @param message - The message to include in the error. Format with `{}`.
 * @param args - Format arguments.
 */
export default function assert (
	condition: boolean,
	message = AssertionError._defaultMessage,
	...args: any[]
): asserts condition {
	if (condition) {
		return;
	}

	for (const item of args) {
		message = message.replace('{}', String(item));
	}

	throw new AssertionError(message);
}
