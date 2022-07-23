/*jshint esversion: 8 */
/* jshint -W117 */
/* jshint -W097 */
"use strict";
const ethers = require("ethers");
const log = require('lambda-log');
const dynamo = require('../common/dynamo');
const dateformat = require("dateformat");

module.exports._isCacheExpired = (timestamp) =>{
    var today = new Date();
    var timeStamp = new Date(timestamp);
    var diffMs = (today - timeStamp); // milliseconds between now & Christmas
    var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
    console.log(diffMins + " minutes until expired)");
    if(diffMins > 10){
        return true;
    }else{
        return false;
    }
};

/**
 * Returns aggregated data on NFTs for a given wallet.
 *
 * @author Allyn j. Alford <Allyn@tenablylabs.com>
 * @async
 * @function _qn_fetchNFTs
 * @param {String} wallet - ethereum wallet address
 * @return {Promise<Array>} Response Array for next step to process.
 */
 module.exports._qn_fetchNFTs  = async (wallet, page) => {
   try {
     const provider = new ethers.providers.JsonRpcProvider(
       process.env.QUICK_NODE_HTTP
     );
     //provider.connection.headers = { "x-qn-api-version": 1 };
     const payload = {
      wallet,
      omitFields: ["provenance", "traits"],
      page,
      perPage: 5,
    };
    console.log(payload)
     return await provider.send("qn_fetchNFTs", payload);
   } catch (e) {
     console.error(e);
     throw e;
   }
 };

 /**
 * Returns full list of wallet NFTs for a given wallet.
 *
 * @author Allyn j. Alford <Allyn@tenablylabs.com>
 * @async
 * @function _qn_fetchFullNFTs
 * @param {String} wallet - ethereum wallet address
 * @return {Promise<Array>} Response Array for next step to process.
 */
  module.exports._qn_fetchFullNFTs = async (wallet) => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        process.env.QUICK_NODE_HTTP
      );
      return await provider.send("qn_fetchNFTs", {
        wallet,
        omitFields: ["provenance", "traits"],
      });
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

 /**
 * Returns aggregated data on NFTs for a given wallet.
 *
 * @author Allyn j. Alford <Allyn@tenablylabs.com>
 * @async
 * @function _qn_fetchNFTs
 * @param {String} wallet - ethereum wallet address
 * @param {Number} page - the page to return
 * @param {Number} perPage - quamtity of NFT's per page
 * @return {Promise<Array>} Response Array for next step to process.
 */
  module.exports._qn_fetchNFTs  = async (wallet, page, perPage) => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        process.env.QUICK_NODE_HTTP
      );
      //provider.connection.headers = { "x-qn-api-version": 1 };
      const heads = await provider.send("qn_fetchNFTs", {
        wallet,
        omitFields: ["provenance", "traits"],
        page,
        perPage
      });
      return heads;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

   /**
 * Returns aggregated data on NFTs for a given wallet from a cache.
 *
 * @author Allyn j. Alford <Allyn@tenablylabs.com>
 * @async
 * @function _qn_fetchNFTsCache
 * @param {String} address - ethereum wallet address
 * @param {Number} page - the page to return
 * @return {Promise<Array>} Response Array for next step to process.
 */
    module.exports._qn_fetchNFTsCache  = async (address, page) => {
        try {
            const assets = await dynamo.qetFromDB({
                TableName: process.env.DYNAMODB_TABLE_WALLET_NFT_CACHE,
                Key: {
                    address,
                    page
                }
            });
          return assets;
        } catch (e) {
          console.error(e);
          throw e;
        }
      };

         /**
 * Add address NFT page to cache
 *
 * @author Allyn j. Alford <Allyn@tenablylabs.com>
 * @async
 * @function _addfetchNFTsToCache
 * @param {String} address - ethereum wallet address
 * @param {Number} page - the page to return
 * @return {Promise<Array>} Response Array for next step to process.
 */
    module.exports._addfetchNFTsToCache = async (address, page, assets) => {
      try {
        return await dynamo.saveItemInDB({
          TableName: process.env.DYNAMODB_TABLE_WALLET_NFT_CACHE,
          Item: {
            address,
            page,
            assets,
            dt: dateformat(new Date(), "isoUtcDateTime"),
            timestamp: new Date().getTime(),
          },
        });
      } catch (e) {
        console.error(e);
        throw e;
      }
    };