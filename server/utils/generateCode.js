const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/**
 * Generate a random alphanumeric short code of given length
 */
function generateShortCode(length = 6) {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return result;
}

/**
 * Validate custom alias: 3-20 chars, alphanumeric + hyphens only
 */
function validateAlias(alias) {
  if (!alias) return { valid: false, error: 'Alias is required' };
  if (alias.length < 3) return { valid: false, error: 'Alias must be at least 3 characters' };
  if (alias.length > 20) return { valid: false, error: 'Alias must be at most 20 characters' };
  if (!/^[a-zA-Z0-9-]+$/.test(alias)) {
    return { valid: false, error: 'Alias can only contain letters, numbers, and hyphens' };
  }
  return { valid: true };
}

module.exports = { generateShortCode, validateAlias };
