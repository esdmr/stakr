export { };

type StackItem = string | number | undefined | boolean;
type AssemblyItem = StackItem | (() => void) | Declare | Label | Refer;

const stack: StackItem[] = [];
const aux: StackItem[] = [];

const push = (...v: StackItem[]) => {
	stack.push(...v.reverse());
};

const pop = () => {
	if (stack.length === 0) {
		throw new Error('Stack empty to pop');
	}

	return stack.pop();
};

const $popnum = () => {
	const value = pop();
	if (typeof value !== 'number') {
		throw new TypeError('Expected number');
	}

	return value;
};

const $decor = (fn: () => void) => (...v: StackItem[]) => {
	push(...v);
	fn();
};

const $binop = (fn: (a: number, b: number) => number) => $decor(() => {
	push(fn($popnum(), $popnum()));
});

const $declare = () => aux.push(undefined) - 1;

const $print = $decor(() => {
	console.log(pop());
});

const get = $decor(() => {
	push(aux[$popnum()]);
});

const set = $decor(() => {
	aux[$popnum()] = pop();
});

const mul = $binop((a, b) => a * b);

class AssemblerData {
	decls = new Map<Declare['name'], number>();

	constructor (public list: AssemblyItem[]) {}
}

abstract class Reference {
	constructor (public name: string) {}
	abstract execute (data: AssemblerData): void;
}

class Refer extends Reference {
	execute (data: AssemblerData) {
		const offset = data.decls.get(this.name);
		if (offset === undefined) {
			throw new Error('Reference not found');
		}

		push(offset);
	}
}

class Declare extends Reference {
	getTrueName (lastLabel: Label['name']) {
		return this.name.startsWith(':') ? lastLabel + this.name : this.name;
	}

	execute = (_: AssemblerData) => undefined;
}

class Label extends Reference {
	execute = (_: AssemblerData) => undefined;
}

const assemble = (source: AssemblyItem[][]) => {
	for (const item of source) {
		item.reverse();
	}

	const list = source.flat();
	const data = new AssemblerData(list);
	let lastLabel = '_';

	for (const [index, item] of list.entries()) {
		if (!(item instanceof Reference)) {
			continue;
		}

		if (item instanceof Label) {
			data.decls.set(item.name, index);
			lastLabel = item.name;
		} else if (item instanceof Declare) {
			data.decls.set(item.getTrueName(lastLabel), $declare());
		}
	}

	for (const item of list) {
		switch (typeof item) {
			case 'object':
				item.execute(data);
				break;

			case 'function':
				item();
				break;

			case 'string':
			case 'number':
			case 'boolean':
			case 'undefined':
				push(item);
				break;

			default:
				throw new Error('Unexpected value');
		}
	}
};

assemble([
	[new Declare('a')],
	[set, new Refer('a'), 3],
	[get, new Refer('a')],
	[$print],
	[get, new Refer('a')],
	[mul, 2],
	[$print],
]);
