import * as ast from 'src/ast.js';
import { ExecuteArg } from 'src/types.js';
import * as _ from 'tap';
import { createAssets } from '../test-util/stakr.js';

await _.test('name', async (_) => {
	const instance = new ast.Operator('test');

	_.equal(instance.name, 'test',
		'expected to preserve name');

	_.end();
});

await _.test('execute', async (_) => {
	const instance = new ast.Operator('test-operator');

	const { context, source, data } = createAssets({
		source: [instance],
		offset: 1,
	});

	const arg: ExecuteArg = {
		context,
		source,
		data,
	};

	let operatorCalled = false;

	context.addSource(source);

	_.throws(
		() => {
			instance.execute(arg);
		},
		'expected to throw if command is undefined',
	);

	data.commandMap.set('test-operator', () => {
		operatorCalled = true;
	});

	instance.execute(arg);

	_.ok(operatorCalled,
		'expected to call operator in context.command');

	_.end();
});
