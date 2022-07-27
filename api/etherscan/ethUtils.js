/*jshint esversion: 8 */
/* jshint -W117 */
/* jshint -W097 */
"use strict";
const ethers = require("ethers");
const endpoint = require('../common/endpoint');
const dateformat = require("dateformat");

/**
 * returns transaction data about the purchase of the NFT
 *
 * @author Allyn j. Alford <Allyn@tenablylabs.com>
 * @async
 * @function getNFTtx
 * @param {String} chain - ethereum blockchain (for now)
 * @param {String} address - ethereum wallet address
 * @param {String} contractAddress - ethereum contract address
 * @param {String} tokenId - unique identifier for the NFT within the collection
 * @return {Promise<Array>} Response Array for next step to process.
 */
module.exports.getNFTtx = async (chain, address, contractaddress, tokenId) => {
    let valueETH, valueUSD, costUSD, costETH, gasETH, gasUSD, etherScanTxUrl, hash, price;
    let mintTokenIds = [];
    try {

        //Check if the NFT already exists for this wallet
        const NFT = await this._getWalletNFT(address, contractaddress + tokenId);

        console.log('NFT Exists',NFT);

        if (typeof NFT !== "undefined" && NFT.length !== 0) {
            return NFT[0];
        };

        //Check if the data already exists
        let tokenNftTx = await this._getNftTxs(address, contractaddress + tokenId);

        console.log('tokenNftTx Exists? ', tokenNftTx);

        if (typeof tokenNftTx === "undefined") {
            //Grab the NFT transactions from API if we don't have it
            tokenNftTx = await this._tokenNftTx(contractaddress, address);

            //What happens when i can't find the data

            if (typeof tokenNftTx.message !== "undefined" && tokenNftTx.message === "No transactions found") {
                return {
                    costETH: 0.0,
                    costUSD: 0.0,
                    valueETH: 0.0,
                    valueUSD: 0.0,
                    ethTransPriceUSD: 0.0,
                    etherScanTxUrl: "",
                    hash,
                    failed: true
                }
            };

            console.log('tokenNftTx unfiltered',tokenNftTx);

            const _ = require('lodash');

            mintTokenIds = _.uniq(_.map(tokenNftTx.result, 'tokenID'));

            tokenNftTx = _.find(tokenNftTx.result, function (o) { return o.tokenID === tokenId; });

           
            console.log('Filtered', tokenNftTx);

            //If there is multiple in the transaction, it was a multiple mint
            //this should be flagged

        }else{
            tokenNftTx = tokenNftTx.result;
        }

        
        

        hash = tokenNftTx.hash


        //Save the transactions
        await this._addNftTx(address, contractaddress + tokenId, tokenNftTx);
  
        //console.log(tokenNftTx);
  
        //Get the transaction date
        const date = new Date(tokenNftTx.timeStamp * 1000);
  
        //Calculate the dates for the price
        const startAndStop = dateformat(date, "yyyy-mm-dd");
  
        //Based on the date of the transaction, lets get the price of ETH
        price = await this._ethDailyPrice(startAndStop, startAndStop);
        //console.log('Price',price);
  
        //Create a web3 object to convert data
        var Web3 = require('web3');
        //add provider to it
        var web3 = new Web3(process.env.QUICK_NODE_HTTP);

        etherScanTxUrl = `https://etherscan.io/tx/${hash}`;

        //Grab all the transactions based on the hash
        const txs = await this._txListInternal(hash);
  
        //console.log(txs);
  
        //Loop thru the transactions and add up the values
        valueETH = 0.0, gasETH = 0.0;
        for (const tx of txs.result) {
  
          const valueToEth = web3.utils.fromWei(tx.value.toString(), 'ether');
  
          const gasToEth = web3.utils.fromWei(tx.gas.toString(), 'ether');
  
  
          valueETH = (Number(valueETH) + Number(valueToEth));//First the value
          gasETH = (Number(gasETH) + Number(gasToEth));//First the value
        };

        gasUSD = parseFloat((Number(gasETH) + 0) * price.result[0].value);

        costETH = (Number(valueETH) + Number(gasETH));//Then the transaction cost in gas

        //Convert ETH to USD based on the price of ETH on that date
        costUSD = parseFloat(costETH * price.result[0].value);
        costUSD = (Number(gasUSD.toFixed(2)) + Number(costUSD.toFixed(2)));



        valueUSD = parseFloat(valueETH * price.result[0].value);

        const saveNFT = await this._addWalletNFT(
          chain,
          address,
          contractaddress + tokenId,
          costUSD,
          costETH,
          valueUSD,
          valueETH,
          price.result[0].value,
          tokenNftTx.hash,
          mintTokenIds,
          date
        );
        console.log("saveNFT", saveNFT);
       

        //Return the data
        return {
            costETH,
            costUSD,
            valueETH,
            valueUSD,
            ethTransPriceUSD: price.result[0].value,
            etherScanTxUrl,
            hash,
            mintTokenIds,
            transactionDate: date
        }
    } catch (err) {
        console.error(err.message);
        console.error('module.exports.getNFTtx', err);
        throw err;
    }
};

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
 * Add NFT transaction
 *
 * @author Allyn j. Alford <Allyn@tenablylabs.com>
 * @async
 * @function _addNftTxHash
 * @param {String} chain - ethereum
 * @param {String} address - nft owner address
 * @param {String} hash transaction hash
 * @param {Array} result results
 * @return {Promise<Array>} Response Array for next step to process.
 */
    module.exports._addNftTxHash = async (chain, address, hash, result) => {
      try {
        const dynamo = require('../common/dynamo');
        const dateformat = require("dateformat");
        return await dynamo.saveItemInDB({
          TableName: process.env.DYNAMODB_TABLE_WALLET_TX_HASH,
          Item: {
            chainAddress: chain + '-' + address, 
            hash,
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
 * Returns NFT transaction data
 *
 * @author Allyn j. Alford <Allyn@tenablylabs.com>
 * @async
 * @function _getNftTxHash
 * @param {String} chain - ethereum
 * @param {String} address - nft owner address
 * @param {String} hash transaction hash
 * @return {Promise<Array>} Response Array for next step to process.
 */
module.exports._getNftTxHash = async (chain, address, hash) => {
    try {
        const dynamo = require('../common/dynamo');
        const assets = await dynamo.qetFromDB({
            TableName: process.env.DYNAMODB_TABLE_WALLET_TX_HASH,
            Key: {
                chainAddress: chain + '-' + address,
                hash
            }
        });
        return assets;
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
     * @param {Array} mintTokenIds
     * @param {Date} transactionDate
     * @return {Promise<Array>} Response Array for next step to process.
     */
        module.exports._addWalletNFT = async (chain, owner, contractAddressTokenId, costETH, costUSD, valueUSD, valueETH, ethTransPriceUSD, hash, mintTokenIds, transactionDate) => {
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
                mintTokenIds,
                transactionDate,
                createdatetime: dateformat(new Date(), "isoUtcDateTime"),
                timestamp: new Date().getTime(),
              },
            });
          } catch (e) {
            console.error(e);
            throw e;
          }
        };


/**
* update NFT fields
*
* @author Allyn j. Alford <Allyn@tenablylabs.com>
* @async
* @function _updateWalletNFTFields
* @param {string} chain 
* @param {string} contractAddressTokenId 
* @param {list} fields 
*/
 module.exports._updateWalletNFTFields = async (chain, contractAddressTokenId, fields) => {
    try {
      const dateFormat = require('dateformat');
      var ExpressionAttributeValues = {}, ExpressionAttributeNames = {}
      var UpdateExpression = "set #dt = :dt";
  
      for (const f of fields) {
        ExpressionAttributeValues[`:${f.name}`] = f.value;
        ExpressionAttributeNames[`#${f.name}`] = f.name;
        UpdateExpression = UpdateExpression + `, #${f.name} = :${f.name}`
      };
  
      ExpressionAttributeNames["#dt"] = "updatedAt";
      ExpressionAttributeValues[":dt"] = dateFormat(new Date(), "isoUtcDateTime");
  
      //Save the profile to dynamoDB
      return await dynamo.updateDB({
        TableName: process.env.DYNAMODB_TABLE_WALLET_NFT,
        Key: { chain, contractAddressTokenId},
        UpdateExpression,
        ExpressionAttributeValues,
        ExpressionAttributeNames,
        ReturnValues: "UPDATED_NEW"
      });
    } catch (err) {
      console.error(JSON.stringify(err));
      log.error(err);
      throw err;
    };
  };