
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listTables() {
    try {
        console.log("Checking for 'ai_messages' table...");
        const res1 = await supabase.from('ai_messages').select('*').limit(1);
        if (res1.error) console.error("ai_messages ERROR:", res1.error.message);
        else console.log("ai_messages EXISTS.");

        console.log("Checking for 'ai_consultations' table...");
        const res2 = await supabase.from('ai_consultations').select('*').limit(1);
        if (res2.error) console.error("ai_consultations ERROR:", res2.error.message);
        else console.log("ai_consultations EXISTS.");

        console.log("Checking for 'rag_knowledge_base' table...");
        const res3 = await supabase.from('rag_knowledge_base').select('*').limit(1);
        if (res3.error) console.error("rag_knowledge_base ERROR:", res3.error.message);
        else console.log("rag_knowledge_base EXISTS.");
    } catch (err) {
        console.error("Fatal Error:", err);
    }
}

listTables();
