import { secretbox, randomBytes } from 'tweetnacl';
import { decodeBase64 } from 'tweetnacl-util';

function decryptPrivateKey(encryptedPrivateKey, encryptionKey, iv) {
  try {
    // Decode the base64 strings
    const decodedKey = decodeBase64(encryptionKey);
    const decodedIv = decodeBase64(iv);
    const decodedEncryptedData = decodeBase64(encryptedPrivateKey);

    // Create the nonce from IV
    const nonce = new Uint8Array(24);
    nonce.set(decodedIv);

    // Decrypt
    const decrypted = secretbox.open(decodedEncryptedData, nonce, decodedKey);
    
    if (!decrypted) {
      throw new Error('Decryption failed');
    }

    // Convert to string
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}

const walletData = {
  publicKey: "CRJXmfwAMNE7cXfLhmxz3PfcdnQJAVsvon2Xe77PGqV1",
  encryptedPrivateKey: "wcP8/7nkIk95u5W6M9E7C19pTMd6eYhvjd05pjs7csRSrnhM3XAyRIEUeJCUYyX/Yr330z…",
  iv: "D+HxIaNDMs6oyt/WKahR/rMJh2ybbdbC",
  encryptionKey: "m0ckn81WDA8mLrrBs/BCl1uiAGRvMKRtGcCDRiYbHaU=",
  encryptionMethod: "NACL_SECRETBOX"
};

const decryptedPrivateKey = decryptPrivateKey(
  walletData.encryptedPrivateKey,
  walletData.encryptionKey,
  walletData.iv
);

console.log('Decrypted Private Key:', decryptedPrivateKey);