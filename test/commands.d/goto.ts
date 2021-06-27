import { goto_ } from 'src/commands.js';
import * as _ from 'tap';
import testGoto from '../test-util/goto.js';
import { createAssets } from '../test-util/stakr.js';

const { data, arg } = createAssets();

testGoto(_, (value) => {
	data.stack.clear();

	if (value !== undefined) {
		data.stack.push(value);
	}

	goto_(arg);
	return arg;
});
