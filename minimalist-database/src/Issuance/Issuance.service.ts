import { signerBuilder } from '@govtechsg/open-attestation';
import { Injectable, HttpStatus, Res } from '@nestjs/common';
import * as log4js from 'log4js';
const fs = require('fs');
const logger = log4js.getLogger('cheese');

// import dependencies
const dotenv = require('dotenv').config();

// import utility functions
const OAHelper = require(`./oa-helper.js`);
const OpenAttestation = require(`./open-attestation.js`);
const OADocumentStore = require(`./oa-document-store.js`);
const OAEncryption = require(`./oa-encryption.js`);
const OAVerify = require(`./oa-verify.js`);

const { error } = require('console');


//Issuer Details
const docStoreAddr = "did:ethr:0xbC2bE7DD6e8B1B2Ff8a5c5deC2C33e64D5B4a186#controller"
const ocsp = "NONE"
const ISSUANCE = "did"

// helper variables
const ZERO_ADDRESS = `0x0000000000000000000000000000000000000000`;


@Injectable()
export class IssuanceService {

    IssueService = async (walletAddress) => {

        var wallet = {
            public: `0xbC2bE7DD6e8B1B2Ff8a5c5deC2C33e64D5B4a186`,
            private: `17579e5493c330d0b1ba25f29a9799c89fcc54866c5eaba51e5292cac521d81e`,
        };

        var walletPair = {
            public: `did:ethr:${wallet.public}#controller`,
            private: `17579e5493c330d0b1ba25f29a9799c89fcc54866c5eaba51e5292cac521d81e`,
        };

        const dns = await configuration(wallet, walletAddress, walletPair);


        return dns;
    }

    IssueMobileService = async () => {

    }

    VerifyService = async (doc) => {
        console.log(doc)
        var verification = await OAVerify.verifyDocument(doc);
        return verification;
    }


}
const saveFile = async (fileName, file) => {
    var directory = `./src/issuance/result`;
    if (!fs.existsSync(directory)) {
        try {
            fs.mkdirSync(directory);
        } catch (error) {
            console.log(`Failed to create directory folder!`);
            throw error;
        }
    }
    try {
        await fs.writeFileSync(`${directory}/${fileName}`, JSON.stringify(file, null, 2));
    } catch (error) {
        console.log(`Failed to save document!`);
        throw error;
    }
}

// function to retrieve file contents in local folder
const retrieveFile = async (filePath, isJSON) => {
    try {
        var file;
        if (isJSON) file = JSON.parse(await fs.readFileSync(filePath));
        else file = await fs.readFileSync(filePath);
        return file;

    } catch (error) {
        console.log(`Failed to retrieve file contents!`);
        throw error;
    }
}

const issuance = async (wallet, dns, docStoreAddr, ocsp, issuerAddress, walletPair) => {
    /**
     * ISSUANCE FLOW
     * 
     * 1. Create Raw Document
     * 2. Wrap Raw Document
     * 3. Check which Issuance Method is used
     * 3a. For Document Store Issuance, issue wrapped document
     * 3b. For DID Issuance, sign wrapped document
     * 
     * Optional:
     * a. Guard Check for each document
     */

    var document = {
        
        "$template": {
            "name": "main",
                "type": "EMBEDDED_RENDERER",
                    "url": "https://tutorial-renderer.openattestation.com"
        },
        "wallet": `${issuerAddress}`
    
    }
    var options = {
        name: `Demo Issuer`,
        docStoreAddr: docStoreAddr,
        ocsp: ocsp,
        dns: dns,
        walletAddr: wallet.public,
    };
    var rawDocument;
    // create raw document
    if (process.env.ISSUANCE == `document-store`) rawDocument = await OAHelper.createRawDocument(1, document, options);
    else if (process.env.ISSUANCE == `did`) {
        if (process.env.REVOCATION == `document-store`) rawDocument = await OAHelper.createRawDocument(3, document, options);
        else if (process.env.REVOCATION == `ocsp`) rawDocument = await OAHelper.createRawDocument(4, document, options);
        else rawDocument = await OAHelper.createRawDocument(2, document, options);
    } else throw new Error(`Environmental Variable, Issuance method is missing or invalid!`);
    if (await !OpenAttestation.guard(rawDocument)) throw new Error(`Raw Document is not a valid OpenAttestation Document!`);
    await saveFile(`raw-document.json`, rawDocument);
    // create wrapped document
    var wrappedDocuments = await OpenAttestation.wrap([rawDocument]);
    if (await !OpenAttestation.guard(wrappedDocuments[0])) throw new Error(`Wrapped Document is not a valid OpenAttestation Document!`);
    await saveFile(`wrapped-documents.json`, wrappedDocuments);
    // issue wrapped document
    var signedDocuments = [];
    if (process.env.ISSUANCE == `document-store`) {
        var documentStore = await OADocumentStore.connectDocumentStore(docStoreAddr, wallet);
        for (let i = 0; i < wrappedDocuments.length; i++) {
            await OADocumentStore.issue(documentStore, `0x${wrappedDocuments[i].signature.merkleRoot}`);
        }
    }
    else if (process.env.ISSUANCE == `did`) {
        for (let i = 0; i < wrappedDocuments.length; i++) {
            var signedDocument = await OpenAttestation.sign(wrappedDocuments[i], walletPair);
            signedDocuments.push(signedDocument);
        }
        await saveFile(`signed-documents.json`, signedDocuments);
        if (await !OpenAttestation.guard(signedDocuments[0])) throw new Error(`Signed Document is not a valid OpenAttestation Document!`);
    }
    else throw new Error(`Environmental Variable, Issuance method is missing or invalid!`);
    return { document, rawDocument, wrappedDocuments, signedDocuments }
}

const verification = async (decryptedDoc) => {
    /**
     * VERIFICATION FLOW
     * 1. Verify Decrypted Document
     * 
     * Optional:
     * a. Verify Decrypted Document Integrity
     * b. Verify Decrypted Document Status
     * c. Verify Decrypted Document Issuer
     */
    await OAVerify.verifyDocument(decryptedDoc);
    await OAVerify.verifyDocumentIntegrity(decryptedDoc);
    await OAVerify.verifyDocumentStatus(decryptedDoc);
    await OAVerify.verifyDocumentIssuer(decryptedDoc);

}

// function to get the document factory contract address
const getDocumentFactoryAddr = (networkId) => {
    switch (networkId) {
        case 1:
        case `1`:
            return ``; // ethereum mainnet
            break;
        case 5:
        case `5`:
            return `0x4534830Aa8Ce802de631626Cb6E0F2e37b8d5fac`; // goerli testnet
            break;
        case 137:
        case `137`:
            return ``; // polygon mainnet
            break;
        case 80001:
        case `80001`:
            return `0x86BE69AaCbD07AA26664922F68E12e62589CA3Ee`; // polygon mumbai testnet
            break;
        default:
            throw new Error(`Environmental Variable, Network ID is invalid!`);
            break;
    }
}

// function to check if wallet has sufficient funds before deploying document store
const deployDocumentStore = async (config, provider, wallet, docFactoryInstance, docStoreName) => {
    var walletBalance = await provider.getBalance(wallet.address);
    if (walletBalance.gte(`10000000000000000`)) {
        await OAHelper.deployDocumentStore(docFactoryInstance, docStoreName);
        var docStoreAddr = await OAHelper.getDocumentStoreAddr(docFactoryInstance, wallet.address);
        config = { ...config, docStoreAddr: docStoreAddr };
        await saveFile(`configuration.json`, config);
        return docStoreAddr;
    } else throw new Error(`Insufficient funds in wallet!`);
}

const configuration = async (wallet, issuerAddress, walletPair) => {
    const dns = await OAHelper.createTempDNSRecord(true, wallet.public,5);
    var { document, rawDocument, wrappedDocuments, signedDocuments } = await issuance(wallet, dns, docStoreAddr, ocsp, issuerAddress, walletPair);
    return signedDocuments
}