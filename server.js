// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const OpenAI = require('openai');
const path = require('path');

const app = express();

app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self'; img-src * data:;"
  );
  next();
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/health', (_req, res) => {
  res.json({ status: 'OK' });
});

app.get('/friendly', async (req, res) => {
  const { type, url } = req.query;
  if (type !== 'summary') {
    return res.status(400).json({ error: 'Invalid type; expected "summary".' });
  }
  if (!url) {
    return res.status(400).json({ error: 'Missing "url" parameter.' });
  }

  try {
    const pageResp = await axios.get(url);
    const html = pageResp.data;
    const $ = cheerio.load(html);

    const title = $('title').text().slice(0, 300);
    const meta = $('meta[name="description"]').attr('content')?.slice(0, 500) || '';
    const h1 = $('h1').text().slice(0, 300);
    const h2 = $('h2').text().slice(0, 300);
    const h3 = $('h3').text().slice(0, 300);
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 5000); // strict cap

    const summarizedInput = `
TITLE: ${title}

META DESCRIPTION: ${meta}

H1: ${h1}
H2: ${h2}
H3: ${h3}

BODY TEXT:
${bodyText}
    `.trim();

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an expert SEO assistant. Return a JSON object summarizing the AI SEO readiness of this website.' },
        {
          role: 'user',
          content: `Analyze the SEO readiness of the following page and return the result in JSON format with keys: title, description, score (1–10), ai_superpowers (array), ai_opportunities (array), ai_engine_insights (object):\n\n${summarizedInput}`
        }
      ]
    });

    const summary = completion.choices[0].message.content.trim();
    return res.json(JSON.parse(summary));
  } catch (err) {
    console.error('Error in /friendly:', err);
    return res.status(500).json({ error: err.message });
  }
});

app.post('/contact', (req, res) => {
  console.log('Contact submission:', req.body);
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
