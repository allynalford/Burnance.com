/*jshint esversion: 8 */
/* jshint -W117 */
/* jshint -W097 */
const ethers = require("ethers");


module.exports._is721 = async (tokenAddress) => {
    try {
    //Grab an ABI
    const ERC721 = require('../abis/ERC721.json');
    //Grab a provider
    const provider = await this._getProvider(process.env.REACT_APP_NODE);

    //Use the provider and key to grab the wallet
    const wallet = await etherScan._createWallet(process.env.REACT_APP_NODE_KEY, provider);

    //Check the type using ERC721 ABI to start
    let contract = await etherScan._getContract(tokenAddress, ERC721, wallet);

    //Check if it's a ERC721 (0x80ac58cd) | ERC1155 (0xd9b67a26)
    const is721 = await contract.supportsInterface(0x80ac58cd);

    return is721

    } catch (e) {
        console.error(e);
    }
};

module.exports._is1155 = async (tokenAddress) => {
    try {
    //Grab an ABI
    const ERC1155 = require('../abis/ERC1155.json');
    //Grab a provider
    const provider = await this._getProvider(process.env.REACT_APP_NODE);

    //Use the provider and key to grab the wallet
    const wallet = await etherScan._createWallet(process.env.REACT_APP_NODE_KEY, provider);

    //Check the type using ERC721 ABI to start
    let contract = await etherScan._getContract(tokenAddress, ERC1155, wallet);

    //Check if it's a ERC721 (0x80ac58cd) | ERC1155 (0xd9b67a26)
    const is1155 = await contract.supportsInterface(0xd9b67a26);



    return is1155

    } catch (e) {
        console.error(e);
    }
};


module.exports._getProvider = async (node) => {
    try {
        const provider = new ethers.providers.WebSocketProvider(node);
        return provider;
    } catch (e) {
        console.error(e);
    }
};

module.exports._getWeb3Provider = async (provider) => {
    try {

        var Web3 = require('web3');
        //var web3Provider = new Web3.providers.HttpProvider(provider);
        var web3 = new Web3(provider);
        return web3;
    } catch (e) {
        console.error(e);
    }
};
module.exports._getContract = async (contractAddress, abi, wallet) => {
    try {
     let contract = new ethers.Contract(contractAddress, abi, wallet);
     return contract;
    } catch (e) {
        console.error(e);
    }
};
module.exports._createWallet = async (privatekey, provider) => {
    try {
        const wallet = new ethers.Wallet(privatekey, provider);
        // print the wallet address
        console.log("Using wallet address " + wallet.address);
        return wallet;
    } catch (e) {
        console.error(e);
    }
};

module.exports._tokenURI = async (contract, tokenId) => {
    try {
     let tokenURI = await contract.tokenURI(tokenId);
     return tokenURI;
    } catch (e) {
        console.error(e);
        return "";
    }
};
