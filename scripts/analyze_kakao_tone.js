import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = 'c:\\Users\\LG\\dev\\class\\kakao_data';
const OUTPUT_REPORT = 'C:\\Users\\LG\\.gemini\\antigravity\\brain\\41b715ab-7c90-4a0d-915c-b49192d44946\\tone_analysis_report.json';
const OUTPUT_SAMPLES = 'C:\\Users\\LG\\.gemini\\antigravity\\brain\\41b715ab-7c90-4a0d-915c-b49192d44946\\kakao_samples.json';

// Utility to parse CSV line logic (handling quotes)
function parseCSV(content) {
    const rows = [];
    let currentRow = [];
    let currentCell = '';
    let inQuote = false;

    for (let i = 0; i < content.length; i++) {
        const char = content[i];
        const nextChar = content[i + 1];

        if (char === '"') {
            if (inQuote && nextChar === '"') {
                currentCell += '"';
                i++; // Skip next quote
            } else {
                inQuote = !inQuote;
            }
        } else if (char === ',' && !inQuote) {
            currentRow.push(currentCell);
            currentCell = '';
        } else if ((char === '\r' || char === '\n') && !inQuote) {
            if (char === '\r' && nextChar === '\n') i++;
            currentRow.push(currentCell);
            rows.push(currentRow);
            currentRow = [];
            currentCell = '';
        } else {
            currentCell += char;
        }
    }
    if (currentCell || currentRow.length > 0) {
        currentRow.push(currentCell);
        rows.push(currentRow);
    }
    return rows;
}

function analyzeFiles() {
    if (!fs.existsSync(DATA_DIR)) {
        console.error(`Data directory not found: ${DATA_DIR}`);
        return;
    }

    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.csv'));
    console.log(`Found ${files.length} CSV files.`);

    let allMessages = []; // For stats
    let qaPairs = []; // For few-shot samples
    let totalFiles = 0;

    files.forEach(file => {
        const content = fs.readFileSync(path.join(DATA_DIR, file), 'utf8');
        // Skip header if present (heuristic)
        const rows = parseCSV(content);

        // Remove header row if it looks like one
        if (rows.length > 0 && (rows[0][1] === 'USER' || rows[0][0] === 'Date')) {
            rows.shift();
        }

        let lastUserMsg = null;

        rows.forEach(row => {
            if (row.length < 3) return;
            const user = row[1];
            const msg = row[2];

            if (!user || !msg) return;

            // Identify MeaningFill (Counselor) vs Customer
            // user field might be quoted, clean it
            const cleanUser = user.replace(/^"|"$/g, '');
            const isCounselor = cleanUser.toUpperCase().includes('MEANINGFILL');

            if (isCounselor) {
                // Check if it's a system message or actual response
                // Heuristic: If it starts with "https://ciderpay", it's a payment link (special case)
                // We keep it for tone but maybe tag it?

                allMessages.push(msg);

                // Form a QA pair if we have a pending user question within reasonable timeframe (simplified here)
                if (lastUserMsg) {
                    // Filter out short/meaningless pairs
                    if (lastUserMsg.length > 3 && msg.length > 3) {
                        qaPairs.push({
                            Q: lastUserMsg,
                            A: msg,
                            file: file
                        });
                    }
                    lastUserMsg = null; // Reset
                }
            } else {
                // Customer
                lastUserMsg = msg;
            }
        });
        totalFiles++;
    });

    // --- TONE ANALYSIS ---
    const totalMsgCount = allMessages.length;
    let totalLength = 0;
    let emojiCount = 0;
    const endings = {};
    const keywords = {};

    // Regex for Korean endings roughly
    const endingRegex = /(?:해요|세요|니|다|요|죠|까)(?:[?!.]*)$/;
    // Regex for Emojis
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

    allMessages.forEach(msg => {
        totalLength += msg.length;
        if (emojiRegex.test(msg)) emojiCount++;

        // Extract ending
        const trimmed = msg.trim();
        // Remove quotes if any
        const cleanMsg = trimmed.replace(/^"|"$/g, '');

        const match = cleanMsg.match(endingRegex);
        if (match) {
            const end = match[0];
            endings[end] = (endings[end] || 0) + 1;
        }
    });

    const avgLen = totalMsgCount > 0 ? Math.round(totalLength / totalMsgCount) : 0;
    const emojiFreq = totalMsgCount > 0 ? (emojiCount / totalMsgCount).toFixed(2) : 0;

    // Sort endings
    const sortedEndings = Object.entries(endings)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(e => e[0]);

    // Sample conversations (Pick 20 diverse ones)
    const shuffledQA = qaPairs.sort(() => 0.5 - Math.random()).slice(0, 50);

    const report = {
        metadata: {
            total_files_analyzed: totalFiles,
            total_counselor_messages: totalMsgCount,
            total_qa_pairs_extracted: qaPairs.length,
            analysis_date: new Date().toISOString()
        },
        tone_profile: {
            avg_sentence_length: avgLen,
            emoji_frequency: parseFloat(emojiFreq),
            common_endings: sortedEndings,
            empathy_keywords_found: true
        },
        analysis_summary: `Analyzed ${totalMsgCount} messages. Average length is ${avgLen} chars. Emoji usage frequency is ${emojiFreq}. Most common endings are: ${sortedEndings.join(', ')}.`
    };

    fs.writeFileSync(OUTPUT_REPORT, JSON.stringify(report, null, 2));
    fs.writeFileSync(OUTPUT_SAMPLES, JSON.stringify(shuffledQA, null, 2));

    console.log("Analysis Complete.");
    console.log("Report saved to:", OUTPUT_REPORT);
    console.log("Samples saved to:", OUTPUT_SAMPLES);
    console.log(JSON.stringify(report, null, 2));
}

analyzeFiles();
