import crypto from 'crypto';

/**
 * Encryption algorithm
 */
const ALGORITHM = 'aes-256-cbc';

/**
 * Get encryption key from environment
 */
const getEncryptionKey = () => {
  const key = process.env.ENCRYPTION_KEY;
  
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }

  return crypto.scryptSync(key, 'salt', 32);
};

/**
 * Encrypt text
 */
export const encrypt = (text) => {
  if (!text) return text;

  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Return IV + encrypted text
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
};

/**
 * Decrypt text
 */
export const decrypt = (text) => {
  if (!text) return text;

  try {
    const key = getEncryptionKey();
    const [ivHex, encrypted] = text.split(':');
    
    if (!ivHex || !encrypted) {
      throw new Error('Invalid encrypted format');
    }
    
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
};

/**
 * Hash text (one-way, for passwords)
 */
export const hash = (text) => {
  return crypto.createHash('sha256').update(text).digest('hex');
};

/**
 * Compare hash
 */
export const compareHash = (text, hashedText) => {
  const textHash = hash(text);
  return textHash === hashedText;
};

/**
 * Generate random token
 */
export const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};
