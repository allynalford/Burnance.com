/*jshint esversion: 8 */
/* jshint -W117 */
/* jshint -W097 */
"use strict";

const endpoint = require('../common/endpoint');


/**
* returns NFT collection stats from Rariable
*
* @author Allyn j. Alford <Allyn@tenablylabs.com>
* @async
* @function _getCollectionStats
* @param {String} chain - ETHEREUM|FLOW|TEZOS|POLYGON|SOLANA
* @param {String} contractAddress - NFT Contract Address
* @return {Promise<Array>} Response Array
*/
module.exports._getCollectionStats = async (chain, contractAddress) => {
    try {
        const Chain = chain.toUpperCase();
        const stats = await endpoint._get(`https://api.rarible.org/v0.1/data/collections/${Chain}:${contractAddress}/stats`);

        // {
        //     "highestSale": 146.208,
        //     "floorPrice": 1.5740356,
        //     "marketCap": 7898.5107,
        //     "items": 5018,
        //     "owners": 1409,
        //     "volume": 10155.178
        //     }

        return stats;

    } catch (e) {
        console.error(e);
        throw e;
    }
};

/**
* returns NFT collection stats from Rariable
*
* @author Allyn j. Alford <Allyn@tenablylabs.com>
* @async
* @function _getPrices
* @param {String} chain - ETHEREUM|FLOW|TEZOS|POLYGON|SOLANA
* @param {String} contractAddress - NFT Contract Address
* @return {Promise<Array>} Response Array
*/
module.exports._getPrices = async (chain, contractAddress) => {
    try {
        const Chain = chain.toUpperCase();
        const prices = await endpoint._get(`https://api.rarible.org/v0.1/data/collections/${Chain}:${contractAddress}/prices`);

        // {
        //     "dates": [
        //     "2022-05-05",
        //     "2022-05-06",
        //     "2022-05-07"
        //     ],
        //     "avgPrices": [
        //     3.0356821472801507,
        //     3.0695980858360876,
        //     4.084722218806717
        //     ],
        //     "medianPrices": [
        //     2.999,
        //     3.1,
        //     4.12
        //     ],
        //     "minPrices": [
        //     0.45,
        //     0.25,
        //     2.26
        //     ],
        //     "sumPrices": [
        //     10934.527094503102,
        //     7876.5886882554005,
        //     1164.1458323599143
        //     ]
        //     }

        return prices;

    } catch (e) {
        console.error(e);
        throw e;
    }
};

/**
* returns NFT collection stats from Rariable
*
* @author Allyn j. Alford <Allyn@tenablylabs.com>
* @async
* @function _getPrices
* @param {String} chain - ETHEREUM|FLOW|TEZOS|POLYGON|SOLANA
* @param {String} contractAddress - NFT Contract Address
* @return {Promise<Array>} Response Array
*/
module.exports.getFloorPrice = async (chain, contractAddress) => {
    try {
        const Chain = chain.toUpperCase();
        const prices = await endpoint._get(`https://api.rarible.org/v0.1/data/collections/${Chain}:${contractAddress}/floorPrice`);

        // {
        //     "historicalDates": [
        //     "2022-05-05",
        //     "2022-05-06",
        //     "2022-05-07"
        //     ],
        //     "historicalValues": [
        //     1.7,
        //     1.69,
        //     1.9
        //     ],
        //     "currentValue": 1.45
        //     }

        return prices.data;

    } catch (e) {
        console.error(e);
        throw e;
    }
};