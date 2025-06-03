diff --git a/api/full.js b/api/full.js
index d12df4b1710f835e93f549be9205802c623165c5..69660c8ffdb01adf502c9567fd3a2ab685d83da8 100644
--- a/api/full.js
+++ b/api/full.js
@@ -1,30 +1,30 @@
 // api/full.js — Last updated: 2025-06-03 19:55 ET
 
 import axios from 'axios';
 import * as cheerio from 'cheerio';
 import OpenAI from 'openai';
 
 const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
 
 export default async function handler(req, res) {
   const { url } = req.query;
   if (!url) return res.status(400).json({ error: 'URL parameter is required.' });
 
   try {
     const response = await axios.get(url);
     const $ = cheerio.load(response.data);
     const bodyText = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 7000);
 
     const prompt = `
 You are an advanced AI SEO consultant. A user has submitted a webpage for full AI SEO analysis.
 
 Here is the visible content from their site:
 
 "${bodyText}"
 
 Please return a fully detailed JSON object ONLY, using this format:
 {
   "url": "Submitted URL",
   "score": 87,
   "superpowers": ["10 detailed strengths with useful commentary"],
   "opportunities": ["Up to 25 weaknesses, each with an actionable recommendation"],
