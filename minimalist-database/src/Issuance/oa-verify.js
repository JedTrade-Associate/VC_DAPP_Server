// import utility functions
const {
    // verify,
    isValid,
    verificationBuilder,
    openAttestationVerifiers,
    Verifier,
    utils,
} = require("@govtechsg/oa-verify");

// import console log css
const { reset, bright, white, red, blue, magenta, green } = require('./console-log-display.js');

const verifyProvider = utils.generateProvider();
const customizedVerify = verificationBuilder(openAttestationVerifiers, { provider: verifyProvider });

/**
 * @info verify if the document integrity, document status and issuer identity are valid
 * @param document wrapped or signed document as an object
 * @return validity as a boolean
 */
verifyDocument = async (document) => {
    console.log(`${bright}${magenta}Starting Verification of Document via OA Verification...${reset}`);
    var fragments = await customizedVerify(document);
    var validity = isValid(fragments);
    if (validity) console.log(`${green}Verification of Document successful!${reset}`);
    else {
        var invalids = [];
        for (let i = 0; i < fragments.length; i++) {
            if (utils.isInvalidFragment(fragments[i])) invalids.push(fragments[i].type);
            else if (utils.isErrorFragment(fragments[i])) {
                throw new Error(`${green}Verification of Document failed with error, ${JSON.stringify(fragments[i].reason, null, 2)}`);
            }
        }
        console.log(`${bright}${red}Verification of Document, ${invalids}, failed!${reset}`);
    }
    return validity;
}

/**
 * @info verify if the document has been issued and not been revoked to ensure document status
 * @param document wrapped or signed document as an object
 * @return validity as a boolean
 */
verifyDocumentIntegrity = async (document) => {
    console.log(`${bright}${magenta}Starting Verification of Document Integrity via OA Verification...${reset}`);
    var fragments = await customizedVerify(document);
    var integrityFragments = await utils.getDocumentIntegrityFragments(fragments);
    var validity;
    for (let i = 0; i < integrityFragments.length; i++) {
        if (utils.isValidFragment(integrityFragments[i])) {
            console.log(`${green}Verification of Document Integrity successful!${reset}`);
            validty = true;
        } else if (utils.isInvalidFragment(integrityFragments[i])) {
            console.log(`${bright}${red}Verification of Document Integrity failed!${reset}`);
            validity = false;
        } else if (utils.isErrorFragment(integrityFragments[i])) {
            throw new Error(`${green}Verification of Document Integrity failed with error, ${JSON.stringify(integrityFragments[i].reason, null, 2)}`);
        }
    }
    return validity;
}

/**
 * @info verify if the document has been issued and not been revoked to ensure document status
 * @param document wrapped or signed document as an object
 * @return validity as a boolean
 */
verifyDocumentStatus = async (document) => {
    console.log(`${bright}${magenta}Starting Verification of Document Status via OA Verification...${reset}`);
    var fragments = await customizedVerify(document);
    var statusFragments = await utils.getDocumentStatusFragments(fragments);
    var validity;
    for (let i = 0; i < statusFragments.length; i++) {
        if (utils.isValidFragment(statusFragments[i])) {
            console.log(`${green}Verification of Document Status successful!${reset}`);
            validty = true;
        } else if (utils.isInvalidFragment(statusFragments[i])) {
            console.log(`${bright}${red}Verification of Document Status failed!${reset}`);
            validity = false;
        } else if (utils.isErrorFragment(statusFragments[i])) {
            throw new Error(`${green}Verification of Document Status failed with error, ${JSON.stringify(statusFragments[i].reason, null, 2)}`);
        }
    }
    return validity;
}

/**
 * @info verify if the document issuer is valid to ensure issuer identity
 * @param document wrapped or signed document as an object
 * @return validity as a boolean
 */
verifyDocumentIssuer = async (document) => {
    console.log(`${bright}${magenta}Starting Verification of Document Issuer via OA Verification...${reset}`);
    var fragments = await customizedVerify(document);
    var issuerFragments = await utils.getIssuerIdentityFragments(fragments);
    var validity;
    for (let i = 0; i < issuerFragments.length; i++) {
        if (utils.isValidFragment(issuerFragments[i])) {
            console.log(`${green}Verification of Document Issuer successful!${reset}`);
            validty = true;
        } else if (utils.isInvalidFragment(issuerFragments[i])) {
            console.log(`${bright}${red}Verification of Document Issuer failed!${reset}`);
            validity = false;
        } else if (utils.isErrorFragment(issuerFragments[i])) {
            throw new Error(`${green}Verification of Document Issuer failed with error, ${JSON.stringify(issuerFragments[i].reason, null, 2)}`);
        }
    }
    return validity;
}

module.exports = {
    verifyDocument,
    verifyDocumentIntegrity,
    verifyDocumentStatus,
    verifyDocumentIssuer,
}