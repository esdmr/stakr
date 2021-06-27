import { Executable, ExecuteArg } from './types.js';

function newTypeErrorForJumpTarget (offset: string) {
	return new TypeError(`Jump target not a number, got ${offset}`);
}

export function goto_ (arg: ExecuteArg) {
	const offset = arg.data.stack.pop();

	if (typeof offset !== 'number') {
		throw newTypeErrorForJumpTarget(typeof offset);
	}

	arg.data.offset = offset;
}

export function call_ (arg: ExecuteArg) {
	const offsetOrSource = arg.data.stack.pop();

	if (typeof offsetOrSource === 'string') {
		const offset = arg.data.stack.pop();

		if (typeof offset !== 'number') {
			throw newTypeErrorForJumpTarget(typeof offset);
		}

		arg.data.aux.push(arg.data.offset, arg.data.sourceName);
		arg.data.sourceName = offsetOrSource;
		arg.data.offset = offset;
	} else if (typeof offsetOrSource === 'number') {
		arg.data.aux.push(arg.data.offset);
		arg.data.offset = offsetOrSource;
	} else {
		throw newTypeErrorForJumpTarget(typeof offsetOrSource);
	}
}

export function return_ (arg: ExecuteArg) {
	const offsetOrSource = arg.data.aux.pop();

	if (typeof offsetOrSource === 'string') {
		const offset = arg.data.aux.pop();

		if (typeof offset !== 'number') {
			throw newTypeErrorForJumpTarget(typeof offset);
		}

		arg.data.sourceName = offsetOrSource;
		arg.data.offset = offset;
	} else if (typeof offsetOrSource === 'number') {
		arg.data.offset = offsetOrSource;
	} else {
		throw newTypeErrorForJumpTarget(typeof offsetOrSource);
	}
}

export function if_ (arg: ExecuteArg) {
	const condition = arg.data.stack.pop();

	if (typeof condition !== 'boolean') {
		throw new TypeError(`Condition is not a boolean, got ${typeof condition}`);
	}

	if (condition) {
		arg.data.stack.pop();
	} else {
		goto_(arg);
	}
}

const commandMap = new Map<string, Executable>([
	['goto', goto_],
	['call', call_],
	['return', return_],
	['if', if_],
	['while', if_],
]);

export default commandMap;
