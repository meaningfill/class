
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
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

const DATA_PATH = path.join(__dirname, '../src/data/synthetic_qa.json');

async function migrate() {
    console.log("🚀 Starting Migration: JSON -> Supabase...");

    // 1. Load JSON
    let dataset = [];
    try {
        const raw = fs.readFileSync(DATA_PATH, 'utf-8');
        dataset = JSON.parse(raw);
        console.log(`📦 Loaded ${dataset.length} items from JSON.`);
    } catch (e) {
        console.error("❌ Failed to load JSON:", e.message);
        process.exit(1);
    }

    // 2. Batched Insert
    const BATCH_SIZE = 100;
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < dataset.length; i += BATCH_SIZE) {
        const batch = dataset.slice(i, i + BATCH_SIZE).map(item => ({
            question: item.question,
            answer: item.answer,
            category: 'general', // Default category
            tags: ['imported'],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }));

        const { error } = await supabase.from('rag_knowledge_base').insert(batch);

        if (error) {
            console.error(`❌ Batch ${i} failed:`, error.message);
            failCount += batch.length;
        } else {
            console.log(`✅ Batch ${i} inserted (${batch.length} items).`);
            successCount += batch.length;
        }
    }

    console.log(`\n🎉 Migration Complete!`);
    console.log(`Total Success: ${successCount}`);
    console.log(`Total Failed: ${failCount}`);
}

migrate();
