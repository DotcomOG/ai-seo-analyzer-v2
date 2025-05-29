# AI SEO Analyzer v2
diff --git a/README.md b/README.md
index 2a048787e73091c20e5c90f301aabcf62634e505..18f575e8b93a9ed1bf082e0110c1d2c3ccf73fc9 100644
--- a/README.md
+++ b/README.md
@@ -1 +1,10 @@
 # AI SEO Analyzer v2
+
+This project provides a simple Express server and static frontend for analyzing web pages with OpenAI. To run locally:
+
+1. Copy `.env.example` to `.env` and fill in your `OPENAI_API_KEY` and `GITHUB_TOKEN`.
+2. Install dependencies with `npm install`.
+3. Start the server using `npm start`.
+4. Visit `http://localhost:3000` in your browser.
+
+The server exposes `/friendly` for performing AI SEO analysis and `/contact` for form submissions.
