import * as stakr from 'src/stakr.js';
import * as types from 'src/types.js';

export const enum SourceState {
	RAW,
	ASSEMBLED,
	ADDED,
	LINKED,
}

export interface Parameters {
	context?: boolean | stakr.ExecutionContext;
	source?: string | types.ASTTree | stakr.Source;
	lib?: string | types.ASTTree | stakr.Source;
	state?: SourceState;
	executeData?: stakr.ExecuteData;
	assembleData?: stakr.AssembleData;
	linkData?: stakr.LinkData;
	offset?: number;
	halted?: boolean;
}

export interface Returns {
	context: stakr.ExecutionContext;
	source: stakr.Source;
	lib: stakr.Source;
	executeOrder: string[];
	arg: types.ExecuteArg;
	linkArg: types.LinkArg;
	assembleArg: types.AssembleArg;
	data: stakr.ExecuteData;
	assembleData: stakr.AssembleData;
	linkData: stakr.LinkData;
}

function isReadonlyArray (arg: unknown): arg is readonly unknown[] {
	return Array.isArray(arg);
}

export function createAssets (arg: Parameters = {}): Returns {
	const { executeData, assembleData, linkData } = createData(arg);
	const { source, lib, executeOrder, context } = createSources(arg);

	const executeArg = {
		context,
		source,
		data: executeData,
	};

	const assembleArg = {
		source,
		data: assembleData,
		blockStack: [],
		offset: arg.offset ?? 0,
	};

	const linkArg = {
		context,
		source,
		data: linkData,
		offset: arg.offset ?? 0,
	};

	return {
		context,
		source,
		lib,
		executeOrder,
		arg: executeArg,
		assembleArg,
		linkArg,
		data: executeData,
		assembleData,
		linkData,
	};
}

function createData (arg: Parameters) {
	const executeData = arg.executeData ?? new stakr.ExecuteData();
	const assembleData = arg.assembleData ?? new stakr.AssembleData();
	const linkData = arg.linkData ?? new stakr.LinkData();

	executeData.sourceName = 'test-source';
	executeData.offset = arg.offset ?? 0;
	executeData.halted = arg.halted ?? false;

	return {
		executeData,
		assembleData,
		linkData,
	};
}

function createSources (arg: Parameters) {
	const context = typeof arg.context === 'boolean' ?
		new stakr.ExecutionContext(arg.context) :
		arg.context ?? new stakr.ExecutionContext();

	const lib = typeof arg.lib === 'string' ?
		new stakr.Source(arg.lib, []) :
		(isReadonlyArray(arg.lib) ?
			new stakr.Source('test-lib', arg.lib) :
			arg.lib ?? new stakr.Source('test-lib', []));

	const source = typeof arg.source === 'string' ?
		new stakr.Source(arg.source, []) :
		(isReadonlyArray(arg.source) ?
			new stakr.Source('test-source', arg.source) :
			arg.source ?? new stakr.Source('test-source', []));

	const state = arg.state ?? SourceState.LINKED;

	if (state >= SourceState.ASSEMBLED) {
		if (arg.lib !== undefined) {
			lib.assemble();
		}

		source.assemble();
	}

	if (state >= SourceState.ADDED) {
		if (arg.lib !== undefined) {
			context.addSource(lib);
		}

		context.addSource(source);
	}

	const executeOrder = state >= SourceState.LINKED ?
		context.link(source.name) :
		[];

	return {
		source,
		lib,
		executeOrder,
		context,
	};
}
