/* eslint-disable @typescript-eslint/non-nullable-type-assertion-style */
const enum Message {
	INDEX_IS_NEGATIVE = 'Index is negative',
	INDEX_IS_NOT_INT = 'Index is not a safe (positive) integer',
	INDEX_OUT_OF_BOUNDS = 'Index is out of bounds',
	LARGER_THAN_MAX = 'Input array is larger than maximum length allowed',
	MAX_IS_NEGATIVE = 'Maximum length is negative',
	MAX_IS_NOT_INT = 'Maximum length is not a safe (positive) integer',
	STACK_IS_EMPTY = 'Stack is empty',
	STACK_IS_FULL = 'Stack is full',
}

/**
 * A dense array with bound checks.
 */
export default class SafeArray<T> {
	private readonly _array: T[] = [];
	private readonly _maxLength: number;
	private _length = 0;

	/**
	 * The length of a safe-array. This is a number one higher than the highest
	 * index in the safe-array.
	*/
	get length (): number {
		return this._length;
	}

	/**
	 * @throws {RangeError}
	 * @param maxLength Maximum number of elements allowed in the safe-array.
	 * Must be a positive safe integer. (`+Infinity` for no limitation)
	 */
	constructor (maxLength = Number.POSITIVE_INFINITY) {
		this._maxLength = maxLength;

		if (!Number.isSafeInteger(maxLength) && maxLength !== Number.POSITIVE_INFINITY) {
			throw new RangeError(Message.MAX_IS_NOT_INT);
		}

		if (maxLength < 0) {
			throw new RangeError(Message.MAX_IS_NEGATIVE);
		}
	}

	/**
	 * Creates a new instance of safe-array and copies a safe-array into it.
	 *
	 * @throws {RangeError}
	 * @param array The array to copy into the safe-array. It should not have
	 * more elements than the provided maximum length.
	 * @param maxLength Maximum number of elements allowed in the safe-array.
	 * Must be a positive safe integer. (`+Infinity` for no limitation)
	 * @returns The new instance of safe-array.
	 */
	static from<T> (array: readonly T[], maxLength?: number): SafeArray<T> {
		if (typeof maxLength === 'number' && array.length > maxLength) {
			throw new RangeError(Message.LARGER_THAN_MAX);
		}

		const safeArray = new SafeArray<T>(maxLength);
		safeArray.push(...array);

		return safeArray;
	}

	/**
	 * Copies the content of a safe-array into a new array.
	 *
	 * @returns The new array.
	 */
	toNewArray (): T[] {
		return [...this._array];
	}

	/**
	 * Appends new elements to the end of a safe-array.
	 *
	 * @throws {RangeError}
	 * @param items New elements to add to the safe-array.
	 */
	push (...items: readonly T[]): void {
		if (this._length + items.length > this._maxLength) {
			throw new RangeError(Message.STACK_IS_FULL);
		}

		this._length = this._array.push(...items);
	}

	/**
	 * Removes the last element from a safe-array and returns it. If the
     * safe-array is empty, a RangeError is thrown.
	 *
	 * @throws {RangeError}
	 */
	pop (): T {
		if (this._array.length === 0) {
			throw new RangeError(Message.STACK_IS_EMPTY);
		}

		return this._array.pop() as T;
	}

	/**
	 * Reads an element from a safe-array and returns it.
	 *
	 * @throws {RangeError}
	 * @param index Index of element to return.
	 * @returns Value of element.
	 */
	get (index: number): T {
		this._assertIndex(index);
		return this._array[index] as T;
	}

	/**
	 * Sets an element to a safe-array.
	 *
	 * @throws {RangeError}
	 * @param index Index of element to change.
	 * @param value New value to set to the element.
	 */
	set (index: number, value: T): void {
		this._assertIndex(index);
		this._array[index] = value;
	}

	/**
	 * Empties a safe-array.
	 */
	clear (): void {
		this._array.length = 0;
		this._length = 0;
	}

	/**
	 * Returns a string representation of a safe-array.
	 *
	 * @returns The string.
	 */
	toString (): string {
		return this._array.toString();
	}

	/**
	 * Returns a string representation of a safe-array. The elements are
	 * converted to string using their toLocalString methods.
	 *
	 * @returns The string.
	 */
	toLocaleString (): string {
		return this._array.toLocaleString();
	}

	get [Symbol.iterator] (): () => IterableIterator<T> {
		return this._array[Symbol.iterator];
	}

	private _assertIndex (index: number): void {
		if (!Number.isSafeInteger(index)) {
			throw new RangeError(Message.INDEX_IS_NOT_INT);
		}

		if (index < 0) {
			throw new RangeError(Message.INDEX_IS_NEGATIVE);
		}

		if (index >= this.length) {
			throw new RangeError(Message.INDEX_OUT_OF_BOUNDS);
		}
	}
}
