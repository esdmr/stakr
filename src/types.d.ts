import type { ExecutionContext, Source } from './stakr.js';

export type StackItem = string | number | boolean | null;

export interface Definition {
	readonly call: boolean;
	readonly offset: number;
	readonly source?: string;
}

export interface AssembleArg {
	readonly source: Source;
	readonly blockStack: number[];
	offset: number;
}

export interface ExecuteArg {
	readonly context: ExecutionContext;
	readonly source: Source;
	offset: number;
}

export type LinkArg = Readonly<ExecuteArg>;
export type Executable = (arg: ExecuteArg) => void;
export type ASTTree = readonly ASTNode[];

export interface ASTNode {
	readonly assemble?: (arg: AssembleArg) => void;
	readonly link?: (arg: LinkArg) => void;
	readonly execute?: Executable;
}
