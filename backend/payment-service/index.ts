import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PAYMENT_SERVICE_PORT || 3004;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'payment-service' });
});

// POST /checkout 
// Generates a secure Paymongo Checkout Link and sends it to the Frontend
app.post('/checkout', async (req: Request, res: Response) => {
  try {
    const { items, total_amount, guest_id = 'guest_user' } = req.body;
    
    // Paymongo expects amounts strictly in centavos (e.g. Php 100.00 = 10000)
    const amountInCentavos = Math.round((Number(total_amount) || 0) * 100);

    if (amountInCentavos < 5000) {
      throw new Error("Minimum amount for Paymongo Link is 50.00 PHP");
    }

    const secretKey = process.env.PAYMONGO_SECRET_KEY;
    if (!secretKey) {
      throw new Error("PAYMONGO_SECRET_KEY missing from .env");
    }
    
    // Convert secret key to base64 for Basic Auth as required by Paymongo
    const authHeader = 'Basic ' + Buffer.from(`${secretKey}:`).toString('base64');

    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: authHeader
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: amountInCentavos,
            description: 'Hopecard Donation',
            remarks: JSON.stringify({ guest_id, item_count: items.length }) 
          }
        }
      })
    };

    const response = await fetch('https://api.paymongo.com/v1/links', options);
    const result: any = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0].detail);
    }

    res.json({ 
      success: true, 
      url: result.data.attributes.checkout_url, 
      reference_id: result.data.attributes.reference_number 
    });
  } catch (err: any) {
    console.error('[payment-service] Checkout Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /webhook
// Listen for successful payments from Paymongo
app.post('/webhook', async (req: Request, res: Response) => {
  try {
    const { data } = req.body;
    const eventType = data.attributes.type;
    
    console.log(`[payment-service] Received Webhook Event: ${eventType}`);

    if (eventType === 'link.payment_success') {
      const paymentData = data.attributes.data.attributes;
      const remarks = JSON.parse(paymentData.remarks || '{}');
      const { guest_id } = remarks;
      const amountPaid = paymentData.amount / 100;

      console.log(`[payment-service] Payment Success for ${guest_id}: ₱${amountPaid}`);

      // 1. Notify donations-service to fulfill the order
      // 2. Notify users-service to clear the guest cart
      
      // For now, we'll log it. In the next step, we'll hit the internal endpoints.
      await fetch('http://localhost:3002/donations/fulfill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: guest_id,
          amount: amountPaid,
          reference: paymentData.reference_number
        })
      });

      await fetch(`http://localhost:3001/users/${guest_id}/cart/clear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    }

    res.json({ received: true });
  } catch (err: any) {
    console.error('[payment-service] Webhook Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`[payment-service] Server running on port ${PORT}`);
});
