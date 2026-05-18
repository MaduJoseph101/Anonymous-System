const crypto = require('crypto');

const generateTrackingCode = () => {
  const randomPart = crypto
    .randomBytes(6)
    .toString('hex')
    .toUpperCase();
  const year = new Date().getFullYear();
  return `RT-${year}-${randomPart}`;
  // Output example: RT-2025-A3F9C2
};

const generateRetractionCode = () => {
  const randomPart = crypto
    .randomBytes(8)
    .toString('hex')
    .toUpperCase();
  return `RET-${randomPart}`;
  // Output example: RET-A1B2C3D4E5F6G7H8
};

module.exports = { generateTrackingCode, generateRetractionCode };
