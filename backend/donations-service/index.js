const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config({ path: '../../.env' }); // Load root .env

const app = express();
const PORT = process.env.DONATIONS_SERVICE_PORT || 3002;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'donations-service' });
});

// Fetch all campaigns, supports ?search= query
app.get('/campaigns', async (req, res) => {
  try {
    const { search } = req.query;
    let query = supabase.from('hc_campaigns').select('*').order('created_at', { ascending: false });
    
    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    res.json({ success: true, data });
  } catch (err) {
    console.error('[donations-service] Error fetching campaigns:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`[donations-service] Server running on port ${PORT}`);
});
