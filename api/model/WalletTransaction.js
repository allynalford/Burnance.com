'use strict';
const dateFormat = require('dateformat');
const log = require('lambda-log');
const dynamo = require('../common/dynamo');

/**
 * constructor for WalletTransaction Object
 *
 * @author Allyn j. Alford <Allyn@tenablylabs.com>
 * @function WalletTransaction
 * @param {String} chain - blockchain
 * @param {String} address - wallet address
 * @param {String} transactionHash - blockchain transaction hash
 * @param {Automation.STATUS} status - status of action
 * @example <caption>Example usage of Action Object.</caption>
 * // new Automation();
 * // new Automation(storeuuid, process, Automation.STATUS.SUCCEEDED);
 * @return {WalletTransaction} Solution Instance Object
 */
function WalletTransaction(chain, address, transactionHash, type) { 
    this.chainAddress  = chain + ":" + address;
    this.transactionHash = transactionHash;
    this.type = type;
}
/**
 * get an Wallet Transaction from the database and build the object
 *
 * @author Allyn j. Alford <Allyn@tenablylabs.com>
 * @async
 * @function get
 * @requires module:./dynamo.js
 * @requires module:lambda-log
 * @requires module:dateformat
 * @example <caption>Example usage of get.</caption>
 * // const automation = new Automation(storeuuid, process, Automation.STATUS.SUCCEEDED);
 * // await automation.get();
 * //@return {Promise<Automation>} Automation Object
 */
 WalletTransaction.prototype.get = async function() {
    log.options.tags = ['log', '<<level>>'];
    try {
        const tx = await dynamo.qetFromDB({
            TableName: process.env.DYNAMODB_TABLE_WALLET_SELL_TX,
            Key: {
                chainAddress: this.chainAddress,
                transactionHash: this.transactionHash
            }
        });

        this.timeStamp = tx.timeStamp;
        this.contractAddress = tx.contractAddress;
        this.to = tx.to;
        this.tokenID = tx.tokenID;
        this.chain = tx.chain;
        this.valueUSD = tx.valueUSD;
        this.costUSD = tx.costUSD;
        this.valueETH = tx.valueETH;
        this.costETH = tx.costETH;
        this.ethTransPriceUSD = tx.ethTransPriceUSD;
        this.txUUID = tx.txUUID;

    } catch (e) {
        console.error(e);
        log.error(e);
        throw e;
    };
}
/**
 * save Automation to the database
 *
 * @author Allyn j. Alford <Allyn@tenablylabs.com>
 * @async
 * @function save
 * @requires module:./dynamo.js
 * @requires module:lambda-log
 * @requires module:dateformat
 * @example <caption>Example usage of get.</caption>
 * // const automation = new Automation(storeuuid, process, Automation.STATUS.SUCCEEDED);
 * // await automation.get();
 * // automation.setStatus(automation.STATUS.PENDING);
 * // await automation.save();
 */
 WalletTransaction.prototype.save = async function() {
    log.options.tags = ['log', '<<level>>']; 
    try {
        const dt = new Date();
        const uuid = require('uuid');
        this.isodate = dateFormat(dt, "isoDate"),
        this.week = dateFormat(dt, "W"),
        this.createdatetime = dateFormat(dt, "isoUtcDateTime"),
        this.updatedat = dateFormat(dt, "isoUtcDateTime")
        this.txUUID = uuid.v4();
        //Make sure the instance doesn't already exists

        return await dynamo.saveItemInDB({
            TableName: process.env.DYNAMODB_TABLE_WALLET_SELL_TX,
            Item:{
                chainAddress: this.chainAddress,
                transactionHash: this.transactionHash,
                timeStamp: this.timeStamp,
                contractAddress: this.contractAddress,
                to: this.to,
                tokenID: this.tokenID,
                chain: this.chain,
                valueUSD: this.valueUSD,
                costUSD: this.costUSD,
                valueETH: this.valueETH,
                costETH: this.costETH,
                ethTransPriceUSD: this.ethTransPriceUSD,
                txUUID: this.txUUID,
                isoDate: this.isodate,
                week: this.week,
                created: this.createdatetime,
                updatedAt: this.updatedat,
            }
        });
    } catch (e) {
        console.error(e);
        log.error(e);
        throw e;
    }
};

/**
 * get the unique process name
 *
 * @author Allyn j. Alford <Allyn@tenablylabs.com>
 * @function getId
 * @requires module:./dynamo.js
 * @requires module:lambda-log
 * @requires module:dateformat
 * @example <caption>Example usage of get.</caption>
 * // const automation = new Automation(storeuuid, process, Automation.STATUS.SUCCEEDED);
 * // await automation.get();
 * // automation.getId();
 * @return {String} actionuuid
 */
 WalletTransaction.prototype.getId = function() {
    return this.transactionHash;
};
/**
 * set the status of Automation
 *
 * @author Allyn j. Alford <Allyn@tenablylabs.com>
 * @function setStatus
 * @param {String} type - the type of transaction
 * @example <caption>Example usage of get.</caption>
 * // const automation = new Automation(storeuuid, process, Automation.STATUS.SUCCEEDED);
 * // await automation.get();
 * // automation.setStatus(Automation.STATUS.PENDING);
 */
 WalletTransaction.prototype.setType = function(type) {
    this.type = type;
};
/**
 * get the type of WalletTransaction
 *
 * @author Allyn j. Alford <Allyn@tenablylabs.com>
 * @function getType
 * @example <caption>Example usage of get.</caption>
 * // const walletTransaction = new WalletTransaction(chain, address, transactionHash, WalletTransaction.type.SELL);
 * // await walletTransaction.get();
 * // walletTransaction.getType();
 * @return {String} Wallet Transaction type
 */
 WalletTransaction.prototype.getType = function() {
    return this.type;
};

WalletTransaction.prototype.type = Object.freeze({
    SELL : "sell",
    GUARANTEE: "guarantee"
});


WalletTransaction.prototype.equals = function(otherSolution) {
    return otherSolution.getStoreuuid() == this.getStoreuuid()
        && otherSolution.getId() == this.getId();
};

WalletTransaction.prototype.fill = function(newFields) {
    for (var field in newFields) {
        if (this.hasOwnProperty(field) && newFields.hasOwnProperty(field)) {
            if (this[field] !== 'undefined') {
                this[field] = newFields[field];
            }
        }
    }
};




/**
 * update a store process attribute
 *
 * @author Allyn j. Alford <Allyn@tenablylabs.com>
 * @async
 * @function _updateStoreProcess
 * @param {String} key - name of attribute to update
 * @param {String} value - value to set attribute to
 * @requires module:./dynamo
 * @throws Will throw an error from dynamoDB.
 * @example <caption>Example usage of _StoreProcessStart.</caption>
 * // returns Promise with DynamoDB response Array of empty of successful or an error response.
 * processCruds._StoreProcessStart(uuid, baseConfig.processes.SETUP, baseConfig.steps.SETUP.START);
 * @return {Promise<Array>} Response Array of actions.
 */
 WalletTransaction.prototype._updateStoreProcess = async (key, value) =>{
    log.options.tags = ['log', '<<level>>']; 
    try {
        const dateFormat = require('dateformat');
        await dynamo.updateDB({
            TableName: process.env.DYNAMODB_TABLE_STORE_AUTOMATION,
            Key: {
                storeuuid: this.storeuuid,
                process: this.process,
            },
            UpdateExpression: "set #fn = :fv, updatedAt = :ut",
            ExpressionAttributeValues: {
              ":fv": value,
              ":ut": dateFormat(new Date(), "isoUtcDateTime")
            },
            ExpressionAttributeNames: {
              "#fn": key
            },
            ReturnValues: "UPDATED_NEW"
          });
        return true;
    } catch (e) {
        log.error(e);
        throw e;
    }
};
/**
 * update store process attributes
 *
 * @author Allyn j. Alford <Allyn@tenablylabs.com>
 * @async
 * @function _updateStoreProcessFields
 * @param {Array} fields - name/value pairs of attribute name / value
 * @param {String} value - value to set attribute to
 * @requires module:./dynamo
 * @throws Will throw an error from dynamoDB.
 * @example <caption>Example usage of _StoreProcessStart.</caption>
 * // returns Promise with DynamoDB response Array of empty of successful or an error response.
 * processCruds._StoreProcessStart(uuid, baseConfig.processes.SETUP, baseConfig.steps.SETUP.START);
 * @return {Promise<Array>} Response Array of actions.
 */
 WalletTransaction.prototype._updateStoreProcessFields = async (fields) => {
    log.options.tags = ['log', '<<level>>']; 
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
        TableName: process.env.DYNAMODB_TABLE_STORE_AUTOMATION,
        Key: {
            storeuuid: this.storeuuid,
            process: this.process,
        },
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
/**
 * get all store processes
 *
 * @author Allyn j. Alford <Allyn@tenablylabs.com>
 * @async
 * @function _getStoreProcesses
 * @requires module:./dynamo
 * @throws Will throw an error from dynamoDB.
 * @example <caption>Example usage of _StoreProcessStart.</caption>
 * // returns Promise with DynamoDB response Array of empty of successful or an error response.
 * processCruds._StoreProcessStart(uuid, baseConfig.processes.SETUP, baseConfig.steps.SETUP.START);
 * @return {Promise<Array>} Response Array of actions.
 */
 WalletTransaction.prototype._getStoreProcesses = async () =>{
    log.options.tags = ['log', '<<level>>']; 
    try {
        return await dynamo.queryDB({
            TableName: process.env.DYNAMODB_TABLE_STORE_AUTOMATION,
            KeyConditionExpression: "#dmn = :uuid",
            ExpressionAttributeNames: {
              "#dmn": "storeuuid"
            },
            ExpressionAttributeValues: {
              ":uuid": this.storeuuid
            }
          });
    } catch (e) {
        log.error(e);
        throw e;
    };
};
/**
 * get store processes based on an attribute filter
 *
 * @author Allyn j. Alford <Allyn@tenablylabs.com>
 * @async
 * @function _getStoreProcesses
 * @param {String} filter - attribute name to filter by
 * @param {String} filterVal - attribute value to filter by
 * @requires module:./dynamo
 * @throws Will throw an error from dynamoDB.
 * @example <caption>Example usage of _StoreProcessStart.</caption>
 * // returns Promise with DynamoDB response Array of empty of successful or an error response.
 * processCruds._StoreProcessStart(uuid, baseConfig.processes.SETUP, baseConfig.steps.SETUP.START);
 * @return {Promise<Array>} Response Array of actions.
 */
 WalletTransaction.prototype._filterStoreProcesses = async (filter, filterVal) =>{
    log.options.tags = ['log', '<<level>>']; 
    try {
        return await dynamo.queryDB({
            TableName: process.env.DYNAMODB_TABLE_STORE_AUTOMATION,
            KeyConditionExpression: "#dmn = :uuid",
            FilterExpression: "attribute_exists(#filter) AND #filter = :filterVal",
            ExpressionAttributeNames: {
              "#dmn": "storeuuid",
              "#filter" : filter
            },
            ExpressionAttributeValues: {
              ":uuid": this.storeuuid,
              ":filterVal": true
            }
          });
    } catch (e) {
        log.error(e);
        throw e;
    };
};

/**
 * get a store process
 *
 * @author Allyn j. Alford <Allyn@tenablylabs.com>
 * @async
 * @function _getStoreProcess
 * @requires module:./dynamo
 * @throws Will throw an error from dynamoDB.
 * @example <caption>Example usage of _StoreProcessStart.</caption>
 * // returns Promise with DynamoDB response Array of empty of successful or an error response.
 * processCruds._StoreProcessStart(uuid, baseConfig.processes.SETUP, baseConfig.steps.SETUP.START);
 * @return {Promise<Array>} Response Array of actions.
 */
 WalletTransaction.prototype._getStoreProcess = async (processId) =>{
    log.options.tags = ['log', '<<level>>']; 
    try {
        return await dynamo.qetFromDB({
            TableName: process.env.DYNAMODB_TABLE_STORE_AUTOMATION,
            Key: {
              storeuuid: this.storeuuid,
              process: processId
            }
          });
    } catch (e) {
        console.error(e);
        throw e;
    };
};
/**
 * delete a store process
 *
 * @author Allyn j. Alford <Allyn@tenablylabs.com>
 * @async
 * @function _deleteStoreProcess
 * @requires module:./dynamo
 * @throws Will throw an error from dynamoDB.
 * @example <caption>Example usage of _StoreProcessStart.</caption>
 * // returns Promise with DynamoDB response Array of empty of successful or an error response.
 * processCruds._StoreProcessStart(uuid, baseConfig.processes.SETUP, baseConfig.steps.SETUP.START);
 * @return {Promise<Array>} Response Array of actions.
 */
 WalletTransaction.prototype._deleteStoreProcess = async (proces) =>{
    log.options.tags = ['log', '<<level>>']; 
    try {
        return await dynamo.deleteItemFromDB({
            TableName: process.env.DYNAMODB_TABLE_STORE_AUTOMATION,
            Key: {
                storeuuid: this.storeuuid,
                process
            }
        });
    } catch (e) {
        log.error(e);
        throw e;
    };
};
module.exports = WalletTransaction;