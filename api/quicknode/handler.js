/*jshint esversion: 8 */
/* jshint -W117 */
/* jshint -W097 */
"use strict";
const responses = require("../common/responses.js");
const log = require("lambda-log");
const quickNode = require('./quickNodeUtils');
const _ = require('lodash');


module.exports.qn_fetchNFTs = async (event) => {
  let req, address, chain, pageNumber, cached = false, saved = false;

  try {
    //Logging
    log.options.meta.event = event;
    // add additional tags to all logs
    log.options.tags.push(event.env);


    //Request
    req = JSON.parse(event.body);

    //Request Parameters
    chain = req.chain;
    address = req.address;
    pageNumber = req.pageNumber;

    //Validations
    if (typeof address === "undefined") throw new Error("address is undefined");
    if (typeof chain === "undefined") throw new Error("chain is undefined");
    if (typeof pageNumber === "undefined") throw new Error("pageNumber is undefined");
  } catch (e) {
    console.error(e);
    return responses.respond(
      {
        success: false,
        error: true,
        message: e.message,
      },
      416
    );
  }

  try {
    
    //Check the cache for the page first
    let ERC721s = await quickNode._qn_fetchNFTsCache(address, pageNumber);
    //console.log('ERC721s Cache', ERC721s.assets);

    if(typeof ERC721s === "undefined" || quickNode._isCacheExpired(ERC721s.timestamp) === true){
      //Let's call the API to get the first page
      ERC721s = await quickNode._qn_fetchNFTs(address, pageNumber);
      //console.log('ERC721s API', ERC721s);
      //Save the payload to the cache
      await quickNode._addfetchNFTsToCache(address, ERC721s.pageNumber, ERC721s);
      saved = true;
      //console.log('Cached',cache)
    }else{
        cached = true;
        ERC721s = ERC721s.assets
    };

    //Remove Shared Store front assets
    _.remove(ERC721s.assets, function(currentObject) {
        return currentObject.collectionName === "OpenSea Shared Storefront";
    });


    

    //respond
    return responses.respond(
      {
        error: false,
        success: true,
        cached,
        saved,
        ERC721s
      },
      200
    );
  } catch (err) {
    console.error(err);
    const res = {
      error: true,
      success: false,
      message: err.message,
      e: err,
      code: 201,
    };
    console.error("module.exports.qn_fetchNFTs", res);
    return responses.respond(res, 201);
  }
};
