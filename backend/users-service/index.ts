import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import * as dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const PORT = process.env.USERS_SERVICE_PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// In-memory fallback for "Guest" cart if database table is not ready
let guestCart: any[] = [];

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'users-service' });
});

// GET /users/:userId/cart
app.get('/users/:userId/cart', async (req: Request, res: Response) => {
  const { userId } = req.params;
  
  if (userId === 'guest') {
    return res.json({ success: true, data: guestCart });
  }

  try {
    const { data, error } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /users/:userId/cart
app.post('/users/:userId/cart', async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { item } = req.body;

  if (userId === 'guest') {
    guestCart.push(item);
    return res.json({ success: true, data: guestCart });
  }

  try {
    const { data, error } = await supabase
      .from('cart_items')
      .insert([{ ...item, user_id: userId }]);
    
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /users/:userId/cart/:itemId
app.delete('/users/:userId/cart/:itemId', async (req: Request, res: Response) => {
  const { userId, itemId } = req.params;
  console.log(`[users-service] Removing item ${itemId} from cart for ${userId}`);

  if (userId === 'guest') {
    guestCart = guestCart.filter(i => i.id !== itemId && i.cartId !== Number(itemId));
    return res.json({ success: true, data: guestCart });
  }

  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)
      .eq('id', itemId);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/users/:userId/cart/clear', async (req: Request, res: Response) => {
  const { userId } = req.params;
  console.log(`[users-service] Clearing cart for ${userId}`);

  if (userId === 'guest') {
    guestCart = [];
    return res.json({ success: true });
  }

  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`[users-service] Server running on port ${PORT}`);
});
