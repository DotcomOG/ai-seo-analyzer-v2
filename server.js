// server.js
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const axios   = require('axios');
const { URL } = require('url');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
app.use(cors());
app.use(express.json());  // <-- parse JSON bodies

const PORT = process.env.PORT || 3000;
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'OK' });
});

// Contact form receiver
app.post('/contact', (req, res) => {
  console.log('🌟 Contact submission:', req.body);
  // Later: save to DB or send email here
  res.json({ success: true });
});

// Friendly summary endpoint
function isSafeUrl(str) {
  try {
    const u = new URL(str);
    if (!['http:', 'https:'].includes(u.protocol)) {
      return false;
    }
    const host = u.hostname;
    return !/^localhost$/.test(host) &&
           !/^127\./.test(host) &&
           !/^0\.0\.0\.0$/.test(host) &&
           !/^10\./.test(host) &&
           !/^192\.168\./.test(host) &&
           !/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host);
  } catch (_) {
    return false;
  }
}

app.get('/friendly', async (req, res) => {
  const { type, url } = req.query;
  if (type !== 'summary') {
    return res.status(400).json({ error: 'Invalid type; expected "summary".' });
  }
  if (!url) {
    return res.status(400).json({ error: 'Missing "url" parameter.' });
  }
  if (!isSafeUrl(url)) {
    return res.status(400).json({ error: 'Invalid or unsafe URL.' });
  }

  try {
    const pageResp = await axios.get(url);
    const htmlContent = pageResp.data;

    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an expert SEO assistant. Respond only with valid JSON.' },
        {
          role: 'user',
          content: `Provide a concise, SEO-friendly summary of the following HTML. Reply in JSON with keys: score, ai_superpowers, ai_opportunities, ai_engine_insights.\n\n${htmlContent}`,
        },
      ],
      temperature: 0.7,
    });

    const summary = completion.data.choices[0].message.content.trim();
    return res.json(JSON.parse(summary));
  } catch (err) {
    console.error('Error in /friendly:', err);
    return res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
