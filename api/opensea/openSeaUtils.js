/*jshint esversion: 8 */
/* jshint -W117 */
/* jshint -W097 */
"use strict";
const endpoint = require('../common/endpoint');

/**
 * get a contract from OpenSea
 *
 * @author Allyn j. Alford <Allyn@tenablylabs.com>
 * @async
 * @function _getAssetContract
 * @param {String} address - CONTRACT address
 * @return {Promise<Array>} Response Array for next step to process.
 */
module.exports._getAssetContract = async (address) => {
  try {
    const result =  await endpoint._get(`${process.env.OPENSEA_API_URL}/asset_contract/${address}`)
    return result.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
/**
 * get contract stats from OpenSea
 *
 * @author Allyn j. Alford <Allyn@tenablylabs.com>
 * @async
 * @function _retrieveCollectionStats
 * @param {String} slug - OpenSea slug name
 * @return {Promise<Array>} Response Array for next step to process.
 */
 module.exports._retrieveCollectionStats = async (slug) => {
  try {
    const result = await endpoint._get(`${process.env.OPENSEA_API_URL}/collection/${slug}/stats`)
    return result.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};