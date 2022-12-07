// import utility functions
const {
    SUPPORTED_SIGNING_ALGORITHM,
    __unsafe__use__it__at__your__own__risks__wrapDocuments,
    wrapDocuments,
    signDocument,
    validateSchema,
    verifySignature,
    obfuscateDocument,
    utils,
} = require("@govtechsg/open-attestation");

// import console log css
const { reset, bright, white, red, blue, magenta, green } = require('./console-log-display.js');

/**
 * @info wrap documents to ensure document integrity
 * @param documents the documents as an array of objects to be wrapped
 * @return wrapped documents as an array of objects
 */
wrap = async (documents) => {
    console.log(`${bright}${magenta}Starting Wrapping of Documents via Open-Attestation...${reset}`);
    return new Promise(async (resolve) => {
        var v2 = 0;
        var v3 = 0;
        var version;
        for (var i = 0; i < documents.length; i++) {
            if (await utils.isRawV2Document(documents[i])) v2++;
            else if (await utils.isRawV3Document(documents[i])) v3++;
        }
        if (v2 > 0 && v3 > 0) {
            console.log(`${bright}${red}Cannot wrap v2 and v3 documents together!${reset}`);
            throw new Error(`Cannot wrap v2 and v3 documents together`);
        } else if (v2 > 0) version = 2;
        else if (v3 > 0) version = 3;
        try {
            if (version == 2) var wrappedDocs = await wrapDocuments(documents);
            else var wrappedDocs = await __unsafe__use__it__at__your__own__risks__wrapDocuments(documents);
            console.log(`${green}Wrapping successful!${reset}`);
        }
        catch (error) {
            console.log(`${bright}${red}Failed to wrap document!${reset}`);
            throw error;
        }
        resolve(wrappedDocs);
    })
}

/**
 * @info sign wrapped document to issue document
 * @param wrappedDoc wrapped document as an object to be signed
 * @param signer either a keypair or an ethers wallet instance as an object
 * @return signed document as an object
 */
sign = async (wrappedDoc, signer) => {
    console.log(`${bright}${magenta}Starting Signing of Document via Open-Attestation...${reset}`);
    return new Promise(async (resolve) => {
        try {
            var signedDoc = await signDocument(
                wrappedDoc,
                SUPPORTED_SIGNING_ALGORITHM.Secp256k1VerificationKey2018,
                signer
            );
            console.log(`${green}Signing successful!${reset}`);
        }
        catch (error) {
            console.log(`${bright}${red}Failed to sign document!${reset}`);
            throw error;
        }
        resolve(signedDoc);
    })
}

/**
 * @info obfuscate document to hide a particular key-value pair
 * @param document wrapped or signed document as an object to be obfuscated
 * @param key key of the key-value pair to be hidden as a string
 * @return obfuscated document as an object
 */
obfuscate = async (document, key) => {
    console.log(`${bright}${magenta}Starting Obfuscation of Document via Open-Attestation...${reset}`);
    return new Promise(async (resolve) => {
        try {
            var obfuscatedDoc = await obfuscateDocument(document, key);
            console.log(`${green}Obfuscation successful!${reset}`);
        }
        catch (error) {
            console.log(`${bright}${red}Failed to obfuscate document!${reset}`);
            throw error;
        }
        resolve(obfuscatedDoc);
    })
}

/**
 * @info validate if the schema of a document conforms to OpenAttestation standards
 * @param document wrapped or signed document as an object to be validated
 * @return document validity as a boolean
 */
validate = async (document) => {
    console.log(`${bright}${magenta}Starting Validation of Document via Open-Attestation...${reset}`);
    var valid = await validateSchema(document);
    if (valid) console.log(`${green}Document Schema is valid!${reset}`);
    else console.log(`${bright}${red}Document Schema is not valid!${reset}`);
    return valid;
}

/**
 * @info verify if the document contents have been modified after it was wrapped to ensure document integrity
 * @param document wrapped or signed document as an object to be validated
 * @return document integrity as a boolean
 */
verifyIntegrity = async (document) => {
    console.log(`${bright}${magenta}Starting Verification of Document via Open-Attestation...${reset}`);
    var valid = await verifySignature(document);
    if (valid) console.log(`${green}Document Integrity is valid!${reset}`);
    else console.log(`${bright}${red}Document Integrity is not valid!${reset}`);
    return valid;
}

/**
 * @info retrieve the raw contents of a document
 * @param document wrapped or signed document as an object to be retrieved
 * @return raw document as an object
 */
retrieve = async (document) => {
    console.log(`${bright}${magenta}Starting Data Retrieval of Document via Open-Attestation...${reset}`);
    return new Promise(async resolve => {
        try {
            var doc = await utils.getDocumentData(document);
            console.log(`${green}Data Retrieval successful!${reset}`);
        }
        catch (error) {
            console.log(`${bright}${red}Failed to retrieve document data!${reset}`);
            throw error;
        }
        resolve(doc);
    })
}

/**
 * @info guard check to validate if a document is a valid OpenAttestation document
 * @param document document as an object to be perform a guard check
 * @return guard check result as a boolean
 */
guard = async (document) => {
    console.log(`${bright}${magenta}Starting Guard Check of Document via Open-Attestation...${reset}`);
    var version;
    var type;
    if (await utils.isWrappedV2Document(document)) version = 2;
    else if (await utils.isWrappedV3Document(document)) version = 3;
    if (version == undefined) {
        if (await utils.isRawV2Document(document)) version = 2;
        else if (await utils.isRawV3Document(document)) version = 3;
    }
    if (version == 2) {
        if (document.proof) type = `signed`;
        else if (document.signature) type = `wrapped`;
        else type = `raw`;
    }
    if (version == 3) {
        if (document.proof) {
            if (document.proof.signature) type = `signed`;
            else type = `wrapped`;
        }
        else type = `raw`;
    }
    switch (type) {
        case `raw`:
            switch (version) {
                case 2:
                    var guard = utils.isRawV2Document(document);
                    break;
                case 3:
                    var guard = utils.isRawV3Document(document);
                    break;
                default:
                    break;
            }
            break;
        case `wrapped`:
            switch (version) {
                case 2:
                    var guard = utils.isWrappedV2Document(document);
                    break;
                case 3:
                    var guard = utils.isWrappedV3Document(document);
                    break;
                default:
                    break;
            }
            break;
        case `signed`:
            switch (version) {
                case 2:
                    var guard = utils.isSignedWrappedV2Document(document);
                    break;
                case 3:
                    var guard = utils.isSignedWrappedV3Document(document);
                    break;
                default:
                    break;
            }
            break;
        default:
            break;
    }
    if (guard) console.log(`${green}Document passes Guard Check!${reset}`);
    else console.log(`${bright}${red}Document fails Guard Check!${reset}`);
    return guard;
}

/**
 * @info retrieve the document store issuer of a wrapped document
 * @dev can only be used for document store issuance documents
 * @param document wrapped document as an object to be perform a guard check
 * @return document store issuer as an array of hexadecimal string
 */
getIssuer = async (document) => {
    console.log(`${bright}${magenta}Starting Retrieval of Document Issuer via Open-Attestation...${reset}`);
    var issuer;
    if (await utils.isWrappedV2Document(document)) issuer = await utils.getIssuerAddress(document);
    else if (await utils.isWrappedV3Document(document)) issuer = await utils.getIssuerAddress(document);
    else throw new Error(`Document is not a valid Open-Attestation Document!`);
    for (let i = 0; i < issuer.length; i++) {
        if (issuer[i] == undefined) throw new Error(`Document is not issued via a Document Store!`);
    }
    console.log(`${green}Document Issuer retrieved successful!${reset}`);
    return issuer;
}

/**
 * @info retrieve the merkle root of a wrapped or signed document
 * @param document wrapped or signed document as an object to retrieve the merkle root
 * @return merkle root as a hexadecimal string
 */
getMerkleRoot = async (document) => {
    console.log(`${bright}${magenta}Starting Retrieval of Document Merkle Root via Open-Attestation...${reset}`);
    try {
        var merkleRoot = await utils.getMerkleRoot(document);
        console.log(`${green}Document Merkle Root retrieved successful!${reset}`);
        return merkleRoot;
    } catch (error) {
        console.log(`${bright}${red}Failed to retrieve document merkle root!${reset}`);
        throw error;
    }
}

/**
 * @info retrieve the target hash of a wrapped or signed document
 * @param document wrapped or signed document as an object to retrieve the target hash
 * @return target hash as a hexadecimal string
 */
getTargetHash = async (document) => {
    console.log(`${bright}${magenta}Starting Retrieval of Document Target Hash via Open-Attestation...${reset}`);
    try {
        var targetHash = await utils.getTargetHash(document);
        console.log(`${green}Document Target Hash retrieved successful!${reset}`);
        return targetHash;
    } catch (error) {
        console.log(`${bright}${red}Failed to retrieve document target hash!${reset}`);
        throw error;
    }
}

/**
 * @info retrieve the template url of a document
 * @param document document as an object to retrieve the template url
 * @return template url as a url string
 */
getTemplateURL = async (document) => {
    console.log(`${bright}${magenta}Starting Retrieval of Document Template URL via Open-Attestation...${reset}`);
    try {
        var templateURL = await utils.getTemplateURL(document);
        console.log(`${green}Document Template URL retrieved successful!${reset}`);
        return templateURL;
    } catch (error) {
        console.log(`${bright}${red}Failed to retrieve document template URL!${reset}`);
        throw error;
    }
}

/**
 * @info verify if a wrapped or signed document is transferable
 * @param document wrapped or signed document as an object to be verify transferability
 * @return transferability as a boolean
 */
isTransferableAsset = async (document) => {
    console.log(`${bright}${magenta}Checking if Document is transferable via Open-Attestation...${reset}`);
    var transferable = await utils.isTransferableAsset(document);
    if (transferable) console.log(`${green}Document is transferable!${reset}`);
    else console.log(`${bright}${red}Document is not transferable!${reset}`);
    return transferable;
}

/**
 * @info verify if a wrapped or signed document is revokable via a document store
 * @param document wrapped or signed document as an object to be verify revocability
 * @return revocability as a boolean
 */
isDocumentRevokable = async (document) => {
    console.log(`${bright}${magenta}Checking if Document is revokable via Open-Attestation...${reset}`);
    var revokable = await utils.isDocumentRevokable(document);
    if (revokable) console.log(`${green}Document is revokable!${reset}`);
    else console.log(`${bright}${red}Document is not revokable!${reset}`);
    return revokable;
}

/**
 * @info retrieve the asset id of a transferable wrapped or signed document
 * @param document transferable wrapped or signed document as an object to retrieve the asset id
 * @return asset id as a hexadecimal string
 */
getAssetId = async (document) => {
    console.log(`${bright}${magenta}Starting Retrieval of Document Asset ID via Open-Attestation...${reset}`);
    try {
        var assetId = await utils.getAssetId(document);
        console.log(`${green}Document Asset ID retrieved successful!${reset}`);
    } catch (error) {
        console.log(`${bright}${red}Failed to retrieve document asset id!${reset}`);
        throw error;
    }
    return assetId;
}

/**
 * @info verify if the data of a wrapped or signed document is obfuscated
 * @param document wrapped or signed document as an object to be verify if its data is obfuscated
 * @return obfuscated as a boolean
 */
isObfuscated = async (document) => {
    console.log(`${bright}${magenta}Checking if Document is obfuscated via Open-Attestation...${reset}`);
    try {
        var obfuscated = await utils.isObfuscated(document);
        if (obfuscated) console.log(`${green}Document is obfuscated!${reset}`);
        else console.log(`${bright}${red}Document is not obfuscated!${reset}`);
        return obfuscated;
    } catch (error) {
        console.log(`${bright}${red}Failed to check if document is obfuscated!${reset}`);
        throw error;
    }
}

/**
 * @info retrieve the obfuscated data of a wrapped or signed document
 * @param document wrapped or signed document as an object to retrieve the obfuscated data
 * @return obfuscated data as an array of hexadecimal strings
 */
getObfuscatedData = async (document) => {
    console.log(`${bright}${magenta}Starting Retrieval of Document Obfuscated Data via Open-Attestation...${reset}`);
    try {
        var obfuscatedData = await utils.getObfuscatedData(document);
        console.log(`${green}Document Obfuscated Data retrieved successful!${reset}`);
    } catch (error) {
        console.log(`${bright}${red}Failed to retrieve document obfuscated data!${reset}`);
        throw error;
    }
    return obfuscatedData;
}

module.exports = {
    wrap,
    sign,
    obfuscate,
    validate,
    verifyIntegrity,
    retrieve,
    guard,
    getIssuer,
    getMerkleRoot,
    getTargetHash,
    getTemplateURL,
    isTransferableAsset,
    isDocumentRevokable,
    getAssetId,
    isObfuscated,
    getObfuscatedData,
}