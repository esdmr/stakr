#!/usr/bin/env node
import child from 'node:child_process';
import fs from 'node:fs/promises';

/**
 * @param {string} command
 * @param {string[]} args
 * @returns {Promise<void>}
 */
async function spawn (command, args) {
	return new Promise((resolve, reject) => {
		const process = child.spawn(command, args, {
			stdio: 'inherit',
		});

		let done = false;

		process.once('error', (error) => {
			if (!done) {
				reject(error);
				done = true;
			}
		});

		process.once('exit', (code) => {
			if (!done) {
				if (code) {
					reject(new Error(`Process failed with error code: ${code}`));
				} else {
					resolve();
				}

				done = true;
			}
		});
	});
}

async function getMetadata () {
	const metadata = JSON.parse(await fs.readFile('package.json', 'utf8'));

	// Cleanup package.json
	delete metadata.scripts;
	delete metadata.devDependencies;
	delete metadata.engines.pnpm;
	delete metadata.imports['#test/*'];
	delete metadata.pnpm;

	return metadata;
}

const metadata = getMetadata();

console.log('pnpm install');
await spawn('pnpm', ['install']);

console.log('pnpm run lint');
await spawn('pnpm', ['run', 'lint']);

console.log('pnpm run build');
await spawn('pnpm', ['run', 'build']);

console.log('pnpm run test');
await spawn('pnpm', ['run', 'test']);

console.log('mv package.json …');
await fs.rename('package.json', '.package.dev.json');

console.log('new package.json');
await fs.writeFile('package.json', JSON.stringify(metadata));
