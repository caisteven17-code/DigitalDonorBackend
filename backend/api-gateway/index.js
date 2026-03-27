const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config({ path: '../../.env' });

const app = express();
const PORT = process.env.API_GATEWAY_PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-gateway' });
});

// Internal Microservice base URLs
const DONATIONS_URL = 'http://localhost:3002';
const USERS_URL     = 'http://localhost:3001';
const PAYMENT_URL   = 'http://localhost:3004';

// Proxy helper using Node.js built-in fetch (Node 18+)
async function proxyRequest(req, res, targetBase) {
  const targetUrl = targetBase + req.originalUrl;
  console.log(`[api-gateway] Proxying ${req.method} ${req.originalUrl} -> ${targetUrl}`);
  try {
    const opts = {
      method: req.method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (req.body && Object.keys(req.body).length > 0) {
      opts.body = JSON.stringify(req.body);
    }
    const upstream = await fetch(targetUrl, opts);
    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (err) {
    console.error('[api-gateway] Proxy failed:', err.message);
    return res.status(502).json({ success: false, error: err.message });
  }
}

// Campaigns -> donations-service (port 3002)
app.get('/campaigns', (req, res) => proxyRequest(req, res, DONATIONS_URL));

// Payment -> payment-service (port 3004)
app.post('/payment/checkout', (req, res) => proxyRequest(req, res, PAYMENT_URL));

// Users -> users-service (port 3001)
app.all('/users', (req, res) => proxyRequest(req, res, USERS_URL));

app.listen(PORT, () => {
  console.log('[api-gateway] Running on port ' + PORT);
  console.log('  /campaigns  -> ' + DONATIONS_URL);
  console.log('  /payment/*  -> ' + PAYMENT_URL);
  console.log('  /users/*    -> ' + USERS_URL);
});
