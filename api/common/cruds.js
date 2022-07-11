/*jshint esversion: 8 */
/* jshint -W117 */
/* jshint -W097 */
"use strict";
const dynamo = require('./dynamo');
const log = require('lambda-log');


module.exports._getNFT = async (contractAddress, tokenId, chain) => {
    try {
        return await dynamo.qetFromDB({
            TableName: process.env.DYNAMODB_TABLE_NFT_METADATA,
            Key: {
                chainContractAddress: chain + '-' + contractAddress,
                tokenId
            }
        });
    } catch (e) {
        console.error('module.exports._getNFT',e);
        log.error(err);
        throw err;
    }
};

module.exports._getABI = async (contractAddress, chain) => {
    try {
        return await dynamo.qetFromDB({
            TableName: process.env.DYNAMODB_TABLE_CONTRACT_ABI,
            Key: {
                chain,
                contractAddress
            }
        });
    } catch (e) {
        console.error(e);
        log.error(err);
        throw err;
    }
};


module.exports._updateDomainStoreName = async (domainglobaluuid, companyglobaluuid, storename) =>{
    try {
        const dateFormat = require('dateformat');
        await dynamo.updateDB({
            TableName: process.env.DYNAMODB_TABLE_NFT_METADATA,
            Key: {
                "companyglobaluuid": companyglobaluuid,
                "domainglobaluuid": domainglobaluuid
            },
            UpdateExpression: "set #fn = :fv, updatedAt = :ut",
            ExpressionAttributeValues: {
              ":fv": storename,
              ":ut": dateFormat(new Date(), "isoUtcDateTime")
            },
            ExpressionAttributeNames: {
              "#fn": 'storename'
            },
            ReturnValues: "UPDATED_NEW"
          });
        return true;
    } catch (e) {
        console.log(e);
        log.error(e);
        throw e;
    }
};



module.exports._deleteNFT = async (contractAddress, tokenId, chain) =>{
    try {
        return await dynamo.deleteItemFromDB({
            TableName: process.env.DYNAMODB_TABLE_NFT_METADATA,
            Key: {
                chainContractAddress: chain + '-' + contractAddress,
                tokenId
            }
        });
    } catch (e) {
        console.error(e);
        log.error(err);
        throw err;
    };
};

module.exports._deleteABI = async (contractAddress, chain) =>{
    try {
        return await dynamo.deleteItemFromDB({
            TableName: process.env.DYNAMODB_TABLE_CONTRACT_ABI,
            Key: {
                chain,
                contractAddress
            }
        });
    } catch (e) {
        console.error(e);
        log.error(err);
        throw err;
    };
};

module.exports._saveNFT = async function (Item) {
    try {
        return await dynamo.saveItemInDB({
            TableName: process.env.DYNAMODB_TABLE_NFT_METADATA,
            Item
        });
    } catch (e) {
        console.error(e);
        log.error(err);
        throw err;
    }
};

module.exports._saveABI = async function (Item) {
    try {
        return await dynamo.saveItemInDB({
            TableName: process.env.DYNAMODB_TABLE_CONTRACT_ABI,
            Item
        });
    } catch (e) {
        console.error(e);
        log.error(err);
        throw err;
    }
};
