const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config({ path: '../../.env' }); // Load root .env

const app = express();
const PORT = process.env.NOTIFICATIONS_SERVICE_PORT || 3003;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'notifications-service' });
});

app.listen(PORT, () => {
  console.log(`[notifications-service] Server running on port ${PORT}`);
});
