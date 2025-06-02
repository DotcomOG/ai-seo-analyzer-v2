// server.js
// Generated on 2025-05-27 18:00 PM ET
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

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'OK' });
});

// Route: /friendly?type=summary&url=...
app.get('/friendly', async (req, res) => {
  const { type, url } = req.query;
  if (type !== 'summary') {
    return res.status(400).json({ error: 'Invalid type; expected "summary".' });
  }
  if (!url) {
    return res.status(400).json({ error: 'Missing "url" parameter.' });
  }

  try {
    // 1. Fetch page HTML
    const pageResp = await axios.get(url);
    const htmlContent = pageResp.data;

    // 2. Check robots.txt and sitemap.xml
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

    // 3. Build groundTruth
    const gt = extractGroundTruth(htmlContent);
    gt.hasRobotsTxt = hasRobotsTxt;
    gt.sitemapExists = hasSitemap;

    // 4. Construct a stringent prompt for exactly 5 superpowers, 10 opportunities, and 4 engines
    const prompt = `
You are an expert AI‐SEO auditor. You receive a groundTruth JSON object extracted from a target page. Use **only** this groundTruth to produce a JSON object with exactly five keys:

1. "score": integer 1–10, reflecting how well this page is optimized for AI search.
2. "ai_superpowers": an array of exactly 5 objects. Each object must have:
   - "title" (string)
   - "explanation" (string, 2–3 lines)  
   These are positive AI‐SEO signals found in groundTruth.

3. "ai_opportunities": an array of exactly 10 objects. Each object must have:
   - "title" (string)
   - "explanation" (string, 2–3 lines)  
   These are missing or suboptimal AI‐SEO signals.

4. "ai_engine_insights": an object with exactly four keys: "ChatGPT", "Gemini", "MS Copilot", and "Perplexity". Each key’s value must be an object with:
   - "score": integer 1–10 (0=very poor, 10=perfect), based on groundTruth
   - "insight": a 2–3 line explanation of the page’s performance on that engine, describing *impact only.*  
     Do **not** offer solutions—only state how the lack/presence of signals affects that engine.

Ensure all fields are backed by groundTruth. **Do not hallucinate** or invent signals. Output must be **pure JSON** with these five keys.

Here is the groundTruth:
\`\`\`json
${JSON.stringify(gt, null, 2)}
\`\`\`

Begin your response now:
`;

    // 5. Call the model
    const llmResp = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a strict JSON‐only AI‐SEO auditor.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2
    });

    const llmText = llmResp.choices[0].message.content.trim();
    let parsed;
    try {
      parsed = JSON.parse(llmText);
    } catch (parseErr) {
      console.error('❌ Failed to parse JSON from LLM:', parseErr, llmText);
      return res.status(500).json({ error: 'Invalid JSON from AI' });
    }

    // 6. Simple validation: ensure score exists
    if (typeof parsed.score !== 'number') {
      console.warn('⚠️ No "score" field or not a number. Returning N/A.');
      parsed.score = null;
    }
    // Optional: you can further validate counts of arrays, etc.

    // 7. Return the JSON
    return res.json(parsed);
  } catch (err) {
    console.error('Error in /friendly:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Contact endpoint (unchanged)
app.post('/contact', (req, res) => {
  console.log('🌟 Contact submission:', req.body);
  res.json({ success: true });
});

// Codex → GitHub (unchanged)
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
