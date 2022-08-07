/*jshint esversion: 8 */
/* jshint -W117 */
/* jshint -W097 */
/* global BigInt */
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
            tokenNftTx = _.find(tokenNftTx.result, function (o) { return o.tokenID === tokenId.toString();  });

            console.log(`Filtered by (${tokenId})`, tokenNftTx);

            //If there is multiple in the transaction, it was a multiple mint
            //this should be flagged

        }else{
            tokenNftTx = tokenNftTx.result;
        }

        
        

        //hash = tokenNftTx.hash


        //Save the transactions
        await this._addNftTx(address, contractaddress + tokenId, tokenNftTx);
  
        //console.log(tokenNftTx);
  
        //Get the transaction date
        const date = new Date(tokenNftTx.timeStamp * 1000);
  
        //Calculate the dates for the price
        const startAndStop = dateformat(date, "yyyy-mm-dd");
  
        //Based on the date of the transaction, lets get the price of ETH
        price = await this._ethDailyPrice(startAndStop, startAndStop);

        if(typeof price.result[0] === "undefined"){
            console.warn('price', price);
        }

        const ethTransPriceUSD = (typeof price.result[0] === "undefined" ? 0 : price.result[0].value);


        //Get the prices
        const gasData = await this._eth_getTransactionValueAndGasByHash(tokenNftTx.hash, ethTransPriceUSD);


        valueETH = Number(gasData.valueETH);
        valueUSD = gasData.valueUSD;


        gasUSD = gasData.gasUSD;
        gasETH = gasData.gasETH;

        gasData.closingPrice = ethTransPriceUSD;

        console.log('Add Cost ETH', (Number(valueETH) + Number(gasETH)))
        gasData.costETH = (Number(valueETH) + Number(gasETH));
        gasData.costUSD = (Number(valueUSD) + Number(gasUSD));

        costETH = gasData.costETH;
        costUSD = gasData.costUSD;

        //console.log(ethers.utils.formatEther(ethers.BigNumber.from(gasData.costETH)))
        console.log('Gas Data', gasData);


  
        // //Create a web3 object to convert data
        // var Web3 = require('web3');
        // //add provider to it
        // var web3 = new Web3(process.env.QUICK_NODE_HTTP);

        // etherScanTxUrl = `${process.env.ETHERSCAN_BASE_URL}tx/${hash}`;

        // //Grab all the transactions based on the hash
        // const txs = await this._txListInternal(hash);
        // //Grab the single result

        // //
        // const txFromHash = await this._eth_getTransactionByHash(hash);
  
        // console.log('txFromHash',txFromHash);
  
        // //Loop thru the transactions and add up the values
        // valueETH = 0.0, gasETH = 0.0;
        // for (const tx of txs.result) {
  
        //   const valueToEth = web3.utils.fromWei(tx.value.toString(), 'ether');
  
        //   const gasToEth = web3.utils.fromWei(tx.gas.toString(), 'ether');
  
  
        //   valueETH = (Number(valueETH) + Number(valueToEth));//First the value
        //   gasETH = (Number(gasETH) + Number(gasToEth));//First the value
        // };

       

        // costETH = (Number(valueETH) + Number(gasETH));//Then the transaction cost in gas


        // let ethTransPriceUSD = 0;
        // if(price.message === "OK"){
        //     valueUSD = parseFloat(valueETH * price.result[0].value);

        //     costUSD = parseFloat(costETH * price.result[0].value);
        //     costUSD = (Number(gasUSD.toFixed(2)) + Number(costUSD.toFixed(2)));
        //     gasUSD = parseFloat((Number(gasETH) + 0) * price.result[0].value);
        //     ethTransPriceUSD = price.result[0].value;
        // }else{
        //     valueUSD = 0;
        //     costUSD = 0;
        //     gasUSD = 0;
        //     ethTransPriceUSD = 0;
        // }


        const saveNFT = await this._addWalletNFTWithData(
          chain,
          address,
          contractaddress + tokenId,
          costUSD,
          costETH,
          valueUSD,
          valueETH,
          ethTransPriceUSD,
          tokenNftTx.hash,
          mintTokenIds,
          date,
          gasData
        );
        console.log("save the NFT result:", saveNFT);
       

        //Return the data
        return {
            costETH,
            costUSD,
            valueETH,
            valueUSD,
            ethTransPriceUSD: price.result[0].value,
            etherScanTxUrl,
            hash: tokenNftTx.hash,
            mintTokenIds,
            transactionDate: date,
            gasData
        }
    } catch (err) {
        console.error(err.message);
        console.error('module.exports.getNFTtx', err);
        throw err;
    }
};

/**
 * returns transaction data about the purchase of the NFT
 *
 * @author Allyn j. Alford <Allyn@tenablylabs.com>
 * @async
 * @function _addressTokenBalance
 * @param {String} address - ethereum wallet address. the string representing the address to check for balance
 * @param {String} page - the integer page number, if pagination is enabled
 * @param {String} offset - the number of transactions displayed per page
 * @return {Promise<Array>} Response Array for next step to process.
 */
module.exports._addressTokenBalance = async (address, page, offset) => {
    try {
        const response = await endpoint._get(`${process.env.ETHERSCAN_API_URL}?module=account&action=addresstokenbalance&address=${address}&page=${page}&offset=${offset}apikey=${process.env.API_KEY_TOKEN}`);
        return response.data;
    } catch (e) {
        console.error(e);
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
 * get the value paid in a transaction
 *
 * @author Allyn j. Alford <Allyn@tenablylabs.com>
 * @function _eth_getTransactionValueByHash
 * @param {String} txhash - blockchain transaction hash
 * @param {Number} price - price of ETH on date of transaction
 * @example <caption>Example .</caption>
 * @return {Promise<Object>}  Object
 * // {
 *   "jsonrpc":"2.0",
 *   "id":1,
 *   "result":{
 *     "blockHash":"0xf850331061196b8f2b67e1f43aaa9e69504c059d3d3fb9547b04f9ed4d141ab7",
 *     "blockNumber":"0xcf2420",
 *     "from":"0x00192fb10df37c9fb26829eb2cc623cd1bf599e8",
 *     "gas":"0x5208",
 *     "gasPrice":"0x19f017ef49",
 *      "maxFeePerGas":"0x1f6ea08600",
 *      "maxPriorityFeePerGas":"0x3b9aca00",
 *      "hash":"0xbc78ab8a9e9a0bca7d0321a27b2c03addeae08ba81ea98b03cd3dd237eabed44",
 *      "input":"0x",
 *      "nonce":"0x33b79d",
 *      "to":"0xc67f4e626ee4d3f272c2fb31bad60761ab55ed9f",
 *      "transactionIndex":"0x5b",
 *      "value":"0x19755d4ce12c00",
 *      "type":"0x2",
 *      "accessList":[
 *         
 *     ],
 *      "chainId":"0x1",
 *     "v":"0x0",
 *     "r":"0xa681faea68ff81d191169010888bbbe90ec3eb903e31b0572cd34f13dae281b9",
 *     "s":"0x3f59b0fa5ce6cf38aff2cfeb68e7a503ceda2a72b4442c7e2844d63544383e3"
 *  }
 }
 */
module.exports._eth_getTransactionValueByHash = async (txhash, price) => {
    try {

        //Grab the transaction
        const response = await endpoint._get(`${process.env.ETHERSCAN_API_URL}?module=proxy&action=eth_getTransactionByHash&txhash=${txhash}&apikey=${process.env.API_KEY_TOKEN}`);
        
        //Grab the value from the response
        const value = response.data.result.value.toString();

        //Convert to ETH from BigInt
        const valueETH = ethers.utils.formatEther(value);

        //Convert from ETH to USD based on the market rate of ETH
        const valueUSD = parseFloat(valueETH * price);

        //Return both values
        return {valueETH, valueUSD};
    } catch (e) {
        console.error(e);
        throw e;
    }
};

module.exports._eth_getTransactionValueAndGasByHash = async (txhash, price) => {
  try {
    //Grab the transaction
    const results = await endpoint._getMulti([
      `${process.env.ETHERSCAN_API_URL}?module=proxy&action=eth_getTransactionByHash&txhash=${txhash}&apikey=${process.env.API_KEY_TOKEN}`,
      `${process.env.ETHERSCAN_API_URL}?module=proxy&action=eth_getTransactionReceipt&txhash=${txhash}&apikey=${process.env.API_KEY_TOKEN}`,
    ]);
    
    // const _value = await endpoint._get(
    //   `${process.env.ETHERSCAN_API_URL}?module=proxy&action=eth_getTransactionByHash&txhash=${txhash}&apikey=${process.env.API_KEY_TOKEN}`
    // );
    // const gas = await endpoint._get(
    //   `${process.env.ETHERSCAN_API_URL}?module=proxy&action=eth_getTransactionReceipt&txhash=${txhash}&apikey=${process.env.API_KEY_TOKEN}`
    // );
    //Grab the value from the response
    const value = results[0].data.result.value.toString();

    //Convert to ETH from BigInt
    const valueETH = ethers.utils.formatEther(value);

    //Convert from ETH to USD based on the market rate of ETH
    const valueUSD = parseFloat(valueETH * price);

    //Grab the value from the response
    const gasUsed = results[1].data.result.gasUsed.toString();

    //Convert to ETH from a BigInt
    let gasETH = ethers.utils.formatEther(gasUsed);
    //console.log('_eth_getTransactionGasByHash:',gasETH);
    //gasETH = (21000 * gasETH);
    //console.log('_eth_getTransactionGasByHash:::',gasETH);

    //Convert to USD from ETH using the market rate of ETH
    const gasUSD = parseFloat(gasETH * price);

    //Return both values
    return { valueETH, valueUSD, gasETH, gasUSD, closingPrice: price };
  } catch (e) {
    console.error(e);
    throw e;
  }
};
// {
//     "jsonrpc":"2.0",
//     "id":1,
//     "result":{
//        "blockHash":"0x07c17710dbb7514e92341c9f83b4aab700c5dba7c4fb98caadd7926a32e47799",
//        "blockNumber":"0xcf2427",
//        "contractAddress":null,
//        "cumulativeGasUsed":"0xeb67d5",
//        "effectiveGasPrice":"0x1a96b24c26",
//        "from":"0x292f04a44506c2fd49bac032e1ca148c35a478c8",
//        "gasUsed":"0xb41d",
//        "logs":[
//           {
//              "address":"0xdac17f958d2ee523a2206206994597c13d831ec7",
//              "topics":[
//                 "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
//                 "0x000000000000000000000000292f04a44506c2fd49bac032e1ca148c35a478c8",
//                 "0x000000000000000000000000ab6960a6511ff18ed8b8c012cb91c7f637947fc0"
//              ],
//              "data":"0x00000000000000000000000000000000000000000000000000000000013f81a6",
//              "blockNumber":"0xcf2427",
//              "transactionHash":"0xadb8aec59e80db99811ac4a0235efa3e45da32928bcff557998552250fa672eb",
//              "transactionIndex":"0x122",
//              "blockHash":"0x07c17710dbb7514e92341c9f83b4aab700c5dba7c4fb98caadd7926a32e47799",
//              "logIndex":"0xdb",
//              "removed":false
//           }
//        ],
//        "logsBloom":"0x00000000000000000000000000000000000000000000000000000000000004000000000004000000000000000000010000000000000000000000000000000000000000000000000000000008000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000010000000001100000000000000000000000000000000000000000000000000000200100000000000000000000000000080000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
//        "status":"0x1",
//        "to":"0xdac17f958d2ee523a2206206994597c13d831ec7",
//        "transactionHash":"0xadb8aec59e80db99811ac4a0235efa3e45da32928bcff557998552250fa672eb",
//        "transactionIndex":"0x122",
//        "type":"0x2"
//     }
//  }
/**
 * get the gas paid in a transaction
 *
 * @author Allyn j. Alford <Allyn@tenablylabs.com>
 * @function _eth_getTransactionGasByHash
 * @param {String} txhash - blockchain transaction hash
 * @param {Number} price - price of ETH on date of transaction
 * @example <caption>Example usage of Action Object.</caption>
 * @return {Promise<Object>}  Object
 * */
module.exports._eth_getTransactionGasByHash = async (txhash, price) => {
  try {
    const response = await endpoint._get(
      `${process.env.ETHERSCAN_API_URL}?module=proxy&action=eth_getTransactionReceipt&txhash=${txhash}&apikey=${process.env.API_KEY_TOKEN}`
    );
    //Grab the value from the response
    const gasUsed = response.data.result.gasUsed.toString();

    //Convert to ETH from a BigInt
    let gasETH = ethers.utils.formatEther(gasUsed);
    //console.log('_eth_getTransactionGasByHash:',gasETH);
    //gasETH = (21000 * gasETH);
    //console.log('_eth_getTransactionGasByHash:::',gasETH);

    //Convert to USD from ETH using the market rate of ETH
    const gasUSD = parseFloat(gasETH * price);

    //Return both values
    return { gasETH, gasUSD };
  } catch (e) {
    console.error(e);
    throw e;
  }
};


module.exports._eth_getTransactionByHash = async (txhash) => {
    try {
        const response = await endpoint._get(`${process.env.ETHERSCAN_API_URL}?module=proxy&action=eth_getTransactionByHash&txhash=${txhash}&apikey=${process.env.API_KEY_TOKEN}`);
        return response.data;
    } catch (e) {
        console.error(e);
    }
};

module.exports._eth_getTransactionReceipt = async (txhash) => {
    try {
        const response = await endpoint._get(`${process.env.ETHERSCAN_API_URL}?module=proxy&action=eth_getTransactionReceipt&txhash=${txhash}&apikey=${process.env.API_KEY_TOKEN}`);
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
        console.log(`${process.env.ETHERSCAN_PRICE_API_URL}?module=stats&action=ethdailyprice&startdate=${startdate}&enddate=${enddate}&sort=asc&apikey=${process.env.API_KEY_TOKEN}`)
         const response = await endpoint._get(`${process.env.ETHERSCAN_PRICE_API_URL}?module=stats&action=ethdailyprice&startdate=${startdate}&enddate=${enddate}&sort=asc&apikey=${process.env.API_KEY_TOKEN}`);
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
* Add NFT transaction
*
* @author Allyn j. Alford <Allyn@tenablylabs.com>
* @async
* @function _addWalletNFTWithData
* @param {String} chain - ethereum
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
* @param {Object} gasData
* @return {Promise<Array>} Response Array for next step to process.
*/
module.exports._addWalletNFTWithData = async (chain, owner, contractAddressTokenId, costETH, costUSD, valueUSD, valueETH, ethTransPriceUSD, hash, mintTokenIds, transactionDate, gasData) => {
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
                gasData,
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