import CryptoJS from 'crypto-js';

// Encryption configuration - to use environment variable in production
// const SECRET_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'default-secure-key-123!@#';
const SECRET_KEY = 'default-secure-key-123!@#';

export const encryptData = (data: any): string => {
    try {
        return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
    } catch (error) {
        console.error('Encryption failed:', error);
        throw new Error('Failed to encrypt data');
    }
};

export const decryptData = (ciphertext: string): any => {
    if (!ciphertext) return null;

    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        if (!decrypted) {
            console.warn('Decryption returned empty result - possibly wrong key');
            return null;
        }
        return JSON.parse(decrypted);
    } catch (error) {
        console.error('Decryption failed:', error);
        return null;
    }
};