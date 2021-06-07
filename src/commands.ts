import { Executable, ExecuteArg } from './types.d';

function newTypeErrorForJumpTarget (offset: string) {
	return new TypeError(`Jump target not a number, got ${offset}`);
}

export const goto_ = (arg: ExecuteArg) => {
	const offset = arg.context.pop();

	if (typeof offset !== 'number') {
		throw newTypeErrorForJumpTarget(typeof offset);
	}

	arg.offset = offset;
};

export const call_ = (arg: ExecuteArg) => {
	const offsetOrSource = arg.context.pop();

	if (typeof offsetOrSource === 'string') {
		const offset = arg.context.pop();

		if (typeof offset !== 'number') {
			throw newTypeErrorForJumpTarget(typeof offset);
		}

		arg.context.aux.push(arg.offset, arg.source.name);
		arg.context.nextSource = offsetOrSource;
		arg.context.nextOffset = offset;
		arg.context.halted = false;
	} else if (typeof offsetOrSource === 'number') {
		arg.context.aux.push(arg.offset);
		arg.offset = offsetOrSource;
	} else {
		throw newTypeErrorForJumpTarget(typeof offsetOrSource);
	}
};

export const return_ = (arg: ExecuteArg) => {
	const offsetOrSource = arg.context.aux.pop();

	if (typeof offsetOrSource === 'string') {
		const offset = arg.context.aux.pop();

		if (typeof offset !== 'number') {
			throw newTypeErrorForJumpTarget(typeof offset);
		}

		arg.context.nextSource = offsetOrSource;
		arg.context.nextOffset = offset;
		arg.context.halted = false;
	} else if (typeof offsetOrSource === 'number') {
		arg.offset = offsetOrSource;
	} else {
		throw newTypeErrorForJumpTarget(typeof offsetOrSource);
	}
};

export const if_ = (name = 'if') => (arg: ExecuteArg) => {
	const condition = arg.context.pop();

	if (typeof condition !== 'boolean') {
		throw new TypeError(`${name} statement on non-boolean, got ${typeof condition}`);
	}

	if (condition) {
		// Check if offset is valid.
		const { offset } = arg;
		goto_(arg);
		arg.offset = offset;
	} else {
		goto_(arg);
	}
};

const commandMap = new Map<string, Executable>([
	['goto', goto_],
	['call', call_],
	['return', return_],
	['if', if_()],
	['while', if_('while')],
]);

export default commandMap;
