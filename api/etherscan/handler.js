/*jshint esversion: 8 */
/* jshint -W117 */
/* jshint -W097 */
"use strict";
const responses = require("../common/responses.js");
const log = require("lambda-log");
const etherscan = require('./ethUtils');
const _ = require('lodash');
const dateformat = require("dateformat");

module.exports.tokenNftTx = async (event) => {
  let req, address, contractaddress, tokenId;

  try {
    //Logging
    log.options.meta.event = event;
    // add additional tags to all logs
    log.options.tags.push(event.env);


    //Request
    req = JSON.parse(event.body);

    //Request Parameters
    tokenId = req.tokenId;
    address = req.address;
    contractaddress = req.contractaddress;

    //Validations
    if (typeof address === "undefined") throw new Error("address is undefined");
    if (typeof contractaddress === "undefined") throw new Error("chain is undefined");
    if (typeof tokenId === "undefined") throw new Error("tokenId is undefined");
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
    
     const tokenNftTx = await etherscan._tokenNftTx(contractaddress, address);

     console.log(tokenNftTx);
     const date = new Date(tokenNftTx.result[0].timeStamp * 1000);
     console.log('Time:',date.getTime());
     console.log('Date:',date);

     const startAndStop = dateformat(date, "yyyy-mm-dd");

     
     //const web3 = etherscan._getWeb3Provider(process.env.NODE);

     var Web3 = require('web3');
     //var web3Provider = new Web3.providers.HttpProvider(provider);
     var web3 = new Web3(process.env.QUICK_NODE_HTTP);

     //var bntokens = web3.utils.toBN(tokens)
    //  gas: '166946',
    //   gasPrice: '38831702910',
    //   gasUsed: '157175',
    //   cumulativeGasUsed: '11333662',

    let ETH = web3.utils.fromWei(tokenNftTx.result[0].gasUsed.toString(), 'ether');

     console.log('ETH:', ETH);

     ETH = web3.utils.fromWei("21226", 'gwei');

     console.log('ETH 2:', ETH);

     const price = await etherscan._ethDailyPrice(startAndStop, startAndStop);

     console.log('price',price)


     const amount = parseFloat(ETH * price);

     console.log(amount)



    

    //respond
    return responses.respond(
      {
        error: false,
        success: true,
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
