diff --git a/api/friendly.js b/api/friendly.js
index 7f1d13eddbc9f70809e856c12de92dd21d6db04b..207810b8f07f744289219319a660a709e32a6c4d 100644
--- a/api/friendly.js
+++ b/api/friendly.js
@@ -1,30 +1,30 @@
 // api/friendly.js — DEBUG version
 
 import axios from 'axios';
 import * as cheerio from 'cheerio';
-import { OpenAI } from 'openai';
+import OpenAI from 'openai';
 
 const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
 
 export default async function handler(req, res) {
   const { url } = req.query;
   if (!url) return res.status(400).json({ error: 'URL parameter is required.' });
 
   try {
     const response = await axios.get(url);
     const $ = cheerio.load(response.data);
     const bodyText = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 5000);
 
     const prompt = `
 You are an AI SEO analyst. A user has submitted the following webpage content:
 
 "${bodyText}"
 
 Return a JSON object in this format:
 {
   "url": "Submitted URL",
   "score": 82,
   "superpowers": [...],
   "opportunities": [...],
   "insights": [...]
 }
