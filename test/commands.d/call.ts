import * as _ from 'tap';
import { call_ } from '#src/commands.js';
import { testCall } from '#test-util/goto.js';
import { createAssets } from '#test-util/stakr.js';

const { data, arg } = createAssets();

testCall(_, data, () => {
	call_(arg);
});
