import * as ast from 'src/ast.js';
import * as _ from 'tap';
import { createAssets } from '../test-util/stakr.js';

await _.test('execute', async (_) => {
	const instance = new ast.WhileEnd();

	const { data, arg } = createAssets({
		source: [
			new ast.BlockStart(),
			instance,
		],
		offset: 2,
	});

	instance.execute(arg);

	_.equal(data.offset, 0,
		'expected to jump to start');

	_.end();
});
