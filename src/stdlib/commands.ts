/* eslint-disable no-bitwise */
import * as assert from '@esdmr/assert';
import type * as stakr from '../stakr.js';
import type * as types from '../types.js';
import * as messages from '../messages.js';
import { ReadonlyMap } from '#src/util/readonly.js';

function isSafeInteger (value: unknown): value is number {
	return Number.isSafeInteger(value);
}

function jump (
	data: stakr.ExecuteData,
	sourceName: types.StackItem,
	offset: types.StackItem,
) {
	if (typeof sourceName !== 'string') {
		throw new TypeError(messages.sourceNameIsNotString);
	}

	if (!isSafeInteger(offset)) {
		throw new RangeError(messages.offsetIsNotInt);
	}

	data.sourceName = sourceName;
	data.offset = offset;
}

function arithmeticBinary (func: (a: number, b: number) => number) {
	return ({ data: { stack } }: types.ExecuteArg) => {
		const a = stack.pop();

		if (typeof a !== 'number') {
			throw new TypeError(messages.parameterIsNotNumber);
		}

		const b = stack.pop();

		if (typeof b !== 'number') {
			throw new TypeError(messages.parameterIsNotNumber);
		}

		stack.push(func(a, b));
	};
}

function logicalBinary (func: (a: boolean, b: boolean) => boolean) {
	return ({ data: { stack } }: types.ExecuteArg) => {
		const a = stack.pop();

		if (typeof a !== 'boolean') {
			throw new TypeError(messages.parameterIsNotBoolean);
		}

		const b = stack.pop();

		if (typeof b !== 'boolean') {
			throw new TypeError(messages.parameterIsNotBoolean);
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
			throw new TypeError(messages.parameterIsNotNumber);
		}

		const b = stack.pop();

		if (typeof b !== 'number') {
			throw new TypeError(messages.parameterIsNotNumber);
		}

		stack.push(func(a, b));
	};
}

function bitwiseBinary (func: (a: number, b: number) => number) {
	return ({ data: { stack } }: types.ExecuteArg) => {
		const a = stack.pop();

		if (!isSafeInteger(a)) {
			throw new TypeError(messages.parameterIsNotInt);
		}

		const b = stack.pop();

		if (!isSafeInteger(b)) {
			throw new TypeError(messages.parameterIsNotInt);
		}

		stack.push(func(a, b));
	};
}

export function halt ({ data }: types.ExecuteArg) {
	data.halted = true;
}

export function goto ({ data }: types.ExecuteArg) {
	jump(data, data.stack.pop(), data.stack.pop());
}

export function call ({ data }: types.ExecuteArg) {
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
		throw new TypeError(messages.conditionIsNotBoolean);
	}

	jump(data, data.stack.pop(), data.stack.pop());

	if (condition) {
		data.sourceName = sourceName;
		data.offset = offset;
	}
}

export function enter ({ data }: types.ExecuteArg) {
	data.aux.push(data.framePointer);
	data.framePointer = data.stack.length;
}

export function leave ({ data }: types.ExecuteArg) {
	const framePointer = data.aux.pop();

	if (!isSafeInteger(framePointer) || framePointer < 0) {
		throw new RangeError(messages.framePointerIsNotValid);
	}

	data.framePointer = framePointer;
}

export function frame ({ data }: types.ExecuteArg) {
	const { framePointer } = data;

	if (!isSafeInteger(framePointer) || framePointer < 0) {
		throw new RangeError(messages.framePointerIsNotValid);
	}

	if (framePointer === 0) {
		throw new RangeError(messages.framePointerIsAtStart);
	}

	if (framePointer > data.stack.length) {
		throw new RangeError(messages.framePointerIsPastEnd);
	}

	data.stack.push(1 - framePointer);
}

export function local ({ data }: types.ExecuteArg) {
	const { framePointer } = data;

	if (!isSafeInteger(framePointer) || framePointer < 0) {
		throw new RangeError(messages.framePointerIsNotValid);
	}

	if (framePointer > data.stack.length) {
		throw new RangeError(messages.framePointerIsPastEnd);
	}

	data.stack.push(framePointer);
}

export function pop ({ data: { stack } }: types.ExecuteArg) {
	stack.pop();
}

export function get ({ data: { stack } }: types.ExecuteArg) {
	const address = stack.pop();

	if (!isSafeInteger(address)) {
		throw new TypeError(messages.addressIsNotInt);
	}

	stack.push(stack.get(Math.abs(address)));
}

export function set ({ data: { stack } }: types.ExecuteArg) {
	const address = stack.pop();
	const value = stack.pop();

	if (!isSafeInteger(address)) {
		throw new TypeError(messages.addressIsNotInt);
	}

	stack.set(Math.abs(address), value);
}

export enum ValueType {
	/** Latin Capital Letter S */
	string = 83,
	/** Latin Capital Letter N */
	number = 78,
	/** Latin Capital Letter B */
	boolean = 66,
	/** Null Character */
	null = 0,
}

export function type ({ data: { stack } }: types.ExecuteArg) {
	const value = stack.pop();
	let type;

	switch (typeof value) {
		case 'string':
			type = ValueType.string;
			break;

		case 'number':
			type = ValueType.number;
			break;

		case 'boolean':
			type = ValueType.boolean;
			break;

		default:
			assert.isEqual<null>(value, null);
			type = ValueType.null;
	}

	stack.push(type);
}

export function stoc ({ data: { stack } }: types.ExecuteArg) {
	const string = stack.pop();

	if (typeof string !== 'string') {
		throw new TypeError(messages.parameterIsNotString);
	}

	const chars = [...string].map((char, index) => {
		const codePoint = char.codePointAt(0);
		assert.isNotUndefined(codePoint, 'Code point at {}', index);
		return codePoint;
	});

	chars.reverse();

	stack.push(...chars, chars.length);
}

export function ctos ({ data: { stack } }: types.ExecuteArg) {
	const length = stack.pop();

	if (!isSafeInteger(length) || length < 0) {
		throw new TypeError(messages.lengthIsNotInt);
	}

	const chars: number[] = [];

	for (let i = 0; i < length; i++) {
		const codePoint = stack.pop();

		if (!isSafeInteger(codePoint) || codePoint < 0 || codePoint > 0x10_FF_FF) {
			throw new TypeError(messages.codePointIsInvalid);
		}

		chars.push(codePoint);
	}

	stack.push(String.fromCodePoint(...chars));
}

export const add = arithmeticBinary((a, b) => a + b);
export const subtract = arithmeticBinary((a, b) => a - b);
export const multiply = arithmeticBinary((a, b) => a * b);
export const divide = arithmeticBinary((a, b) => a / b);
export const remainder = arithmeticBinary((a, b) => a % b);
export const power = arithmeticBinary((a, b) => a ** b);

export const and = logicalBinary((a, b) => a && b);
export const or = logicalBinary((a, b) => a || b);

export function not ({ data: { stack } }: types.ExecuteArg) {
	const value = stack.pop();

	if (typeof value !== 'boolean') {
		throw new TypeError(messages.parameterIsNotBoolean);
	}

	stack.push(!value);
}

export const equal = equalityBinary((a, b) => a === b);
export const notEqual = equalityBinary((a, b) => a !== b);
export const lessThan = inequalityBinary((a, b) => a < b);
export const lessThanOrEqual = inequalityBinary((a, b) => a <= b);
export const greaterThan = inequalityBinary((a, b) => a > b);
export const greaterThanOrEqual = inequalityBinary((a, b) => a >= b);

export const bitwiseAnd = bitwiseBinary((a, b) => a & b);
export const bitwiseOr = bitwiseBinary((a, b) => a | b);
export const bitwiseExclusiveOr = bitwiseBinary((a, b) => a ^ b);

export function bitwiseNot ({ data: { stack } }: types.ExecuteArg) {
	const value = stack.pop();

	if (!isSafeInteger(value)) {
		throw new TypeError(messages.parameterIsNotInt);
	}

	stack.push(~value);
}

export const bitwiseLeftShift = bitwiseBinary((a, b) => a << b);
export const bitwiseRightArithmeticShift = bitwiseBinary((a, b) => a >> b);
export const bitwiseRightLogicalShift = bitwiseBinary((a, b) => a >>> b);
export const bitwiseLeftRotate = bitwiseBinary((a, b) => (a << b) | (a >> (32 - b)));
export const bitwiseRightRotate = bitwiseBinary((a, b) => (a >> b) | (a << (32 - b)));

const commands = new ReadonlyMap<string, types.Executable>([
	['halt', halt],
	['goto', goto],
	['call', call],
	['return', return_],
	['if', if_],
	['while', if_],
	['enter', enter],
	['leave', leave],
	['frame', frame],
	['local', local],
	['pop', pop],
	['get', get],
	['set', set],
	['type', type],
	['stoc', stoc],
	['ctos', ctos],
	['+', add],
	['-', subtract],
	['*', multiply],
	['/', divide],
	['%', remainder],
	['**', power],
	// The syntax for referOnly references conflict with the C symbol for the
	// logical and operator. '&&' can either be parsed as the Logical And
	// Operator, or a referOnly reference to the Bitwise And Operator. To keep
	// the logical operators consistent, all the operators are named by a word
	// instead of a symbol.
	['and', and],
	['or', or],
	['not', not],
	['==', equal],
	['!=', notEqual],
	['<', lessThan],
	['<=', lessThanOrEqual],
	['>', greaterThan],
	['>=', greaterThanOrEqual],
	['&', bitwiseAnd],
	['|', bitwiseOr],
	['^', bitwiseExclusiveOr],
	['~', bitwiseNot],
	['<<', bitwiseLeftShift],
	['>>', bitwiseRightArithmeticShift],
	['>>>', bitwiseRightLogicalShift],
	['<<|', bitwiseLeftRotate],
	['|>>', bitwiseRightRotate],
]);

/** @internal */
export const name = 'stdlib:commands';

/** @internal */
export default function createCommands () {
	return commands;
}
