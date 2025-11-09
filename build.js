import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const src = path.join(__dirname, 'src');
const lib = path.join(__dirname, 'lib');

async function build() {
    console.log('Building package...');

    // Remove old lib directory
    if (fs.existsSync(lib)) {
        await fs.remove(lib);
        console.log('Cleaned lib directory');
    }

    // Copy src to lib
    await fs.copy(src, lib);
    console.log('Copied src to lib');

    console.log('Build completed!');
}

build().catch(console.error);
