const express = require('express')
const app = express()
const http = require('http');

// import dependencies
const fs = require('fs');
const dotenv = require('dotenv').config();
//const axios = require('axios');
const cors = require('cors')
const bodyParser = require('body-parser');
var CryptoJS = require("crypto-js");

// import utility functions
const OAHelper = require(`./oa-helper.js`);
const OpenAttestation = require(`./open-attestation.js`);
const OADocumentStore = require(`./oa-document-store.js`);
const OAEncryption = require(`./oa-encryption.js`);
const OAVerify = require(`./oa-verify.js`);

//Issuer Details
const docStoreAddr = "did:ethr:0xbC2bE7DD6e8B1B2Ff8a5c5deC2C33e64D5B4a186#controller"
const ocsp = "NONE"
const dns = "explicit-gold-sloth.sandbox.openattestation.com"
const ISSUANCE = "did"

// import console log css
const { reset, bright, white, red, blue, magenta, green } = require('./console-log-display.js');
const { error } = require('console');

// helper variables
const ZERO_ADDRESS = `0x0000000000000000000000000000000000000000`;


app.use(cors())
app.use(bodyParser.json());

app.post("/api", (req, res) => {

    const recipientWallet = req.body.walletAddress
    const Message = req.body.message
    const Hash = req.body.hash

    // Decrypt private key
    //var bytes = CryptoJS.AES.decrypt(Key, Hash);
    //var decryptedText = bytes.toString(CryptoJS.enc.Utf8);

    //17579e5493c330d0b1ba25f29a9799c89fcc54866c5eaba51e5292cac521d81e
    var wallet = {
        public: `0xbC2bE7DD6e8B1B2Ff8a5c5deC2C33e64D5B4a186`,
        private: `17579e5493c330d0b1ba25f29a9799c89fcc54866c5eaba51e5292cac521d81e`,
    };

    //var dns = OAHelper.createTempDNSRecord(true, wallet.public,5);

    //dns.then(function (result) {
    //    var issueDoc = issuance(wallet, result, docStoreAddr, ocsp);
    //    issueDoc.then(function (result) {
    //        var SignedDoc = retrieveFile(`./result/signed-documents.json`, true);
    //        SignedDoc.then(function (result) {
    //            res.json(result)
    //        })
    //    })
    //})


    var issueDoc = issuance(wallet, dns, docStoreAddr, ocsp, Message, Hash);
    issueDoc.then(function (result) {
        var SignedDoc = retrieveFile(`./result/signed-documents.json`, true);
         SignedDoc.then(function (result) {
             res.json(result)
         })
     })
});

app.listen(5000, () => { console.log("Server started on port 5000") })

// function to save documents in result folder
saveFile = async (fileName, file) => {
    var directory = `./result`;
    if (!fs.existsSync(directory)) {
        try {
            fs.mkdirSync(directory);
        } catch (error) {
            console.log(`${bright}${red}Failed to create directory folder!${reset}`);
            throw error;
        }
    }
    try {
        await fs.writeFileSync(`${directory}/${fileName}`, JSON.stringify(file, null, 2));
    } catch (error) {
        console.log(`${bright}${red}Failed to save document!${reset}`);
        throw error;
    }
}

// function to retrieve file contents in local folder
retrieveFile = async (filePath, isJSON) => {
    try {
        var file;
        if (isJSON) file = JSON.parse(await fs.readFileSync(filePath));
        else file = await fs.readFileSync(filePath);
        return file;

    } catch (error) {
        console.log(`${bright}${red}Failed to retrieve file contents!${reset}`);
        throw error;
    }
}

// function to get the document factory contract address
getDocumentFactoryAddr = (networkId) => {
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
deployDocumentStore = async (config, provider, wallet, docFactoryInstance, docStoreName) => {
    var walletBalance = await provider.getBalance(wallet.address);
    if (walletBalance.get(`10000000000000000`)) {
        await OAHelper.deployDocumentStore(docFactoryInstance, docStoreName);
        docStoreAddr = await OAHelper.getDocumentStoreAddr(docFactoryInstance, wallet.address);
        config = { ...config, docStoreAddr: docStoreAddr };
        await saveFile(`configuration.json`, config);
        return docStoreAddr;
    } else throw new Error(`Insufficient funds in wallet!`);
}

const issuance = async (wallet, dns, docStoreAddr, ocsp) => {
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
    var document = await retrieveFile(`../samples/documents/document.json`, true);
    var options = {
        name: `Demo Issuer`,
        docStoreAddr: docStoreAddr,
        ocsp: ocsp,
        dns: dns,
        walletAddr: wallet.public,
    };
    var rawDocument;
    // create raw document
    if (ISSUANCE == "document-store") rawDocument = await OAHelper.createRawDocument(1, document, options);
    else if (ISSUANCE == "did") {
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
    if (ISSUANCE == `document-store`) {
        var documentStore = await OADocumentStore.connectDocumentStore(docStoreAddr, wallet);
        for (let i = 0; i < wrappedDocuments.length; i++) {
            await OADocumentStore.issue(documentStore, `0x${wrappedDocuments[i].signature.merkleRoot}`);
        }
    }
    else if (ISSUANCE == `did`) {
        for (let i = 0; i < wrappedDocuments.length; i++) {
            var signedDocument = await OpenAttestation.sign(wrappedDocuments[i], wallet);
            signedDocuments.push(signedDocument);
        }
        await saveFile(`signed-documents.json`, signedDocuments);
        if (await !OpenAttestation.guard(signedDocuments[0])) throw new Error(`Signed Document is not a valid OpenAttestation Document!`);
    }
    else throw new Error(`Environmental Variable, Issuance method is missing or invalid!`);
    return { document, rawDocument, wrappedDocuments, signedDocuments }
}

transmissionSend = async (wrappedDocuments, signedDocuments) => {
    /**
     * TRANSMISSION FLOW
     * 
     * SEND
     * 
     * 1. Encrypt Wrapped or Signed Document
     * 2. Encode Encrypted Document
     * 
     * Optional:
     * a. Obfuscate Wrapped or Signed Document
     */
    //  obfuscate and encrypt
    var obfuscatedDoc;
    var encryptedDoc;
    if (ISSUANCE == `document-store`) {
        obfuscatedDoc = await OpenAttestation.obfuscate(wrappedDocuments[0], `uselessField`);
        await saveFile(`obfuscated-wrapped-document.json`, obfuscatedDoc);
        encryptedDoc = await OAEncryption.encrypt(wrappedDocuments[0]);
        await saveFile(`encrypted-wrapped-document.json`, encryptedDoc);
    } else if (ISSUANCE == `did`) {
        obfuscatedDoc = await OpenAttestation.obfuscate(signedDocuments[0], `uselessField`);
        await saveFile(`obfuscated-signed-document.json`, obfuscatedDoc);
        encryptedDoc = await OAEncryption.encrypt(signedDocuments[0]);
        await saveFile(`encrypted-signed-document.json`, encryptedDoc);
    } else throw new Error(`Environmental Variable, Issuance method is missing or invalid!`);
    // encode
    var encodedDoc = await OAEncryption.encode(encryptedDoc);
    return { obfuscatedDoc, encryptedDoc, encodedDoc };
}

verification = async (decryptedDoc) => {
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

bootstrap = async () => {
    var { provider, wallet, keypair, dns, docStoreAddr, ocsp } = await configuration();
    var { document, rawDocument, wrappedDocuments, signedDocuments } = await issuance(wallet, dns, docStoreAddr, ocsp);
    var { obfuscatedDoc, encryptedDoc, encodedDoc } = await transmissionSend(wrappedDocuments, signedDocuments);
    var { decodedDoc, decryptedDoc } = await transmissionReceive(wrappedDocuments, signedDocuments, obfuscatedDoc, encodedDoc);
    await verification(decryptedDoc);
}