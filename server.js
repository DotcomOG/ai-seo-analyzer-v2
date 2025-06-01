// server.js
// Generated on 2025-05-27 15:15 PM ET
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const axios   = require('axios');
const OpenAI  = require('openai');
const { extractGroundTruth } = require('./groundTruth');
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

// Validate LLM claims against groundTruth
function validateLLMClaims(groundTruth, aiSuperpowers, aiOpportunities) {
  const errors = [];

  // Example: HTTPS superpower must match groundTruth.usesHTTPS
  if (aiSuperpowers.some(sp => sp.title === "Secure HTTPS") && !groundTruth.usesHTTPS) {
    errors.push("Claimed Secure HTTPS, but page did not load over HTTPS.");
  }
  if (aiOpportunities.some(op => op.title === "Missing Meta Description") && groundTruth.hasMetaDescription) {
    errors.push("Claimed Missing Meta Description, but meta description exists.");
  }
  // Check H1 superpower/opportunity
  aiSuperpowers.forEach(sp => {
    if (/h1/i.test(sp.title) && !groundTruth.hasH1) {
      errors.push(`Claimed H1 exists (“${sp.title}”), but groundTruth.hasH1 is false.`);
    }
  });
  aiOpportunities.forEach(op => {
    if (/no structured data/i.test(op.title) && groundTruth.hasJSONLD) {
      errors.push("Claimed No Structured Data, but JSON-LD is present.");
    }
  });

  // (Add more checks as needed for each field in groundTruth)
  return errors;
}

app.get('/friendly', async (req, res) => {
  const { type, url } = req.query;
  if (type !== 'summary') {
    return res.status(400).json({ error: 'Invalid type: must be "summary".' });
  }
  if (!url) {
    return res.status(400).json({ error: 'Missing "url" parameter.' });
  }

  try {
    // 1. Fetch page HTML
    const pageResp = await axios.get(url);
    const htmlContent = pageResp.data;

    // 2. Build groundTruth from HTML + robots.txt / sitemap checks
    //    Check robots.txt:
    let hasRobots = false;
    try {
      await axios.head(`${new URL(url).origin}/robots.txt`);
      hasRobots = true;
    } catch {}
    //    Check sitemap.xml:
    let hasSitemap = false;
    try {
      await axios.head(`${new URL(url).origin}/sitemap.xml`);
      hasSitemap = true;
    } catch {}
    //    Extract groundTruth:
    const gt = await extractGroundTruth(htmlContent);
    gt.hasRobotsTxt = hasRobots;
    gt.sitemapExists = hasSitemap;

    // 3. Construct a tightly defined prompt using groundTruth
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

    // 4. Call the LLM
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

    // 5. Validate LLM output
    const superpowers = parsed.ai_superpowers || [];
    const opportunities = parsed.ai_opportunities || [];
    const validationErrors = validateLLMClaims(gt, superpowers, opportunities);

    // 6. If any validationErrors exist, optionally filter or tag them
    if (validationErrors.length) {
      // For now, just log and remove any conflicting items
      console.warn('🔍 Hallucination errors detected:', validationErrors);
      // Example: filter out any superpower/opportunity that didn’t match groundTruth
      // (implement filtering logic here based on your preference)
    }

    // 7. Return the (validated) JSON
    return res.json(parsed);
  } catch (err) {
    console.error('Error in /friendly:', err);
    return res.status(500).json({ error: err.message });
  }
});

// … (rest of server.js remains unchanged) …

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
