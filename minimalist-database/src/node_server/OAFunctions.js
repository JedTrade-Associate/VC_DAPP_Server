// import dependencies
const fs = require('fs');
const dotenv = require('dotenv').config();

// import utility functions
const OAHelper = require(`./scripts/oa-helper.js`);
const OpenAttestation = require(`./scripts/open-attestation.js`);
const OADocumentStore = require(`./scripts/oa-document-store.js`);
const OAEncryption = require(`./scripts/oa-encryption.js`);
const OAVerify = require(`./scripts/oa-verify.js`);

// import console log css
const { reset, bright, white, red, blue, magenta, green } = require('./scripts/console-log-display.js');
const { default: axios } = require('axios');

// helper variables
const ZERO_ADDRESS = `0x0000000000000000000000000000000000000000`;

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
    if (walletBalance.gte(`10000000000000000`)) {
        await OAHelper.deployDocumentStore(docFactoryInstance, docStoreName);
        docStoreAddr = await OAHelper.getDocumentStoreAddr(docFactoryInstance, wallet.address);
        config = { ...config, docStoreAddr: docStoreAddr };
        await saveFile(`configuration.json`, config);
        return docStoreAddr;
    } else throw new Error(`Insufficient funds in wallet!`);
}

configuration = async () => {
    /**
     * CONFIGURATION FLOW
     * 
     * 1. Check if Wallet exists
     * 2. Check if DNS is configured
     * 3. Check which Issuance Method is used
     * 3a. For Document Store Issuance, check if Document Store is deployed
     * 4. Check which Revocation Method is used
     * 4a. For Document Store Revocation, check if Document Store is deployed
     * 4b. For OCSP Revocation, check if OCSP is set up
     */
    var config = {};
    switch (process.env.NETWORK_ID) {
        case 1:
        case `1`:
            break;
        case 5:
        case `5`:
            break;
        case 137:
        case `137`:
            break;
        case 80001:
        case `80001`:
            break;
        default:
            //throw new Error(`Environmental Variable, Network ID is missing or invalid!`);
            break;
    }
    if (process.env.PROVIDER_ENDPOINT_URL == ``) throw new Error(`Environmental Variable, Provider RPC URL is missing!`);
    var provider = await OAHelper.getProvider(process.env.PROVIDER_ENDPOINT_URL, process.env.NETWORK_ID);
    // Checking Wallet
    var wallet;
    if (process.env.WALLET_PRIV == ``) {
        wallet = await OAHelper.createWallet(true, provider);
        config = { ...config, privateKey: wallet.privateKey };
        await saveFile(`configuration.json`, config);
    }
    else wallet = await OAHelper.createWallet(false, provider, process.env.WALLET_PRIV);
    var keypair = await OAHelper.walletToKeypair(wallet);
    // Checking DNS
    var dns = process.env.DNS;
    if (dns == ``) {
        if (process.env.ISSUANCE == `document-store`) dns = await OAHelper.createTempDNSRecord(true, wallet.address, process.env.NETWORK_ID);
        else if (process.env.ISSUANCE == `did`) dns = await OAHelper.createTempDNSRecord(false, wallet.address);
        else throw new Error(`Environmental Variable, Issuance method is missing or invalid!`);
        config = { ...config, dns: dns };
        await saveFile(`configuration.json`, config);
    }
    // Checking Issuance Method
    var docFactoryAddr;
    if (process.env.NETWORK_ID != ``) docFactoryAddr = await getDocumentFactoryAddr(process.env.NETWORK_ID);
    else throw new Error(`Environmental Variable, Network ID is missing!`);
    if (docFactoryAddr == undefined || docFactoryAddr == ``) throw new Error(`Environmental Variable, Network ID is invalid!`);
    var docFactoryJSON = await retrieveFile(`./build/contracts/DocumentStoreFactory.json`, true);
    var docFactoryInstance = await OAHelper.getContractInstance(docFactoryAddr, docFactoryJSON.abi, wallet);
    // Checking Document Store Issuance Method
    var docStoreAddr;
    if (process.env.ISSUANCE == `document-store`) {
        docStoreAddr = await OAHelper.getDocumentStoreAddr(docFactoryInstance, wallet.address);
        var ownableJSON = await retrieveFile(`./build/contracts/Ownable.json`, true);
        var ownableInstance = await OAHelper.getContractInstance(docStoreAddr, ownableJSON.abi, wallet);
        var docStoreOwner = await OADocumentStore.owner(ownableInstance);
        if (docStoreAddr == ZERO_ADDRESS || docStoreOwner != wallet.address)
            docStoreAddr = await deployDocumentStore(config, provider, wallet, docFactoryInstance, `My Document Store`);
    }
    // Checking Revocation Method
    var ocsp;
    if (process.env.ISSUANCE != `document-store`) {
        if (process.env.REVOCATION == `document-store`) {
            docStoreAddr = await OAHelper.getDocumentStoreAddr(docFactoryInstance, wallet.address);
            var ownableJSON = await retrieveFile(`./build/contracts/Ownable.json`, true);
            var ownableInstance = await OAHelper.getContractInstance(docStoreAddr, ownableJSON.abi, wallet);
            var docStoreOwner = await OADocumentStore.owner(ownableInstance);
            if (docStoreAddr == ZERO_ADDRESS || docStoreOwner != wallet.address)
                docStoreAddr = await deployDocumentStore(config, provider, wallet, docFactoryInstance, `My Document Store`);
        } else if (process.env.REVOCATION == `ocsp`) {
            /**
             * 
             * create method for OCSP
             * 
             */
            ocsp = `https://ocsp-sandbox.openattestation.com`;
        }
    }
    return { provider, wallet, keypair, dns, docStoreAddr, ocsp };
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
    var document = await retrieveFile(`./samples/documents/document.json`, true);
    var options = {
        name: `Demo Issuer`,
        docStoreAddr: docStoreAddr,
        ocsp: ocsp,
        dns: dns,
        walletAddr: wallet.address,
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
    if (process.env.ISSUANCE == `document-store`) {
        obfuscatedDoc = await OpenAttestation.obfuscate(wrappedDocuments[0], `uselessField`);
        await saveFile(`obfuscated-wrapped-document.json`, obfuscatedDoc);
        encryptedDoc = await OAEncryption.encrypt(wrappedDocuments[0]);
        await saveFile(`encrypted-wrapped-document.json`, encryptedDoc);
    } else if (process.env.ISSUANCE == `did`) {
        obfuscatedDoc = await OpenAttestation.obfuscate(signedDocuments[0], `uselessField`);
        await saveFile(`obfuscated-signed-document.json`, obfuscatedDoc);
        encryptedDoc = await OAEncryption.encrypt(signedDocuments[0]);
        await saveFile(`encrypted-signed-document.json`, encryptedDoc);
    } else throw new Error(`Environmental Variable, Issuance method is missing or invalid!`);
    // encode
    var encodedDoc = await OAEncryption.encode(encryptedDoc);
    return { obfuscatedDoc, encryptedDoc, encodedDoc };
}

transmissionReceive = async (wrappedDocuments, signedDocuments, obfuscatedDoc, encodedDoc) => {
    /**
     * TRANSMISSION FLOW
     * 1. Decode Encoded Document
     * 2. Decrypt Encrypted Document
     * 3. Validate Wrapped or Signed Document
     * 4. Verify Wrapped or Signed Document
     * 
     * Optional:
     * a. Get Raw Document from Wrapped or Signed Document
     * b. Get Issuer Information of Wrapped or Signed Document
     * c. Get Merkle Root of Wrapped or Signed Document
     * d. Get Target Hash of Wrapped or Signed Document
     * e. Get Template URL of Wrapped or Signed Document
     * f. Get Obfuscated Data of Wrapped or Signed Document
     * g. Check if Wrapped or Signed Document is revokable
     * h. Check if Wrapped or Signed Document is obfuscated
     */
    // decode
    var decodedDoc = await OAEncryption.decode(encodedDoc);
    // decrypt
    var decryptedDoc = await OAEncryption.decrypt(decodedDoc);
    if (process.env.ISSUANCE == `document-store`) {
        if (decryptedDoc.signature.merkleRoot != wrappedDocuments[0].signature.merkleRoot) throw new Error(`Decrypted Document doesn't match Wrapped Document!`);
    } else if (process.env.ISSUANCE == `did`) {
        if (decryptedDoc.signature.merkleRoot != signedDocuments[0].signature.merkleRoot) throw new Error(`Decrypted Document doesn't match Signed Document!`);
    } else throw new Error(`Environmental Variable, Issuance method is missing or invalid!`);
    // validate
    await OpenAttestation.validate(decryptedDoc);
    // verify
    await OpenAttestation.verifyIntegrity(decryptedDoc);
    // optional
    var decryptedDocRaw = await OpenAttestation.retrieve(decryptedDoc);
    var decryptedDocIssuer = await OpenAttestation.getIssuer(decryptedDoc);
    var decryptedDocMerkleRoot = await OpenAttestation.getMerkleRoot(decryptedDoc);
    var decryptedDocTargetHash = await OpenAttestation.getTargetHash(decryptedDoc);
    var decryptedDocTemplateURL = await OpenAttestation.getTemplateURL(decryptedDoc);
    await OpenAttestation.isDocumentRevokable(decryptedDoc);
    // optional, obfuscated
    var obfuscatedData = await OpenAttestation.getObfuscatedData(obfuscatedDoc);
    await OpenAttestation.isObfuscated(obfuscatedDoc);
    return { decodedDoc, decryptedDoc };
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

bootstrap();