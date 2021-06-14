import * as Stakr from './stakr.js';

export type StackItem = string | number | boolean | null;

export interface Definition {
	readonly offset: number;
	readonly sourceName: string;
	readonly exported: boolean;
	readonly implicitlyCalled: boolean;
}

export interface AssembleArg {
	readonly source: Stakr.Source;
	readonly blockStack: number[];
	readonly data: Stakr.AssembleData;
	offset: number;
}

export interface LinkArg {
	readonly context: Stakr.ExecutionContext;
	readonly source: Stakr.Source;
	readonly data: Stakr.LinkData;
	readonly offset: number;
}

export interface ExecuteArg {
	readonly context: Stakr.ExecutionContext;
	readonly source: Stakr.Source;
	readonly data: Stakr.ExecuteData;
	offset: number;
}

export type Writable<T> = { -readonly [K in keyof T]: T[K] };
export type Executable = (arg: ExecuteArg) => void;
export type ASTTree = readonly ASTNode[];

export interface ASTNode {
	readonly assemble?: (arg: AssembleArg) => void;
	readonly link?: (arg: LinkArg) => void;
	readonly execute?: Executable;
}
