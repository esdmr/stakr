import { inspect } from 'util';
import * as ast from './ast.js';
import * as stakr from './stakr.js';

export { };

const context = new stakr.ExecutionContext();
context.addSource(new stakr.Source('a', [
	new ast.BlockStart(),
	new ast.FunctionStatement('abc', true),
	new ast.Label('in-abc', false),
	new ast.Literal('In abc'),
	new ast.FunctionEnd(),
	new ast.Literal('In a'),
]));

context.addSource(new stakr.Source('b', [
	new ast.Literal('Before Import'),
	new ast.ImportStatement('a', 'a'),
	new ast.Literal('After Import'),
	new ast.Refer('a:abc'),
	new ast.Literal('After Call'),
]));

const sourceList = context.link(new Set(['b']));
const data = new stakr.ExecuteData();
context.execute(sourceList, data);

console.log(inspect({
	sourceList,
	context,
	linkData: [...context.sourceMap.values()].map((s) => s.linkData.get(context)),
	data,
}, {
	colors: true,
	depth: Number.POSITIVE_INFINITY,
}));
