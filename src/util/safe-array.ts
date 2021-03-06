/* eslint-disable @typescript-eslint/non-nullable-type-assertion-style */
/** @internal */
export const enum Message {
	indexIsNegative = 'Index is negative',
	indexIsNotInt = 'Index is not a safe (positive) integer',
	indexOutOfBounds = 'Index is out of bounds',
	largerThanMax = 'Input is larger than maximum length allowed',
	maxIsNegative = 'Maximum length is negative',
	maxIsNotInt = 'Maximum length is not a safe (positive) integer',
	arrayIsEmpty = 'SafeArray is empty',
	arrayIsFull = 'SafeArray is full',
}

/**
 * A dense array with bound checks.
 *
 * @public
 */
export default class SafeArray<T> {
	/**
	 * Creates a new instance of safe-array and copies a safe-array into it.
	 *
	 * @nosideeffects
	 * @throws RangeError
	 * @param array - The array to copy into the safe-array. It should not have
	 * more elements than the provided maximum length.
	 * @param maxLength - Maximum number of elements allowed in the safe-array.
	 * Must be a positive safe integer. (`+Infinity` for no limitation)
	 * @returns The new instance of safe-array.
	 */
	static from<T> (array: readonly T[], maxLength?: number): SafeArray<T> {
		const safeArray = new SafeArray<T>(maxLength);

		if (array.length > safeArray._maxLength) {
			throw new RangeError(Message.largerThanMax);
		}

		safeArray.push(...array);
		return safeArray;
	}

	private readonly _array: T[] = [];
	private readonly _maxLength: number;
	private _length = 0;

	/**
	 * The length of a safe-array. This is a number one higher than the highest
	 * index in the safe-array.
	 *
	 * @nosideeffects
	 */
	get length (): number {
		return this._length;
	}

	/**
	 * @nosideeffects
	 * @throws RangeError
	 * @param maxLength - Maximum number of elements allowed in the safe-array.
	 * Must be a positive safe integer. (`+Infinity` for no limitation)
	 */
	constructor (maxLength = Number.POSITIVE_INFINITY) {
		this._maxLength = maxLength;

		if (!Number.isSafeInteger(maxLength) && maxLength !== Number.POSITIVE_INFINITY) {
			throw new RangeError(Message.maxIsNotInt);
		}

		if (maxLength < 0) {
			throw new RangeError(Message.maxIsNegative);
		}
	}

	/**
	 * Copies the content of a safe-array into a new array.
	 *
	 * @nosideeffects
	 * @returns The new array.
	 */
	toNewArray (): T[] {
		return [...this._array];
	}

	/**
	 * Appends new elements to the end of a safe-array.
	 *
	 * @throws RangeError
	 * @param items - New elements to add to the safe-array.
	 */
	push (...items: readonly T[]): void {
		if (items.length === 0) {
			return;
		}

		if (this.length === this._maxLength) {
			throw new RangeError(Message.arrayIsFull);
		}

		if (this.length + items.length > this._maxLength) {
			throw new RangeError(Message.largerThanMax);
		}

		this._length = this._array.push(...items);
	}

	/**
	 * Removes the last element from a safe-array and returns it. If the
	 * safe-array is empty, a RangeError is thrown.
	 *
	 * @throws RangeError
	 */
	pop (): T {
		if (this._array.length === 0) {
			throw new RangeError(Message.arrayIsEmpty);
		}

		this._length--;
		return this._array.pop() as T;
	}

	/**
	 * Reads an element from a safe-array and returns it.
	 *
	 * @nosideeffects
	 * @throws RangeError
	 * @param index - Index of element to return.
	 * @returns - Value of element.
	 */
	get (index: number): T {
		this._assertIndex(index);
		return this._array[index] as T;
	}

	/**
	 * Sets an element to a safe-array.
	 *
	 * @throws RangeError
	 * @param index - Index of element to change.
	 * @param value - New value to set to the element.
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
	 * @nosideeffects Depending on every elements' `toString` method.
	 * @returns The string.
	 */
	toString (): string {
		return this._array.toString();
	}

	/**
	 * Returns a string representation of a safe-array. The elements are
	 * converted to string using their `toLocalString` methods.
	 *
	 * @nosideeffects Depending on every elements' `toLocaleString` method.
	 * @returns The string.
	 */
	toLocaleString (): string {
		return this._array.toLocaleString();
	}

	/** @nosideeffects */
	[Symbol.iterator] (): IterableIterator<T> {
		return this._array[Symbol.iterator]();
	}

	private _assertIndex (index: number): void {
		if (!Number.isSafeInteger(index)) {
			throw new RangeError(Message.indexIsNotInt);
		}

		if (index < 0) {
			throw new RangeError(Message.indexIsNegative);
		}

		if (index >= this.length) {
			throw new RangeError(Message.indexOutOfBounds);
		}
	}
}
