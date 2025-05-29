diff --git a/github.js b/github.js
index 2c613df082ffdd3d5a91af2772c298c0f30fbe22..cf5fdab305b0c77f73529e9693322383457eefc7 100644
--- a/github.js
+++ b/github.js
@@ -1,32 +1,32 @@
 // Generated on 2025-05-27 10:45 AM ET
 require('dotenv').config();
 const express = require('express');
 const cors = require('cors');
 const axios = require('axios');
 const { OpenAI } = require('openai');
-const { upsertFile } = require('./github');
+const { upsertFile } = require('./github-util');
 
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
