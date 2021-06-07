import * as _ from 'tap';
import * as Stakr from 'src/stakr.js';
import url from 'url';
import { goto_ } from 'src/commands.js';
import { ExecuteArg } from 'src/types.d';
import { testGoto } from '../util/goto.js';

if (process.argv[1] === url.fileURLToPath(import.meta.url)) {
	const context = new Stakr.ExecutionContext();
	const source = new Stakr.Source('test', []);
	const arg: ExecuteArg = { context, source, offset: 0 };

	testGoto(_, () => {
		goto_(arg);
	}, arg);

	_.end();
}
