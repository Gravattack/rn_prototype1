import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const LZString = require('lz-string');

// Get the project root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const NATIVE_APP_DIR = path.join(PROJECT_ROOT, 'apps', 'native');

function ensureDirectoryExistence(filePath) {
    const dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}

async function sync() {
    const urlArg = process.argv[2];

    if (!urlArg) {
        console.error('Please provide the playground URL as an argument.');
        console.error('Usage: npm run sync:native <URL>');
        process.exit(1);
    }

    try {
        // 1. Parse URL to get 'code' query param
        const urlObj = new URL(urlArg);
        const codeParam = urlObj.searchParams.get('code');

        if (!codeParam) {
            console.error('Error: URL does not contain a "code" query parameter.');
            process.exit(1);
        }

        // 2. Decompress
        console.log('Decompressing code...');
        const decompressed = LZString.decompressFromEncodedURIComponent(codeParam);

        if (!decompressed) {
            console.error('Error: Failed to decompress the code. The URL might be invalid.');
            process.exit(1);
        }

        // 3. Parse JSON
        const files = JSON.parse(decompressed);
        console.log(`Found ${Object.keys(files).length} files.`);

        // 4. Write files
        for (const [filename, content] of Object.entries(files)) {
            // Skip package.json and config files to avoid breaking the native environment
            // We mainly want App.tsx and other source files.
            if (filename === 'package.json' || filename === 'tsconfig.json' || filename === 'babel.config.js' || filename.startsWith('.')) {
                console.log(`Skipping ${filename}...`);
                continue;
            }

            const targetPath = path.join(NATIVE_APP_DIR, filename);

            // Ensure parent directory exists
            const targetDir = path.dirname(targetPath);
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }

            fs.writeFileSync(targetPath, content);
            console.log(`Synced ${filename}`);
        }

        console.log('\n✅ Sync complete! Run the following to test:');
        console.log('  cd apps/native && npm start');

    } catch (error) {
        console.error('Error syncing code:', error);
        process.exit(1);
    }
}

sync();
