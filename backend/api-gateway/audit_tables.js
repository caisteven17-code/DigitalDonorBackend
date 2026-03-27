const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.join(__dirname, '../../.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const url = envConfig.NEXT_PUBLIC_SUPABASE_URL || envConfig.SUPABASE_URL;
const key = envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY || envConfig.SUPABASE_SERVICE_ROLE_KEY || envConfig.SUPABASE_ANON_KEY;

async function checkTables() {
  if (!url || !key || url.includes('your_supabase')) {
    console.log("ERROR: Missing or placeholder credentials in .env");
    return;
  }
  
  try {
    // The base REST endpoint for PostgREST provides an OpenAPI spec containing table definitions
    const res = await fetch(`${url}/rest/v1/?apikey=${key}`);
    if (!res.ok) {
        throw new Error(`Failed to fetch schema. Status: ${res.status}`);
    }
    const data = await res.json();
    const tables = Object.keys(data.definitions || {}).filter(k => !k.includes('(')); // Filter out RPCs and complex definitions
    console.log("=== SUPABASE TABLES ===");
    tables.forEach(t => console.log(`- ${t}`));
    console.log("=======================");
  } catch (err) {
    console.log("ERROR fetching Supabase tables:", err.message);
  }
}

checkTables();
