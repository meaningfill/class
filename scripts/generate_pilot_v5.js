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
const OUTPUT_PATH = path.join(BRAIN_DIR, 'synthetic_pilot_v5.json');

const apiKey = process.env.VITE_API_KEY;
if (!apiKey) {
    console.error("Error: VITE_API_KEY is not defined.");
    process.exit(1);
}

const genAI = new GoogleGenAI({ apiKey });

// Targeted Scenarios for Verification
const SCENARIOS = [
    "Inquiry about Food Waste & Cleanup",
    "Vegan Option Request (Total Order < 50)",
    "Vegan Option Request (Total Order > 50)",
    "Cancellation Request (Customer Fault, > 7 days)",
    "Urgent Delivery Time Change"
];

const TONE_RULES = `
[Tone & Persona: "MeaningFill Concierge"]
You are the **Concierge** of MeaningFill, a high-end catering brand.
Your language should be **sophisticated, empathetic, and definitive**.

**TONE GUIDELINES (SOPHISTICATED)**:
1.  **Refusal**: Never say "No" directly. Use "Regarding [Topic], our policy is..." or "Service limitation."
    -   *Bad*: "We don't do cleanup."
    -   *Good*: "Please note that on-site cleanup is not included in our standard care package, as we focus on food safety and delivery precision."
2.  **Handoff**: When connecting to a human, use graceful phrasing.
    -   *Good*: "For this specific request, I would like to connect you directly with our Event Manager to explore the best possible solution."
3.  **Clarity**: Be extremely precise about numbers (20 people, 50 people, 7 days, 100,000 KRW).

**CRITICAL LOGIC (User Rules)**:
-   **Cleanup**: We DO NOT provide cleanup. We can *refer* external vendors (client pays/arranges).
-   **Min Order**: Minimum 20 servings.
-   **Vegan Changes**:
    -   If Total Order >= 50: Partial vegan changes allowed.
    -   If Total Order < 50: **Partial changes NOT allowed** (Must be ALL vegan or NO vegan).
-   **Refunds**:
    -   Company Fault: 100% Refund.
    -   Customer Cancel (> 7 days before): Refund minus **100,000 KRW** (Deposit/Loss Fee).
-   **Urgent Schedule**: "Shall I connect you to the Manager for a real-time check?"
`;

const POLICIES = `
[MeaningFill Strict Policies]
1.  **Cleanup**: Not provided directly. External referral only.
2.  **Vegan/Allergy**:
    -   Partial changes possible ONLY for orders of 50+.
    -   Under 50, menu must be unified.
3.  **Cancellation (Customer Side)**:
    -   Cancel 7+ days before: Refund excl. 100k KRW deposit.
    -   (Implicit: <7 days is non-refundable or strict - refer to counsel).
4.  **Min Order**: 20 servings.
`;

// Load Songys Data for Style Randomization
let naturalSamples = [];
try {
    const rawData = fs.readFileSync(path.join(PROJECT_ROOT, 'data/ChatbotData.csv'), 'utf-8');
    const lines = rawData.split('\n').filter(line => line.includes(',')); // Simple CSV parse
    // Taking samples from the '0' label (Daily life) usually
    naturalSamples = lines.slice(1).map(l => {
        const parts = l.split(',');
        return { Q: parts[0], A: parts[1] };
    }).filter(i => i.Q && i.A && i.A.length > 5);
} catch (e) {
    console.warn("Could not load ChatbotData.csv, using fallback examples.");
}

function getRandomNaturalSamples(cnt = 3) {
    if (naturalSamples.length === 0) return "";
    const selected = [];
    for (let i = 0; i < cnt; i++) {
        const idx = Math.floor(Math.random() * naturalSamples.length);
        selected.push(naturalSamples[idx]);
    }
    return selected.map(s => `(Style Ref Only) Q: "${s.Q}" / A: "${s.A}"`).join('\n');
}

async function generateBatch(scenario, count) {
    const model = 'models/gemini-2.0-flash-001';
    const styleRefs = getRandomNaturalSamples(3);

    // [New] AI Hub Purpose Data Loading (Tri-Hybrid)
    const aiHubPurposeDir = path.join(PROJECT_ROOT, 'kakao_data/purpose_temp/03.주문결제');
    let aiHubPurposeExamples = "";

    if (fs.existsSync(aiHubPurposeDir)) {
        try {
            const files = fs.readdirSync(aiHubPurposeDir).filter(f => f.endsWith('.json'));
            const sampledFiles = files.sort(() => 0.5 - Math.random()).slice(0, 3);

            let parsedDialogues = [];
            for (const file of sampledFiles) {
                const content = fs.readFileSync(path.join(aiHubPurposeDir, file), 'utf-8');
                const json = JSON.parse(content);
                const lines = json.info[0].annotations.lines;
                const dialogueText = lines.map(l => `${l.speaker.id}: ${l.text}`).join('\n');
                parsedDialogues.push(dialogueText);
            }
            aiHubPurposeExamples = parsedDialogues.join('\n\n---\n\n');
        } catch (e) {
            console.error("Error loading AI Hub Purpose data:", e.message);
        }
    }

    const prompt = `
You are the **Senior UX Copywriter and Sommelier** for "MeaningFill" (미닝필), a premium catering and lunch box service.
Your goal is to generate **high-quality, natural, and helpful synthetic Q&A pairs** in Korean.

**CRITICAL RULES (V5 - TRI-HYBRID INTELLIGENCE):**
1.  **Language**: 100% KOREAN. Natural, polite, professional yet warm.
2.  **Safety**: NEVER invent prices. If asked about checks, refer to counseling.
3.  **Tone Integration**:
    -   **Naturalness**: Borrow the casual flow from [Source A].
    -   **Professionalism**: Adopt the clear business logic from [Source B: Not Loaded in Pilot].
    -   **Goal-Orientation**: Ensure the user's specific inquiry is resolved efficiently like in [Source C].

**DATA SOURCES (STYLE TRANSFER):**

[Source A: Natural Daily Conversation]
${styleRefs}

[Source C: Goal-Oriented Shopping Dialogue (Reference ONLY)]
${aiHubPurposeExamples}

**YOUR TASK:**
Generate ${count} distinct Q&A pairs for the topic: "${scenario}".
Focus on:
- Complex Orders (e.g., "Change menu for 3 people to vegan")
- Policy Explanations
- Delivery Logistics

**FORMAT:**
Return ONLY the raw JSON array.
[
  { "question": "...", "answer": "..." },
  ...
]
`;

    try {
        const response = await genAI.models.generateContent({
            model: model,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                temperature: 0.7,
                maxOutputTokens: 4000,
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
    console.log("Starting PILOT generation (V5 Tri-Hybrid)...");

    for (const scenario of SCENARIOS) {
        console.log(`Generating pilot for: ${scenario}...`);
        // Generate only 2 items per scenario for quick review
        const batch = await generateBatch(scenario, 2);
        if (batch.length > 0) {
            allData = allData.concat(batch);
            console.log(`  + Generated ${batch.length} items.`);
        }
        await new Promise(r => setTimeout(r, 500));
    }

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(allData, null, 2));
    console.log(`Successfully generated ${allData.length} pilot items. Saved to ${OUTPUT_PATH}`);
}

main();
