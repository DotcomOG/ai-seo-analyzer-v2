// server.js
// Generated on 2025-05-27 13:00 PM ET
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const axios   = require('axios');
const OpenAI  = require('openai');
const { upsertFile } = require('./github');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'OK' });
});

// AI-friendly summary
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
    const htmlContent = pageResp.data;
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an expert SEO assistant.' },
        {
          role: 'user',
          content: `Please provide a concise, SEO-friendly summary of the following HTML:\n\n${htmlContent}`
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

// Contact form receiver
app.post('/contact', (req, res) => {
  console.log('🌟 Contact submission:', req.body);
  res.json({ success: true });
});

// Codex → GitHub integration
app.post('/codex-push', async (req, res) => {
  const { owner, repo, path, commitMessage, prompt } = req.body;
  if (!owner || !repo || !path || !commitMessage || !prompt) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  try {
    const aiResp = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a code assistant.' },
        { role: 'user', content: prompt }
      ]
    });
    const code = aiResp.choices[0].message.content;
    await upsertFile({ owner, repo, path, content: code, message: commitMessage });
    res.json({ success: true, message: 'File created/updated on GitHub.', path });
  } catch (err) {
    console.error('Error in /codex-push:', err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});