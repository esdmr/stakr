#!/usr/bin/env node
const { readFile, writeFile } = require('node:fs/promises');
const process = require('process');
const hasColors = process.stderr?.hasColors?.() ?? false;
const isInGitHub = Boolean(process.env.GITHUB_ACTIONS);
const logColor = hasColors ? '\x1B[94m' : '';
const warnColor = isInGitHub ? '::warning::' : hasColors ? '\x1B[93m' : '';
const errorColor = isInGitHub ? '::error::' : hasColors ? '\x1B[91m' : '';
const resetColor = hasColors ? '\x1B[m' : '';

main(process.argv.slice(2)).catch((error) => {
	console.error(error);
	process.exit(1);
});

function log (...args) {
	console.warn(logColor + 'ℹ', ...args, resetColor);
}

function warn (...args) {
	console.warn(warnColor + '⚠', ...args, resetColor);
}

function error (...args) {
	console.error(errorColor + '✖', ...args, resetColor);
}

/** @return {value is Record<string, unknown>} */
function isObject (value) {
	return typeof value === 'object' && value !== null;
}

/** @param {string} path */
function toRelative (path) {
	if (path.startsWith('/') || path.startsWith('../')) {
		error('Path must start with neither / nor ../:', path);
		return;
	}

	return path.startsWith('./') ? path : `./${path}`;
}

function getExportsObject (exports) {
	if (!isObject(exports)) {
		warn('"exports" field does not exists or is not an object.');
		return;
	}

	log('Package has conditional exports.');

	if (typeof exports.types === 'string') {
		log('Package does not use subpaths.');

		const relative = toRelative(exports.types);

		if (relative === undefined) {
			return;
		}

		log('  ⟶ ', relative);

		return {
			'.': relative,
		};
	}

	const entries = Object.entries(exports);

	if (entries.length === 0) {
		warn('The "exports" field is empty.');
		return;
	}

	if (entries.some(([key]) => key !== '.' && !key.startsWith('./'))) {
		warn('Package does not have any subpaths and the "types" field is missing.');
		return;
	}

	/** @type {Record<string, string>} */
	let exportsObject = {};

	for (const [key, value] of entries) {
		if (isObject(value) && typeof value.types === 'string') {
			log('Subpath found:', key);

			const relative = toRelative(value.types);

			if (relative !== undefined) {
				log('  ⟶ ', relative);

				exportsObject[key] = relative;
			}
		} else {
			warn('Subpath is not an object or does not have a "types" field:', key);
		}
	}

	return exportsObject;
}

function getTypesObject (types) {
	if (typeof types !== 'string') {
		warn('"types" field does not exists or is not a string.');
		return;
	}

	log('Global "types" field found.');

	let relative = toRelative(types);

	if (relative === undefined) {
		return;
	}

	log('  ⟶ ', relative);

	return {
		'.': relative,
	};
}

/** @param {string[]} argv */
async function main (argv) {
	const json = JSON.parse(await readFile('package.json', 'utf8'));

	if (!isObject(json)) {
		error('package.json is not an object or is null.');
		return;
	}

	if (typeof json.name !== 'string') {
		error('package.json has no name, or the name is not a string.');
	}

	const name = json.name;
	const exportsObject = getExportsObject(json.exports) ?? getTypesObject(json.types);

	if (exportsObject === undefined) {
		warn('No exported types found.');
		return;
	}

	/** @type {Map<string, string[]>} */
	const matches = new Map(argv.map((path) => [path, []]));

	for (let [key, value] of Object.entries(exportsObject)) {
		log('New subpath:', key, '→', value);
		let isMapped = key.includes('/*');

		if (isMapped && !value.includes('/*')) {
			warn('Pattern is mapped but its value is not.');
			key = key.replace('/*', '/index');
			isMapped = false;
		}

		let keyBegining = isMapped ? key.slice(0, key.indexOf('/*')) : key;
		let keyEnding = isMapped ? key.slice(key.indexOf('/*') + 2) : '';
		let begining = isMapped ? value.slice(0, value.indexOf('/*')) : value;
		let ending = isMapped ? value.slice(value.indexOf('/*') + 2) : '';

		log('  Key parts:', keyBegining, '→', keyEnding);
		log('  Value parts:', begining, '→', ending);

		for (const [path, matched] of matches) {
			if (path.startsWith(begining) && path.endsWith(ending)) {
				log('  Path matches:', path);
				matched.push(name
					+ keyBegining.slice(1) // This removes the dot
					+ path.slice(begining.length, path.indexOf(ending))
					+ keyEnding);
			}
		}
	}

	for (const [path, matched] of matches) {
		if (matched.length === 0) {
			log('Path did not match:', path);
		} else {
			matched.sort((a, b) => a.length - b.length);
			console.log(`${matched[0]}\t${path}`);
		}
	}

	json.name = 'placeholder_package_name';
	await writeFile('package.json', JSON.stringify(json), 'utf8');
}
