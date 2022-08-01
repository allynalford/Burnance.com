/*jshint esversion: 6 */
/* jshint -W117 */
'use strict';
const responses = require('../common/responses.js');
const dateFormat = require('dateformat');
const uuid = require('uuid');;
const _ = require('lodash');


	
module.exports.addTx = async event => {
    let req, dt, chainAddress, contractAddresses, tokenID, chain;

    //Get from webScrape
    let timeStamp;

    //get from tx pull
    let to;
  
    try{
      req = JSON.parse(event.body);
      dt = dateFormat(new Date(), "isoUtcDateTime");

      chainAddress = req.chain + ":" + req.address;
      transactionHash = req.transactionHash;
      contractAddresses = req.contractAddresses;
      tokenID = req.tokenID;
      chain = req.chain,

      valueUSD = req.valueUSD,
      costUSD = req.costUSD,
      valueETH = req.valueETH,
      costETH = req.costETH,
      ethTransPriceUSD = req.ethTransPriceUSD

      if(typeof chainAddress  === 'undefined') throw new Error("chainAddress is undefined");
      if(typeof chain  === 'undefined') throw new Error("chain is undefined");
      if(typeof transactionHash  === 'undefined') throw new Error("transactionHash is undefined");
      if(typeof contractAddresses  === 'undefined') throw new Error("contractAddresses is undefined");
      if(typeof tokenID  === 'undefined') throw new Error("tokenID is undefined");

      if(typeof valueUSD  === 'undefined') valueUSD = 0;
      if(typeof costUSD  === 'undefined') costUSD = 0;
      if(typeof valueETH  === 'undefined') valueETH = 0;
      if(typeof costETH  === 'undefined') costETH = 0;
      if(typeof ethTransPriceUSD  === 'undefined') ethTransPriceUSD = 0;


  }catch(e){
    console.error(e);
      return respond({
          success: false,
          error: true,
          message: e.message,
          e
        }, 416);
  };
  

    try {
        


        return responses.respond({stateMachineArn, name, exec}, 200);

    } catch (e) {
        console.error(e);
        return e;
    }
};