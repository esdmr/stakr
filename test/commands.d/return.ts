import * as _ from 'tap';
import { return_ } from '#src/commands.js';
import testGoto from '#test-util/goto.js';
import { createAssets } from '#test-util/stakr.js';

const { data, arg } = await createAssets();

await testGoto(_, async (...items) => {
	data.aux.clear();
	data.aux.push(...items);
	return_(arg);

	return {
		stack: data.aux,
		offset: data.offset,
		sourceName: data.sourceName,
	};
});
