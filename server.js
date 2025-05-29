// 2025-05-28 15:55 ET
try {
  require("dotenv").config();
} catch (e) {
  console.warn("dotenv not installed, skipping .env load");
}

const express = require("express");
const OpenAI = require("openai");

// Initialize OpenAI with API key from environment
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Contact form submissions endpoint
app.post("/contact", (req, res) => {
  console.log("Contact submission:", req.body);
  res.status(200).json({ status: "received" });
});

// AI SEO analysis endpoint
app.get("/friendly", async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: "Missing URL parameter" });
  }
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an AI SEO analyzer that provides actionable insights." },
        { role: "user", content: `Analyze the following URL for AI SEO: ${url}` },
      ],
    });
    res.json({ analysis: completion.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.toString() });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});