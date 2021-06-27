import * as ast from 'src/ast.js';
import * as _ from 'tap';
import { createAssets } from '../test-util/stakr.js';

await _.test('execute', async (_) => {
	const instance = new ast.FunctionEnd();

	const { data, arg } = createAssets({
		source: [
			new ast.BlockStart(),
			instance,
		],
		offset: 2,
	});

	data.aux.push(123);
	instance.execute(arg);

	_.equal(data.offset, 123,
		'expected to return');

	_.strictSame(data.aux.toNewArray(), [],
		'expected to pop value from aux');

	_.end();
});
