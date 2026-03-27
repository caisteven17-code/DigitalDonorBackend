import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const PORT = process.env.NOTIFICATIONS_SERVICE_PORT || 3003;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'notifications-service' });
});

app.listen(PORT, () => {
  console.log(`[notifications-service] Server running on port ${PORT}`);
});
