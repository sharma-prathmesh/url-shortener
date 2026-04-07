const express = require('express');
const Url = require('../models/Url');
const Click = require('../models/Click');
const { getGeoFromIP, extractReferrerDomain, getClientIP } = require('../utils/geoLookup');
const { parseUserAgent } = require('../utils/parseUA');

const router = express.Router();

// GET /:shortCode - The main redirect route
router.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;

    // Skip API routes
    if (shortCode.startsWith('api')) {
      return res.status(404).json({ message: 'Not found' });
    }

    const url = await Url.findOne({ shortCode });

    if (!url) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Link Not Found</title>
        <style>
          body { font-family: Inter, sans-serif; background: #0f0f0f; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .box { text-align: center; }
          h1 { font-size: 2rem; color: #3b82f6; }
          p { color: #888; }
          a { color: #3b82f6; text-decoration: none; }
        </style>
        </head>
        <body>
          <div class="box">
            <h1>404 — Link Not Found</h1>
            <p>This short link doesn't exist or may have been deleted.</p>
            <a href="/">← Go Home</a>
          </div>
        </body>
        </html>
      `);
    }

    if (!url.isActive) {
      return res.status(410).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Link Disabled</title>
        <style>
          body { font-family: Inter, sans-serif; background: #0f0f0f; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .box { text-align: center; }
          h1 { font-size: 2rem; color: #f59e0b; }
          p { color: #888; }
        </style>
        </head>
        <body>
          <div class="box">
            <h1>⚠️ Link Disabled</h1>
            <p>This short link has been disabled by its owner.</p>
          </div>
        </body>
        </html>
      `);
    }

    if (url.expiresAt && new Date() > new Date(url.expiresAt)) {
      return res.status(410).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Link Expired</title>
        <style>
          body { font-family: Inter, sans-serif; background: #0f0f0f; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .box { text-align: center; }
          h1 { font-size: 2rem; color: #ef4444; }
          p { color: #888; }
        </style>
        </head>
        <body>
          <div class="box">
            <h1>⏰ Link Expired</h1>
            <p>This short link has expired and is no longer valid.</p>
          </div>
        </body>
        </html>
      `);
    }

    // Perform redirect immediately
    res.redirect(302, url.originalUrl);

    // Log click asynchronously (don't block redirect)
    setImmediate(async () => {
      try {
        const ip = getClientIP(req);
        const userAgent = req.headers['user-agent'] || '';
        const referrer = extractReferrerDomain(req.headers['referer'] || req.headers['referrer'] || '');
        const { device, browser, os } = parseUserAgent(userAgent);

        // Geo lookup (async, non-blocking)
        const { country, city } = await getGeoFromIP(ip);

        await Click.create({
          urlId: url._id,
          shortCode,
          ip,
          country,
          city,
          device,
          browser,
          os,
          referrer,
          userAgent,
        });

        // Increment click counter
        await Url.findByIdAndUpdate(url._id, { $inc: { totalClicks: 1 } });
      } catch (logErr) {
        console.error('Click logging error:', logErr);
      }
    });
  } catch (err) {
    console.error('Redirect error:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
