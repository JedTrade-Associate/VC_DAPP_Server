// import utility functions
const { connect } = require("@govtechsg/document-store");

// import console log css
const { reset, bright, white, red, blue, magenta, green } = require('./console-log-display.js');

// helper variables
const ZERO_ADDRESS = `0x0000000000000000000000000000000000000000`;

/**
 * @info creates a document store instance
 * @param docStoreAddr the document store contract address as a hexadecimal string
 * @param wallet an ethers wallet instance as an object
 * @return document store instance as an object
 */
connectDocumentStore = async (docStoreAddr, wallet) => {
    console.log(`${bright}${magenta}Starting Connection to Document Store via OA Document Store...${reset}`);
    try {
        var documentStore = await connect(docStoreAddr, wallet);
        console.log(`${green}Connection to Document Store successful!${reset}`);
        return documentStore;
    } catch (error) {
        console.log(`${bright}${red}Failed to connect to document store!${reset}`);
        throw error;
    }
}

/**
 * @info issues a document via a document store
 * @dev {documentHash} must have `0x` in front of it
 * @dev only the document store owner can call this function
 * @dev only document that is not issued previously can be issued
 * @param docStore the document store instance as an object
 * @param documentHash the merkle root of a document as a hexadecimal string
 * @return blockchain transaction id as a hexadecimal string
 */
issue = async (docStore, documentHash) => {
    console.log(`${bright}${magenta}Starting Issuance to Document Store via OA Document Store...${reset}`);
    try {
        var tx = await docStore.issue(documentHash);
        console.log(`${blue}Issuance to Document Store sent with Tx Hash, ${bright}${tx.hash}${reset}${blue}, awaiting completion...${reset}`);
        var receipt = await tx.wait();
        if (!await isIssued(docStore, documentHash)) throw new Error(`Issuance to document store unsuccessful!`);
        console.log(`${green}Issuance to Document Store successful, Tx Hash: ${bright}${receipt.transactionHash}${reset}${green}!${reset}`);
        return receipt.transactionHash;
    } catch (error) {
        console.log(`${bright}${red}Failed to issue to document store!${reset}`);
        throw error;
    }
}

/**
 * @info issues document(s) via a document store
 * @dev {documentHash} must have `0x` in front of it
 * @dev only the document store owner can call this function
 * @dev only document(s) that are not issued previously can be issued
 * @param docStore the document store instance as an object
 * @param documentHashes the merkle root of a document(s) as an array of hexadecimal strings
 * @return blockchain transaction id as a hexadecimal string
 */
bulkIssue = async (docStore, documentHashes) => {
    console.log(`${bright}${magenta}Starting Bulk Issuance to Document Store via OA Document Store...${reset}`);
    try {
        var tx = await docStore.bulkIssue(documentHashes);
        console.log(`${blue}Bulk Issuance to Document Store sent with Tx Hash, ${bright}${tx.hash}${reset}${blue}, awaiting completion...${reset}`);
        var receipt = await tx.wait();
        for (let i = 0; i < documentHashes.length; i++) {
            if (!await isIssued(docStore, documentHashes[i])) throw new Error(`Bulk Issuance to document store unsuccessful!`);
        }
        console.log(`${green}Bulk Issuance to Document Store successful, Tx Hash: ${bright}${receipt.transactionHash}${reset}${green}!${reset}`);
        return receipt.transactionHash;
    } catch (error) {
        console.log(`${bright}${red}Failed to bulk issue to document store!${reset}`);
        throw error;
    }
}

/**
 * @info revokes a document via a document store
 * @dev {documentHash} must have `0x` in front of it
 * @dev only the document store owner can call this function
 * @dev only document that is not revoked previously can be revoked
 * @param docStore the document store instance as an object
 * @param documentHash the merkle root of a document as a hexadecimal string
 * @return blockchain transaction id as a hexadecimal string
 */
revoke = async (docStore, documentHash) => {
    console.log(`${bright}${magenta}Starting Revocation to Document Store via OA Document Store...${reset}`);
    try {
        var tx = await docStore.revoke(documentHash);
        console.log(`${blue}Revocation to Document Store sent with Tx Hash, ${bright}${tx.hash}${reset}${blue}, awaiting completion...${reset}`);
        var receipt = await tx.wait();
        if (!await isRevoked(docStore, documentHash)) throw new Error(`Revocation to document store unsuccessful!`);
        console.log(`${green}Revocation to Document Store successful, Tx Hash: ${bright}${receipt.transactionHash}${reset}${green}!${reset}`);
        return receipt.transactionHash;
    } catch (error) {
        console.log(`${bright}${red}Failed to revoke to document store!${reset}`);
        throw error;
    }
}

/**
 * @info revokes document(s) via a document store
 * @dev {documentHash} must have `0x` in front of it
 * @dev only the document store owner can call this function
 * @dev only document(s) that are not revoked previously can be revoked
 * @param docStore the document store instance as an object
 * @param documentHashes the merkle root of a document(s) as an array of hexadecimal strings
 * @return blockchain transaction id as a hexadecimal string
 */
bulkRevoke = async (docStore, documentHashes) => {
    console.log(`${bright}${magenta}Starting Bulk Revocation to Document Store via OA Document Store...${reset}`);
    try {
        var tx = await docStore.bulkRevoke(documentHashes);
        console.log(`${blue}Bulk Revocation to Document Store sent with Tx Hash, ${bright}${tx.hash}${reset}${blue}, awaiting completion...${reset}`);
        var receipt = await tx.wait();
        for (let i = 0; i < documentHashes.length; i++) {
            if (!await isRevoked(docStore, documentHashes[i])) throw new Error(`Bulk Revocation to document store unsuccessful!`);
        }
        console.log(`${green}Bulk Revocation to Document Store successful, Tx Hash: ${bright}${receipt.transactionHash}${reset}${green}!${reset}`);
        return receipt.transactionHash;
    } catch (error) {
        console.log(`${bright}${red}Failed to bulk revoke to document store!${reset}`);
        throw error;
    }
}

/**
 * @info revokes a document via a document store
 * @dev {documentHash} must have `0x` in front of it
 * @dev only the document store owner can call this function
 * @param docStore the document store instance as an object
 * @param documentHash the merkle root of a document as a hexadecimal string
 * @param signerAddr the signer address as a hexadecimal string
 * @return blockchain transaction id as a hexadecimal string
 */
allowSigner = async (docStore, documentHash, signerAddr) => {
    console.log(`${bright}${magenta}Starting Signer Approval to Document Store via OA Document Store...${reset}`);
    try {
        var tx = await docStore.allowSigner(documentHash, signerAddr);
        console.log(`${blue}Signer Approval to Document Store sent with Tx Hash, ${bright}${tx.hash}${reset}${blue}, awaiting completion...${reset}`);
        var receipt = await tx.wait();
        if (await documentSigner(docStore, documentHash) != signerAddr) throw new Error(`Signer Approval to document store unsuccessful!`);
        console.log(`${green}Signer Approval to Document Store successful, Tx Hash: ${bright}${receipt.transactionHash}${reset}${green}!${reset}`);
        return receipt.transactionHash;
    } catch (error) {
        console.log(`${bright}${red}Failed to approve signer to document store!${reset}`);
        throw error;
    }
}

/**
 * @info signs a document via a document store
 * @dev {documentHash} must have `0x` in front of itK
 * @dev only the approved signer can call this function
 * @dev only document that is issued previously can be signed
 * @dev only document that is revoked previously can be signed
 * @dev only document that is not signed previously can be signed
 * @param docStore the document store instance as an object
 * @param documentHash the merkle root of a document as a hexadecimal string
 * @return blockchain transaction id as a hexadecimal string
 */
sign = async (docStore, documentHash) => {
    console.log(`${bright}${magenta}Starting Document Signing to Document Store via OA Document Store...${reset}`);
    try {
        var tx = await docStore.sign(documentHash);
        console.log(`${blue}Document Signing to Document Store sent with Tx Hash, ${bright}${tx.hash}${reset}${blue}, awaiting completion...${reset}`);
        var receipt = await tx.wait();
        if (await documentSigned(docStore, documentHash) == 0) throw new Error(`Document Signing to document store unsuccessful!`);
        console.log(`${green}Document Signing to Document Store successful, Tx Hash: ${bright}${receipt.transactionHash}${reset}${green}!${reset}`);
        return receipt.transactionHash;
    } catch (error) {
        console.log(`${bright}${red}Failed to sign document to document store!${reset}`);
        throw error;
    }
}

/**
 * @info retrieves the block number that a document was issued
 * @dev {documentHash} must have `0x` in front of it
 * @param docStore the document store instance as an object
 * @param documentHash the merkle root of a document as an array of hexadecimal strings
 * @return issuance block number as an integer
 */
getIssuedBlock = async (docStore, documentHash) => {
    console.log(`${bright}${magenta}Starting Retrieval of Issuance Block Number via OA Document Store...${reset}`);
    try {
        var issuedBlock = parseInt(await docStore.getIssuedBlock(documentHash));
        console.log(`${green}Document was issued at Block Number ${bright}${issuedBlock}${reset}${green}!${reset}`);
        return issuedBlock;
    } catch (error) {
        console.log(`${bright}${red}Failed to retrieve issuance block number!${reset}`);
        throw error;
    }
}

/**
 * @info verify if a document is issued via the document store
 * @dev {documentHash} must have `0x` in front of it
 * @param docStore the document store instance as an object
 * @param documentHash the merkle root of a document as an array of hexadecimal strings
 * @return issuance status as a boolean
 */
isIssued = async (docStore, documentHash) => {
    console.log(`${bright}${magenta}Starting Verification of Issuance Status via OA Document Store...${reset}`);
    try {
        var isIssued = await docStore.isIssued(documentHash);
        console.log(`${green}Issuance Status of Document is ${bright}${isIssued}${reset}${green}!${reset}`);
        return isIssued;
    } catch (error) {
        console.log(`${bright}${red}Failed to verify issuance status!${reset}`);
        throw error;
    }
}

/**
 * @info verify if a document is revoked via the document store
 * @dev {documentHash} must have `0x` in front of it
 * @param docStore the document store instance as an object
 * @param documentHash the merkle root of a document as an array of hexadecimal strings
 * @return revocation status as a boolean
 */
isRevoked = async (docStore, documentHash) => {
    console.log(`${bright}${magenta}Starting Verification of Revocation Status via OA Document Store...${reset}`);
    try {
        var isRevoked = await docStore.isRevoked(documentHash);
        console.log(`${green}Revocation Status of Document is ${bright}${isRevoked}${reset}${green}!${reset}`);
        return isRevoked;
    } catch (error) {
        console.log(`${bright}${red}Failed to verify revocation status!${reset}`);
        throw error;
    }
}

/**
 * @info verify if a document is issued before a certain block number via the document store
 * @dev {documentHash} must have `0x` in front of it
 * @param docStore the document store instance as an object
 * @param documentHash the merkle root of a document as an array of hexadecimal strings
 * @param blockNumber the blockchain block number as an integer or string
 * @return issuance status as a boolean
 */
isIssuedBefore = async (docStore, documentHash, blockNumber) => {
    console.log(`${bright}${magenta}Starting Verification of Issuance Status via OA Document Store...${reset}`);
    try {
        var isIssuedBefore = await docStore.isIssuedBefore(documentHash, blockNumber);
        if (isIssuedBefore) console.log(`${green}Document is issued before Block Number ${bright}${blockNumber}${reset}${green}!${reset}`);
        else console.log(`${green}Document is not issued before Block Number ${bright}${blockNumber}${reset}${green}!${reset}`);
        return isIssuedBefore;
    } catch (error) {
        console.log(`${bright}${red}Failed to verify issuance status!${reset}`);
        throw error;
    }
}

/**
 * @info verify if a document is revoked before a certain block number via the document store
 * @dev {documentHash} must have `0x` in front of it
 * @param docStore the document store instance as an object
 * @param documentHash the merkle root of a document as an array of hexadecimal strings
 * @param blockNumber the blockchain block number as an integer or string
 * @return issuance status as a boolean
 */
isRevokedBefore = async (docStore, documentHash, blockNumber) => {
    console.log(`${bright}${magenta}Starting Verification of Revocation Status via OA Document Store...${reset}`);
    try {
        var isRevokedBefore = await docStore.isRevokedBefore(documentHash, blockNumber);
        if (isRevokedBefore) console.log(`${green}Document is revoked before Block Number ${bright}${blockNumber}${reset}${green}!${reset}`);
        else console.log(`${green}Document is not revoked before Block Number ${bright}${blockNumber}${reset}${green}!${reset}`);
        return isRevokedBefore;
    } catch (error) {
        console.log(`${bright}${red}Failed to verify revocation status!${reset}`);
        throw error;
    }
}

/**
 * @info retrieves the block number that a document was issued
 * @dev {documentHash} must have `0x` in front of it
 * @param docStore the document store instance as an object
 * @param documentHash the merkle root of a document as an array of hexadecimal strings
 * @return issuance block number as an integer
 */
documentIssued = async (docStore, documentHash) => {
    console.log(`${bright}${magenta}Starting Retrieval of Issuance Block Number via OA Document Store...${reset}`);
    try {
        var issuedBlkNo = parseInt(await docStore.documentIssued(documentHash));
        console.log(`${green}Document was issued at Block Number ${bright}${issuedBlkNo}${reset}${green}!${reset}`);
        return issuedBlkNo;
    } catch (error) {
        console.log(`${bright}${red}Failed to retrieve issuance block number!${reset}`);
        throw error;
    }
}

/**
 * @info retrieves the block number that a document was issued
 * @dev {documentHash} must have `0x` in front of it
 * @param docStore the document store instance as an object
 * @param documentHash the merkle root of a document as an array of hexadecimal strings
 * @return revocation block number as an integer
 */
documentRevoked = async (docStore, documentHash) => {
    console.log(`${bright}${magenta}Starting Retrieval of Revocation Block Number via OA Document Store...${reset}`);
    try {
        var issuedBlkNo = parseInt(await docStore.documentRevoked(documentHash));
        console.log(`${green}Document was revoked at Block Number ${bright}${issuedBlkNo}${reset}${green}!${reset}`);
        return issuedBlkNo;
    } catch (error) {
        console.log(`${bright}${red}Failed to retrieve revocation block number!${reset}`);
        throw error;
    }
}

/**
 * @info retrieves the signer address of a document
 * @dev {documentHash} must have `0x` in front of it
 * @param docStore the document store instance as an object
 * @param documentHash the merkle root of a document as an array of hexadecimal strings
 * @return signer address as a hexadecimal string
 */
documentSigner = async (docStore, documentHash) => {
    console.log(`${bright}${magenta}Starting Retrieval of Document Signer via OA Document Store...${reset}`);
    try {
        var signerAddr = await docStore.documentSigner(documentHash);
        console.log(`${green}Document Signer is ${bright}${signerAddr}${reset}${green}!${reset}`);
        return signerAddr;
    } catch (error) {
        console.log(`${bright}${red}Failed to retrieve document signer!${reset}`);
        throw error;
    }
}

/**
 * @info retrieves the block number that a document was signed
 * @dev {documentHash} must have `0x` in front of it
 * @param docStore the document store instance as an object
 * @param documentHash the merkle root of a document as an array of hexadecimal strings
 * @return signed block number as an integer
 */
documentSigned = async (docStore, documentHash) => {
    console.log(`${bright}${magenta}Starting Retrieval of Signed Document Block Number via OA Document Store...${reset}`);
    try {
        var signedBlkNo = parseInt(await docStore.documentSigned(documentHash));
        console.log(`${green}Document was signed at Block Number ${bright}${signedBlkNo}${reset}${green}!${reset}`);
        return signedBlkNo;
    } catch (error) {
        console.log(`${bright}${red}Failed to retrieve signed document block number!${reset}`);
        throw error;
    }
}

/**
 * @info retrieves the document store name
 * @param docStore the document store instance as an object
 * @return document store name as a string
 */
documentStoreName = async (docStore) => {
    console.log(`${bright}${magenta}Starting Retrieval of Document Store Name via OA Document Store...${reset}`);
    try {
        var docStoreName = await docStore.name();
        console.log(`${green}Document Store Name is ${bright}${docStoreName}${reset}${green}!${reset}`);
        return docStoreName;
    } catch (error) {
        console.log(`${bright}${red}Failed to retrieve document store name!${reset}`);
        throw error;
    }
}
exports.documentStoreName = documentStoreName;

/**
 * @info retrieves the document store version
 * @param docStore the document store instance as an object
 * @return document store version as a string
 */
documentStoreVersion = async (docStore) => {
    console.log(`${bright}${magenta}Starting Retrieval of Document Store Version via OA Document Store...${reset}`);
    try {
        var docStoreVersion = await docStore.version();
        console.log(`${green}Document Store Version is ${bright}${docStoreVersion}${reset}${green}!${reset}`);
        return docStoreVersion;
    } catch (error) {
        console.log(`${bright}${red}Failed to retrieve document store version!${reset}`);
        throw error;
    }
}

/**
 * @info retrieves the mapping address of the document store
 * @param docStore the document store instance as an object
 * @return mapping address as a hexadecimal string
 */
docStoreMapping = async (docStore) => {
    console.log(`${bright}${magenta}Starting Retrieval of Document Store Mapping Contract via OA Document Store...${reset}`);
    try {
        var docStoreMapping = await docStore.docStoreMapping();
        console.log(`${green}Document Store Mapping Contract Address is ${bright}${docStoreMapping}${reset}${green}!${reset}`);
        return docStoreMapping;
    } catch (error) {
        console.log(`${bright}${red}Failed to retrieve document store mapping contract!${reset}`);
        throw error;
    }
}

/**
 * @info retrieves the document store address of a signer and document
 * @dev {documentHash} must have `0x` in front of it
 * @param docStoreMapping the document store mapping instance as an object
 * @param documentHash the merkle root of a document as an array of hexadecimal strings
 * @param signerAddr the signer address as a hexadecimal string
 * @return document store address as a hexadecimal string
 */
mappings = async (docStoreMapping, documentHash, signerAddr) => {
    console.log(`${bright}${magenta}Starting Retrieval of Document Store Contract via OA Document Store...${reset}`);
    try {
        var docStore = await docStoreMapping.mappings(signerAddr, documentHash);
        console.log(`${green}Document Store Contract Address is ${bright}${docStore}${reset}${green}!${reset}`);
        return docStore;
    } catch (error) {
        console.log(`${bright}${red}Failed to retrieve document store contract!${reset}`);
        throw error;
    }
}

/**
 * @info transfers the ownership of the document store
 * @dev only the document store owner can call this function
 * @param ownable the ownable contract instance as an object
 * @param newOwnerAddr the new owner address as a hexadecimal string
 * @return blockchain transaction id as a hexadecimal string
 */
transferOwnership = async (ownable, newOwnerAddr) => {
    console.log(`${bright}${magenta}Starting Transfering of Owner to Document Store via OA Document Store...${reset}`);
    try {
        var tx = await ownable.transferOwnership(newOwnerAddr);
        console.log(`${blue}Transfering of Owner to Document Store sent with Tx Hash, ${bright}${tx.hash}${reset}${blue}, awaiting completion...${reset}`);
        var receipt = await tx.wait();
        if (await owner(ownable) != newOwnerAddr) throw new Error(`Transfering of Owner to document store unsuccessful!`);
        console.log(`${green}Transfering of Owner to Document Store successful, Tx Hash: ${bright}${receipt.transactionHash}${reset}${green}!${reset}`);
        return receipt.transactionHash;
    } catch (error) {
        console.log(`${bright}${red}Failed to transfer owner to document store!${reset}`);
        throw error;
    }
}

/**
 * @info transfers the ownership of the document store
 * @dev only the document store owner can call this function
 * @param ownable the ownable contract instance as an object
 * @return blockchain transaction id as a hexadecimal string
 */
renounceOwnership = async (ownable) => {
    console.log(`${bright}${magenta}Starting Renouncement of Owner to Document Store via OA Document Store...${reset}`);
    try {
        var tx = await ownable.renounceOwnership();
        console.log(`${blue}Renouncement of Owner to Document Store sent with Tx Hash, ${bright}${tx.hash}${reset}${blue}, awaiting completion...${reset}`);
        var receipt = await tx.wait();
        if (await owner(ownable) != ZERO_ADDRESS) throw new Error(`Renouncement of Owner to document store unsuccessful!`);
        console.log(`${green}Renouncement of Owner to Document Store successful, Tx Hash: ${bright}${receipt.transactionHash}${reset}${green}!${reset}`);
        return receipt.transactionHash;
    } catch (error) {
        console.log(`${bright}${red}Failed to renounce owner to document store!${reset}`);
        throw error;
    }
}

/**
 * @info retrieves the mapping address of the document store
 * @param ownable the ownable contract instance as an object
 * @return mapping address as a hexadecimal string
 */
owner = async (ownable) => {
    console.log(`${bright}${magenta}Starting Retrieval of Document Store Owner via OA Document Store...${reset}`);
    try {
        var ownerAddr = await ownable.owner();
        console.log(`${green}The owner of the Document Store is ${bright}${ownerAddr}${reset}${green}!${reset}`);
        return ownerAddr;
    } catch (error) {
        console.log(`${bright}${red}Failed to retrieve document store owner!${reset}`);
        throw error;
    }
}

module.exports = {
    connectDocumentStore,
    issue,
    bulkIssue,
    revoke,
    bulkRevoke,
    allowSigner,
    sign,
    getIssuedBlock,
    isIssued,
    isRevoked,
    isIssuedBefore,
    isRevokedBefore,
    documentIssued,
    documentRevoked,
    documentSigner,
    documentSigned,
    documentStoreName,
    documentStoreVersion,
    docStoreMapping,
    mappings,
    transferOwnership,
    renounceOwnership,
    owner,
}