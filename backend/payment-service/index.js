const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config({ path: '../../.env' }); // Load root .env

const app = express();
const PORT = process.env.PAYMENT_SERVICE_PORT || 3004;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'payment-service' });
});

// POST /checkout 
// Generates a secure Paymongo Checkout Link and sends it to the Frontend
app.post('/checkout', async (req, res) => {
  try {
    const { items, total_amount } = req.body;
    
    // Paymongo expects amounts strictly in centavos (e.g. Php 100.00 = 10000)
    const amountInCentavos = Math.round((Number(total_amount) || 0) * 100);

    if (amountInCentavos < 5000) {
      throw new Error("Minimum amount for Paymongo Link is 50.00 PHP");
    }

    const secretKey = process.env.PAYMONGO_SECRET_KEY;
    if (!secretKey) {
      console.warn("WARNING: PAYMONGO_SECRET_KEY missing from .env. Using fallback behavior.");
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
            remarks: 'Digital Donor Checkout' 
          }
        }
      })
    };

    // The Paymongo Links API generates a dynamic, hosted checkout page for immediate payment
    const response = await fetch('https://api.paymongo.com/v1/links', options);
    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0].detail);
    }

    // We successfully generated a secure URL! Send it back to React Native.
    res.json({ success: true, url: result.data.attributes.checkout_url, reference_id: result.data.attributes.reference_number });
  } catch (err) {
    console.error('[payment-service] Checkout Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`[payment-service] Server running on port ${PORT}`);
});
