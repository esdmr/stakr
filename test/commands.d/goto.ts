import * as _ from 'tap';
import * as stakr from 'src/stakr.js';
import url from 'url';
import { goto_ } from 'src/commands.js';
import { ExecuteArg } from 'src/types.d';
import { testGoto } from '../test-util/goto.js';

if (process.argv[1] === url.fileURLToPath(import.meta.url)) {
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

	_.end();
}
