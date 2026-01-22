import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load env vars
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Root is one level up from scripts
const ROOT_DIR = path.resolve(__dirname, '..');

const BRAIN_DIR = 'C:\\Users\\LG\\.gemini\\antigravity\\brain\\41b715ab-7c90-4a0d-915c-b49192d44946';
const TONE_REPORT_PATH = path.join(BRAIN_DIR, 'tone_analysis_report.json');
const SAMPLES_PATH = path.join(BRAIN_DIR, 'kakao_samples.json');
const OUTPUT_PATH = path.join(BRAIN_DIR, 'synthetic_pilot.json');

// Get API Key from env
const apiKey = process.env.VITE_API_KEY;

if (!apiKey) {
    console.error("Error: VITE_API_KEY is not defined in .env file.");
    process.exit(1);
}

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey });

async function generatePilot() {
    console.log("Loading Tone Profile...");
    const toneReport = JSON.parse(fs.readFileSync(TONE_REPORT_PATH, 'utf8'));
    const samples = JSON.parse(fs.readFileSync(SAMPLES_PATH, 'utf8'));

    // Pick 3 random samples for few-shot
    const fewShots = samples.sort(() => 0.5 - Math.random()).slice(0, 3);

    const modelsToTry = ["models/gemini-2.0-flash-001"];

    const combinedPrompt = `
You are the AI consultant for 'MeaningFill' (미닝필).
Generate 5 synthetic Q&A pairs regarding Payment & Reservations.

[Tone Rules]
1. Endings: Ends with a period ("."). Do NOT use tildes ("~").
2. Greeting: ALWAYS start the answer with "안녕하세요".
3. Specificity: Include the subject explicitly (e.g., "예약금은 현금 계좌이체로만...").
4. Affirmation: Use "네" only.

[MeaningFill Payment Policies] (MUST ADHERE STRICTLY)
1. Deposit: 50% of total (rounded to 10k). Cash transfer only.
   - Phrasing: "예약금은 현금 계좌이체로만 가능합니다."
2. Card Change:
   - Allowed only within 2 days.
   - If > 2 days (e.g. 3 days): "3일이 지나셨기 때문에 카드사에 확인 후 안내드려야 할 것 같은데, 확인 후 연락드려도 될까요?" (Check with card company logic).
3. Tax Invoice: Issued within 1 day after deposit confirmation.
4. Reservation Deadline: 5 days before event.
   - If < 5 days (e.g. 3 days): "정확한 예약일정을 맞추기 위해 행사는 5일 전에 마감하고 있어서, 스케줄 확인이 필요한 사항이라 상담원을 연결해드릴까요?" (Schedule check logic).

[Task]
Generate 5 Q&A pairs covering:
1. Deposit inquiry (amount, method).
2. Card change request (after 3 days).
3. Tax invoice request.
4. Late reservation request (3 days left).
5. General reservation confirmation.

Return ONLY a valid JSON array of objects with "Q" and "A" keys. Do not include markdown formatting.
`;

    for (const modelName of modelsToTry) {
        console.log(`Trying model: ${modelName}...`);
        try {
            const response = await genAI.models.generateContent({
                model: modelName,
                contents: [{ role: 'user', parts: [{ text: combinedPrompt }] }],
                config: {
                    temperature: 0.4,
                    maxOutputTokens: 2000,
                    responseMimeType: "text/plain"
                }
            });

            const responseText = typeof response.text === 'function' ? response.text() : response.text;
            console.log("Generated Content:", responseText);

            fs.writeFileSync(OUTPUT_PATH, responseText);
            console.log(`Saved pilot data to ${OUTPUT_PATH}`);
            return; // Success
        } catch (error) {
            console.warn(`Failed with ${modelName}:`, error.message);
        }
    }
    console.error("All models failed.");
}

generatePilot();
