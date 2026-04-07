const axios = require('axios');

/**
 * Get geolocation data from an IP address using ipapi.co (free tier)
 * Returns { country, city } or defaults on failure
 */
async function getGeoFromIP(ip) {
  // Skip for localhost/private IPs
  if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return { country: 'Local', city: 'Local' };
  }

  try {
    const response = await axios.get(`https://ipapi.co/${ip}/json/`, {
      timeout: 3000,
      headers: { 'User-Agent': 'URL-Shortener/1.0' },
    });

    if (response.data && !response.data.error) {
      return {
        country: response.data.country_name || 'Unknown',
        city: response.data.city || 'Unknown',
      };
    }
    return { country: 'Unknown', city: 'Unknown' };
  } catch (err) {
    // Don't let geo lookup failures break the redirect
    return { country: 'Unknown', city: 'Unknown' };
  }
}

/**
 * Extract referrer domain from referrer header
 */
function extractReferrerDomain(referrer) {
  if (!referrer || referrer === '') return 'Direct';
  try {
    const url = new URL(referrer);
    return url.hostname.replace('www.', '') || 'Direct';
  } catch {
    return 'Direct';
  }
}

/**
 * Get real IP from request (handles proxies)
 */
function getClientIP(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || req.ip || '127.0.0.1';
}

module.exports = { getGeoFromIP, extractReferrerDomain, getClientIP };
