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

module.exports.startWalletLoad = async event => {
  let req, dt, address, chain, stateMachineArn;
  let AWS, stepfunctions, alchemyUtils;
  try{
    req = JSON.parse(event.body);
    dt = dateFormat(new Date(), "isoUtcDateTime");

    address  = req.address;
    chain  = req.chain;
    walletNftListStateMachineARN = process.env.STATE_MACHINE_WALLET_NFT_LIST_ARN;
    collectionListStateMachineARN = process.env.STATE_MACHINE_COLLECTION_LIST_ARN;

    AWS = require('aws-sdk');
    stepfunctions = new AWS.StepFunctions();
    alchemyUtils = require('../alchemy/utils');

    if(typeof address  === 'undefined') throw new Error("address is undefined");
    if(typeof chain  === 'undefined') throw new Error("chain is undefined");
    if(typeof walletNftListStateMachineARN  === 'undefined') throw new Error("Critical Error: walletNftListStateMachineARN");
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

    let collectionStateMachineName = uuid.v4(), nftStateMachineNames = [], nftStateMachineName;
    //Grab a list of Collections and TokenIds

    //Call the Collection Loading State Machine
    const CollectionExec = await stepfunctions
      .startExecution({
        stateMachineArn,
        name: collectionStateMachineName,
        input: JSON.stringify({ address, chain }),
      })
      .promise();

      console.log(CollectionExec);

    //       //Load the data
    // const addresses = await alchemyUtils.getCollections(chain, address);

    // //Loop the collections and call the NFT state Machine for every 5 addresses
    // let contractAddresses = [], index = 0;
    // for(const address of addresses){

    //   if(contractAddresses.length === 5){
    //     //Make call to service
    //     nftStateMachineName = uuid.v4();
    //   //Start the execution
    //     const collectionNFTLoadExec = await stepfunctions.startExecution({
    //       walletNftListStateMachineARN,
    //       name: nftStateMachineName,
    //       input: JSON.stringify({ chain, address, contractAddresses })
    //     }).promise();

    //     console.log(collectionNFTLoadExec);

    //     nftStateMachineNames.push(nftStateMachineName);

    //     //Clear out the list
    //     contractAddresses = [];

    //     //Add this address
    //     contractAddresses.push(address);
    //   }else{

    //     //Since we don't have 5, add the address
    //     contractAddresses.push(address)
    //   }

    //   index++;

    //   if(index === addresses.length){
    //     //Make a call with the last of the addresses
    //     console.log('last load of addresses', addresses);
    //   };

    // }




      //Check it's status
      //const stats = await stepfunctions.describeExecution({executionArn: exec.executionArn}).promise();

      //console.log(stats)

      return responses.respond({stateMachineArn, nftStateMachineNames, collectionStateMachineName}, 200);

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
  let req, chain, address, dt, add, name;
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
    const walletUtils = require('./utils');

    //Check if wallet exists, if it does update last connection date/time
    const exists = await walletUtils._getWallet(chain, address);

    if(typeof exists === "undefined"){
      //Add the wallet
      add = await walletUtils._addWallet(chain, address);
      console.log('Added', dt);

      //Make the call to load the wallet collections
      const stateMachineArn = process.env.STATE_MACHINE_COLLECTION_LIST_ARN;
      const AWS = require("aws-sdk");
      const stepfunctions = new AWS.StepFunctions();
      name = `${chain}-${address}-` + Date.now();
      const collectionLoad = await stepfunctions
        .startExecution({
          stateMachineArn: process.env.STATE_MACHINE_COLLECTION_LIST_ARN,
          name,
          input: JSON.stringify({ address, chain }),
        })
        .promise();
        console.log('State Machine Called:', {collectionLoad, name})
    }else{
      //Update the last connectionDate
      add = await walletUtils._updateWalletFields(chain, address, [{name: 'lastConnectionDateTime', value: dt}]);
      console.log('lastConnectionDateTime', dt);
    }

    return responses.respond({ error: false, success: true, add, name, dt }, 200);
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
    var wallet = await walletUtils._getWallet(chain, address);

    if(typeof wallet === "undefined"){
      wallet = {};
    }

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

module.exports.GetWalletNFTs = async (event) => {
  let dt, chain, address, pageNumber;
  try {
    dt = dateFormat(new Date(), "isoUtcDateTime");

    chain = event.pathParameters.chain;
    address = event.pathParameters.address;
    pageNumber = event.pathParameters.pageNumber;

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
    const alchemyUtils = require('../alchemy/utils');

    //Add the wallet
    var nfts = await alchemyUtils.getNFTs(chain, address);
    var wallet = [nfts.ownedNfts];
    //console.log(nfts.ownedNfts);

    //Check if the list has more NFTs
    if(typeof nfts.pageKey !== "undefined"){
      const page = await alchemyUtils.getNFTsByPageKey(chain, address, nfts.pageKey);
      console.log('Next Page',page);
      wallet.push(...page.ownedNfts)
    }

    //console.log(nfts);

    if(typeof wallet === "undefined"){
      wallet = [];
    }

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
    const walletUtils = require('./utils');

    //Add the wallet
    const wallet = await walletUtils._deleteWallet(chain, address);

    return responses.respond({ error: false, success: true, wallet, dt }, 200);
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

module.exports.ViewWalletCollectionNFTs = async (event) => {
  let dt, chain, address, contractAddress;
  try {
    dt = dateFormat(new Date(), "isoUtcDateTime");

    chain = event.pathParameters.chain;
    address = event.pathParameters.address;
    contractAddress = event.pathParameters.contractAddress;

    if (typeof chain === "undefined") throw new Error("chain is undefined");
    if (typeof address === "undefined") throw new Error("address is undefined");
    if (typeof contractAddress === "undefined") throw new Error("contractAddress is undefined");

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
    const alchemyUtils = require('../alchemy/utils');
    const walletUtils = require('../wallet/utils');
    

   //Grab the NFTs for the collection
    const nfts = await alchemyUtils.getNFTsByContract(chain, address, [contractAddress]);

    const updatedNfts = [], nftsToLoad = [];
    //Loop the NFT's and get the data for them
    for(const ownedNft of nfts.ownedNfts){
      //console.log(ownedNft);
      let nft = await walletUtils._ViewWalletNFT(chain, address, contractAddress, ownedNft.tokenId);

      //console.log(ownedNft);

      if(typeof nft === "undefined"){
        //Add to list to be loaded
        nft = {loading: true};

        nftsToLoad.push({chain, address, contractAddress, tokenId: ownedNft.tokenId})
      };

      nft.title = ownedNft.title;
      nft.media = ownedNft.media;
      nft.contract = ownedNft.contract;
      nft.tokenId = ownedNft.tokenId;
      nft.description = ownedNft.description;

      updatedNfts.push(nft);
    };

    if(nftsToLoad.length !== 0){
      //Send list to State Machine
    }


    return responses.respond({ error: false, success: true, nfts: updatedNfts }, 200);
  } catch (err) {
    console.error(err);
    const res = {
      error: true,
      success: false,
      message: err.message,
      e: err,
      code: 201,
    };
    console.error("module.exports.ViewCollection", res);
    return responses.respond(res, 201);
  }
};