import * as ast from 'src/ast.js';
import { ExecuteArg } from 'src/types.js';
import * as _ from 'tap';
import { createAssets } from '../test-util/stakr.js';

await _.test('execute', async (_) => {
	const instance = new ast.WhileEnd();

	const { context, source, data } = createAssets({
		source: [
			new ast.BlockStart(),
			instance,
		],
	});

	const arg: ExecuteArg = {
		context,
		source,
		data,
		offset: 2,
	};

	instance.execute(arg);

	_.equal(arg.offset, 0,
		'expected to jump to start');

	_.end();
});
