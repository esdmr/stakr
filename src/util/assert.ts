export function assert (condition: boolean, message = 'Assertion failed', ...args: any[]): asserts condition {
	if (condition) {
		return;
	}

	for (const item of args) {
		message = message.replace('{}', String(item));
	}

	throw new Error(message);
}
