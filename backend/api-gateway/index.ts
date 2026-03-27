import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const PORT = process.env.API_GATEWAY_PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// REQUEST LOGGER
app.use((req, res, next) => {
  console.log(`[api-gateway] ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'api-gateway' });
});

// Internal Microservice base URLs
const DONATIONS_URL = 'http://localhost:3002';
const USERS_URL     = 'http://localhost:3001';
const PAYMENT_URL   = 'http://localhost:3004';

// Proxy helper - using originalUrl to preserve prefixes like /users or /payment
const proxyRequest = async (req: Request, res: Response, targetBase: string) => {
  const targetUrl = targetBase + req.originalUrl;
  console.log(`[api-gateway] Proxying ${req.method} ${req.originalUrl} -> ${targetUrl}`);
  
  try {
    const opts: any = {
      method: req.method,
      headers: { 
        'Content-Type': 'application/json',
        'bypass-tunnel-reminder': 'true'
      },
    };
    
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      opts.body = JSON.stringify(req.body);
    }

    const upstream = await fetch(targetUrl, opts);
    const text = await upstream.text();
    try {
      const data = JSON.parse(text);
      return res.status(upstream.status).json(data);
    } catch (e) {
      console.log(`[api-gateway] Upstream response for ${req.originalUrl} was not JSON.`);
      return res.status(upstream.status).send(text);
    }
  } catch (err: any) {
    console.error('[api-gateway] Proxy failed:', err.message);
    return res.status(502).json({ success: false, error: err.message });
  }
};

// Use wildcard use() to handle subpaths correctly
app.use('/campaigns', (req, res) => proxyRequest(req, res, DONATIONS_URL));
app.use('/donations', (req, res) => proxyRequest(req, res, DONATIONS_URL));
app.use('/payment', (req, res) => proxyRequest(req, res, PAYMENT_URL));
app.use('/users', (req, res) => proxyRequest(req, res, USERS_URL));
app.use('/cart', (req, res) => proxyRequest(req, res, USERS_URL));

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`[api-gateway] Running on port ${PORT}`);
});
