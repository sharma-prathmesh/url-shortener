const axios = require('axios');

/**
 * Auto-fetch page title from a URL using meta tags / Open Graph
 */
async function fetchPageTitle(url) {
  try {
    const response = await axios.get(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; URLShortener/1.0)',
      },
      maxRedirects: 3,
    });

    const html = response.data;
    if (typeof html !== 'string') return '';

    // Try og:title first
    const ogMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    if (ogMatch) return ogMatch[1].trim().slice(0, 100);

    // Try <title> tag
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) return titleMatch[1].trim().slice(0, 100);

    return '';
  } catch {
    return '';
  }
}

module.exports = { fetchPageTitle };
