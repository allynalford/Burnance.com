
/*jshint esversion: 6 */
/* jshint -W117 */
'use strict';
const responses = require('../common/responses.js');
const dateFormat = require('dateformat');
const uuid = require('uuid');;
const _ = require('lodash');

module.exports.allowance = async (event) => {
    let dt, chain, owner, tokenAddress, contractAddress;
    try {
      dt = dateFormat(new Date(), "isoUtcDateTime");
  
      chain = event.pathParameters.chain;
      owner = event.pathParameters.owner;
      tokenAddress = event.pathParameters.tokenAddress;
      contractAddress = event.pathParameters.contractAddress;
  
      if (typeof chain === "undefined") throw new Error("chain is undefined");
      if (typeof owner === "undefined") throw new Error("owner is undefined");
      if (typeof contractAddress === "undefined") throw new Error("contractAddress is undefined");
      if (typeof tokenAddress === "undefined") throw new Error("tokenAddress is undefined");

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
      //We need etherscan utils
      const etherScan = require('../etherscan/ethUtils');
      //Grab both of the token contract types
      const ERC20 = require('../abis/ERC20.json');
  
      //Grab a provider
      const provider = await etherScan._getProvider(process.env.NODE);
  
      //Use the provider and key to grab the wallet
      const wallet = await etherScan._createWallet(process.env.KEY, provider);
  
      //Check the type using ERC721 ABI to start
      let contract = await etherScan._getContract(tokenAddress, ERC20, wallet);
  
      //Check the allowance of the owners tokens the contract can use
      const allowance = await contract.allowance(owner, contractAddress);
  
  
      return responses.respond({ error: false, success: true, allowance, dt }, 200);
    } catch (err) {
      console.error(err);
      const res = {
        error: true,
        success: false,
        message: err.message,
        e: err,
        code: 201,
      };
      console.error("module.exports.allowance", res);
      return responses.respond(res, 201);
    }
  };