/*jshint esversion: 8 */
/* jshint -W117 */
/* jshint -W097 */
"use strict";
const ethers = require("ethers");
const endpoint = require('../common/endpoint');

/**
 * Returns the ERC-721 token inventory of an address, filtered by contract address. This endpoint is throttled to 2 calls/second regardless of API Pro tier.
 *
 * @author Allyn j. Alford <Allyn@tenablylabs.com>
 * @async
 * @function _addressTokenNftInventory
 * @param {String} contractAddress - ethereum contract address
 * @param {String} address - ethereum wallet address
 * @return {Promise<Array>} Response Array for next step to process.
 */
 module.exports._addressTokenNftInventory = async (contractaddress, address) => {
    try {
        const response = await endpoint._get(`${process.env.ETHERSCAN_API_URL}?module=account&action=tokennfttx$contractaddress=${contractaddress}&address=${address}&sort=asc&apikey=${process.env.API_KEY_TOKEN}`);
        return response.data;
    } catch (e) {
        console.error(e);
    }
};

/**
 * get an Ethereum token transactions by Contract address and wallet address
 *
 * @author Allyn j. Alford <Allyn@tenablylabs.com>
 * @async
 * @function _tokenNftTx
 * @param {String} contractAddress - ethereum contract address
 * @param {String} address - ethereum wallet address
 * @return {Promise<Array>} Response Array for next step to process.
 */
 module.exports._tokenNftTx = async (contractaddress, address) => {
    try {
        const response = await endpoint._get(`${process.env.ETHERSCAN_API_URL}?module=account&action=tokennfttx$contractaddress=${contractaddress}&address=${address}&sort=asc&apikey=${process.env.API_KEY_TOKEN}`);
        return response.data;
    } catch (e) {
        console.error(e);
    }
};

/**
 * get an Ethereum price by start and end date
 *
 * @author Allyn j. Alford <Allyn@tenablylabs.com>
 * @async
 * @function _ethDailyPrice
 * @param {String} startdate - start date
 * @param {String} enddate - end date
 * @return {Promise<Array>} Response Array for next step to process.
 */
module.exports._ethDailyPrice = async (startdate, enddate) => {
    try {
        const response = await endpoint._get(`${process.env.ETHERSCAN_API_URL}?module=stats&action=ethdailyprice$startdate=${startdate}&enddate=${enddate}&sort=asc&apikey=${process.env.API_KEY_TOKEN}`);
        return response.data;
    } catch (e) {
        console.error(e);
    }
};

/**
 * get an Ethereum Contract ABI by contract address
 *
 * @author Allyn j. Alford <Allyn@tenablylabs.com>
 * @async
 * @function _getContractAbi
 * @param {String} contractAddress - Array representing a Store Action
 * @return {Promise<Array>} Response Array for next step to process.
 */
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