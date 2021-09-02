import type * as stakr from '../stakr.js';
import type * as types from '../types.js';

/** @internal */
export const enum _Message {
	SOURCE_NAME_IS_NOT_STRING = 'Source name is not a string',
	OFFSET_IS_NOT_SAFE_INT = 'Offset is not a safe integer',
	CONDITION_IS_NOT_BOOLEAN = 'Condition is not a boolean',
	FRAME_POINTER_IS_NOT_VALID = 'Frame pointer is not valid',
	FRAME_POINTER_IS_AT_START = 'Frame pointer points to the start of stack',
	FRAME_POINTER_IS_PAST_END = 'Frame pointer is past the end of stack',
}

function isSafeInteger (value: unknown): value is number {
	return Number.isSafeInteger(value);
}

function jump (
	data: stakr.ExecuteData,
	sourceName: types.StackItem,
	offset: types.StackItem,
) {
	if (typeof sourceName !== 'string') {
		throw new TypeError(_Message.SOURCE_NAME_IS_NOT_STRING);
	}

	if (!isSafeInteger(offset)) {
		throw new RangeError(_Message.OFFSET_IS_NOT_SAFE_INT);
	}

	data.sourceName = sourceName;
	data.offset = offset;
}

/** @public */
export function goto_ ({ data }: types.ExecuteArg) {
	jump(data, data.stack.pop(), data.stack.pop());
}

/** @public */
export function call_ ({ data }: types.ExecuteArg) {
	data.aux.push(data.offset, data.sourceName);
	jump(data, data.stack.pop(), data.stack.pop());
}

/** @public */
export function return_ ({ data }: types.ExecuteArg) {
	jump(data, data.aux.pop(), data.aux.pop());
}

/** @public */
export function if_ ({ data }: types.ExecuteArg) {
	const { sourceName, offset } = data;
	const condition = data.stack.pop();

	if (typeof condition !== 'boolean') {
		throw new TypeError(_Message.CONDITION_IS_NOT_BOOLEAN);
	}

	jump(data, data.stack.pop(), data.stack.pop());

	if (condition) {
		data.sourceName = sourceName;
		data.offset = offset;
	}
}

/** @public */
export function enter_ ({ data }: types.ExecuteArg) {
	data.aux.push(data.framePointer);
	data.framePointer = data.stack.length;
}

/** @public */
export function leave_ ({ data }: types.ExecuteArg) {
	const framePointer = data.aux.pop();

	if (!isSafeInteger(framePointer) || framePointer < 0) {
		throw new RangeError(_Message.FRAME_POINTER_IS_NOT_VALID);
	}

	data.framePointer = framePointer;
}

/** @public */
export function frame_ ({ data }: types.ExecuteArg) {
	const { framePointer } = data;

	if (!isSafeInteger(framePointer) || framePointer < 0) {
		throw new RangeError(_Message.FRAME_POINTER_IS_NOT_VALID);
	}

	if (framePointer === 0) {
		throw new RangeError(_Message.FRAME_POINTER_IS_AT_START);
	}

	if (framePointer > data.stack.length) {
		throw new RangeError(_Message.FRAME_POINTER_IS_PAST_END);
	}

	data.stack.push(1 - framePointer);
}

/** @public */
export function local_ ({ data }: types.ExecuteArg) {
	const { framePointer } = data;

	if (!isSafeInteger(framePointer) || framePointer < 0) {
		throw new RangeError(_Message.FRAME_POINTER_IS_NOT_VALID);
	}

	if (framePointer > data.stack.length) {
		throw new RangeError(_Message.FRAME_POINTER_IS_PAST_END);
	}

	data.stack.push(framePointer);
}

/** @public */
const commands: Array<[string, types.Executable]> = [
	['goto', goto_],
	['call', call_],
	['return', return_],
	['if', if_],
	['while', if_],
	['enter', enter_],
	['leave', leave_],
	['frame', frame_],
	['local', local_],
];

export default commands;
