import type * as stakr from './stakr.js';

/** @public */
export type StackItem = string | number | boolean | null;

/** @public */
export interface Definition {
	readonly offset: number;
	readonly sourceName: string;
	readonly exported: boolean;
	readonly implicitlyCalled: boolean;
}

/** @public */
export interface AssembleArg {
	readonly source: stakr.Source;
	readonly blockStack: number[];
	readonly data: stakr.AssembleData;
	offset: number;
}

/** @public */
export interface LinkArg {
	readonly context: stakr.ExecutionContext;
	readonly source: stakr.Source;
	readonly data: stakr.LinkData;
	readonly offset: number;
}

/** @public */
export interface ExecuteArg {
	readonly context: stakr.ExecutionContext;
	readonly source: stakr.Source;
	readonly data: stakr.ExecuteData;
}

/** @internal */
export type _Writable<T> = { -readonly [K in keyof T]: T[K] };
/** @public */
export type Executable = (arg: ExecuteArg) => void | Promise<void>;
/** @public */
export type ASTTree = readonly ASTNode[];

/** @public */
export interface ASTNode {
	readonly assemble?: (arg: AssembleArg) => void;
	readonly link?: (arg: LinkArg) => void;
	readonly execute?: Executable;
}

/** @public */
export interface Loader {
	readonly resolve: (
		specifier: string,
		parentName: string,
	) => string;

	readonly getSource: (
		url: string,
		context: stakr.ExecutionContext,
	) => Promise<stakr.Source>;
}

/** @public */
export interface Logger {
	readonly log: (message: string) => void | Promise<void>;
	readonly error: (message: string) => void | Promise<void>;
}

/** @public */
export interface StandardLibraryArg {
	readonly context: stakr.ExecutionContext;
	readonly logger: Logger;
}
