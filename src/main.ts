import * as S from './stakr.js';
import * as A from './ast.js';
import { inspect } from 'util';

export {};

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

const sourceList = context.assemble(new Set(['b']));
context.execute(sourceList);
console.log(sourceList, inspect(context, {
	colors: true,
	depth: Number.POSITIVE_INFINITY,
}));
