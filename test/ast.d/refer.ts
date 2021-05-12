import * as _ from 'tap';
import * as AST from 'src/ast.js';
import * as Stakr from 'src/stakr.js';

void _.test('Refer', (_) => {
	void _.test('name', (_) => {
		_.equal(new AST.Refer('test').name, 'test', 'expected to preserve name');
		_.end();
	});

	void _.test('execute', (_) => {
		void _.test('label', (_) => {
			const instance = new AST.Refer('test-label');
			const context = new Stakr.ExecutionContext();

			const source = new Stakr.Source('test', [
				new AST.Label('test-label'),
				instance,
			]);

			const arg: Stakr.ExecuteArg = { context, source, offset: 2 };

			context.addSource(source);

			_.throws(() => {
				instance.execute(arg);
			}, 'expected to throw if label is not found');

			source.assemble();
			instance.execute(arg);
			_.strictSame(context.stack, [0], 'expected to push onto the stack');
			_.end();
		});

		void _.test('function', (_) => {
			const instance = new AST.Refer('test-function');
			const context = new Stakr.ExecutionContext();

			const source = new Stakr.Source('test', [
				new AST.BlockStart(),
				new AST.FunctionStatement('test-function', false),
				new AST.FunctionEnd(),
				instance,
			]);

			const arg: Stakr.ExecuteArg = { context, source, offset: 4 };

			context.addSource(source);

			_.throws(() => {
				instance.execute(arg);
			}, 'expected to throw if function is not found');

			source.assemble();
			instance.execute(arg);
			_.equal(arg.offset, 2, 'expected to jump to function');
			_.strictSame(context.aux, [4], 'expected to push onto the aux stack');
			_.end();
		});

		void _.test('import', (_) => {
			const context = new Stakr.ExecutionContext();

			const source = new Stakr.Source('test', [
				new AST.ImportStatement('lib', 'test-lib'),
				new AST.Refer('lib:test-function'),
			]);

			context.addSource(new Stakr.Source('test-lib', [
				new AST.BlockStart(),
				new AST.FunctionStatement('test-function', true),
				new AST.FunctionEnd(),
			]));

			context.addSource(source);

			_.throws(() => {
				source.execute(context, 1);
			}, 'expected to throw if function is not found');

			context.assemble(new Set(['test']));
			source.execute(context, 0);

			_.equal(context.halted, false, 'expected to clear halted flag');
			_.equal(context.nextSource, 'test-lib', 'expected to jump to source');
			_.equal(context.nextOffset, 2, 'expected to jump to function');
			_.strictSame(context.aux, [2, 'test'], 'expected to push onto the aux stack');
			_.end();
		});

		void _.test('uncallable import', (_) => {
			const instance = new AST.Refer('test-function');
			const context = new Stakr.ExecutionContext();
			const source = new Stakr.Source('test', [instance]);
			const arg: Stakr.ExecuteArg = { context, source, offset: 1 };

			context.addSource(source);

			_.throws(() => {
				instance.execute(arg);
			}, 'expected to throw if function is not found');

			source.assemble();
			source.identifiers.set('test-function', {
				call: false,
				offset: 0,
				source: 'test-lib',
			});

			_.throws(() => {
				instance.execute(arg);
			}, 'expected to throw if instance is a uncallable external label');

			_.end();
		});

		_.end();
	});

	_.end();
});
