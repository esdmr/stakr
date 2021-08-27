#!/usr/bin/env node

import fs from 'node:fs/promises';
import { posix } from 'node:path';

/**
 * @param {boolean} condition
 * @returns {asserts condition}
 */
function assert (condition) {
	if (!condition) {
		throw new Error('Assertion failed');
	}
}

/**
 * @param {string} path
 */
async function loadJSON (path) {
	return JSON.parse(await fs.readFile(path, 'utf8'));
}

/**
 * @param {string} path
 * @param {unknown} value
 */
async function storeJSON (path, value) {
	await fs.writeFile(path, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

const json = await loadJSON('package.json');
assert(json instanceof Object);
assert(json.imports instanceof Object);

/** @type {[string, string | { types?: string; }][]} */
const jsonImports = Object.entries(json.imports);
/** @type {Record<string, string[]>} */
const srcImports = {};
/** @type {Record<string, string[]>} */
const testImports = {};

for (const [subpath, value] of jsonImports) {
	const path = typeof value === 'string' ? value : value.types;
	assert(typeof path === 'string');

	const array = [
		path.replace('./build/test/', './test/')
			.replace('./build/examples/', './examples/')
			.replace('./build/', './src/')
			.replace('.js', '.d.ts'),
	];

	testImports[subpath] = array;

	if (!path.startsWith('./build/test/')) {
		srcImports[subpath] = array;
	}
}

/** @type {[string, Record<string, string[]>][]} */
const configPaths = [
	['src/tsconfig.json', srcImports],
	['test/tsconfig.json', testImports],
];

await Promise.all(configPaths.map(async ([path, imports]) => {
	const json = await loadJSON(path);

	imports = {
		...imports,
	};

	for (const [key, value] of Object.entries(imports)) {
		imports[key] = value.map((item) => posix.relative(
			posix.resolve(posix.dirname(path)),
			item,
		));
	}

	json.compilerOptions ??= {};
	assert(json.compilerOptions instanceof Object);
	json.compilerOptions.paths = imports;

	await storeJSON(path, json);
}));

/** @type {[string, { types: string }][]} */
const jsonExports = Object.entries(json.exports);
/** @type {Record<string, string[]>} */
const exports = {};

for (const [subpath, value] of jsonExports) {
	assert(value instanceof Object);
	assert(typeof value.types === 'string');

	exports[subpath.replace('./', '')] = [value.types.replace('./', '')];
}

json.typesVersions = {
	'*': exports,
};

storeJSON('package.json', json);
