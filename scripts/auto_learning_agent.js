
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Config
const supabaseUrl = process.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_PUBLIC_SUPABASE_ANON_KEY;
const apiKey = process.env.VITE_API_KEY;

if (!supabaseUrl || !supabaseAnonKey || !apiKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const genAI = new GoogleGenAI({ apiKey });

async function runAgent() {
    console.log("🕵️  [Knowledge Curator] Agent Started...");

    // 1. Fetch recent user messages (Last 24 hours, limited to 50)
    // We only care about user questions, maybe filter by length
    const { data: messages, error } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('role', 'user')
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error("Failed to fetch messages:", error.message);
        return;
    }

    if (!messages || messages.length === 0) {
        console.log("No recent messages to analyze.");
        return;
    }

    console.log(`Analyzing ${messages.length} messages...`);

    // 2. Analyze using Gemini
    // We want to find questions that are "unanswered" or "new"
    // Since we don't have 'unanswered' tag yet, we simply look for GOOD questions to add to KB.
    const candidates = [];

    for (const msg of messages) {
        // Skip if already analyzed (You might want a flag in DB, skipping for now)

        const analysisPrompt = `
        Analyze this user message: "${msg.content}"
        
        Is this a question that should be added to our Knowledge Base?
        (Criteria: specific, relevant to catering/baking, not just a greeting)
        
        If YES, draft a perfect Q&A pair in JSON format:
        { "is_valid": true, "question": "refined question", "answer": "ideal answer" }
        
        If NO, return:
        { "is_valid": false }
        `;

        try {
            const result = await generateJSON(analysisPrompt);
            if (result.is_valid) {
                candidates.push({
                    source_message_id: msg.id,
                    question: result.question,
                    answer: result.answer,
                    status: 'pending'
                });
                console.log(`Found Candidate: ${result.question}`);
            }
        } catch (e) {
            console.error("AI Analysis failed:", e);
        }
    }

    // 3. Save Candidates
    if (candidates.length > 0) {
        const { error: insertError } = await supabase.from('rag_candidates').insert(candidates);
        if (insertError) console.error("Failed to save candidates:", insertError.message);
        else console.log(`✅ Saved ${candidates.length} new candidates to DB.`);
    } else {
        console.log("No new candidates found.");
    }
}

async function generateJSON(prompt) {
    const model = 'gemini-2.0-flash-001';
    const resp = await genAI.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
    });

    // Robust parsing
    let text = "";
    if (typeof resp.text === 'function') {
        text = resp.text();
    } else if (resp.text) {
        text = resp.text;
    } else if (resp.candidates?.[0]?.content?.parts?.[0]?.text) {
        text = resp.candidates[0].content.parts[0].text;
    }

    return JSON.parse(text || "{}");
}

runAgent();
