/*jshint esversion: 6 */
/* jshint -W117 */
'use strict';
const responses = require('../common/responses.js');
const dateFormat = require('dateformat');
const uuid = require('uuid');;
const _ = require('lodash');


	
module.exports.start = async event => {
    let req, dt, address, chain, stateMachineArn;
  
    try{
      req = JSON.parse(event.body);
      dt = dateFormat(new Date(), "isoUtcDateTime");
      address  = req.address;
      chain  = req.chain;
      stateMachineArn = process.env.state_machine_arn;
      if(typeof address  === 'undefined') throw new Error("address is undefined");
      if(typeof chain  === 'undefined') throw new Error("chain is undefined");
      if(typeof stateMachineArn  === 'undefined') throw new Error("Critical Error");
  }catch(e){
    console.error(e);
      return respond({
          success: false,
          error: true,
          message: e.message,
          e
        }, 416);
  };
  

    // stateMachineArn: The Amazon Resource Name (ARN) of the state machine to execute.
    // input: The string that contains the JSON input data for the execution, for example:
    //name: The name of the execution. This name must be unique for your AWS account, 
    //region, and state machine for 90 days. For more information, see Limits Related 
    try {
         //to State Machine Executions in the AWS Step Functions Developer Guide.
        const name = uuid.v4();
        const params = {
            stateMachineArn,
            name,
            input: JSON.stringify({address, chain})
        };

        console.log(params);
        //arn:aws:states:us-east-1:111122223333:stateMachine:HelloWorld-StateMachine
        const AWS = require('aws-sdk');
        const stepfunctions = new AWS.StepFunctions();

        //Start the execution
        const exec = await stepfunctions.startExecution(params).promise();

        //Check it's status
        //const stats = await stepfunctions.describeExecution({executionArn: exec.executionArn}).promise();

        //console.log(stats)

        return responses.respond({stateMachineArn, name, exec}, 200);

        // return stepfunctions.startExecution(params).promise().then((err, data) => {
        //     if (err) console.log(err, err.stack); // an error occurred
        //     else     console.log(data);           // successful response
        //     responses.respond({stateMachineArn}, 200);
        //     //callback(null, `Your state machine ${stateMachineArn} executed successfully`);
        // }).catch(error => {
        //     console.log(error);
        //     responses.respond(error, 200);
        // });
    } catch (e) {
        console.error(e);
        return e;
    }
};


module.exports.AddCollection = async (event) => {
  let req, chain, address, dt;
  try {
    req = JSON.parse(event.body);
    dt = dateFormat(new Date(), "isoUtcDateTime");
    chain = req.chain;
    address = req.address;
    if (typeof chain === "undefined") throw new Error("chain is undefined");
    if (typeof address === "undefined") throw new Error("address is undefined");
  } catch (e) {
    console.error(e);
    return responses.respond(
      {
        success: false,
        error: true,
        message: e.message,
        e,
      },
      416
    );
  }

  try {
    const collectionUtils = require('./collectionUtils');

    //Check if the collection exists already
    const exists = await collectionUtils._getCollection(chain, address);

    if(typeof exists === "undefined"){

      //Add the collection
      await collectionUtils._addCollection(chain, address);


      //Now lookup the collection's volume and floor price, and last activity date
      const stats = collectionUtils._getStats();

      //Get stats from rariable
      const rariableUtils = require('../rarible/utils');
      
      const raribleStats = rariableUtils._getCollectionStats(chain, address);

      //Now update the collection
      await collectionUtils._updateCollectionFields(chain, address, [
        { name: "floorPrice", value: stats.floor_price },
        { name: "volume", value: stats.total_volume },
        { name: "avgPrice", value: stats.average_price },
        { name: "mktCap", value: stats.market_cap },
        { name: "owners", value: stats.num_owners },
        { name: "owners", value: stats.num_owners },
        { name: "sales", value: stats.total_sales },
        { name: "supply", value: stats.total_supply },
        { name: "stats", value: stats },
        { name: "statsUpdated", value: dt },
      ]);
    }



    return responses.respond({ error: false, success: true, add, dt }, 200);
  } catch (err) {
    console.error(err);
    const res = {
      error: true,
      success: false,
      message: err.message,
      e: err,
      code: 201,
    };
    console.error("module.exports.AddCollection", res);
    return responses.respond(res, 201);
  }
};

module.exports.GetCollection = async (event) => {
  let dt, chain, address;
  try {
    dt = dateFormat(new Date(), "isoUtcDateTime");

    chain = event.pathParameters.chain;
    address = event.pathParameters.address;

    if (typeof chain === "undefined") throw new Error("chain is undefined");
    if (typeof address === "undefined") throw new Error("address is undefined");

  } catch (e) {
    console.error(e);
    return respond(
      {
        success: false,
        error: true,
        message: e.message,
        e,
      },
      416
    );
  }

  try {
    const collectionUtils = require('./collectionUtils');

    //Add the wallet
    var collection = await collectionUtils._getCollection(chain, address);

    if(typeof collection === "undefined"){
      collection = {};
    }

    return responses.respond({ error: false, success: true, collection }, 200);
  } catch (err) {
    console.error(err);
    const res = {
      error: true,
      success: false,
      message: err.message,
      e: err,
      code: 201,
    };
    console.error("module.exports.GetCollection", res);
    return responses.respond(res, 201);
  }
};

module.exports.GetCollectionDetails = async (event) => {
  let dt, chain, address;
  try {
    dt = dateFormat(new Date(), "isoUtcDateTime");

    chain = event.pathParameters.chain;
    address = event.pathParameters.address;

    if (typeof chain === "undefined") throw new Error("chain is undefined");
    if (typeof address === "undefined") throw new Error("address is undefined");

  } catch (e) {
    console.error(e);
    return respond(
      {
        success: false,
        error: true,
        message: e.message,
        e,
      },
      416
    );
  }

  try {
    const collectionUtils = require('./collectionUtils');

    //Add the wallet
    var collection = await collectionUtils._getCollectionDetails(chain, address);

    if(typeof collection === "undefined"){
      collection = {};
    }

    return responses.respond({ error: false, success: true, collection }, 200);
  } catch (err) {
    console.error(err);
    const res = {
      error: true,
      success: false,
      message: err.message,
      e: err,
      code: 201,
    };
    console.error("module.exports.GetCollectionDetails", res);
    return responses.respond(res, 201);
  }
};

module.exports.GetCollectionFloorPrice = async (event) => {
  let dt, chain, address;
  try {
    dt = dateFormat(new Date(), "isoUtcDateTime");

    chain = event.pathParameters.chain;
    address = event.pathParameters.address;

    if (typeof chain === "undefined") throw new Error("chain is undefined");
    if (typeof address === "undefined") throw new Error("address is undefined");

  } catch (e) {
    console.error(e);
    return respond(
      {
        success: false,
        error: true,
        message: e.message,
        e,
      },
      416
    );
  }

  try {
    const collectionUtils = require('./collectionUtils');
    const alchemyUtils = require('../alchemy/utils');

    //Add the wallet
    const results = await collectionUtils._loadCollectionFloorPrice(chain, address);
    results.rariable = await collectionUtils._getFloorPriceAvgs(chain, address);

    //console.log('results', results);

    if(typeof results === "undefined"){
      results = {};
    }

    return responses.respond({ error: false, success: true, results }, 200);
  } catch (err) {
    console.error(err);
    const res = {
      error: true,
      success: false,
      message: err.message,
      e: err,
      code: 201,
    };
    console.error("module.exports.GetCollectionFloorPrice", res);
    return responses.respond(res, 201);
  }
};

module.exports.GetCollectionVolume = async (event) => {
  let dt, chain, address;
  try {
    dt = dateFormat(new Date(), "isoUtcDateTime");

    chain = event.pathParameters.chain;
    address = event.pathParameters.address;

    if (typeof chain === "undefined") throw new Error("chain is undefined");
    if (typeof address === "undefined") throw new Error("address is undefined");

  } catch (e) {
    console.error(e);
    return respond(
      {
        success: false,
        error: true,
        message: e.message,
        e,
      },
      416
    );
  }

  try {
    const collectionUtils = require('./collectionUtils');

    //Add the wallet
    var collection = await collectionUtils._getCollectionVolume(chain, address);

    if(typeof collection === "undefined"){
      collection = {};
    }

    return responses.respond({ error: false, success: true, collection }, 200);
  } catch (err) {
    console.error(err);
    const res = {
      error: true,
      success: false,
      message: err.message,
      e: err,
      code: 201,
    };
    console.error("module.exports.GetCollectionVolume", res);
    return responses.respond(res, 201);
  }
};

module.exports.DeleteCollection = async (event) => {
  let dt, chain, address;
  try {;
    dt = dateFormat(new Date(), "isoUtcDateTime");

    chain = event.pathParameters.chain;
    address = event.pathParameters.address;

    if (typeof chain === "undefined") throw new Error("chain is undefined");
    if (typeof address === "undefined") throw new Error("address is undefined");

  } catch (e) {
    console.error(e);
    return respond(
      {
        success: false,
        error: true,
        message: e.message,
        e,
      },
      416
    );
  }

  try {
    const collectionUtils = require('./collectionUtils');

    //Add the wallet
    const collection = await collectionUtils._deleteWallet(chain, address);

    return responses.respond({ error: false, success: true, collection, dt }, 200);
  } catch (err) {
    console.error(err);
    const res = {
      error: true,
      success: false,
      message: err.message,
      e: err,
      code: 201,
    };
    console.error("module.exports.DeleteCollection", res);
    return responses.respond(res, 201);
  }
};