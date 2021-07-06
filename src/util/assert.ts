/** @internal */
export class AssertionError extends Error {
	name = 'AssertionError';

	static get defaultMessage () {
		return 'Assertion failed';
	}
}

/**
 * Asserts that a given condition is true.
 *
 * @throws {AssertionError}
 * @param condition The given condition.
 * @param message The message to include in the error. Format with `{}`.
 * @param args Format arguments.
 */
export default function assert (
	condition: boolean,
	message = AssertionError.defaultMessage,
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
