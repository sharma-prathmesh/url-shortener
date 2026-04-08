require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const urlRoutes = require('./routes/urls');
const analyticsRoutes = require('./routes/analytics');
const redirectRouter = require('./routes/redirect');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'http://localhost:5177',
      process.env.CLIENT_URL
    ].filter(Boolean);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Trust proxy for real IPs
app.set('trust proxy', 1);

// Rate limiter for URL creation
const createLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { message: 'Too many requests. Max 10 URL creations per minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/urls/check-alias', urlRoutes); // Must be before /api/urls with protect
app.use('/api/urls', createLimiter, urlRoutes);
app.use('/api/analytics', analyticsRoutes);

// Redirect route (must be last)
app.get('/', (req, res) => {
  res.send('API running 🚀');
});
app.use('/', redirectRouter);

// Connect to MongoDB and start server
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
}

startServer();
