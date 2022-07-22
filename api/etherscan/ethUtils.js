/*jshint esversion: 8 */
/* jshint -W117 */
/* jshint -W097 */
"use strict";
const ethers = require("ethers");
const endpoint = require('../common/endpoint');


module.exports._addressTokenNFTBalance = async (address, page, offset) => {
    try {
        const response = await endpoint._get(`${process.env.ETHERSCAN_API_URL}?module=account&action=addresstokennftbalance&address=${address}&page=1&offset=100apikey=${process.env.API_KEY_TOKEN}`);
        return response.data;
    } catch (e) {
        console.error(e);
    }
};

module.exports._addressTokenNFTInventory = async (address, contractaddress, page, offset) => {
    try {
        const response = await endpoint._get(`${process.env.ETHERSCAN_API_URL}?module=account&action=addresstokennftinventory&address=${address}&contractaddress=${contractaddress}&page=1&offset=100apikey=${process.env.API_KEY_TOKEN}`);
        return response.data;
    } catch (e) {
        console.error(e);
    }
};

/**
 * Returns transactions by hash
 *
 * @author Allyn j. Alford <Allyn@tenablylabs.com>
 * @async
 * @function _txListInternal
 * @param {String} txhash - ethereum tx hash
 * @return {Promise<Array>} Response Array for next step to process.
 */
 module.exports._txListInternal = async (txhash) => {
    try {
        const response = await endpoint._get(`${process.env.ETHERSCAN_API_URL}?module=account&action=txlistinternal&txhash=${txhash}&apikey=${process.env.API_KEY_TOKEN}`);
        return response.data;
    } catch (e) {
        console.error(e);
    }
};

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
        const response = await endpoint._get(`${process.env.ETHERSCAN_API_URL}?module=account&action=tokennfttx&contractaddress=${contractaddress}&address=${address}&sort=asc&apikey=${process.env.API_KEY_TOKEN}`);
        return response.data;
    } catch (e) {
        console.error(e);
    }
};

/**
 * get an Ethereum latest price
 *
 * @author Allyn j. Alford <Allyn@tenablylabs.com>
 * @async
 * @function _ethPrice
 * @return {Promise<Array>} Response Array for next step to process.
 */
 module.exports._ethPrice = async () => {
    try {
         const response = await endpoint._get(`${process.env.ETHERSCAN_API_URL}?module=stats&action=ethprice&apikey=${process.env.API_KEY_TOKEN}`);
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
         const response = await endpoint._get(`${process.env.ETHERSCAN_API_URL}?module=stats&action=ethdailyprice&startdate=${startdate}&enddate=${enddate}&sort=asc&apikey=${process.env.API_KEY_TOKEN}`);
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

module.exports._getWeb3Provider = async (provider) => {
    try {

        var Web3 = require('web3');
        //var web3Provider = new Web3.providers.HttpProvider(provider);
        var web3 = new Web3(provider);


        //const Web3 = require('web3');
        //const provider = Web3.HTTPProvider("https://aged-wild-sun.discover.quiknode.pro/22d04687857eddacbc7d24f70b51106bcf679686/")
        //var web3 = new Web3(provider);
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

   /**
 * Returns NFT transaction data
 *
 * @author Allyn j. Alford <Allyn@tenablylabs.com>
 * @async
 * @function _getNftTxs
 * @param {String} owner - nft owner ethereum wallet address
 * @param {String} contractAddressTokenId - NFT Contract Address combined with tokenId
 * @return {Promise<Array>} Response Array for next step to process.
 */
    module.exports._getNftTxs  = async (owner, contractAddressTokenId) => {
        try {
            const dynamo = require('../common/dynamo');
            const assets = await dynamo.qetFromDB({
                TableName: process.env.DYNAMODB_TABLE_WALLET_NFT_TX,
                Key: {
                    owner,
                    contractAddressTokenId
                }
            });
          return assets;
        } catch (e) {
          console.error(e);
          throw e;
        }
      };

         /**
 * Add NFT transaction
 *
 * @author Allyn j. Alford <Allyn@tenablylabs.com>
 * @async
 * @function _addNftTx
 * @param {String} owner - nft owner ethereum wallet address
 * @param {String} contractAddressTokenId - NFT Contract Address combined with tokenId
 * @param {Number} cost
 * @param {Number} value
 * @param {Number} gasUsed
 * @return {Promise<Array>} Response Array for next step to process.
 */
    module.exports._addNftTx = async (owner, contractAddressTokenId, result) => {
      try {
        const dynamo = require('../common/dynamo');
        const dateformat = require("dateformat");
        return await dynamo.saveItemInDB({
          TableName: process.env.DYNAMODB_TABLE_WALLET_NFT_TX,
          Item: {
            owner,
            contractAddressTokenId,
            result,
            dt: dateformat(new Date(), "isoUtcDateTime"),
            timestamp: new Date().getTime(),
          },
        });
      } catch (e) {
        console.error(e);
        throw e;
      }
    };


       /**
 * Returns Wallet NFT data
 *
 * @author Allyn j. Alford <Allyn@tenablylabs.com>
 * @async
 * @function _getWalletNFT
 * @param {String} owner - nft owner ethereum wallet address
 * @param {String} contractAddressTokenId - NFT Contract Address combined with tokenId
 * @return {Promise<Array>} Response Array for next step to process.
 */

module.exports._getWalletNFT = async (owner, contractAddressTokenId) => {
    try {
        const dynamo = require('../common/dynamo');
        return await dynamo.queryDB({
            TableName: process.env.DYNAMODB_TABLE_WALLET_NFT,
            IndexName: 'InstanceIdIndex',
            KeyConditionExpression: "#owner = :owner and #contractAddressTokenId = :contractAddressTokenId",
            ExpressionAttributeNames: {
                "#owner": "owner",
                "#contractAddressTokenId": "contractAddressTokenId"
            },
            ExpressionAttributeValues: {
                ":owner": owner,
                ":contractAddressTokenId": contractAddressTokenId
            },
        });

    } catch (e) {
        console.error(e.message);
        throw e;
    }
};
    
             /**
     * Add NFT transaction
     *
     * @author Allyn j. Alford <Allyn@tenablylabs.com>
     * @async
     * @function _addNftTx
     * @param {String} owner - nft owner ethereum wallet address
     * @param {String} contractAddressTokenId - NFT Contract Address combined with tokenId
     * @param {Number} costETH
     * @param {Number} costUSD
     * @param {Number} valueUSD
     * @param {Number} valueETH
     * @param {Number} ethTransPriceUSD
     * @param {String} hash
     * @return {Promise<Array>} Response Array for next step to process.
     */
        module.exports._addWalletNFT = async (chain, owner, contractAddressTokenId, costETH, costUSD, valueUSD, valueETH, ethTransPriceUSD, hash) => {
          try {
            const dynamo = require('../common/dynamo');
            const dateformat = require("dateformat");
            return await dynamo.saveItemInDB({
              TableName: process.env.DYNAMODB_TABLE_WALLET_NFT,
              Item: {
                chain,
                owner,
                contractAddressTokenId,
                costETH, 
                costUSD, 
                valueUSD, 
                valueETH, 
                ethTransPriceUSD, 
                hash,
                createdatetime: dateformat(new Date(), "isoUtcDateTime"),
                timestamp: new Date().getTime(),
              },
            });
          } catch (e) {
            console.error(e);
            throw e;
          }
        };