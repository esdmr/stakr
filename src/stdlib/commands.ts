import * as assert from '@esdmr/assert';
import type * as stakr from '../stakr.js';
import type * as types from '../types.js';
import { ReadonlyMap } from '#src/util/readonly.js';

/** @internal */
export const enum _Message {
	SOURCE_NAME_IS_NOT_STRING = 'Source name is not a string',
	OFFSET_IS_NOT_SAFE_INT = 'Offset is not a safe integer',
	CONDITION_IS_NOT_BOOLEAN = 'Condition is not a boolean',
	FRAME_POINTER_IS_NOT_VALID = 'Frame pointer is not valid',
	FRAME_POINTER_IS_AT_START = 'Frame pointer points to the start of stack',
	FRAME_POINTER_IS_PAST_END = 'Frame pointer is past the end of stack',
	ADDRESS_IS_NOT_SAFE_INT = 'Address is not a number',
	PARAM_IS_NOT_STRING = 'Parameter is not a string',
	LENGTH_IS_NOT_SAFE_INT = 'Length is not a safe integer',
	CODE_POINT_AT = 'Code point at {}',
	CODE_POINT_IS_INVALID = 'Code point is not valid',
	PARAM_IS_NOT_NUMBER = 'Parameter is not a number',
	PARAM_IS_NOT_BOOLEAN = 'Parameter is not a boolean',
	PARAM_IS_NOT_SAFE_INT = 'Parameter is not a safe integer',
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

function arithmeticBinary (func: (a: number, b: number) => number) {
	return ({ data: { stack } }: types.ExecuteArg) => {
		const a = stack.pop();

		if (typeof a !== 'number') {
			throw new TypeError(_Message.PARAM_IS_NOT_NUMBER);
		}

		const b = stack.pop();

		if (typeof b !== 'number') {
			throw new TypeError(_Message.PARAM_IS_NOT_NUMBER);
		}

		stack.push(func(a, b));
	};
}

function logicalBinary (func: (a: boolean, b: boolean) => boolean) {
	return ({ data: { stack } }: types.ExecuteArg) => {
		const a = stack.pop();

		if (typeof a !== 'boolean') {
			throw new TypeError(_Message.PARAM_IS_NOT_BOOLEAN);
		}

		const b = stack.pop();

		if (typeof b !== 'boolean') {
			throw new TypeError(_Message.PARAM_IS_NOT_BOOLEAN);
		}

		stack.push(func(a, b));
	};
}

function equalityBinary (func: (a: types.StackItem, b: types.StackItem) => boolean) {
	return ({ data: { stack } }: types.ExecuteArg) => {
		const a = stack.pop();
		const b = stack.pop();

		stack.push(func(a, b));
	};
}

function inequalityBinary (func: (a: number, b: number) => boolean) {
	return ({ data: { stack } }: types.ExecuteArg) => {
		const a = stack.pop();

		if (typeof a !== 'number') {
			throw new TypeError(_Message.PARAM_IS_NOT_NUMBER);
		}

		const b = stack.pop();

		if (typeof b !== 'number') {
			throw new TypeError(_Message.PARAM_IS_NOT_NUMBER);
		}

		stack.push(func(a, b));
	};
}

function bitwiseBinary (func: (a: number, b: number) => number) {
	return ({ data: { stack } }: types.ExecuteArg) => {
		const a = stack.pop();

		if (!isSafeInteger(a)) {
			throw new TypeError(_Message.PARAM_IS_NOT_SAFE_INT);
		}

		const b = stack.pop();

		if (!isSafeInteger(b)) {
			throw new TypeError(_Message.PARAM_IS_NOT_SAFE_INT);
		}

		stack.push(func(a, b));
	};
}

export function halt_ ({ data }: types.ExecuteArg) {
	data.halted = true;
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
		throw new TypeError(_Message.CONDITION_IS_NOT_BOOLEAN);
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

	if (!isSafeInteger(framePointer) || framePointer < 0) {
		throw new RangeError(_Message.FRAME_POINTER_IS_NOT_VALID);
	}

	data.framePointer = framePointer;
}

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

export function pop_ ({ data: { stack } }: types.ExecuteArg) {
	stack.pop();
}

export function get_ ({ data: { stack } }: types.ExecuteArg) {
	const address = stack.pop();

	if (!isSafeInteger(address)) {
		throw new TypeError(_Message.ADDRESS_IS_NOT_SAFE_INT);
	}

	stack.push(stack.get(Math.abs(address)));
}

export function set_ ({ data: { stack } }: types.ExecuteArg) {
	const address = stack.pop();
	const value = stack.pop();

	if (!isSafeInteger(address)) {
		throw new TypeError(_Message.ADDRESS_IS_NOT_SAFE_INT);
	}

	stack.set(Math.abs(address), value);
}

export enum ValueType {
	/** Latin Capital Letter S */
	STRING = 83,
	/** Latin Capital Letter N */
	NUMBER = 78,
	/** Latin Capital Letter B */
	BOOLEAN = 66,
	/** Null Character */
	NULL = 0,
}

export function type_ ({ data: { stack } }: types.ExecuteArg) {
	const value = stack.pop();
	let type;

	switch (typeof value) {
		case 'string':
			type = ValueType.STRING;
			break;

		case 'number':
			type = ValueType.NUMBER;
			break;

		case 'boolean':
			type = ValueType.BOOLEAN;
			break;

		default:
			assert.isEqual<null>(value, null);
			type = ValueType.NULL;
	}

	stack.push(type);
}

export function stoc_ ({ data: { stack } }: types.ExecuteArg) {
	const string = stack.pop();

	if (typeof string !== 'string') {
		throw new TypeError(_Message.PARAM_IS_NOT_STRING);
	}

	const chars = [...string].map((char, index) => {
		const codePoint = char.codePointAt(0);
		assert.isNotUndefined(codePoint, _Message.CODE_POINT_AT, index);
		return codePoint;
	});

	chars.reverse();

	stack.push(...chars, chars.length);
}

export function ctos_ ({ data: { stack } }: types.ExecuteArg) {
	const length = stack.pop();

	if (!isSafeInteger(length) || length < 0) {
		throw new TypeError(_Message.LENGTH_IS_NOT_SAFE_INT);
	}

	const chars: number[] = [];

	for (let i = 0; i < length; i++) {
		const codePoint = stack.pop();

		if (!isSafeInteger(codePoint) || length < 0 || length > 0x10_FF_FF) {
			throw new TypeError(_Message.CODE_POINT_IS_INVALID);
		}

		chars.push(codePoint);
	}

	stack.push(String.fromCodePoint(...chars));
}

export const add_ = arithmeticBinary((a, b) => a + b);
export const subtract_ = arithmeticBinary((a, b) => a - b);
export const multiply_ = arithmeticBinary((a, b) => a * b);
export const divide_ = arithmeticBinary((a, b) => a / b);
export const remainder_ = arithmeticBinary((a, b) => a % b);
export const power_ = arithmeticBinary((a, b) => a ** b);

export const and_ = logicalBinary((a, b) => a && b);
export const or_ = logicalBinary((a, b) => a || b);

export function not_ ({ data: { stack } }: types.ExecuteArg) {
	const value = stack.pop();

	if (typeof value !== 'boolean') {
		throw new TypeError(_Message.PARAM_IS_NOT_BOOLEAN);
	}

	stack.push(!value);
}

export const equal_ = equalityBinary((a, b) => a === b);
export const notEqual_ = equalityBinary((a, b) => a !== b);
export const lessThan_ = inequalityBinary((a, b) => a < b);
export const lessThanOrEqual_ = inequalityBinary((a, b) => a <= b);
export const greaterThan_ = inequalityBinary((a, b) => a > b);
export const greaterThanOrEqual_ = inequalityBinary((a, b) => a >= b);

export const bitwiseAnd_ = bitwiseBinary((a, b) => a & b);
export const bitwiseOr_ = bitwiseBinary((a, b) => a | b);
export const bitwiseXOr_ = bitwiseBinary((a, b) => a ^ b);

export function bitwiseNot_ ({ data: { stack } }: types.ExecuteArg) {
	const value = stack.pop();

	if (!isSafeInteger(value)) {
		throw new TypeError(_Message.PARAM_IS_NOT_SAFE_INT);
	}

	stack.push(~value);
}

export const bitwiseLeftShift_ = bitwiseBinary((a, b) => a << b);
export const bitwiseRightArithmeticShift_ = bitwiseBinary((a, b) => a >> b);
export const bitwiseRightLogicalShift_ = bitwiseBinary((a, b) => a >>> b);
export const bitwiseLeftRotate_ = bitwiseBinary((a, b) => (a << b) | (a >> (32 - b)));
export const bitwiseRightRotate_ = bitwiseBinary((a, b) => (a >> b) | (a << (32 - b)));

const commands = new ReadonlyMap<string, types.Executable>([
	['halt', halt_],
	['goto', goto_],
	['call', call_],
	['return', return_],
	['if', if_],
	['while', if_],
	['enter', enter_],
	['leave', leave_],
	['frame', frame_],
	['local', local_],
	['pop', pop_],
	['get', get_],
	['set', set_],
	['type', type_],
	['stoc', stoc_],
	['ctos', ctos_],
	['+', add_],
	['-', subtract_],
	['*', multiply_],
	['/', divide_],
	['%', remainder_],
	['**', power_],
	// The syntax for referOnly references conflict with the C symbol for the
	// logical and operator. '&&' can either be parsed as the Logical And
	// Operator, or a referOnly reference to the Bitwise And Operator. To keep
	// the logical operators consistent, all the operators are named by a word
	// instead of a symbol.
	['and', and_],
	['or', or_],
	['not', not_],
	['==', equal_],
	['!=', notEqual_],
	['<', lessThan_],
	['<=', lessThanOrEqual_],
	['>', greaterThan_],
	['>=', greaterThanOrEqual_],
	['&', bitwiseAnd_],
	['|', bitwiseOr_],
	['^', bitwiseXOr_],
	['~', bitwiseNot_],
	['<<', bitwiseLeftShift_],
	['>>', bitwiseRightArithmeticShift_],
	['>>>', bitwiseRightLogicalShift_],
	['<<|', bitwiseLeftRotate_],
	['|>>', bitwiseRightRotate_],
]);

/** @internal */
export const name = 'stdlib:commands';

/** @internal */
export default function createCommands () {
	return commands;
}
