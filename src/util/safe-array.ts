const enum Message {
	MAX_IS_NOT_INT = 'Maximum length is not a safe (positive) integer',
	MAX_IS_NEGATIVE = 'Maximum length can not be negative',
	STACK_IS_FULL = 'Stack is full',
	STACK_IS_EMPTY = 'Stack is empty',
	INDEX_OUT_OF_BOUNDS = 'Index is out of bounds',
	VALUE_IS_UNDEFINED = 'Nullish values are not allowed in a SafeArray',
	INDEX_IS_NOT_INT = 'Index is not a safe integer',
}

export default class SafeArray<T> {
	private readonly array: T[] = [];
	private _length = 0;

	get length () {
		return this._length;
	}

	constructor (
		private readonly maxLength = Number.POSITIVE_INFINITY,
	) {
		if (!Number.isSafeInteger(maxLength) && maxLength !== Number.POSITIVE_INFINITY) {
			throw new RangeError(Message.MAX_IS_NOT_INT);
		}

		if (maxLength < 0) {
			throw new RangeError(Message.MAX_IS_NEGATIVE);
		}
	}

	push (...items: readonly T[]): void {
		if (this._length + items.length > this.maxLength) {
			throw new RangeError(Message.STACK_IS_FULL);
		}

		for (const item of items) {
			this.assertNotUndefined(item);
		}

		this._length = this.array.push(...items);
	}

	pop (): T {
		const value = this.array.pop();

		if (value === undefined) {
			throw new RangeError(Message.STACK_IS_EMPTY);
		}

		return value;
	}

	get (index: number): T {
		const value = this.array[this.normalizeIndex(index)];

		if (value === undefined) {
			throw new RangeError(Message.INDEX_OUT_OF_BOUNDS);
		}

		return value;
	}

	set (index: number, value: T): void {
		const normalized = this.normalizeIndex(index);
		this.assertNotUndefined(value);

		if (normalized >= this.length) {
			throw new RangeError(Message.INDEX_OUT_OF_BOUNDS);
		}

		this.array[normalized] = value;
	}

	private assertNotUndefined (value: T) {
		if (value === undefined) {
			throw new TypeError(Message.VALUE_IS_UNDEFINED);
		}
	}

	private normalizeIndex (index: number) {
		if (!Number.isSafeInteger(index)) {
			throw new RangeError(Message.INDEX_IS_NOT_INT);
		}

		return index + (index < 0 ? this.length : 0);
	}
}
