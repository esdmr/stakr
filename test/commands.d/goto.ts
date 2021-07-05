import * as _ from 'tap';
import { goto_ } from '#src/commands.js';
import testGoto from '#test-util/goto.js';
import { createAssets } from '#test-util/stakr.js';

const { data, arg } = createAssets();

await testGoto(_, async (...items) => {
	data.stack.clear();
	data.stack.push(...items);
	goto_(arg);

	return data;
});
