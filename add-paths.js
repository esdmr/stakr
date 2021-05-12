#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

main().catch((error) => {
	console.error(error);
	process.exit(1);
});

async function main () {
	const dir = path.join('build', 'test', 'node_modules');

	process.chdir(__dirname);
	await fs.mkdir(dir, { recursive: true });
	process.chdir(dir);

	try {
		await fs.unlink('src');
	} catch {}

	await fs.symlink(path.join('..', '..'), 'src');
}
