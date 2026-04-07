const UAParser = require('ua-parser-js');

/**
 * Parse a User-Agent string and return device, browser, OS info
 */
function parseUserAgent(uaString) {
  if (!uaString) {
    return { device: 'unknown', browser: 'Unknown', os: 'Unknown' };
  }

  try {
    const parser = new UAParser(uaString);
    const result = parser.getResult();

    // Determine device type
    let device = 'desktop';
    if (result.device && result.device.type) {
      const type = result.device.type.toLowerCase();
      if (type === 'mobile') device = 'mobile';
      else if (type === 'tablet') device = 'tablet';
      else device = 'desktop';
    }

    // Get browser name
    const browser = result.browser && result.browser.name
      ? result.browser.name
      : 'Unknown';

    // Get OS name
    const os = result.os && result.os.name
      ? result.os.name
      : 'Unknown';

    return { device, browser, os };
  } catch (err) {
    return { device: 'unknown', browser: 'Unknown', os: 'Unknown' };
  }
}

module.exports = { parseUserAgent };
