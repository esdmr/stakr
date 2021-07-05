import * as _ from 'tap';
import { call_ } from '#src/commands.js';
import { testCall } from '#test-util/goto.js';
import { createAssets } from '#test-util/stakr.js';

const { data, arg } = await createAssets();

await testCall(_, data, async () => {
	call_(arg);
});
