// server.js
// Generated on 2025-05-27 16:00 PM ET
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const axios   = require('axios');
const OpenAI  = require('openai');
const { extractGroundTruth } = require('./groundTruth');
const { upsertFile } = require('./github');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
    const htmlContent = pageResp.data;

    let hasRobotsTxt = false;
    try {
      await axios.head(`${new URL(url).origin}/robots.txt`);
      hasRobotsTxt = true;
    } catch {}

    let hasSitemap = false;
    try {
      await axios.head(`${new URL(url).origin}/sitemap.xml`);
      hasSitemap = true;
    } catch {}

    const gt = extractGroundTruth(htmlContent);
    gt.hasRobotsTxt = hasRobotsTxt;
    gt.sitemapExists = hasSitemap;

    const prompt = `
You are an expert SEO assistant. Below is the groundTruth object extracted from the HTML of a webpage. Use ONLY this groundTruth to create JSON with three keys: "ai_superpowers", "ai_opportunities", and "ai_engine_insights".
groundTruth = ${JSON.stringify(gt)}

REQUIREMENTS:
1. "ai_superpowers" must list every positive SEO signal in groundTruth (e.g., if usesHTTPS is true, add { "title": "Secure HTTPS", "explanation": "Your site uses HTTPS, which improves trust." }).
2. "ai_opportunities" must list every missing item (e.g., if hasMetaDescription is false, add { "title": "Missing Meta Description", "explanation": "No meta description found. Add one." }).
3. "ai_engine_insights" must have two required engines: "ChatGPT" and "Gemini". For each, set "score" (0–10) based on how many groundTruth fields are present (e.g., +2 points each for hasH1, hasMetaDescription, usesHTTPS, hasOpenGraph; max 10). Under "insight", write one‐sentence commentary referencing exactly the groundTruth fields (e.g., "Recognizes your SSL and meta description but detects no structured data.").
4. DO NOT hallucinate. If groundTruth has a field false, you cannot report it as present. Output must be pure JSON with no extra text.
5. Return the entire JSON object.

Begin response now:
`;

    const llmResp = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a JSON‐focused SEO assistant.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2
    });
    const llmText = llmResp.choices[0].message.content.trim();
    const parsed = JSON.parse(llmText);

    const aiSuperpowers   = parsed.ai_superpowers || [];
    const aiOpportunities = parsed.ai_opportunities || [];
    const validationErrors = [];

    if (aiSuperpowers.some(sp => sp.title === "Secure HTTPS") && !gt.usesHTTPS) {
      validationErrors.push("Claimed Secure HTTPS, but page did not load over HTTPS.");
    }
    if (aiOpportunities.some(op => op.title === "Missing Meta Description") && gt.hasMetaDescription) {
      validationErrors.push("Claimed Missing Meta Description, but meta description exists.");
    }
    aiSuperpowers.forEach(sp => {
      if (/h1/i.test(sp.title) && !gt.hasH1) {
        validationErrors.push(`Claimed H1 exists (“${sp.title}”), but groundTruth.hasH1 is false.`);
      }
    });
    aiOpportunities.forEach(op => {
      if (/no structured data/i.test(op.title) && gt.hasJSONLD) {
        validationErrors.push("Claimed No Structured Data, but JSON-LD is present.");
      }
    });

    if (validationErrors.length) {
      console.warn('🔍 Hallucination errors detected:', validationErrors);
    }

    return res.json(parsed);
  } catch (err) {
    console.error('Error in /friendly:', err);
    return res.status(500).json({ error: err.message });
  }
});

app.post('/contact', (req, res) => {
  console.log('🌟 Contact submission:', req.body);
  res.json({ success: true });
});

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

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
