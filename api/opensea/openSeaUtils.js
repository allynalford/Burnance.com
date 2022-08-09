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
    const result =  await endpoint._get(`${process.env.OPENSEA_API_URL}/asset_contract/${address}?format=json`)
    return result.data;
  } catch (e) {
    console.error('_getAssetContract', {message: e.message, url: e.config.url});
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
 module.exports._retrieveCollectionStatsOld = async (slug) => {
  try {
    const result = await endpoint._get(`${process.env.OPENSEA_API_URL}/collection/${slug}/stats`)
    return result.data;
  } catch (e) {
    console.error('_retrieveCollectionStats', {message: e.message, url: e.config.url});
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
 module.exports._retrieveCollectionStats = async (owner, address) => {
  try {
    const result = await endpoint._get(`${process.env.OPENSEA_API_URL}/collections?asset_owner=${owner}&offset=0&limit=300`)
    const _ = require('lodash');
    const collection =  _.find(result.data, ['primary_asset_contracts.address', address]);
    return collection.stats;
  } catch (e) {
    console.error('_retrieveCollectionStats', {message: e.message, url: e.config.url});
    throw e;
  }
};

/**
 * collections from OpenSea
 *
 * @author Allyn j. Alford <Allyn@tenablylabs.com>
 * @async
 * @function _getCollections
 * @param {String} slug - OpenSea slug name
 * @return {Promise<Array>} Response Array for next step to process.
 */
 module.exports._getCollections = async (owner) => {
  try {
    const result = await endpoint._get(`${process.env.OPENSEA_API_URL}/collections?asset_owner=${owner}&offset=0&limit=300`)
    return result.data;
  } catch (e) {
    console.error('_getCollections', {message: e.message, url: e.config.url});
    throw e;
  }
};

/**
 * collections from OpenSea
 *
 * @author Allyn j. Alford <Allyn@tenablylabs.com>
 * @async
 * @function _getCollections
 * @param {String} slug - OpenSea slug name
 * @return {Promise<Array>} Response Array for next step to process.
 */
 module.exports._getCollection = async (owner, address) => {
  try {
    const result = await endpoint._get(`${process.env.OPENSEA_API_URL}/collections?asset_owner=${owner}&offset=0&limit=300`)
    const _ = require('lodash');
    const collection =  _.find(result.data, ['primary_asset_contracts[0].address', address]);
    return collection;
  } catch (e) {
    console.error('_getCollections', {message: e.message});
    throw e;
  }
};