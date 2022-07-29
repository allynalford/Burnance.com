/*jshint esversion: 6 */
/* jshint -W117 */
'use strict';
const responses = require('../common/responses.js');
const dateFormat = require('dateformat');
const uuid = require('uuid');;
const _ = require('lodash');


	
module.exports.start = async event => {
    let dt, address, chain, stateMachineArn, exec;
  
    try{
       dt = dateFormat(new Date(), "isoUtcDateTime");

      chain = event.pathParameters.chain;
      address = event.pathParameters.address;

      stateMachineArn = process.env.STATE_MACHINE_COLLECTION_LIST_ARN;
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

        const name = `${chain}-${address}-` + Date.now();
        const params = {
            stateMachineArn,
            name,
            input: JSON.stringify({address, chain})
        };

        console.log(params);
        const AWS = require('aws-sdk');
        const stepfunctions = new AWS.StepFunctions();

        //Start the execution
        exec = await stepfunctions.startExecution(params).promise();

        return responses.respond({stateMachineArn, name, exec}, 200);

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
  let dt, chain, address, statistics;
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
    const walletUtils = require('../wallet/utils');
    const nftPortUtils = require('../nftport/utils');

    //We need to return
    // - Floor Price
    // - Holding Value: HELD * Floor Price or HELD * avg price
    // - Amount Invested: Calculate the amount invested based on basisCost of each NFT added together
    // - Pnl: Holding Value - Amount Invested
    // - Liquidity(7D): The liquidity rate measures the relative liquidity of each collection. Liquidity = Sales / The number of NFTs * 100%

    //Check if the collection already exists in cache
    var collections = await walletUtils._getWalletCollectionFromCache(chain, address);

    if(typeof collections === "undefined"){

      const alchemyUtils = require('../alchemy/utils');
      //Then grab the collections for this wallet
      const addresses = await alchemyUtils.getCollections(chain, address);

      console.info('Addresses to process:', addresses.length);

      collections = [];

      //loop the addresses and add them to the database
      for(const addr of addresses){

        //Check if the collection exists
        let collection = await collectionUtils._getCollection(chain, addr.address);

        //If the collection doesn't already exists in the wallet
        if(typeof collection === "undefined"){

          //Grab the wallets information
          const metaData = await alchemyUtils.getContractMetadata(chain, addr.address);

          collection = metaData.contractMetadata;
          collection.chain = chain;
          collection.address = metaData.address;


          try {
            statistics = await nftPortUtils._getCollectionStats(chain, addr.address);
          } catch (s) {
            console.log(s.message);
            statistics = {};

            //We need to look up the data elsewhere
          }


          if (typeof statistics.statistics !== "undefined") {

            console.log('Loaded Stats for new Collection', statistics.statistics);

            collection.statistics = statistics.statistics;

            //Add the collection
            await collectionUtils._addCollectionWithStats(
              chain,
              metaData.address,
              metaData.contractMetadata.name,
              metaData.contractMetadata.symbol,
              metaData.contractMetadata.totalSupply,
              metaData.contractMetadata.tokenType,
              collection.statistics
            );


          } else {
            //Add the collection
            await collectionUtils._addCollection(
              chain,
              metaData.address,
              metaData.contractMetadata.name,
              metaData.contractMetadata.symbol,
              metaData.contractMetadata.totalSupply,
              metaData.contractMetadata.tokenType
            );

          }

 
        } else {

          //Does the collection have the needed data
          if (typeof collection.statistics === "undefined") {
            let statistics;

            try {
              statistics = await nftPortUtils._getCollectionStats(chain, addr.address);
            } catch (s) {
              console.log(s.message);
              statistics = {};

              //We need to look up the data elsewhere
            }

            if (typeof statistics.statistics !== "undefined") {

              console.log('Adding Stats for Existing Collection',statistics.statistics);

              await collectionUtils._updateCollectionFields(chain, addr.address, [{ name: 'statistics', value: statistics.statistics }]);

              collection.statistics = statistics.statistics
            }
          }
        }


      

        collection.count = addr.count;

        //Add the collection
        collections.push(collection);
      }

      //Push the collection to the cache
      await walletUtils._addWalletCollectionToCache(chain, address, collections);

    }

    for (const collection of collections) {

      //We need to return
      // - Floor Price
      // - Holding Value: HELD * Floor Price or HELD * avg price
      // - Amount Invested: Calculate the amount invested based on basisCost of each NFT added together
      // - Pnl: Holding Value - Amount Invested
      // - Liquidity(7D): The liquidity rate measures the relative liquidity of each collection. 
      //   Liquidity = Sales / The number of NFTs * 100%

      if (typeof collection.statistics !== "undefined") {

        collection.HoldingValue = (collection.count * collection.statistics.average_price);
        collection.FloorPrice = collection.statistics.floor_price;
        collection.AmountInvested = 0.00;
        collection.pnl = 0.00;
        collection.Liquidity7D = (collection.statistics.seven_day_sales / collection.statistics.num_owners) * 100;
      } else {
        collection.HoldingValue = 0.00;
        collection.FloorPrice = 0.00;
        collection.AmountInvested = 0.00;
        collection.pnl = 0.00;
        collection.Liquidity7D = 0;
        collection.notfound = true;
      }

    }



    if(typeof collections === "undefined"){
      collections = [];
    }

    return responses.respond({ error: false, success: true, collections }, 200);
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

module.exports.ViewCollection = async (event) => {
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
    const collectionUtils = require('./collectionUtils');
   // const alchemyUtils = require('../alchemy/utils');
    //const walletUtils = require('../wallet/utils');
    

    //Grab the collection
    const collection = await collectionUtils._getCollection(chain, contractAddress);

    //Grab the NFTs for the collection
    // const nfts = await alchemyUtils.getNFTsByContract(chain, address, [contractAddress]);

    // const updatedNfts = []. nftsToLoad = [];
    // //Loop the NFT's and get the data for them
    // for(const ownedNft of nfts.ownedNfts){
    //   //console.log(ownedNft);
    //   const nft = await walletUtils._ViewWalletNFT(chain, address, contractAddress, ownedNft.tokenId);

    //   //console.log(ownedNft);

    //   if(typeof nft === "undefined"){
    //     //Add to list to be loaded
    //     nft.loading = true;
    //     nftsToLoad.push({chain, address, contractAddress, tokenId: ownedNft.tokenId})
    //   };

    //   nft.title = ownedNft.title;
    //   nft.media = ownedNft.media;
    //   nft.contract = ownedNft.contract;
    //   nft.tokenId = ownedNft.tokenId;
    //   nft.description = ownedNft.description;

    //   updatedNfts.push(nft);
    // };

    // if(nftsToLoad.length !== 0){
    //   //Send list to State Machine
    // }


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
    console.error("module.exports.ViewCollection", res);
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