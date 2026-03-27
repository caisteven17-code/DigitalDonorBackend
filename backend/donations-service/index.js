const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config({ path: '../../.env' }); // Load root .env

const app = express();
const PORT = process.env.DONATIONS_SERVICE_PORT || 3002;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'donations-service' });
});

app.listen(PORT, () => {
  console.log(`[donations-service] Server running on port ${PORT}`);
});
