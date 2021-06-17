#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import url from 'node:url';

// @ts-ignore Module *is* ESNext. Using import.meta is fine.
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

main().catch((error) => {
	console.error(error);
	process.exit(1);
});

async function main () {
	const dir = path.join('build', 'test', 'node_modules');

	process.chdir(__dirname);

	await fs.mkdir(dir, {
		recursive: true,
	});

	process.chdir(dir);

	try {
		await fs.unlink('src');
	} catch {}

	await fs.symlink(path.join('..', '..'), 'src');
}
