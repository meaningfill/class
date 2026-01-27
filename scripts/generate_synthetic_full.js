import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../');
// Changed output path to local data directory for project portability
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'data');
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'synthetic_qa.json');

const apiKey = process.env.VITE_API_KEY;
if (!apiKey) {
    console.error("Error: VITE_API_KEY is not defined.");
    process.exit(1);
}

const genAI = new GoogleGenAI({ apiKey });

// Comprehensive Scenarios for 2000 items
const SCENARIOS = [
    "Corporate Lunch Catering Inquiry",
    "Wedding & Party Catering Inquiry",
    "Reservation Change (Date/Time)",
    "Menu Customization (Vegan/Allergy)",
    "Payment & Invoice (Tax Bill/Card)",
    "Delivery & Logistics Inquiry",
    "Order Cancellation & Refunds (Strict 7-day rule)",
    "Food Waste & Cleanup Policy",
    "Urgent Orders (< 3 days)",
    "General Brand & Class Inquiries",
    "Website Creation Services",
    "Sandwich Class Details"
];

const TONE_RULES = `
[Tone & Persona: "MeaningFill Concierge"]
You are the **Concierge** of MeaningFill, a high-end catering brand.
Your language should be **sophisticated, empathetic, and definitive**.

**TONE GUIDELINES (SOPHISTICATED)**:
1.  **Refusal**: Never say "No" directly. Use "Regarding [Topic], our policy is..." or "Service limitation."
2.  **Handoff**: When connecting to a human, use graceful phrasing.
3.  **Clarity**: Be extremely precise about numbers (20 people, 50 people, 7 days, 100,000 KRW).
`;

async function generateBatch(scenario, count) {
    const model = 'models/gemini-2.0-flash-001';

    // 1. Load Songys Example (Naturalness)
    let songysExamples = "";
    try {
        const rawSongys = fs.readFileSync(path.join(PROJECT_ROOT, 'data/ChatbotData.csv'), 'utf-8');
        const lines = rawSongys.split('\n').slice(1).filter(l => l.length > 5);
        songysExamples = lines.sort(() => 0.5 - Math.random()).slice(0, 3).map(l => {
            const p = l.split(','); return `Q: ${p[0]}\nA: ${p[1]}`;
        }).join('\n\n');
    } catch (e) { }

    // 2. Load LLMDataset.csv (Gold Standard Policy)
    let llmExamples = "";
    try {
        const llmPath = path.join(PROJECT_ROOT, 'docs/LLMDataset.csv');
        if (fs.existsSync(llmPath)) {
            const rawLLM = fs.readFileSync(llmPath, 'utf-8');
            const lines = rawLLM.split('\n').slice(1).filter(l => l.length > 20);
            // Provide more examples to ground the model better
            llmExamples = lines.sort(() => 0.5 - Math.random()).slice(0, 15).join('\n');
        }
    } catch (e) { }

    // 3. Load AI Hub Purpose (Flow Structure)
    let aiHubExamples = "";
    try {
        const purposeDir = path.join(PROJECT_ROOT, 'kakao_data/purpose_temp/03.주문결제');
        if (fs.existsSync(purposeDir)) {
            const files = fs.readdirSync(purposeDir).filter(f => f.endsWith('.json'));
            const sampled = files.sort(() => 0.5 - Math.random()).slice(0, 2);
            for (const f of sampled) {
                const c = fs.readFileSync(path.join(purposeDir, f), 'utf-8');
                const j = JSON.parse(c);
                aiHubExamples += j.info[0].annotations.lines.map(l => `${l.speaker.id}: ${l.text}`).join('\n') + "\n---\n";
            }
        }
    } catch (e) { }


    const prompt = `
You are the **Concierge** for "MeaningFill" (미닝필).
Generate ${count} distinct Q&A pairs in Korean about "${scenario}".

**CRITICAL POLICY SOURCE (GOLD STANDARD):**
These are the ONLY valid business rules. Do not invent new policies.
${llmExamples}

**STYLE SOURCES:**
[Natural Tone Ref]
${songysExamples}

**STRICT GENERATION RULES:**
1.  **Anti-Hallucination**: If a scenario requires specific details (like prices, locations, specific constraints) NOT found in the 'CRITICAL POLICY SOURCE', **YOU MUST GENERATE AN ANSWER THAT DIRECTS THE USER TO A MANAGER**.
    *   Example: "상세한 견적은 담당 매니저와 상담이 필요합니다. 연결해 드릴까요?"
2.  **Refund Policy**: Strict 7-day rule. 100k KRW deposit deduction.
3.  **Min Order**: 20 servings.
4.  **Language**: Korean (Honorifics/존댓말).
5.  **Format**: STRICT JSON Array.

**OUTPUT FORMAT:**
Return ONLY a valid JSON array.
[{"question": "...", "answer": "..."}, ...]
`;

    try {
        const response = await genAI.models.generateContent({
            model: model,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                temperature: 0.7,
                maxOutputTokens: 8000,
                responseMimeType: "application/json"
            }
        });

        let text = typeof response.text === 'function' ? response.text() : response.text;
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(text);
    } catch (e) {
        console.error(`Failed batch for ${scenario}:`, e.message);
        return [];
    }
}

async function main() {
    let allData = [];
    const targetTotal = 2000;
    const itemsPerBatch = 20;
    const loopsPerScenario = Math.ceil((targetTotal / SCENARIOS.length) / itemsPerBatch);

    console.log(`Starting generation for ~${targetTotal} items...`);
    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    for (const scenario of SCENARIOS) {
        console.log(`Generating scenario: ${scenario}...`);
        for (let i = 0; i < loopsPerScenario; i++) {
            const batch = await generateBatch(scenario, itemsPerBatch);
            if (batch.length > 0) {
                allData = allData.concat(batch);
                process.stdout.write(`.`); // Progress indicator
            }
            await new Promise(r => setTimeout(r, 1000)); // Rate limiting
        }
        console.log(`\n  + Completed scenario. Total so far: ${allData.length}`);
    }

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(allData, null, 2));
    console.log(`\nDone. Saved ${allData.length} items to ${OUTPUT_PATH}`);
}

main();
