import express, { Request, Response } from 'express';
console.log('[donations-service] Starting file execution...');
import cors from 'cors';
import morgan from 'morgan';
import * as dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const PORT = process.env.DONATIONS_SERVICE_PORT || 3002;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
console.log(`[donations-service] Supabase URL: ${supabaseUrl ? 'SET' : 'MISSING'}`);
console.log(`[donations-service] Supabase Key: ${supabaseKey ? 'SET' : 'MISSING'}`);
const supabase = createClient(supabaseUrl, supabaseKey);

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'donations-service' });
});

// Fetch all campaigns, supports ?search= query
app.get('/campaigns', async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const tableName = 'hc_campaigns';
    console.log(`[donations-service] Fetching campaigns from table: ${tableName}`);
    let query = supabase.from(tableName).select('*').order('created_at', { ascending: false });

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    const { data, error } = await query;
    if (error) {
      throw error;
    }

    res.json({ success: true, data });
  } catch (err: any) {
    console.error('[donations-service] Error fetching campaigns:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /donations/fulfill
// Records a completed donation card purchase in Supabase
app.post('/donations/fulfill', async (req: Request, res: Response) => {
  try {
    const { userId, amount, reference, items = [], paymentMethod = 'gcash' } = req.body;
    console.log(`[donations-service] RECEIVED fulfillment for ${userId}: PHP ${amount} (Ref: ${reference})`);

    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'At least one cart item is required' });
    }

    const purchases = items.map((item: any, index: number) => ({
      buyer_auth_id: userId,
      hopecard_id: item.id,
      amount_paid: (Number(item.amount) || 0) * (Number(item.quantity) || 1),
      payment_method: paymentMethod,
      payment_reference: `${reference}-${index + 1}`,
      status: 'paid',
    }));

    console.log(`[donations-service] Attempting insert into hopecard_purchases (${purchases.length} rows)...`);
    const { data, error } = await supabase
      .from('hopecard_purchases')
      .insert(purchases)
      .select();

    if (error) {
      console.error('[donations-service] ERROR in hopecard_purchases:', error.message);
      return res.status(400).json({ success: false, error: error.message });
    }

    console.log('[donations-service] SUCCESS hopecard_purchases');
    res.json({
      success: true,
      message: 'Donation fulfilled and recorded',
      data,
    });
  } catch (err: any) {
    console.error('[donations-service] Fulfillment Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`[donations-service] Server running on port ${PORT}`);
});
