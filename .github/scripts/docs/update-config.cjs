#!/usr/bin/env node
const { readFile, writeFile } = require('node:fs/promises');
const process = require('process');

main(process.argv[2]).catch((error) => {
	console.error(error);
	process.exit(1);
});

/** @param {string} entrypoint */
async function main (entrypoint) {
	const json = JSON.parse(await readFile('api-extractor.json', 'utf8'));

	if (json) {
		json.mainEntryPointFilePath = '<projectFolder>/' + entrypoint;
	}

	await writeFile('api-extractor.json', JSON.stringify(json), 'utf8');
}
