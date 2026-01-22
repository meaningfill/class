import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../'); // Assuming scripts/ is one level deep
const BRAIN_DIR = 'C:\\Users\\LG\\.gemini\\antigravity\\brain\\41b715ab-7c90-4a0d-915c-b49192d44946';
const OUTPUT_PATH = path.join(BRAIN_DIR, 'synthetic_v5_2000.json');

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
    "Order Cancellation & Refunds",
    "Food Waste & Cleanup Policy",
    "Urgent Orders (< 3 days)",
    "General Brand & Class Inquiries"
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
            llmExamples = lines.sort(() => 0.5 - Math.random()).slice(0, 5).join('\n');
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

**CRITICAL POLICY SOURCE (STRICT ADHERENCE):**
${llmExamples}

**STYLE SOURCES:**
[Natural Tone Ref]
${songysExamples}

[Complex Flow Ref]
${aiHubExamples}

**STRICT BUSINESS RULES:**
1.  **Cleanup**: Not provided. Refer external if asked.
2.  **Refunds**: 7+ days = 100% (minus 100k deposit). <7 days = No refund.
3.  **Min Order**: 20 servings.
4.  **Vegan**: Partial change only if Total >= 50.

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
    // const targetPerScenario = Math.ceil(targetTotal / SCENARIOS.length);
    const loopsPerScenario = Math.ceil((targetTotal / SCENARIOS.length) / itemsPerBatch);

    console.log(`Starting generation for 2000 items (${loopsPerScenario} batches of ${itemsPerBatch} per 10 scenarios)...`);

    for (const scenario of SCENARIOS) {
        console.log(`Generating scenario: ${scenario}...`);
        for (let i = 0; i < loopsPerScenario; i++) {
            const batch = await generateBatch(scenario, itemsPerBatch);
            if (batch.length > 0) {
                allData = allData.concat(batch);
                console.log(`  + Generated ${batch.length} items. Total: ${allData.length}`);
            }
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(allData, null, 2));
    console.log(`Done. Saved to ${OUTPUT_PATH}`);
}

main();
