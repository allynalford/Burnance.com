'use strict';
const log = require('lambda-log');
const dateFormat = require('dateformat');
const { add } = require('lodash');


function CustomError(name, message) {
    this.name = name;
    this.message = message;
}
CustomError.prototype = new Error();


module.exports.start = async event => {
    let req, dt, contractAddresses, chain, collectionUtils;
    try{
        //req = (event.body !== "" ? JSON.parse(event.body) : event);
        req = event;
        log.options.tags = ['log', '<<level>>'];
        dt = dateFormat(new Date(), "isoUtcDateTime");
        contractAddresses  = req.contractAddresses;
        chain  = req.chain;

        if(typeof contractAddresses  === 'undefined') throw new Error("contractAddresses is undefined");
        if(contractAddresses.length  === 0) throw new Error("contractAddresses list is empty");
        if(typeof chain  === 'undefined') throw new Error("chain is undefined");


        collectionUtils = require('./collectionUtils');


    }catch(e){
      console.error(e);
      const error = new CustomError('HandledError', e.message);
      return error;
    }

    try{


        //Lets loop the list of contract addresses and check if they exists, 
        
        //add them to a new list
        let addresses = [];

        for(const address of contractAddresses){
            //Check the database
            const exists = await collectionUtils._getCollection(chain, address);

            //exists
            if(typeof exists === "undefined"){
                //Add the address to the list
                addresses.push(address);
            }
        }

        //Pass the addresses along to the next step
       return {chain, addresses};
    }catch(e){
        console.error(e);
        const error = new CustomError('HandledError', e.message);
        return error;
    }
  
};


module.exports.loadWalletCollections = async (event) => {
    let req, dt, chain, address, statistics;
    try {
        dt = dateFormat(new Date(), "isoUtcDateTime");
        //req = (event.body !== "" ? JSON.parse(event.body) : event);
        req = event;

        //POST parameters
        chain = req.chain;
        address = req.address;

        if (typeof chain === "undefined") throw new Error("chain is undefined");
        if (typeof address === "undefined") throw new Error("address is undefined");

    } catch (e) {
        console.error(e);
        const error = new CustomError('HandledError', e.message);
        return error;
    };

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));


    try {
        const collectionUtils = require('./collectionUtils');
        const nftPortUtils = require('../nftport/utils');
        const alchemyUtils = require('../alchemy/utils');
        const rariableUtils = require('../rarible/utils');
        const walletUtils = require('../wallet/utils');
        const openSeaUtils = require('../opensea/openSeaUtils');


        //Then grab the collections for this wallet
        const addresses = await alchemyUtils.getCollections(chain, address);

        //Log the address count
        console.info('Wallet Collection Count:', addresses.length);

        let loaded = 0, enriched = 0, existed = 0, saved = 0;
        //loop the addresses and add them to the database
        for (const addr of addresses) {

            //Check if the collection exists
            let collection = await collectionUtils._getCollection(chain, addr.address);

            //If the collection doesn't already exists in the database
            if (typeof collection === "undefined") {

                const assetContract = await openSeaUtils._getAssetContract(addr.address);
                console.log('assetContract:', assetContract);
                const slug = assetContract.collection.slug;

                //Grab the wallets information
                const metaData = await alchemyUtils.getContractMetadata(chain, addr.address);

                collection = metaData.contractMetadata;
                collection.chain = chain;
                collection.address = metaData.address;


                try {
                    statistics = await openSeaUtils._retrieveCollectionStats(slug);
                } catch (s) {
                    console.log(`${addr.address} Failed and didn't exists for: (${metaData.contractMetadata.name})`,s.message);
                    statistics = {};
                    delay(7000);
                    //We need to look up the data elsewhere
                }


                if (typeof statistics.stats !== "undefined") {

                    console.log('Loaded Stats for new Collection', metaData.contractMetadata.name);

                    collection.statistics = statistics.stats;

                    //Add the collection
                    await collectionUtils._addCollectionWithStats(
                        chain,
                        metaData.address,
                        metaData.contractMetadata.name,
                        metaData.contractMetadata.symbol,
                        metaData.contractMetadata.totalSupply,
                        metaData.contractMetadata.tokenType,
                        collection.statistics,
                        assetContract
                    );

                        enriched++;
                        loaded++;
                        saved++;
                } else {
                    console.log("Couldn't Load Collection Stats")
                    //Add the collection
                    await collectionUtils._addCollection(
                        chain,
                        metaData.address,
                        metaData.contractMetadata.name,
                        metaData.contractMetadata.symbol,
                        metaData.contractMetadata.totalSupply,
                        metaData.contractMetadata.tokenType
                    );
                    loaded++;
                    saved++
                }

                await collectionUtils._updateCollectionFields(chain, addr.address, [{ name: 'loaded', value: true }]);

                delay(3000);

            } else {
                existed++;

                //Does the collection have the needed data
                if (typeof collection.stats === "undefined") {
                    let statistics;

                    const assetContract = await openSeaUtils._getAssetContract(addr.address);
                    console.log('assetContract:', assetContract);
                    const slug = assetContract.collection.slug;

                    try {
                        statistics = await openSeaUtils._retrieveCollectionStats(slug);
                    } catch (s) {
                        console.log(`${addr.address} Failed and needs data`,s.message);
                        statistics = {};
                        delay(7000);
                        //We need to look up the data elsewhere
                    }

                    if (typeof statistics.stats !== "undefined") {

                        console.log('Adding Stats for Existing Collection', statistics.statistics);

                        await collectionUtils._updateCollectionFields(
                          chain,
                          addr.address,
                          [
                            {
                              name: "statistics",
                              value: statistics.stats,
                            },
                            { name: "loaded", value: true },
                            { name: "contract", value: assetContract },
                          ]
                        );

                        delay(2000);
                        enriched++;
                    } else if(typeof collection.rariable === "undefined") {
                        console.log("No Stats to load. Loading rariable stats...");

                        //Get stats from rariable
                        const raribleStats = await rariableUtils._getCollectionStats(chain, addr.address);
                        console.log("No Stats.. Loaded Rariable Stats..", raribleStats.data);

                        await collectionUtils._updateCollectionFields(
                          chain,
                          addr.address,
                          [
                            { name: "rariable", value: raribleStats.data },
                            { name: "loaded", value: true },
                          ]
                        );
                   
                        enriched++;
                    }else if(typeof collection.rariable !== "undefined") {
                        console.log(`Alternate Stats loaded for ${addr.address}`);
                    }
                }
            }
        }

        if(loaded !== 0){
            await walletUtils._updateWalletFields(chain, address, [
                {name: "collections", value: true},
                {name: "enriched", value: enriched},
                {name: "loaded", value: loaded},
                {name: "existed", value: true},
                {name: "saved", value: saved}
            ])
        }


        return { error: false, success: true, chain, address, enriched, loaded, existed, saved }
    } catch (e) {
        console.error(e);
        const error = new CustomError('HandledError', e.message);
        return error;
    }
};


module.exports.loadCollections = async event => {
    let req, dt, addresses, chain, collectionUtils, alchemyUtils, nftPortUtils;

    try{
        req = (event.body !== "" ? JSON.parse(event.body) : event);
        //req = event;
        log.options.tags = ['log', '<<level>>'];
        dt = dateFormat(new Date(), "isoUtcDateTime");
        addresses  = req.addresses;


        if(typeof addresses  === 'undefined') throw new Error("addresses is undefined");
        if(addresses.length  === 0) throw new Error("addresses list is empty");
        if(typeof chain  === 'undefined') throw new Error("chain is undefined");

        collectionUtils = require('./collectionUtils');
        alchemyUtils = require('../alchemy/utils');
        nftPortUtils = require('../nftport/utils');
        
    }catch(e){
      log.error(e);
      const error = new CustomError('HandledError',e.message);
      return error;
    }

    try{

        //Loop the collections and collect the data

        for(const address of addresses){
            //Get the floorPrice
            const floor = collectionUtils._loadCollectionFloorPrice(chain, address);

            //Get Stats from NFT Port
            const stats = nftPortUtils._getCollectionStats(chain, address);

            //Get the collection Name
            const collection = await alchemyUtils.getContractMetadata(chain, address);


            //Save the collection
            await collectionUtils._addCollection(chain, address, collection.name, collection.symbol, collection.totalSupply, collection.tokenType);

            //Update the fields
            // floorPrice, #floorUpdated
            await collectionUtils._updateCollectionFields(chain, address, [
              { name: "floor", value: floor.results },
              { name: "floorPrice", value: floor.results.avgFloorPriceUSD },
              { name: "floorUpdated", value: dateFormat(new Date(), "isoUtcDateTime") },
              { name: "statistics", value: statistics },
              { name: "statisticsUpdated", value: dateFormat(new Date(), "isoUtcDateTime") },
            ]);
        }

        log.info('return', resp);
        const responses = require('../common/responses');
        return responses.respond(
            {
              error: false,
              success: true,
              nfts
            },
            200
          ); 

        return resp
    }catch(e){
        console.error(e);
        const error = new CustomError('HandledError', e.message);
        return error;
    }

};



module.exports.stop = async (event) => {
    console.log(event)


    return { success: true };
};

module.exports.stop = async (event) => {
    log.options.tags = ['log', '<<level>>'];
    log.info('event', event);

    try {



        return { stop: true };
    } catch (e) {
        log.error(e);
        return e;
    }
};
// {
//     "version":"0",
//     "id":"dd8f2f53-3c6e-43b6-d5b5-312ec08a2e1a",
//     "detail-type":"Step Functions Execution Status Change",
//     "source":"aws.states",
//     "account":"177038571739",
//     "time":"2022-05-18T01:25:09Z",
//     "region":"us-east-1",
//     "resources":[
//        "arn:aws:states:us-east-1:177038571739:execution:shopifySetupStateMachine-remediation-dev:defbf3a9-4962-440a-90a3-7011a5b3944f"
//     ],
//     "detail":{
//        "executionArn":"arn:aws:states:us-east-1:177038571739:execution:shopifySetupStateMachine-remediation-dev:defbf3a9-4962-440a-90a3-7011a5b3944f",
//        "stateMachineArn":"arn:aws:states:us-east-1:177038571739:stateMachine:shopifySetupStateMachine-remediation-dev",
//        "name":"defbf3a9-4962-440a-90a3-7011a5b3944f",
//        "status":"FAILED",
//        "startDate":1652837103848,
//        "stopDate":1652837109161,
//        "input":"{\"domainglobaluuid\":\"2951ef5c-2e98-4f41-8cda-1b091e61301e\",\"companyglobaluuid\":\"7e36dba0-3a3a-11ea-95f7-c5b273ab0a92\"}",
//        "output":null,
//        "inputDetails":{
//           "included":true
//        },
//        "outputDetails":null
//     }
//  }
module.exports.notification = async event => {

    log.options.tags = ['log', '<<level>>'];
    log.info(event);

    //const input = JSON.parse(event.detail.input);

    //log.info(input);




    return { event }
};



