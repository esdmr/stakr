/** @internal */
export interface ReadonlyMapConstructor {
	readonly prototype: ReadonlyMap<any, any>;
	new<K, V> (entries: ReadonlyArray<readonly [K, V]> | null): ReadonlyMap<K, V>;
}

/** @internal */
export const ReadonlyMap = Map as ReadonlyMapConstructor;

/** @internal */
export interface ReadonlySetConstructor {
	readonly prototype: ReadonlySet<any>;
	new<T = any> (values: readonly T[] | null): ReadonlySet<T>;
}

/** @internal */
export const ReadonlySet = Set as ReadonlySetConstructor;
