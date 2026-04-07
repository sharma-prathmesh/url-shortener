const express = require('express');
const Click = require('../models/Click');
const Url = require('../models/Url');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Helper: get date range
function getDateRange(period) {
  const now = new Date();
  const start = new Date();
  if (period === '7d') start.setDate(now.getDate() - 7);
  else if (period === '30d') start.setDate(now.getDate() - 30);
  else start.setFullYear(2000); // all time
  return start;
}

// GET /api/analytics/:shortCode/overview
router.get('/:shortCode/overview', protect, async (req, res) => {
  try {
    const url = await Url.findOne({ shortCode: req.params.shortCode, userId: req.user._id });
    if (!url) return res.status(404).json({ message: 'URL not found' });

    const clicks = await Click.find({ shortCode: req.params.shortCode });

    // Unique IPs
    const uniqueIPs = new Set(clicks.map((c) => c.ip).filter(Boolean)).size;

    // Top country
    const countryCounts = {};
    clicks.forEach((c) => {
      if (c.country && c.country !== 'Unknown') {
        countryCounts[c.country] = (countryCounts[c.country] || 0) + 1;
      }
    });
    const topCountry = Object.entries(countryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    // Top device
    const deviceCounts = {};
    clicks.forEach((c) => {
      if (c.device) deviceCounts[c.device] = (deviceCounts[c.device] || 0) + 1;
    });
    const topDevice = Object.entries(deviceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    // Clicks today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const clicksToday = clicks.filter((c) => new Date(c.timestamp) >= todayStart).length;

    res.json({
      totalClicks: url.totalClicks,
      uniqueIPs,
      topCountry,
      topDevice,
      clicksToday,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/analytics/:shortCode/clicks?period=7d|30d|all
router.get('/:shortCode/clicks', protect, async (req, res) => {
  try {
    const url = await Url.findOne({ shortCode: req.params.shortCode, userId: req.user._id });
    if (!url) return res.status(404).json({ message: 'URL not found' });

    const period = req.query.period || '30d';
    const country = req.query.country || null;
    const startDate = getDateRange(period);

    const matchQuery = {
      shortCode: req.params.shortCode,
      timestamp: { $gte: startDate },
    };
    if (country) matchQuery.country = country;

    const clicks = await Click.find(matchQuery).sort({ timestamp: 1 });

    // Group by day
    const grouped = {};
    clicks.forEach((c) => {
      const day = new Date(c.timestamp).toISOString().split('T')[0];
      grouped[day] = (grouped[day] || 0) + 1;
    });

    // Fill in missing days
    const result = [];
    const current = new Date(startDate);
    const end = new Date();
    while (current <= end) {
      const day = current.toISOString().split('T')[0];
      result.push({ date: day, clicks: grouped[day] || 0 });
      current.setDate(current.getDate() + 1);
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/analytics/:shortCode/geography
router.get('/:shortCode/geography', protect, async (req, res) => {
  try {
    const url = await Url.findOne({ shortCode: req.params.shortCode, userId: req.user._id });
    if (!url) return res.status(404).json({ message: 'URL not found' });

    const clicks = await Click.find({ shortCode: req.params.shortCode });

    const countryCounts = {};
    clicks.forEach((c) => {
      const country = c.country || 'Unknown';
      countryCounts[country] = (countryCounts[country] || 0) + 1;
    });

    const total = clicks.length || 1;
    const result = Object.entries(countryCounts)
      .map(([country, count]) => ({
        country,
        clicks: count,
        percentage: parseFloat(((count / total) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/analytics/:shortCode/devices
router.get('/:shortCode/devices', protect, async (req, res) => {
  try {
    const url = await Url.findOne({ shortCode: req.params.shortCode, userId: req.user._id });
    if (!url) return res.status(404).json({ message: 'URL not found' });

    const clicks = await Click.find({ shortCode: req.params.shortCode });
    const total = clicks.length || 1;

    // Device breakdown
    const deviceCounts = {};
    const browserCounts = {};
    const osCounts = {};

    clicks.forEach((c) => {
      deviceCounts[c.device || 'unknown'] = (deviceCounts[c.device || 'unknown'] || 0) + 1;
      browserCounts[c.browser || 'Unknown'] = (browserCounts[c.browser || 'Unknown'] || 0) + 1;
      osCounts[c.os || 'Unknown'] = (osCounts[c.os || 'Unknown'] || 0) + 1;
    });

    const toArray = (obj) =>
      Object.entries(obj)
        .map(([name, count]) => ({
          name,
          clicks: count,
          percentage: parseFloat(((count / total) * 100).toFixed(1)),
        }))
        .sort((a, b) => b.clicks - a.clicks);

    res.json({
      devices: toArray(deviceCounts),
      browsers: toArray(browserCounts).slice(0, 8),
      os: toArray(osCounts).slice(0, 8),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/analytics/:shortCode/referrers
router.get('/:shortCode/referrers', protect, async (req, res) => {
  try {
    const url = await Url.findOne({ shortCode: req.params.shortCode, userId: req.user._id });
    if (!url) return res.status(404).json({ message: 'URL not found' });

    const clicks = await Click.find({ shortCode: req.params.shortCode });
    const total = clicks.length || 1;

    const referrerCounts = {};
    clicks.forEach((c) => {
      const ref = c.referrer || 'Direct';
      referrerCounts[ref] = (referrerCounts[ref] || 0) + 1;
    });

    const result = Object.entries(referrerCounts)
      .map(([domain, count]) => ({
        domain,
        clicks: count,
        percentage: parseFloat(((count / total) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/analytics/dashboard/summary - Overall dashboard stats
router.get('/dashboard/summary', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const [totalLinks, activeLinks, allUrls] = await Promise.all([
      Url.countDocuments({ userId }),
      Url.countDocuments({ userId, isActive: true }),
      Url.find({ userId }, { totalClicks: 1, shortCode: 1, createdAt: 1 }),
    ]);

    const totalClicks = allUrls.reduce((sum, u) => sum + (u.totalClicks || 0), 0);

    // Clicks today (from Click collection)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const shortCodes = allUrls.map((u) => u.shortCode);
    const clicksToday = await Click.countDocuments({
      shortCode: { $in: shortCodes },
      timestamp: { $gte: todayStart },
    });

    // Last 30 days clicks for chart
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentClicks = await Click.find({
      shortCode: { $in: shortCodes },
      timestamp: { $gte: thirtyDaysAgo },
    }).select('timestamp');

    const grouped = {};
    recentClicks.forEach((c) => {
      const day = new Date(c.timestamp).toISOString().split('T')[0];
      grouped[day] = (grouped[day] || 0) + 1;
    });

    const clicksChart = [];
    const cur = new Date(thirtyDaysAgo);
    while (cur <= new Date()) {
      const day = cur.toISOString().split('T')[0];
      clicksChart.push({ date: day, clicks: grouped[day] || 0 });
      cur.setDate(cur.getDate() + 1);
    }

    res.json({
      totalLinks,
      activeLinks,
      totalClicks,
      clicksToday,
      clicksChart,
    });
  } catch (err) {
    console.error('Dashboard summary error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
