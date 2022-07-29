/*jshint esversion: 8 */
/* jshint -W117 */
/* jshint -W097 */
"use strict";
const ethers = require("ethers");


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
