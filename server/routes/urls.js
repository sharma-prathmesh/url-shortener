const express = require('express');
const Url = require('../models/Url');
const { protect } = require('../middleware/auth');
const { generateShortCode, validateAlias } = require('../utils/generateCode');
const { fetchPageTitle } = require('../utils/fetchTitle');

const router = express.Router();

// POST /api/urls - Create short URL
router.post('/', protect, async (req, res) => {
  try {
    const { originalUrl, customAlias, title, expiresAt } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ message: 'Original URL is required' });
    }

    // Validate URL
    try {
      new URL(originalUrl);
    } catch {
      return res.status(400).json({ message: 'Invalid URL format' });
    }

    let shortCode;

    if (customAlias) {
      const validation = validateAlias(customAlias);
      if (!validation.valid) {
        return res.status(400).json({ message: validation.error });
      }

      // Check if alias is taken
      const existing = await Url.findOne({ shortCode: customAlias });
      if (existing) {
        return res.status(409).json({ message: 'This alias is already taken' });
      }
      shortCode = customAlias;
    } else {
      // Generate unique code
      let attempts = 0;
      do {
        shortCode = generateShortCode(6);
        attempts++;
        if (attempts > 10) {
          return res.status(500).json({ message: 'Could not generate unique code' });
        }
      } while (await Url.findOne({ shortCode }));
    }

    // Auto-fetch title if not provided
    let finalTitle = title || '';
    if (!finalTitle) {
      finalTitle = await fetchPageTitle(originalUrl);
    }

    const url = await Url.create({
      shortCode,
      originalUrl,
      customAlias: customAlias || null,
      title: finalTitle,
      expiresAt: expiresAt || null,
      isActive: true,
      totalClicks: 0,
      userId: req.user._id,
    });

    res.status(201).json({
      ...url.toObject(),
      shortUrl: `${process.env.BASE_URL}/${shortCode}`,
    });
  } catch (err) {
    console.error('Create URL error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/urls - List all URLs (paginated)
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    const query = { userId: req.user._id };
    if (search) {
      query.$or = [
        { shortCode: { $regex: search, $options: 'i' } },
        { originalUrl: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
      ];
    }

    const [urls, total] = await Promise.all([
      Url.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Url.countDocuments(query),
    ]);

    const urlsWithShort = urls.map((u) => ({
      ...u.toObject(),
      shortUrl: `${process.env.BASE_URL}/${u.shortCode}`,
    }));

    res.json({
      urls: urlsWithShort,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('List URLs error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/urls/:shortCode - Get single URL with stats
router.get('/:shortCode', protect, async (req, res) => {
  try {
    const url = await Url.findOne({
      shortCode: req.params.shortCode,
      userId: req.user._id,
    });

    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    res.json({
      ...url.toObject(),
      shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/urls/:shortCode - Update (toggle active, edit alias, etc.)
router.patch('/:shortCode', protect, async (req, res) => {
  try {
    const url = await Url.findOne({
      shortCode: req.params.shortCode,
      userId: req.user._id,
    });

    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    const allowedFields = ['isActive', 'title', 'expiresAt'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        url[field] = req.body[field];
      }
    });

    await url.save();

    res.json({
      ...url.toObject(),
      shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/urls/:shortCode
router.delete('/:shortCode', protect, async (req, res) => {
  try {
    const url = await Url.findOneAndDelete({
      shortCode: req.params.shortCode,
      userId: req.user._id,
    });

    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    // Also delete all clicks for this URL
    const Click = require('../models/Click');
    await Click.deleteMany({ shortCode: req.params.shortCode });

    res.json({ message: 'URL deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/urls/check-alias/:alias - Check if alias is available
router.get('/check-alias/:alias', protect, async (req, res) => {
  try {
    const existing = await Url.findOne({ shortCode: req.params.alias });
    res.json({ available: !existing });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
