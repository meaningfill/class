import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../');
const DATA_PATH = path.join(PROJECT_ROOT, 'src/data/synthetic_qa.json');


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
            if (item.question && item.question.includes(k)) score += 2;
            if (item.answer && item.answer.includes(k)) score += 1;
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
2.  **Greetings**: Start with "안녕하세요" ONLY in the very first response of the conversation. Do NOT repeat it in subsequent turns.
3.  **Affirmation**: Use "네" only when directly answering Yes/No questions or acknowledging a complex request. Do NOT start every single sentence with "네".
4.  **Endings**: Use periods ("."). No tildes ("~").
5.  **Phrasing**: Be professional but friendly. Use explicit subjects.
6.  **Completeness**: When listing menu items or options, list ALL of them explicitly.
7.  **Formatting**: Use bullet points ("- ") and newlines for every item in a list to improve readability. Do NOT write lists in a single paragraph.

[Format]
- Keep answers concise (under 200 characters if possible), EXCEPT when listing items (then use as much space as needed for readability).
- If the Context suggests a "Manager Handoff", politely suggest connecting to a manager.
`;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function chat() {
    console.log("\n💬 [MeaningFill AI Chatbot - Protocol Test]");
    console.log("Type your question (or 'exit' to quit):");
    console.log("------------------------------------------------");

    // Initialize History
    const history = [
        {
            role: "user",
            parts: [{ text: "System Initialization: You are the MeaningFill AI Consultant. Follow these TONE_RULES:\n" + TONE_RULES }]
        },
        {
            role: "model",
            parts: [{ text: "네, 알겠습니다. 미닝필 AI 컨설턴트로서 TONE_RULES를 준수하며 대화를 진행하겠습니다." }]
        }
    ];

    const ask = () => {
        rl.question('User: ', async (input) => {
            if (input.toLowerCase() === 'exit') {
                rl.close();
                return;
            }

            // 1. Find Context (RAG)
            const relevantItems = findRelevantContext(input);
            const contextText = relevantItems.map(i => `Q: ${i.question}\nA: ${i.answer}`).join('\n---\n');

            // 2. Construct Prompt with Context
            const prompt = `
[Context from Knowledge Base]
${contextText}

[User Query]
${input}

[Instruction]
Answer the user's query using the provided context if relevant. If the context doesn't help with this specific query, rely on your general knowledge about MeaningFill but ensure you mention you are an AI. Remember the TONE_RULES (no repeated greetings).
`;

            // Add current turn to temporary history for this request
            const currentMessage = { role: 'user', parts: [{ text: prompt }] };
            const requestContents = [...history, currentMessage];

            try {
                process.stdout.write("AI: (Thinking...)");

                const response = await genAI.models.generateContent({
                    model: modelName,
                    contents: requestContents
                });

                // Clear "Thinking..." line
                process.stdout.clearLine(0);
                process.stdout.cursorTo(0);

                const text = typeof response.text === 'function' ? response.text() : response.text;

                console.log(`AI: ${text.trim()}\n`);

                // Update history
                history.push(currentMessage);
                history.push({ role: 'model', parts: [{ text: text }] });

            } catch (e) {
                console.error("\nError generating response:", e.message);
            }

            ask();
        });
    };

    ask();
}

chat().catch(err => {
    console.error("Fatal Error:", err);
    process.exit(1);
});
