import { inspect } from 'util';
import * as A from './ast.js';
import * as S from './stakr.js';

export { };

const context = new S.ExecutionContext();
context.addSource(new S.Source('a', [
	new A.BlockStart(),
	new A.FunctionStatement('abc', true),
	new A.Literal('In abc'),
	new A.FunctionEnd(),
	new A.Literal('In a'),
]));

context.addSource(new S.Source('b', [
	new A.Literal('Before Import'),
	new A.ImportStatement('a', 'a'),
	new A.Literal('After Import'),
	new A.Refer('a:abc'),
	new A.Literal('After Call'),
]));

const sourceList = context.link(new Set(['b']));
const data = new S.ExecuteData();
context.execute(sourceList, data);

console.log(inspect({
	sourceList,
	context,
	linkData: [...context.sourceMap.values()].map(s => s.linkData.get(context)),
	data,
}, {
	colors: true,
	depth: Number.POSITIVE_INFINITY,
}));
