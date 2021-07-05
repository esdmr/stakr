import * as _ from 'tap';
import * as ast from '#src/ast.js';
import { createAssets } from '#test-util/stakr.js';

await _.test('value', async (_) => {
	const instance = new ast.Literal(123);

	_.equal(instance.value, 123,
		'expected to preserve value');

	_.end();
});

await _.test('execute', async (_) => {
	const instance = new ast.Literal(123);

	const { context, source, data } = await createAssets({
		source: [instance],
	});

	instance.execute({
		context,
		source,
		data,
	});

	_.strictSame(data.stack.toNewArray(), [instance.value],
		'expected to push onto the stack');

	_.end();
});
