import { inspect } from 'node:util';
import * as ast from '@esdmr/stakr/ast';
import * as stakr from '@esdmr/stakr/stakr';

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
	new ast.Refer('a:abc', false),
	new ast.Literal('After Call'),
]));

const sourceList = await context.link('b');
const data = new stakr.ExecuteData();
await context.executeAll(sourceList, data);

console.log(inspect({
	sourceList,
	context,
	data,
}, {
	colors: true,
	depth: Number.POSITIVE_INFINITY,
	showHidden: true,
}));
