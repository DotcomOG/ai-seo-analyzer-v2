import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import friendlyHandler from './api/friendly.js';
import fullHandler from './api/full.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

// Serve /full-report with query parameters without returning 404
app.get('/full-report', (_req, res) => {
  res.sendFile(path.join(publicDir, 'full-report.html'));
});

app.get('/health', (_req, res) => {
  res.json({ status: 'OK' });
});

app.get('/api/friendly', (req, res) => friendlyHandler(req, res));
app.get('/api/full', (req, res) => fullHandler(req, res));

app.post('/contact', (req, res) => {
  console.log('Contact submission:', req.body);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
