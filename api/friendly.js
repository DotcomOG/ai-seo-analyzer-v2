// api/full.js — Last updated: 2025-06-02 19:30 ET

import axios from 'axios';
import * as cheerio from 'cheerio';
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL parameter is required.' });

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 5000);

    const prompt = `
You are an AI SEO consultant. Analyze this webpage text for full AI SEO optimization potential.

"${bodyText}"

Return a full JSON object with:
{
  "url": "Submitted URL",
  "score": 87,
  "superpowers": [10 detailed strengths],
  "opportunities": [Up to 25 detailed issues with fixes],
  "insights": {
    "gemini": [...],
    "chatgpt": [...],
    "copilot": [...],
    "perplexity": [...]
  }
}
Only return valid JSON.
    `;

    const chat = await openai.chat.completions.create({
      model: 'gpt-4',
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = chat.choices[0].message.content;
    const parsed = JSON.parse(raw);
    parsed.url = url;

    const insightsArray = [
      ...(parsed.insights?.gemini || []),
      ...(parsed.insights?.chatgpt || []),
      ...(parsed.insights?.copilot || []),
      ...(parsed.insights?.perplexity || []),
    ];

    parsed.insights = insightsArray;

    res.status(200).json(parsed);
  } catch (err) {
    console.error('Error in /api/full:', err);
    res.status(500).json({ error: 'Failed to analyze full report.', detail: err.message });
  }
}
