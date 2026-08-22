import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Read .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
let supabaseUrl = '';
let supabaseKey = '';

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = trimmed.replace('NEXT_PUBLIC_SUPABASE_URL=', '').trim();
    }
    if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      supabaseKey = trimmed.replace('NEXT_PUBLIC_SUPABASE_ANON_KEY=', '').trim();
    }
  }
}

console.log('--- SUPABASE CONNECTION DIAGNOSTIC ---');
console.log('Project URL:', supabaseUrl || '(not configured)');
console.log('Anon Key:', supabaseKey ? (supabaseKey.slice(0, 10) + '...' + supabaseKey.slice(-5)) : '(not configured)');

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project-id') || supabaseKey.includes('your-anon-key')) {
  console.log('\n[STATUS]: 🟡 NOT CONNECTED');
  console.log('[REASON]: .env.local still contains placeholder keys (https://your-project-id.supabase.co).');
  console.log('[ACTION]: Replace the placeholder values in .env.local with your real Supabase Project URL and anon key.');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    const { data, error } = await supabase.from('expenses').select('id').limit(1);
    if (error) {
      console.log('\n[STATUS]: 🔴 CONNECTION FAILED');
      console.log('[ERROR MESSAGE]:', error.message);
      if (error.code === '42P01') {
        console.log('[CAUSE]: Table "expenses" does not exist yet. Please run supabase_schema.sql in Supabase SQL Editor.');
      }
    } else {
      console.log('\n[STATUS]: 🟢 CONNECTED SUCCESSFULLY!');
      console.log('Supabase Postgres database is connected and "expenses" table is reachable.');
    }
  } catch (err) {
    console.log('\n[STATUS]: 🔴 NETWORK ERROR');
    console.error(err);
  }
}

testConnection();
