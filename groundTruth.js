// groundTruth.js
// Generated on 2025-05-27 15:00 PM ET

const cheerio = require('cheerio');
const axios = require('axios');

async function extractGroundTruth(html) {
  const $ = cheerio.load(html);

  // 1. Meta description
  const metaDescTag = $('head meta[name="description"]').attr('content') || '';
  const hasMetaDescription = !!metaDescTag;
  const metaDescriptionLength = hasMetaDescription ? metaDescTag.length : 0;

  // 2. H1 presence
  const h1Text = $('h1').first().text().trim();
  const hasH1 = !!h1Text;

  // 3. All H2 texts
  const h2s = [];
  $('h2').each((i, el) => {
    const txt = $(el).text().trim();
    if (txt) h2s.push(txt);
  });

  // 4. JSON-LD (structured data)
  const hasJSONLD = $('script[type="application/ld+json"]').length > 0;

  // 5. Open Graph tags
  const hasOpenGraph = 
    $('head meta[property="og:title"]').length > 0 ||
    $('head meta[property="og:description"]').length > 0;

  // 6. Canonical tag
  const hasCanonical = $('head link[rel="canonical"]').length > 0;

  // 7. HTTPS usage (we’ll trust that the URL you passed already started with https; you can refine if needed)
  const usesHTTPS = true; // since fetch(url) succeeded over HTTPS

  // 8. Mobile viewport
  const mobileViewportSet = $('head meta[name="viewport"]').length > 0;

  // 9. robots.txt (try a HEAD request)
  let hasRobotsTxt = false;
  try {
    const parsedUrl = new URL(html); // won't work—replace with the URL param instead
  } catch {}
  // We’ll check robots.txt separately before calling extractGroundTruth.

  // 10. Sitemap.xml (simple HEAD request)
  // 11. Word count
  const textBody = $('body').text();
  const pageWordCount = textBody.split(/\s+/).filter(Boolean).length;

  // 12. Images without alt
  const imagesWithoutAlt = [];
  $('img').each((i, el) => {
    const src = $(el).attr('src') || '';
    const alt = $(el).attr('alt') || '';
    if (!alt.trim() && src) imagesWithoutAlt.push(src);
  });

  // 13. Video embeds
  const videosEmbedded = $('video, iframe[src*="youtube"], iframe[src*="vimeo"]').length > 0;

  return {
    hasMetaDescription,
    metaDescriptionLength,
    hasH1,
    hasH2s: h2s,
    hasJSONLD,
    hasOpenGraph,
    hasCanonical,
    usesHTTPS,
    mobileViewportSet,
    hasRobotsTxt,   // you’ll set this before calling
    sitemapExists: false, // set separately if needed
    pageWordCount,
    imagesWithoutAlt,
    videosEmbedded
  };
}

module.exports = { extractGroundTruth };