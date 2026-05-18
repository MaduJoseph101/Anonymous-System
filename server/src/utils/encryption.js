const CryptoJS = require('crypto-js');

const KEY = process.env.ENCRYPTION_KEY;

if (!KEY || KEY.length !== 32) {
  console.error(
    'FATAL: ENCRYPTION_KEY must be exactly 32 characters. ' +
    'Current length:', KEY ? KEY.length : 'undefined'
  );
}

const encrypt = (text) => {
  if (text === null || text === undefined) return null;
  try {
    return CryptoJS.AES.encrypt(String(text), KEY).toString();
  } catch (e) {
    console.error('Encryption error:', e.message);
    return null;
  }
};

const decrypt = (cipherText) => {
  if (cipherText === null || cipherText === undefined) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, KEY);
    const result = bytes.toString(CryptoJS.enc.Utf8);
    return result || null;
  } catch (e) {
    console.error('Decryption error:', e.message);
    return null;
  }
};

module.exports = { encrypt, decrypt };
