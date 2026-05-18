const crypto = require('crypto');

const hashString = (value) => {
  if (value === null || value === undefined) return null;
  return crypto
    .createHash('sha256')
    .update(String(value))
    .digest('hex');
};

module.exports = { hashString };
