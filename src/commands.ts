import type * as stakr from './stakr.js';
import type * as types from './types.js';

/** @internal */
export const enum _Message {
	SOURCE_NAME_IS_NOT_STRING = 'Source name is not a string',
	OFFSET_IS_NOT_NUMBER = 'Offset is not a number',
	CONDITION_IS_NOT_BOOLEAN = 'Condition is not a boolean',
	FRAME_POINTER_IS_NOT_NUMBER = 'Frame pointer is not a number',
	FRAME_POINTER_IS_NOT_VALID = 'Frame pointer is not valid',
	FRAME_POINTER_IS_AT_START = 'Frame pointer points to the start of stack',
	FRAME_POINTER_IS_PAST_END = 'Frame pointer is past the end of stack',
}

/** @public */
export class NativeFunction implements types.ASTNode {
	constructor (
		readonly name: string,
		readonly executable: types.Executable,
		readonly exported: boolean,
	) {}

	static createArray (
		map: ReadonlyArray<[string, types.Executable]>,
		exported: boolean,
	): NativeFunction[] {
		return map.map(([name, executable]) => new NativeFunction(name, executable, exported));
	}

	assemble ({ source, data, offset }: types.AssembleArg) {
		data.addIdentifier(this.name, {
			sourceName: source.name,
			offset,
			exported: this.exported,
			implicitlyCalled: true,
		});
	}

	async execute (arg: types.ExecuteArg) {
		const value = this.executable(arg);

		if (value !== undefined) {
			await value;
		}

		return_(arg);
	}
}

function jump (
	data: stakr.ExecuteData,
	sourceName: types.StackItem,
	offset: types.StackItem,
) {
	if (typeof sourceName !== 'string') {
		throw new TypeError(_Message.SOURCE_NAME_IS_NOT_STRING);
	}

	if (typeof offset !== 'number') {
		throw new TypeError(_Message.OFFSET_IS_NOT_NUMBER);
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

	if (typeof framePointer !== 'number') {
		throw new TypeError(_Message.FRAME_POINTER_IS_NOT_NUMBER);
	}

	if (!Number.isSafeInteger(framePointer) || framePointer < 0) {
		throw new RangeError(_Message.FRAME_POINTER_IS_NOT_VALID);
	}

	data.framePointer = framePointer;
}

/** @public */
export function frame_ ({ data }: types.ExecuteArg) {
	const { framePointer } = data;

	if (!Number.isSafeInteger(framePointer) || framePointer < 0) {
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

	if (!Number.isSafeInteger(framePointer) || framePointer < 0) {
		throw new RangeError(_Message.FRAME_POINTER_IS_NOT_VALID);
	}

	if (framePointer > data.stack.length) {
		throw new RangeError(_Message.FRAME_POINTER_IS_PAST_END);
	}

	data.stack.push(framePointer);
}

/** @public */
const commandList = NativeFunction.createArray([
	['goto', goto_],
	['call', call_],
	['return', return_],
	['if', if_],
	['while', if_],
	['enter', enter_],
	['leave', leave_],
	['frame', frame_],
	['local', local_],
], true);

export default commandList;
