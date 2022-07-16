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
    
    //Grab the NFT transactions
     const tokenNftTx = await etherscan._tokenNftTx(contractaddress, address);

     //Get the transaction date
     const date = new Date(tokenNftTx.result[0].timeStamp * 1000);

     //Calculate the dates for the price
     const startAndStop = dateformat(date, "yyyy-mm-dd");

     //Create a web3 object to convert data
     var Web3 = require('web3');
     //add provider to it
     var web3 = new Web3(process.env.QUICK_NODE_HTTP);

     //var bntokens = web3.utils.toBN(tokens)
    //  gas: '166946',
    //   gasPrice: '38831702910',
    //   gasUsed: '157175',
    //   cumulativeGasUsed: '11333662',

    //Grab all the transactions based on the hash
    const txs = await etherscan._txListInternal(tokenNftTx.result[0].hash);
   
    //Loop thru the transactions and add up the values
    let value = 0;
    for(const tx of txs.result){
        //Add all the values togethers
        value = (Number(value) + Number(tx.value));//First the value
        value = (Number(value) + Number(tx.gasUsed));//Then the transaction cost in gas
    };

    console.log('value:', value);

    //Convert the value to Ether
    const ETH = web3.utils.fromWei(value.toString(), 'ether');

    console.log('ETH:', ETH);


     //Based on the date of the transaction, lets get the price of ETH
     const price = await etherscan._ethDailyPrice(startAndStop, startAndStop);

     console.log('price', price)

     //Convert ETH to USD based on the price of ETH on that date
     const amount = parseFloat(ETH * price.result[0].value);

     console.log("Amount:",amount);


    //respond
    return responses.respond(
      {
        error: false,
        success: true,
        cost: amount
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
