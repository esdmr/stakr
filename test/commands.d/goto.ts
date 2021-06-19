import { goto_ } from 'src/commands.js';
import * as stakr from 'src/stakr.js';
import { ExecuteArg } from 'src/types.js';
import * as _ from 'tap';
import { testGoto } from '../test-util/goto.js';

const context = new stakr.ExecutionContext();
const source = new stakr.Source('test', []);
const arg: ExecuteArg = {
	context,
	source,
	data: new stakr.ExecuteData(),
	offset: 0,
};

testGoto(_, () => {
	goto_(arg);
}, arg);
