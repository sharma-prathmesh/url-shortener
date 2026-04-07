# URL Shortener with Analytics

A full-stack URL shortener with real-time analytics dashboard.

## Tech Stack

- **Backend:** Node.js + Express.js + MongoDB (Mongoose)
- **Frontend:** React (Vite) + Tailwind CSS + Recharts
- **Auth:** JWT-based single admin login
- **Analytics:** ipapi.co for geolocation, ua-parser-js for device detection

## Features

- Shorten any URL with auto-generated 6-char code or custom alias
- Track every click: location (country/city), device, browser, OS, referrer
- Analytics dashboard: charts, maps, device breakdown, referrer table
- Link management: enable/disable, expiry dates, delete
- Fully responsive dark UI

## Quick Start

### 1. Setup MongoDB

Create a free cluster at [mongodb.com](https://www.mongodb.com/atlas) and get your connection string.

### 2. Configure Backend

```bash
cd server
cp .env.example .env
# Edit .env with your MONGO_URI and other settings
```

### 3. Install & Run

From the root directory:

```bash
npm install          # Install root deps (concurrently)
cd server && npm install
cd ../client && npm install
cd ..
npm run dev          # Starts both servers concurrently
```

- **Backend:** http://localhost:5000
- **Frontend:** http://localhost:5173

### Default Login

- Email: `admin@example.com`
- Password: `admin123`

(Change these in `server/.env` before deploying!)

## Environment Variables

### Backend (`server/.env`)

```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/urlshortener
JWT_SECRET=your_secret_here
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
BASE_URL=http://localhost:5000
PORT=5000
CLIENT_URL=http://localhost:5173
```

### Frontend (`client/.env`)

```env
VITE_API_URL=http://localhost:5000
VITE_SHORT_URL_BASE=http://localhost:5000
```

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |
| POST | `/api/urls` | Create short URL |
| GET | `/api/urls` | List URLs |
| DELETE | `/api/urls/:code` | Delete URL |
| PATCH | `/api/urls/:code` | Update URL |
| GET | `/api/analytics/:code/overview` | Analytics overview |
| GET | `/api/analytics/:code/clicks` | Clicks over time |
| GET | `/api/analytics/:code/geography` | Clicks by country |
| GET | `/api/analytics/:code/devices` | Device breakdown |
| GET | `/api/analytics/:code/referrers` | Top referrers |
| GET | `/:shortCode` | Redirect (tracks click) |

## Deployment

For production, update `BASE_URL` in `server/.env` and `VITE_API_URL` / `VITE_SHORT_URL_BASE` in `client/.env` to your actual domain.

Build the frontend: `cd client && npm run build`
