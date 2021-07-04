import * as _ from 'tap';
import * as ast from '#src/ast.js';
import testGoto from '#test-util/goto.js';
import { createAssets } from '#test-util/stakr.js';

await _.test('execute', async (_) => {
	const instance = new ast.FunctionEnd();

	const { data, arg } = createAssets({
		source: [
			new ast.BlockStart(),
			instance,
		],
		offset: 2,
	});

	testGoto(_, (...items) => {
		data.aux.clear();
		data.aux.push(...items);
		instance.execute(arg);

		return {
			stack: data.aux,
			offset: data.offset,
			sourceName: data.sourceName,
		};
	});

	_.end();
});
