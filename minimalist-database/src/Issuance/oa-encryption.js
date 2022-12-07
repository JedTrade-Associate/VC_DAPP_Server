// import utility functions
const {
    generateEncryptionKey,
    encryptString,
    decryptString,
    encodeDocument,
    decodeDocument,
} = require("@govtechsg/oa-encryption");

// import console log css
const { reset, bright, white, red, blue, magenta, green } = require('./console-log-display.js');

/**
 * @info encrypt document(s) with a key for data confidentiality
 * @dev if {key} is not provided, a random key will be generated
 * @param document document(s) as an object or an array of objects to be encrypted
 * @param key encryption key as a 32 bytes hexadecimal string
 * @return encrypted document(s) as an object or an array of objects
 */
encrypt = async (document, key) => {
    console.log(`${bright}${magenta}Starting Encryption of Document via OA Encryption...${reset}`);
    return new Promise(async (resolve) => {
        try {
            var encryptedDoc = await encryptString(JSON.stringify(document), key);
            console.log(`${green}Encryption successful!${reset}`);
        }
        catch (error) {
            console.log(`${bright}${red}Failed to encrypt document!${reset}`);
            throw error;
        }
        resolve(encryptedDoc);
    })
}

/**
 * @info decrypt document(s) with a key for data confidentiality
 * @param encryptedDoc encrypted document(s) as an object or an array of objects to be decrypted
 * @return decrypted document(s) as an object or an array of objects
 */
decrypt = async (encryptedDoc) => {
    console.log(`${bright}${magenta}Starting Decryption of Document via OA Encryption...${reset}`);
    return new Promise(async (resolve) => {
        try {
            var decryptedDoc = JSON.parse(await decryptString(encryptedDoc));
            console.log(`${green}Decryption successful!${reset}`);
        }
        catch (error) {
            console.log(`${bright}${red}Failed to decrypt document!${reset}`);
            throw error;
        }
        resolve(decryptedDoc);
    })
}

/**
 * @info encode document(s) for data usability
 * @param document document(s) as an object to be encoded
 * @return encoded document(s) as a base64 string
 */
encode = async (document) => {
    console.log(`${bright}${magenta}Starting Encoding of Document via OA Encryption...${reset}`);
    return new Promise(async (resolve) => {
        if (!document) document = await getSampleDocument(2);
        try {
            var encodedDoc = await encodeDocument(JSON.stringify(document));
            console.log(`${green}Encode successful!${reset}`);
        }
        catch (error) {
            console.log(`${bright}${red}Failed to encode document!${reset}`);
            throw error;
        }
        resolve(encodedDoc);
    })
}

/**
 * @info decode document(s) for data usability
 * @param encodedDoc encoded document(s) as an base64 string to be decoded
 * @return decoded document(s) as an object or an array of objects
 */
decode = async (encodedDoc) => {
    console.log(`${bright}${magenta}Starting Decoding of Document via OA Encryption...${reset}`);
    return new Promise(async (resolve) => {
        try {
            var decodedDoc = JSON.parse(await decodeDocument(encodedDoc));
            console.log(`${green}Decode successful!${reset}`);
        }
        catch (error) {
            console.log(`${bright}${red}Failed to decode document!${reset}`);
            throw error;
        }
        resolve(decodedDoc);
    })
}

module.exports = {
    encrypt,
    decrypt,
    encode,
    decode,
}