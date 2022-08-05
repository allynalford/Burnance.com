/*jshint esversion: 8 */
/* jshint -W117 */
/* jshint -W097 */
"use strict";
const endpoint = require('../common/endpoint');

/**
* returns NFT collection stats from NFT Port
*
* @author Allyn j. Alford <Allyn@tenablylabs.com>
* @async
* @function _getCollectionStats
* @param {String} chain - ETHEREUM|POLYGON
* @param {String} contractAddress - NFT Contract Address
* @return {Promise<Array>} Response Array
*/
module.exports._getCollectionStats = async (chain, contractAddress) => {
    try {
        const Chain = chain.toLowerCase();
        const options = {
            method: 'GET',
            url: `${process.env.NFT_PORT_BASE_API_URL}/transactions/stats/${contractAddress}`,
            params: {chain: Chain},
            headers: {
              'Content-Type': 'application/json',
              Authorization: process.env.NFT_PORT_API_KEY
            }
          };
        const stats = await endpoint._getWithOptions(options);

        // {
        //     "response": "OK",
        //     "statistics": {
        //         "one_day_volume": 1.4038332999999998,
        //         "one_day_change": 0.372405220451657,
        //         "one_day_sales": 26.0,
        //         "one_day_average_price": 0.053993588461538455,
        //         "seven_day_volume": 12.100501199999988,
        //         "seven_day_change": -0.30078223043563596,
        //         "seven_day_sales": 233.0,
        //         "seven_day_average_price": 0.051933481545064324,
        //         "thirty_day_volume": 198.30848397870992,
        //         "thirty_day_change": -0.9201065591865273,
        //         "thirty_day_sales": 2137.0,
        //         "thirty_day_average_price": 0.09279760597974258,
        //         "total_volume": 2680.4707486094517,
        //         "total_sales": 16196.0,
        //         "total_supply": 9999.0,
        //         "total_minted": 9999.0,
        //         "num_owners": 2793.0,
        //         "average_price": 0.16550202201836575,
        //         "market_cap": 519.2828819690982,
        //         "floor_price": 0.03,
        //         "floor_price_historic_one_day": null,
        //         "floor_price_historic_seven_day": 0.043,
        //         "floor_price_historic_thirty_day": null,
        //         "updated_date": "2022-07-21T10:46:56.071356"
        //     }
        // }

        return {stats: stats.data.statistics, response: stats.data.response}

    } catch (e) {
        console.error(e.message);
        throw e;
    }
};


/**
* returns NFT collection stats from NFT Port
*
* @author Allyn j. Alford <Allyn@tenablylabs.com>
* @async
* @function _getCollectionStats
* @param {String} chain - ETHEREUM
* @param {String} contractAddress - NFT Contract Address
* @param {String} tokenId - NFT token id
* @param {String} type - Transaction type. Allowed values: transfer mint burn sale all
* @return {Promise<Array>} Response Array
*/
module.exports._txsByNFT = async (chain, contractAddress, tokenId, type) => {
    try {
        const Chain = chain.toLowerCase();
        const results = await endpoint._get(`${baseURL}/transactions/nfts/${contractAddress}/${tokenId}?chain=${chain}&type=${type}`);

        // {
        //     "response": "OK",
        //     "transactions": {
        //       "type": "list",
        //       "lister_address": "0xb4cdc8dfd9ce9bf647f38cd8278036c0aacdc91e",
        //       "nft": {
        //         "contract_type": "ERC1155_lazy",
        //         "contract_address": "0xb66a603f4cfe17e3d27b87a8bfcad319856518b8",
        //         "token_id": "15358604318467100856391476616408347066873708425523410565866333184395837440001",
        //         "metadata_url": "ipfs://QmUNeWBXz4pJkBzMAaPTXS4dUXkHyVNsrfVTbN4bEsJnW1",
        //         "creators": [
        //           {
        //             "account_address": "0x21f4a9780a52c7a8ca5e30bac89a6b0e2722bf65",
        //             "creator_share": "10000"
        //           }
        //         ],
        //         "royalties": [
        //           {
        //             "account_address": "0x21f4a9780a52c7a8ca5e30bac89a6b0e2722bf65",
        //             "royalty_share": "1000"
        //           }
        //         ],
        //         "signatures": [
        //           "0xde8ee69a90450466de44e0025aec715d621afbcc1ad11361cc9d63666a7e3f3e33eb72d48f2753f6e5d414967ba5ae06d00e39d1f53e99d419038011c2f159f51b"
        //         ],
        //         "total": 5000
        //       },
        //       "quantity": 1,
        //       "listing_details": {
        //         "asset_type": "ERC20",
        //         "contract_address": "0xaa75b8c9e01ac2e9fc041a39d36a6536540b2072",
        //         "price": "0.071",
        //         "price_usd": 271.5
        //       },
        //       "transaction_date": "2021-12-03T01:28:55.961",
        //       "marketplace": "opensea"
        //     },
        //     "continuation": "1638479526000_61a936bd60c2ce3a0c68cd6f"
        //   }

        return results.data;

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

        return prices.data;

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