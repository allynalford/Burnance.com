/*jshint esversion: 8 */
/* jshint -W117 */
/* jshint -W097 */
"use strict";
const ethers = require("ethers");
const endpoint = require('../common/endpoint');
module.exports._getContractAbi = async (contractAddress) => {
    try {
        const response = await endpoint._get(`${process.env.ETHERSCAN_API_URL}?${process.env.ETHERSCAN_ABI_PARAMS}&address=${contractAddress}&apikey=${process.env.API_KEY_TOKEN}`);
        return response.data;
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