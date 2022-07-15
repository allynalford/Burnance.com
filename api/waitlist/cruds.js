/*jshint esversion: 8 */
/* jshint -W117 */
/* jshint -W097 */
"use strict";
const dynamo = require('../common/dynamo');
const log = require('lambda-log');


module.exports._getAddress = async (chain, emailaddress) => {
    try {
        return await dynamo.qetFromDB({
            TableName: process.env.DYNAMODB_TABLE_WAITLIST,
            Key: {
                chain, 
                emailaddress
            }
        });
    } catch (e) {
        console.error('module.exports._getAddress',e);
        log.error(err);
        throw err;
    }
};


module.exports._deleteAddress = async (chain, emailaddress) =>{
    try {
        return await dynamo.deleteItemFromDB({
            TableName: process.env.DYNAMODB_TABLE_WAITLIST,
            Key: {
                chain, 
                emailaddress
            }
        });
    } catch (e) {
        console.error(e);
        log.error(err);
        throw err;
    };
};


module.exports._saveAddress = async function (Item) {
    try {
        return await dynamo.saveItemInDB({
            TableName: process.env.DYNAMODB_TABLE_WAITLIST,
            Item
        });
    } catch (e) {
        console.error(e);
        log.error(err);
        throw err;
    }
};

