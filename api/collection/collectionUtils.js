/*jshint esversion: 8 */
/* jshint -W117 */
/* jshint -W097 */
"use strict";


module.exports._getStats = () => {
  return {
    one_day_volume: 76.7,
    one_day_change: -0.1403272808787267,
    one_day_sales: 7,
    one_day_average_price: 10.957142857142857,
    seven_day_volume: 973.7173372500002,
    seven_day_change: 0.1315901135044749,
    seven_day_sales: 75,
    seven_day_average_price: 12.982897830000002,
    thirty_day_volume: 5490.415687249995,
    thirty_day_change: -0.28995701096720417,
    thirty_day_sales: 336,
    thirty_day_average_price: 16.340522878720225,
    total_volume: 143535.03114919487,
    total_sales: 23272,
    total_supply: 10000,
    count: 10000,
    num_owners: 5213,
    average_price: 6.167713610742303,
    num_reports: 1,
    market_cap: 129828.97830000003,
    floor_price: 10.84,
  };
};

/**
* Returns NFT collection
*
* @author Allyn j. Alford <Allyn@tenablylabs.com>
* @async
* @function _getCollection
* @param {String} owner - nft owner ethereum wallet address
* @param {String} contractAddress -  NFT Collection contract address
* @return {Promise<Array>} Response Array for next step to process.
*/
module.exports._getCollection = async (chain, contractAddress) => {
    try {
        const dynamo = require('../common/dynamo');
        const assets = await dynamo.qetFromDB({
            TableName: process.env.DYNAMODB_TABLE_NFT_COLLECTION,
            Key: {
              chain,
                contractAddress
            }
        });
        return assets;
    } catch (e) {
        console.error(e);
        throw e;
    }
};

/**
* Returns NFT collection Floor price
*
* @author Allyn j. Alford <Allyn@tenablylabs.com>
* @async
* @function _getCollectionFloor
* @param {String} owner - nft owner ethereum wallet address
* @param {String} contractAddress -  NFT Collection contract address
* @return {Promise<Array>} Response Array for next step to process.
*/
module.exports._getCollectionFloorPrice = async (chain, contractAddress) => {
  try {
      const dynamo = require('../common/dynamo');
      const assets = await dynamo.qetFromDB({
          TableName: process.env.DYNAMODB_TABLE_NFT_COLLECTION,
          Key: {
            chain,
            contractAddress
          },
          ProjectionExpression: "floorPrice, floorUpdated"
      });
      return assets;
  } catch (e) {
      console.error(e);
      throw e;
  }
};



/**
* get collection avg prices from rariable
*
* @author Allyn j. Alford <Allyn@tenablylabs.com>
* @async
* @function _getFloorPriceAvgs
* @param {String} chain - ETHEREUM|FLOW|TEZOS|POLYGON|SOLANA
* @param {String} contractAddress -  NFT Collection contract address
* @return {Promise<Array>} Response Array for next step to process.
*/
module.exports._getFloorPriceAvgs = async (chain, contractAddress) => {
  try {

    function add(accumulator, a) {
      return accumulator + a;
    };

    const rariableUtils = require('../rarible/utils');

    //Grab the rariable avgs
    const results = await rariableUtils._getPrices(chain, contractAddress);

    const prices = {};
   // with initial value to avoid when the array is empty
   //Process each array into avgs
    prices.priceAvg = (results.avgPrices.reduce(add, 0) / results.avgPrices.length);
    prices.medianPricesAvg = (results.medianPrices.reduce(add, 0) / results.medianPrices.length);
    prices.minPricesAvg = (results.minPrices.reduce(add, 0) / results.minPrices.length);
    prices.sumPricesAvg = (results.sumPrices.reduce(add, 0) / results.sumPrices.length);


    return prices;
 
  } catch (e) {
    console.error(e);
    throw e;
  }
};

/**
* load floor price from rariable, opensea and looksrare
*
* @author Allyn j. Alford <Allyn@tenablylabs.com>
* @async
* @function _loadCollectionFloorPrice
* @param {String} chain - ETHEREUM|FLOW|TEZOS|POLYGON|SOLANA
* @param {String} contractAddress -  NFT Collection contract address
* @return {Promise<Array>} Response Array for next step to process.
*/
module.exports._loadCollectionFloorPrice = async (chain, contractAddress) => {
  try {
      const alchemyUtils = require('../alchemy/utils');
      const rariable = require('../rarible/utils');
      const dateformat = require("dateformat");
      const etherscanUtils = require('../etherscan/ethUtils');

      const results = await alchemyUtils.getFloorPrice(chain, contractAddress);
      //console.info(alchemyResults);

      results.price = await etherscanUtils._ethPrice();
      console.log(results.price);

      results.looksRare.floorPriceUSD = parseFloat(results.looksRare.floorPrice * results.price.result.ethusd);

      if(typeof results.openSea.floorPrice !== "undefined"){
        results.openSea.floorPriceUSD = parseFloat(results.openSea.floorPrice * results.price.result.ethusd);
      }

      

      const rariableResults = await rariable.getFloorPrice(chain, contractAddress);
      console.info('USD to ETH', (results.price.result.ethusd / rariableResults.currentValue).toFixed(2))

    
      results.rariable = {
        floorPrice: rariableResults.currentValue,
        floorPriceUSD: rariableResults.currentValue,
        priceCurrency: "USD",
        retrievedAt: dateformat(new Date(), "isoUtcDateTime"),
      };

      if(typeof results.openSea.floorPrice !== "undefined"){
        results.avgFloorPriceUSD = (results.rariable.floorPriceUSD + results.looksRare.floorPriceUSD + results.openSea.floorPriceUSD) / 3;
      }else{
        results.avgFloorPriceUSD = (results.rariable.floorPriceUSD + results.looksRare.floorPriceUSD) / 2;
      }


      return results;
  } catch (e) {
      console.error(e);
      throw e;
  }
};

/**
* Returns NFT collection volume
*
* @author Allyn j. Alford <Allyn@tenablylabs.com>
* @async
* @function _getCollectionVolume
* @param {String} chain - ETHEREUM|FLOW|TEZOS|POLYGON|SOLANA
* @param {String} contractAddress -  NFT Collection contract address
* @return {Promise<Array>} Response Array for next step to process.
*/
module.exports._getCollectionVolume = async (chain, contractAddress) => {
  try {
      const dynamo = require('../common/dynamo');
      const assets = await dynamo.qetFromDB({
          TableName: process.env.DYNAMODB_TABLE_NFT_COLLECTION,
          Key: {
            chain,
            contractAddress
          },
          ProjectionExpression: "volume, volumeUpdated"
      });
      return assets;
  } catch (e) {
      console.error(e);
      throw e;
  }
};

/**
* Returns NFT collection details of floor price and volume
*
* @author Allyn j. Alford <Allyn@tenablylabs.com>
* @async
* @function _getCollectionDetails
* @param {String} chain - ETHEREUM|FLOW|TEZOS|POLYGON|SOLANA
* @param {String} contractAddress -  NFT Collection contract address
* @return {Promise<Array>} Response Array for next step to process.
*/
module.exports._getCollectionDetails = async (chain, contractAddress) => {
  try {
      const dynamo = require('../common/dynamo');
      const assets = await dynamo.qetFromDB({
          TableName: process.env.DYNAMODB_TABLE_NFT_COLLECTION,
          Key: {
            chain,
            contractAddress
          },
          ProjectionExpression: "name, floorPrice, floorUpdated, volume, volumeUpdated"
      });
      return assets;
  } catch (e) {
      console.error(e);
      throw e;
  }
};

/**
* Add NFT Collection
*
* @author Allyn j. Alford <Allyn@tenablylabs.com>
* @async
* @function _addCollection
* @param {String} chain - blockchain of address
* @param {String} contractAddress - NFT Collection contract address
* @return {Promise<Array>} Response Array for next step to process.
*/
module.exports._addCollection = async (chain, contractAddress, name, symbol, totalSupply, tokenType) => {
    try {
        const dynamo = require('../common/dynamo');
        const dateformat = require("dateformat");
        return await dynamo.saveItemInDB({
            TableName: process.env.DYNAMODB_TABLE_NFT_COLLECTION,
            Item: {
                chain,
                contractAddress,
                name, 
                symbol, 
                totalSupply, 
                tokenType,
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
* delete a wallet
*
* @author Allyn j. Alford <Allyn@tenablylabs.com>
* @async
* @function _deleteWallet
* @param {String} chain - blockchain of address
* @param {String} contractAddress - NFT Collection contract address
* @return {Promise<Array>} Response Array for next step to process.
*/
module.exports._deleteCollection = async (chain, contractAddress) => {
    try {
        const dynamo = require('../common/dynamo');
        const wallet = await dynamo.deleteItemFromDB({
            TableName: process.env.DYNAMODB_TABLE_NFT_COLLECTION,
            Key: {
                chain, 
                contractAddress
            }
        });
        return wallet;
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

module.exports._getWalletNFT = async (owner, contractAddress) => {
    try {
        const dynamo = require('../common/dynamo');
        return await dynamo.queryDB({
            TableName: process.env.DYNAMODB_TABLE_NFT_COLLECTION,
            IndexName: 'InstanceIdIndex',
            KeyConditionExpression: "#owner = :owner and #contractAddress = :contractAddress",
            ExpressionAttributeNames: {
                "#owner": "owner",
                "#contractAddress": "contractAddress"
            },
            ExpressionAttributeValues: {
                ":owner": owner,
                ":contractAddress": contractAddress
            },
        });

    } catch (e) {
        console.error(e.message);
        throw e;
    }
};



/**
* update NFT Collection Floor Price
*
* @author Allyn j. Alford <Allyn@tenablylabs.com>
* @async
* @function _updateCollectionFloorPrice
* @param {string} chain 
* @param {string} contractAddress
* @param {Number} floorPrice 
*/
module.exports._updateCollectionFloorPrice = async (
  chain,
  contractAddress,
  floorPrice
) => {
  try {
    const dateFormat = require("dateformat");
    const dynamo = require("../common/dynamo");

    //Save the profile to dynamoDB
    return await dynamo.updateDB({
      TableName: process.env.DYNAMODB_TABLE_NFT_COLLECTION,
      Key: { chain, contractAddress },
      UpdateExpression:
        "set #floorPrice = :floorPrice, #floorUpdated = :floorUpdated",
      ExpressionAttributeNames: {
        "#floorPrice": "floorPrice",
        "#floorUpdated": "floorUpdated",
      },
      ExpressionAttributeValues: {
        ":floorUpdated": dateFormat(new Date(), "isoUtcDateTime"),
        ":floorPrice": floorPrice,
      },
      ReturnValues: "UPDATED_NEW",
    });
  } catch (err) {
    console.error(JSON.stringify(err));
    throw err;
  }
};



/**
* update NFT Collection fields
*
* @author Allyn j. Alford <Allyn@tenablylabs.com>
* @async
* @function _updateCollectionFields
* @param {string} chain 
* @param {string} contractAddress
* @param {list} fields 
*/
module.exports._updateCollectionFields = async (chain, contractAddress, fields) => {
  try {
      const dateFormat = require('dateformat');
      const dynamo = require('../common/dynamo');

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
          TableName: process.env.DYNAMODB_TABLE_NFT_COLLECTION,
          Key: { chain, contractAddress },
          UpdateExpression,
          ExpressionAttributeValues,
          ExpressionAttributeNames,
          ReturnValues: "UPDATED_NEW"
      });
  } catch (err) {
      console.error(JSON.stringify(err));
      throw err;
  };
};