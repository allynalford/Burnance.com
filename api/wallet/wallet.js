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


module.exports.AddWallet = async (event) => {
  let req, dt, chain, address;
  try {
    req = JSON.parse(event.body);
    dt = dateFormat(new Date(), "isoUtcDateTime");
    chain = req.chain;
    address = req.address;
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
    const walletUtils = require('./utils');

    //Add the wallet
    const add = walletUtils._addWallet(chain, address);

    return responses.respond({ error: false, success: true, add }, 200);
  } catch (err) {
    console.error(err);
    const res = {
      error: true,
      success: false,
      message: err.message,
      e: err,
      code: 201,
    };
    console.error("module.exports.AddWallet", res);
    return responses.respond(res, 201);
  }
};

module.exports.GetWallet = async (event) => {
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
    const walletUtils = require('./utils');

    //Add the wallet
    const wallet = walletUtils._getWallet(chain, address);

    return responses.respond({ error: false, success: true, wallet }, 200);
  } catch (err) {
    console.error(err);
    const res = {
      error: true,
      success: false,
      message: err.message,
      e: err,
      code: 201,
    };
    console.error("module.exports.GetWallet", res);
    return responses.respond(res, 201);
  }
};

module.exports.DeleteWallet = async (event) => {
  let req, dt, chain, address;
  try {
    req = JSON.parse(event.body);
    dt = dateFormat(new Date(), "isoUtcDateTime");

    chain = req.chain;
    address = req.address;

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
    const walletUtils = require('./utils');

    //Add the wallet
    const wallet = walletUtils._deleteWallet(chain, address);

    return responses.respond({ error: false, success: true, wallet }, 200);
  } catch (err) {
    console.error(err);
    const res = {
      error: true,
      success: false,
      message: err.message,
      e: err,
      code: 201,
    };
    console.error("module.exports.GetWallet", res);
    return responses.respond(res, 201);
  }
};