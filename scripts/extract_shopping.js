import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '../');
const ZIP_PATH = path.join(PROJECT_ROOT, 'kakao_data', 'purpose_shopping.zip');
const EXTRACT_DIR = path.join(PROJECT_ROOT, 'kakao_data', 'purpose_shopping_extracted');

if (!fs.existsSync(EXTRACT_DIR)) {
    fs.mkdirSync(EXTRACT_DIR, { recursive: true });
}

console.log(`Extracting ${ZIP_PATH} to ${EXTRACT_DIR}...`);

try {
    const cmd = `powershell -Command "Expand-Archive -Path '${ZIP_PATH}' -DestinationPath '${EXTRACT_DIR}' -Force"`;
    console.log("Running:", cmd);
    execSync(cmd, { stdio: 'inherit' });

    console.log("Extraction complete.");

    const files = fs.readdirSync(EXTRACT_DIR);
    console.log("Extracted files:", files);

} catch (e) {
    console.error("Extraction failed:", e.message);
    process.exit(1);
}
