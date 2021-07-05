import * as stakr from '#src/stakr.js';
import * as types from '#src/types.js';

export const enum SourceState {
	RAW,
	ASSEMBLED,
	ADDED,
	LINKED,
}

export interface Parameters {
	context?: ConstructorParameters<typeof stakr.ExecutionContext>[0];
	source?: types.ASTTree;
	lib?: types.ASTTree;
	state?: SourceState;
	executeData?: stakr.ExecuteData;
	assembleData?: stakr.AssembleData;
	linkData?: stakr.LinkData;
	loader?: stakr.DefaultLoader;
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
	loader: stakr.DefaultLoader;
}

export async function createAssets (arg: Parameters = {}): Promise<Returns> {
	const { executeData, assembleData, linkData } = createData(arg);
	const { source, lib, executeOrder, context } = await createSources(arg);

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

	const loader = new stakr.DefaultLoader();

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
		loader,
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

async function createSources (arg: Parameters) {
	const context = new stakr.ExecutionContext(arg.context);
	const lib = new stakr.Source('test-lib', arg.lib ?? []);
	const source = new stakr.Source('test-source', arg.source ?? []);
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
		await context.link(source.name) :
		[];

	return {
		source,
		lib,
		executeOrder,
		context,
	};
}
