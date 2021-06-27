import * as stakr from 'src/stakr.js';
import * as types from 'src/types.js';

export const enum SourceState {
	RAW,
	ASSEMBLED,
	ADDED,
	LINKED,
}

export interface Parameters {
	context?: stakr.ExecutionContext;
	executeData?: stakr.ExecuteData;
	assembleData?: stakr.AssembleData;
	linkData?: stakr.LinkData;
	lib?: string | types.ASTTree | stakr.Source;
	source?: string | types.ASTTree | stakr.Source;
	state?: SourceState;
	offset?: number;
	halted?: boolean;
}

export interface Returns {
	context: stakr.ExecutionContext;
	data: stakr.ExecuteData;
	assembleData: stakr.AssembleData;
	linkData: stakr.LinkData;
	lib: stakr.Source;
	source: stakr.Source;
	executeOrder: string[];
}

function isReadonlyArray (arg: unknown): arg is readonly unknown[] {
	return Array.isArray(arg);
}

export function createAssets (arg: Parameters = {}): Returns {
	const out: Partial<Returns> = {};

	out.context = arg.context ?? new stakr.ExecutionContext();
	out.data = arg.executeData ?? new stakr.ExecuteData();
	out.assembleData = arg.assembleData ?? new stakr.AssembleData();
	out.linkData = arg.linkData ?? new stakr.LinkData();

	out.data.sourceName = 'test-source';
	out.data.offset = arg.offset ?? 0;
	out.data.halted = arg.halted ?? false;

	out.lib = typeof arg.lib === 'string' ?
		new stakr.Source(arg.lib, []) :
		(isReadonlyArray(arg.lib) ?
			new stakr.Source('test-lib', arg.lib) :
			arg.lib ?? new stakr.Source('test-lib', []));

	out.source = typeof arg.source === 'string' ?
		new stakr.Source(arg.source, []) :
		(isReadonlyArray(arg.source) ?
			new stakr.Source('test-source', arg.source) :
			arg.source ?? new stakr.Source('test-source', []));

	const state = arg.state ?? SourceState.LINKED;

	if (state >= SourceState.ASSEMBLED) {
		if (arg.lib !== undefined) {
			out.lib.assemble();
		}

		out.source.assemble();
	}

	if (state >= SourceState.ADDED) {
		if (arg.lib !== undefined) {
			out.context.addSource(out.lib);
		}

		out.context.addSource(out.source);
	}

	out.executeOrder = state >= SourceState.LINKED ?
		out.context.link(new Set([out.source.name])) :
		[];

	return out as Returns;
}
