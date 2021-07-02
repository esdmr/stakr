import * as stakr from './stakr.js';
import * as types from './types.js';

function jump (
	data: stakr.ExecuteData,
	sourceName: types.StackItem,
	offset: types.StackItem,
) {
	if (typeof sourceName !== 'string') {
		throw new TypeError('Source name is not a string');
	}

	if (typeof offset !== 'number') {
		throw new TypeError('Offset is not a number');
	}

	data.sourceName = sourceName;
	data.offset = offset;
}

export function goto_ ({ data }: types.ExecuteArg) {
	jump(data, data.stack.pop(), data.stack.pop());
}

export function call_ ({ data }: types.ExecuteArg) {
	data.aux.push(data.offset, data.sourceName);
	jump(data, data.stack.pop(), data.stack.pop());
}

export function return_ ({ data }: types.ExecuteArg) {
	jump(data, data.aux.pop(), data.aux.pop());
}

export function if_ ({ data }: types.ExecuteArg) {
	const { sourceName, offset } = data;
	const condition = data.stack.pop();

	if (typeof condition !== 'boolean') {
		throw new TypeError('Condition is not a boolean');
	}

	jump(data, data.stack.pop(), data.stack.pop());

	if (condition) {
		data.sourceName = sourceName;
		data.offset = offset;
	}
}

export function enter_ ({ data }: types.ExecuteArg) {
	data.aux.push(data.framePointer);
	data.framePointer = data.stack.length;
}

export function leave_ ({ data }: types.ExecuteArg) {
	const framePointer = data.aux.pop();

	if (typeof framePointer !== 'number') {
		throw new TypeError('New frame pointer is not a number');
	}

	if (!Number.isSafeInteger(framePointer) || framePointer < 0) {
		throw new RangeError('New frame pointer is not valid');
	}

	data.framePointer = framePointer;
}

export function frame_ ({ data }: types.ExecuteArg) {
	const { framePointer } = data;

	if (!Number.isSafeInteger(framePointer) || framePointer < 0) {
		throw new RangeError('Frame pointer is not valid');
	}

	if (framePointer === 0) {
		throw new RangeError('Frame pointer points to the start of stack');
	}

	if (framePointer > data.stack.length) {
		throw new RangeError('Frame pointer is past the end of stack');
	}

	data.stack.push(1 - framePointer);
}

export function local_ ({ data }: types.ExecuteArg) {
	const { framePointer } = data;

	if (!Number.isSafeInteger(framePointer) || framePointer < 0) {
		throw new RangeError('Frame pointer is not valid');
	}

	if (framePointer > data.stack.length) {
		throw new RangeError('Frame pointer is past the end of stack');
	}

	data.stack.push(framePointer);
}

const commandMap = new Map<string, types.Executable>([
	['goto', goto_],
	['call', call_],
	['return', return_],
	['if', if_],
	['while', if_],
	['enter', enter_],
	['leave', leave_],
	['frame', frame_],
	['local', local_],
]);

export default commandMap;
