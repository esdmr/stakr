import * as _ from 'tap';
import { NativeFunction } from '#src/ast.js';
import { NativeFunction as NativeFunction_ } from '#src/commands.js';

_.equal(NativeFunction, NativeFunction_,
	'Expected to reexport NativeFunction from commands');
