// Generated on 2025-05-27 10:45 AM ET
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { OpenAI } = require('openai');
const { upsertFile } = require('./github');

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.get('/health', (_req, res) => {
  res.json({ status: 'OK' });
});

app.get('/friendly', async (req, res) => {
  const { type, url } = req.query;
  if (type !== 'summary') {
    return res.status(400).json({ error: 'Invalid type' });
  }
  if (!url) {
    return res.status(400).json({ error: 'Missing url' });
  }

  try {
    const page = await axios.get(url);
    const html = page.data;
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Return concise JSON SEO readiness.' },
        { role: 'user', content: html }
      ]
    });
    const text = completion.choices[0].message.content.trim();
    res.json(JSON.parse(text));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/contact', (req, res) => {
  console.log('Contact form submission:', req.body);
  res.json({ success: true });
});

app.post('/codex-push', async (req, res) => {
  const { owner, repo, path, commitMessage, prompt } = req.body;
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }]
    });
    const content = completion.choices[0].message.content;
    await upsertFile({ owner, repo, path, content, message: commitMessage });
    res.json({ success: true, message: 'File updated', path });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
