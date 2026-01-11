
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load .env manually to avoid dependencies
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...values] = line.split('=');
    if (key && values) {
        let val = values.join('=');
        // Remove quotes if present
        if (val.startsWith('"') && val.endsWith('"')) {
            val = val.slice(1, -1);
        }
        env[key.trim()] = val.trim();
    }
});

const supabaseUrl = env.VITE_PUBLIC_SUPABASE_URL;
const supabaseKey = env.VITE_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing Supabase Connection...');
console.log('URL:', supabaseUrl);
console.log('Key Length:', supabaseKey ? supabaseKey.length : 0);

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing credentials!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    try {
        const testEmail = `qa_test_${Date.now()}@example.com`;
        console.log(`Attempting to insert email: ${testEmail}`);

        const { data, error } = await supabase
            .from('newsletter_subscriptions')
            .insert([{ email: testEmail, created_at: new Date().toISOString() }])
            .select();

        if (error) {
            console.error('FAILED:', JSON.stringify(error, null, 2));
        } else {
            console.log('SUCCESS! Data inserted:', data);
        }
    } catch (err) {
        console.error('EXCEPTION:', err);
    }
}

testConnection();
