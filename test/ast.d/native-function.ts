import { test } from 'tap';
import { NativeFunction } from '#src/ast.js';
import { NativeFunction as NativeFunction_ } from '#src/commands.js';

await test('NativeFunction', async (t) => {
	t.equal(NativeFunction, NativeFunction_,
		'Expected to reexport NativeFunction from commands');
});
