// import dependencies
const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);
const {
    getDefaultProvider,
    Wallet,
    Contract,
} = require(`ethers`);

// import console log css
const { reset, bright, white, red, blue, magenta, green } = require('./console-log-display.js');

/**
 * @info creates an ethers provider instance
 * @param providerURL the rpc url to connect to the blockchain as an url string
 * @param networkId the network id of the blockchain to connect to as a string or integer
 * @return ethers provider instance as an object
 */
getProvider = async (providerURL, networkId) => {
    var provider = getDefaultProvider(providerURL);
    var network = await provider.getNetwork();
    if (network.chainId != networkId || network.chainId != parseInt(networkId)) throw new Error(`RPC URL and Network ID doesn't match!`);
    return provider;
}

/**
 * @info creates an ethers wallet instance
 * @dev if {isRandom} is true, {privateKey} do not have to be provided
 * @param isRandom indicate if the wallet should be randomly generated as an boolean
 * @param provider an ethers provider instance as an object
 * @param privateKey the private key as a hexadecimal string
 * @return ethers wallet instance as an object
 */
createWallet = async (isRandom, provider, privateKey) => {
    console.log(`${bright}${magenta}Starting Creation of a wallet via Ethers...${reset}`);
    var wallet;
    if (isRandom) {
        randomWallet = Wallet.createRandom();
        wallet = new Wallet(randomWallet.privateKey, provider);
    }
    else wallet = new Wallet(privateKey, provider);
    console.log(`${green}Wallet successfully created!${reset}`);
    return wallet;
}

/**
 * @info creates a keypair with an ethers wallet instance
 * @param wallet an ethers wallet instance as an object
 * @return public and private keys as an object
 */
walletToKeypair = async (wallet) => {
    var keypair = {
        public: `did:ethr:${wallet.address}#controller`,
        private: wallet.privateKey,
    };
    return keypair;
}

/**
 * @info creates a temporary DNS record in OpenAttestation sandbox
 * @dev if {isDID} is true, {networkId} do not have to be provided
 * @param isDID indicate if issurance will be via DID as an boolean
 * @param walletAddr the issuer wallet address as a hexadecimal string
 * @param networkId the network Id as a string or integer
 * @return DNS text record as an url string
 */
createTempDNSRecord = async (isDID, walletAddr, networkId) => {
    console.log(`${bright}${magenta}Starting Creation of a temporary DNS Record via OpenAttestation...${reset}`);
    return new Promise(async resolve => {
        if (!isDID) {
            var command = `open-attestation dns txt-record create --address ${walletAddr} --network-id ${networkId}`;
            var { error, stdout, stderr } = await exec(command);
            if (error) {
                console.log(`${red}Temporary DNS Record creation failed!${reset}`);
                throw error;
            }
            console.log(`${green}Temporary DNS Record successfully created!${reset}`);
            var split = stdout.split(' ')
            resolve(split[8]);
        }
        else {
            var command = `open-attestation dns txt-record create --public-key did:ethr:${walletAddr}#controller`;
            var { error, stdout, stderr } = await exec(command);
            if (error) {
                console.log(`${red}Temporary DNS Record creation failed!${reset}`);
                throw error;
            }
            console.log(`${green}Temporary DNS Record successfully created!${reset}`);
            var split = stdout.split(' ')
            resolve(split[8]);
        }
    })
}

/**
 * @info creates a contract instance for contract interaction
 * @dev {wallet} is optional if the instance will only be for read-only methods
 * @param address the contract address as a hexadecimal string
 * @param abi the contract abi as an array of objects
 * @param wallet optional, an ethers wallet instance as an object
 * @return contract instance as an object
 */
getContractInstance = async (address, abi, wallet) => {
    console.log(`${bright}${magenta}Starting Creation of Contract Instance via Ethers...${reset}`);
    try {
        var factory = await new Contract(address, abi, wallet);
        console.log(`${green}Contract instance successfully created!${reset}`);
        return factory;
    } catch (error) {
        console.log(`${red}Creation of contract instance failed!${reset}`);
        throw error;
    }
}

/**
 * @info retrieves the Document Store contract address
 * @param docFactoryInstance the Document Factory contract instance as an object
 * @param walletAddr the issuer wallet address as a hexadecimal string
 * @return Document Store contract address as a hexadecimal string
 */
getDocumentStoreAddr = async (docFactoryInstance, walletAddr) => {
    console.log(`${bright}${magenta}Starting Retrieval of Document Store Contract Address via Ethers...${reset}`);
    try {
        var docStoreAddr = await docFactoryInstance.assets(walletAddr);
        console.log(`${green}Document Store contract address successfully retrieved!${reset}`);
        return docStoreAddr;
    } catch (error) {
        console.log(`${red}Retrieval of Document Store contract address failed!${reset}`);
        throw error;
    }
}

/**
 * @info deploys a Document Store contract
 * @param docFactoryInstance the Document Factory contract instance as an object
 * @param docStoreName the Document Store name as a string
 * @return deployment result as a boolean
 */
deployDocumentStore = async (docFactoryInstance, docStoreName) => {
    console.log(`${bright}${magenta}Starting Deployment of Document Store contract via Ethers...${reset}`);
    return new Promise(async resolve => {
        try {
            var tx = await docFactoryInstance.deployDocStore(docStoreName);
            console.log(`${blue}Document Store contract deployed with Tx Hash, ${bright}${tx.hash}${reset}${blue}, awaiting completion...${reset}`);
            var receipt = await tx.wait();
            console.log(`${green}Document Store contract successfully deployed, Tx Hash: ${bright}${receipt.transactionHash}${reset}${green}!${reset}`);
            resolve(true);
        } catch (error) {
            console.log(`${red}Deployment of Document Store contract failed!${reset}`);
            throw error;
        }
    })
}

/**
 * @info creates a raw OpenAttestation document
 * @dev {type} 1 is document store issuance, 2 is did issuance with no revocation, 3 is did issuance with document store revocation, 4 is did issuance with ocsp revocation
 * @param type the document permutation as an integer
 * @param document the OpenAttestation conformance document as an object
 * @param options the issuer metadata as an object
 * @return raw OpenAttestation document as an object
 */
createRawDocument = async (type, document, options) => {
    console.log(`${bright}${magenta}Starting Creation of Raw Document...${reset}`);
    var rawDocument;
    switch (type) {
        case 1:
            rawDocument = {
                ...document,
                issuers: [
                    {
                        "name": options.name,
                        "documentStore": options.docStoreAddr,
                        "identityProof": {
                            "type": `DNS-TXT`,
                            "location": options.dns
                        }
                    }
                ],
            }
            break;
        case 2:
            rawDocument = {
                ...document,
                issuers: [
                    {
                        "id": `did:ethr:${options.walletAddr}`,
                        "name": options.name,
                        "revocation": {
                            "type": `NONE`
                        },
                        "identityProof": {
                            "type": `DNS-DID`,
                            "location": options.dns,
                            "key": `did:ethr:${options.walletAddr}#controller`
                        }
                    }
                ],
            }
            break;
        case 3:
            rawDocument = {
                ...document,
                issuers: [
                    {
                        "id": `did:ethr:${options.walletAddr}`,
                        "name": "Demo Issuer",
                        "revocation": {
                            "type": "REVOCATION_STORE",
                            "location": options.docStoreAddr
                        },
                        "identityProof": {
                            "type": "DNS-DID",
                            "location": options.dns,
                            "key": `did:ethr:${options.walletAddr}#controller`
                        }
                    }
                ],
            }
            break;
        case 4:
            rawDocument = {
                ...document,
                issuers: [
                    {
                        "id": `did:ethr:${options.walletAddr}`,
                        "name": "Demo Issuer",
                        "revocation": {
                            "type": "OCSP_RESPONDER",
                            "location": options.ocsp
                        },
                        "identityProof": {
                            "type": "DNS-DID",
                            "location": options.dns,
                            "key": `did:ethr:${options.walletAddr}#controller`
                        }
                    }
                ],
            }
            break;
        default:
            throw new Error(`${red}Invalid Raw Document type!${reset}`);
            break;
    }
    console.log(`${green}Raw Document successfully created!${reset}`);
    return rawDocument;
}

module.exports = {
    getProvider,
    createWallet,
    walletToKeypair,
    createTempDNSRecord,
    getContractInstance,
    getDocumentStoreAddr,
    deployDocumentStore,
    createRawDocument,
}