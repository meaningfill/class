import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BRAIN_DIR = 'C:\\Users\\LG\\.gemini\\antigravity\\brain\\41b715ab-7c90-4a0d-915c-b49192d44946';
const DATA_PATH = path.join(BRAIN_DIR, 'synthetic_qa_dataset.json');

const apiKey = process.env.VITE_API_KEY;
if (!apiKey) {
    console.error("Error: VITE_API_KEY is not defined.");
    process.exit(1);
}

const genAI = new GoogleGenAI({ apiKey });
const modelName = 'models/gemini-2.0-flash-001';

// Load Dataset
console.log("Loading Knowledge Base (1,000 Q&A Pairs)...");
let dataset = [];
try {
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    dataset = JSON.parse(raw);
    console.log(`Loaded ${dataset.length} items.`);
} catch (e) {
    console.error("Failed to load dataset:", e.message);
    process.exit(1);
}

// Simple Keyword Search (Simulated RAG)
function findRelevantContext(query) {
    const keywords = query.split(' ').filter(w => w.length > 1);
    const scored = dataset.map(item => {
        let score = 0;
        keywords.forEach(k => {
            if (item.Q.includes(k)) score += 2;
            if (item.A.includes(k)) score += 1;
        });
        return { item, score };
    });

    // Sort by score and take top 5
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 5).map(s => s.item);
}

const TONE_RULES = `
[Tone & Personality]
1.  **Identity**: "MeaningFill" (미닝필) AI Consultant.
2.  **Greetings**: Always start with "안녕하세요".
3.  **Affirmation**: Use "네" exclusively. (No "넵", "네네").
4.  **Endings**: Use periods ("."). No tildes ("~").
5.  **Phrasing**: Be professional but friendly. Use explicit subjects.
`;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function chat() {
    console.log("\n💬 [MeaningFill AI Chatbot - Protocol Test]");
    console.log("Type your question (or 'exit' to quit):");
    console.log("------------------------------------------------");

    const ask = () => {
        rl.question('User: ', async (input) => {
            if (input.toLowerCase() === 'exit') {
                rl.close();
                return;
            }

            const relevantItems = findRelevantContext(input);
            const contextText = relevantItems.map(i => `Q: ${i.Q}\nA: ${i.A}`).join('\n---\n');

            const prompt = `
${TONE_RULES}

[Reference Knowledge (Similar Past Q&A)]
${contextText}

[Task]
Answer the user's question based on the Reference Knowledge and Tone Rules.
User Question: "${input}"
Answer:
`;

            try {
                process.stdout.write("AI: (Thinking...)");
                const response = await genAI.models.generateContent({
                    model: modelName,
                    contents: [{ role: 'user', parts: [{ text: prompt }] }]
                });

                // Clear "Thinking..." line
                process.stdout.clearLine(0);
                process.stdout.cursorTo(0);

                const text = typeof response.text === 'function' ? response.text() : response.text;
                console.log(`AI: ${text.trim()}\n`);
            } catch (e) {
                console.error("\nError generating response:", e.message);
            }

            ask();
        });
    };

    ask();
}

chat();
