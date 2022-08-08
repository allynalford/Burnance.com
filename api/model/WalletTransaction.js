'use strict';
const dateFormat = require('dateformat');
const log = require('lambda-log');
const dynamo = require('../common/dynamo');
const etherscan = require('../etherscan/ethUtils');
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
 * // new WalletTransaction(chain, address, transactionHash, type, contractaddress, tokenId);
 * @return {WalletTransaction} Solution Instance Object
 */
function WalletTransaction(chain, address, transactionHash, type, contractaddress, tokenID) { 
    this.chainAddress  = chain + ":" + address;
    this.address  = address;
    this.transactionHash = transactionHash || null;
    this.type = type;
    this.contractaddress = contractaddress;
    this.tokenID = tokenID;
}

/**
 * load the transaction from EtherScan
 *
 * @author Allyn j. Alford <Allyn@tenablylabs.com>
 * @async
 * @function loadTX
 * @requires module:./dynamo.js
 * @requires module:lambda-log
 * @requires module:dateformat
 * @example <caption>Example usage of get.</caption>
 * // const tx = new WalletTransaction(chain, address, transactionHash, type);
 * // await tx.loadTX();
 */
 WalletTransaction.prototype.loadTX = async function() {
    log.options.tags = ['log', '<<level>>'];
    try {
        const _ = require('lodash');
        const transactions = await etherscan._tokenNftTx(this.contractaddress, this.address);
        console.log('transactions', transactions);
        
        console.log('hash', {hash:this.transactionHash});
        const tx = _.find(transactions.result, {hash:this.transactionHash});
        console.log('tx', tx);
        //const transaction = await etherscan._eth_getTransactionByHash(tx.hash);
        
        this.to = tx.to;
        this.timeStamp = tx.timeStamp;
        this.tokenName = tx.tokenName;
        this.tokenSymbol = tx.tokenSymbol;
;
    } catch (e) {
        console.error(e);
        log.error(e);
        throw e;
    };
}

/**
 * load the transaction gas data from EtherScan using puppeteer
 *
 * @author Allyn j. Alford <Allyn@tenablylabs.com>
 * @async
 * @function loadGasData
 * @requires module:./dynamo.js
 * @requires module:lambda-log
 * @requires module:dateformat
 * @example <caption>Example usage of get.</caption>
 * // const tx = new WalletTransaction(chain, address, transactionHash, type);
 * // await tx.loadTX();
 */
 WalletTransaction.prototype.loadGasData = async function() {
    log.options.tags = ['log', '<<level>>'];
    try {
        //const pupUtils = require('../pup/utils');
        //const gasData = await pupUtils.getGasData(this.transactionHash);
        const gasData = await etherscan._eth_getTransactionValueAndGasByHash(this.transactionHash, this.ethTransPriceUSD);
       
        //console.log(gasData);


        this.transferGasETH = gasData.gasETH;
        this.transferValueETH = gasData.valueETH;
        this.closingPrice = gasData.price;
    } catch (e) {
        console.error(e);
        log.error(e);
        throw e;
    };
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
        this.transferGasETH = tx.txFee;
        this.transferValueETH = tx.value;

        this.isoDate = tx.isodate;
        this.week = tx.week;
        this.created = tx.createdatetime;
        this.updatedAt = tx.updatedat;

    } catch (e) {
        console.error(e);
        log.error(e);
        throw e;
    };
};

/**
 * get an Wallet Transaction from the database by TokenId and build the object
 *
 * @author Allyn j. Alford <Allyn@tenablylabs.com>
 * @async
 * @function getByTokenId
 * @requires module:./dynamo.js
 * @requires module:lambda-log
 * @requires module:dateformat
 * @example <caption>Example usage of get.</caption>
 * // const tx = new WalletTransaction(storeuuid, process, Automation.STATUS.SUCCEEDED);
 * // await tx.getByTokenId();
 * //@return {Promise<WalletTransaction>} WalletTransaction Object
 */
 WalletTransaction.prototype.getByTokenId = async function() {
    log.options.tags = ['log', '<<level>>'];
    try {

        const tx =  await dynamo.queryDB({
            TableName: process.env.DYNAMODB_TABLE_WALLET_SELL_TX,
            KeyConditionExpression: "#chainAddress = :chainAddress",
            FilterExpression: "#tokenID = :tokenID",
            ExpressionAttributeNames: {
                "#chainAddress": "chainAddress",
                "#tokenID": "tokenID"
            },
            ExpressionAttributeValues: {
                ":chainAddress": this.chainAddress,
                ":tokenID": this.tokenID
            },
        });

        if(typeof tx !== "undefined" && tx.length !== 0){
            this.transactionHash = tx[0].transactionHash;
            this.timeStamp = tx[0].timeStamp;
            this.contractAddress = tx[0].contractAddress;
            this.to = tx[0].to;
            this.valueUSD = tx[0].valueUSD;
            this.costUSD = tx[0].costUSD;
            this.valueETH = tx[0].valueETH;
            this.costETH = tx[0].costETH;
            this.ethTransPriceUSD = tx[0].ethTransPriceUSD;
            this.txUUID = tx[0].txUUID;
            this.transferGasETH = tx[0].transferGasETH;
            this.transferValueETH = tx[0].transferValueETH;
    
            this.isoDate = tx[0].isodate;
            this.week = tx[0].week;
            this.created = tx[0].createdatetime;
            this.updatedAt = tx[0].updatedat;
        }else{
            this.transactionHash = "0x000000";
            this.timeStamp = 1659336634;
            this.contractAddress = "0x000000000";
            this.to = "0x000000000";
            this.valueUSD = 0;
            this.costUSD = 0;
            this.valueETH = 0;
            this.costETH = 0;
            this.ethTransPriceUSD = 0;
            this.txUUID = "123456789";
            this.transferGasETH = 0;
            this.transferValueETH = 0;
    

            this.isodate = dateFormat(new Date(), "isoDate"),
            this.week = dateFormat(new Date(), "W"),
            this.createdatetime = dateFormat(new Date(), "isoUtcDateTime"),
            this.updatedat = dateFormat(new Date(), "isoUtcDateTime")
        }

        return this;
    } catch (e) {
        console.error(e);
        log.error(e);
        throw e;
    };
};

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
        const dt = this.dt;
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
                transferGasETH : this.transferGasETH,
                transferValueETH : this.transferValueETH,
                txUUID: this.txUUID,
                isoDate: this.isodate,
                week: this.week,
                created: this.createdatetime,
                updatedAt: this.updatedat
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