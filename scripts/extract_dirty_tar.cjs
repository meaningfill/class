
const fs = require('fs');
const path = require('path');

const tarPath = path.join(__dirname, '../kakao_data/aihub_training.tar');
const outDir = path.join(__dirname, '../kakao_data');
const outZip = path.join(outDir, 'aihub_training.zip');

if (!fs.existsSync(tarPath)) {
    console.error(`File not found: ${tarPath}`);
    process.exit(1);
}

const fd = fs.openSync(tarPath, 'r');
const buffer = Buffer.alloc(512); // Tar header size
let position = 0;

let largestFile = { run: null, size: 0, startPos: 0 };

try {
    const stats = fs.fstatSync(fd);
    const totalSize = stats.size;

    while (position < totalSize) {
        const read = fs.readSync(fd, buffer, 0, 512, position);
        if (read < 512) break;

        // Check for empty block (end of archive)
        if (buffer.every(b => b === 0)) {
            // Check next block to confirm
            const nextBuf = Buffer.alloc(512);
            fs.readSync(fd, nextBuf, 0, 512, position + 512);
            if (nextBuf.every(b => b === 0)) break;
        }

        // Parse Header
        // Name: 0-100
        // Size: 124-136 (octal string)
        // Type: 156 (0 = file, 5 = dirt)

        const nameBytes = buffer.subarray(0, 100);
        const name = nameBytes.toString().replace(/\u0000/g, '').trim();

        const sizeString = buffer.subarray(124, 136).toString().replace(/\u0000/g, '').trim();
        const size = parseInt(sizeString, 8);

        const typeFlag = buffer.subarray(156, 157).toString();

        console.log(`Found entry at ${position}: Size=${size}, Type=${typeFlag}, Name (Raw)=${name.substring(0, 20)}...`);

        if (isNaN(size)) {
            console.log("Invalid size, stopping.");
            break;
        }

        if (typeFlag === '0' || typeFlag === '\0') {
            if (size > largestFile.size) {
                largestFile = {
                    size: size,
                    startPos: position + 512, // Content starts after header
                    type: typeFlag
                };
            }
        }

        // Move to next header
        // Jump content + padding
        const contentBlocks = Math.ceil(size / 512);
        position += 512 + (contentBlocks * 512);
    }

    if (largestFile.startPos > 0) {
        console.log(`Extracting largest file (${largestFile.size} bytes) to ${outZip}...`);

        const readStream = fs.createReadStream(tarPath, {
            start: largestFile.startPos,
            end: largestFile.startPos + largestFile.size - 1
        });
        const writeStream = fs.createWriteStream(outZip);

        readStream.pipe(writeStream);

        writeStream.on('finish', () => {
            console.log("Extraction complete.");
        });
    } else {
        console.log("No file found to extract.");
    }

} catch (e) {
    console.error(e);
} finally {
    fs.closeSync(fd);
}
