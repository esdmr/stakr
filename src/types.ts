import * as stakr from './stakr.js';

export type StackItem = string | number | boolean | null;

export interface Definition {
	readonly offset: number;
	readonly sourceName: string;
	readonly exported: boolean;
	readonly implicitlyCalled: boolean;
}

export interface AssembleArg {
	readonly source: stakr.Source;
	readonly blockStack: number[];
	readonly data: stakr.AssembleData;
	offset: number;
}

export interface LinkArg {
	readonly context: stakr.ExecutionContext;
	readonly source: stakr.Source;
	readonly data: stakr.LinkData;
	readonly offset: number;
}

export interface ExecuteArg {
	readonly context: stakr.ExecutionContext;
	readonly source: stakr.Source;
	readonly data: stakr.ExecuteData;
}

export type Writable<T> = { -readonly [K in keyof T]: T[K] };
export type Executable = (arg: ExecuteArg) => void;
export type ASTTree = readonly ASTNode[];

export interface ASTNode {
	readonly assemble?: (arg: AssembleArg) => void;
	readonly link?: (arg: LinkArg) => void;
	readonly execute?: Executable;
}
