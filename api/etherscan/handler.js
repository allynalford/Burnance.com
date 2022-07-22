/*jshint esversion: 8 */
/* jshint -W117 */
/* jshint -W097 */
"use strict";
const responses = require("../common/responses.js");
const log = require("lambda-log");
const etherscan = require('./ethUtils');
const _ = require('lodash');
const dateformat = require("dateformat");
const { add } = require("lodash");

module.exports.tokenNftTx = async (event) => {
  let req,
    address,
    contractaddress,
    tokenId,
    cost,
    value,
    gas,
    gasUsed,
    ETH,
    price,
    valueETH,
    valueUSD,
    costUSD,
    costETH,
    gasETH,
    gasUSD,
    cumulativeGasUsedETH,
    cumulativeGasUsedUSD,
    etherScanTxUrl;
    
    const chain = "ethereum";
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

    //Check if the NFT already exists for this wallet
    const NFT = await etherscan._getWalletNFT(address, contractaddress + tokenId);

    console.log(NFT);

    if(typeof NFT !== "undefined" && NFT.length !== 0){
      return responses.respond(
        {
          error: false,
          success: true,
          costETH: NFT[0].costETH,
          costUSD: NFT[0].costUSD,
          valueETH: NFT[0].valueETH,
          valueUSD: NFT[0].valueUSD,
          ethTransPriceUSD: NFT[0].ethTransPriceUSD,
          etherScanTxUrl: `https://etherscan.io/tx/${NFT[0].hash}`
        },
        200
      );
    }

    //Check if the data already exists
     let tokenNftTx = await etherscan._getNftTxs(address, contractaddress + tokenId);
     
  
    if (typeof tokenNftTx === "undefined") {
      //Grab the NFT transactions from API if we don't have it
      tokenNftTx = await etherscan._tokenNftTx(contractaddress, address);
    }

    console.log(tokenNftTx);


      //Save the transactions
      await etherscan._addNftTx(address, contractaddress + tokenId, tokenNftTx.result);

      //console.log(tokenNftTx);

      //Get the transaction date
      const date = new Date(tokenNftTx.result[0].timeStamp * 1000);

      //Calculate the dates for the price
      const startAndStop = dateformat(date, "yyyy-mm-dd");

      //Based on the date of the transaction, lets get the price of ETH
      price = await etherscan._ethDailyPrice(startAndStop, startAndStop);
      //console.log('Price',price);

      //Create a web3 object to convert data
      var Web3 = require('web3');
      //add provider to it
      var web3 = new Web3(process.env.QUICK_NODE_HTTP);

      //var bntokens = web3.utils.toBN(tokens)
      //  gas: '166946',
      //   gasPrice: '38831702910',
      //   gasUsed: '157175',
      //   cumulativeGasUsed: '11333662',

      cumulativeGasUsedETH = web3.utils.fromWei(tokenNftTx.result[0].gasUsed.toString(), 'ether');
      cumulativeGasUsedUSD = parseFloat(cumulativeGasUsedETH * price.result[0].value);

      //2087944915703771750

      // const test = web3.utils.fromWei("2087944915703771750", 'ether');
      // console.log('test', test);

      
      etherScanTxUrl = `https://etherscan.io/tx/${tokenNftTx.result[0].hash}`;

      //Grab all the transactions based on the hash
      const txs = await etherscan._txListInternal(tokenNftTx.result[0].hash);

      console.log(txs);

      //Loop thru the transactions and add up the values
      valueETH = 0.0, gasETH = 0.0, gas = 0.0, gasUsed = 0.0, ETH = 0.0;
      for (const tx of txs.result) {

        const valueToEth = web3.utils.fromWei(tx.value.toString(), 'ether');

        const gasToEth = web3.utils.fromWei(tx.gas.toString(), 'ether');


        valueETH = (Number(valueETH) + Number(valueToEth));//First the value
        gasETH = (Number(gasETH) + Number(gasToEth));//First the value
      };
      // const tx = txs.result[txs.result.length-1];
      //console.log(tx);
      // value = web3.utils.fromWei(tx.value.toString(), 'ether');
      // gas = web3.utils.fromWei(tx.gas.toString(), 'ether');//Then the transaction cost in gas
      // gasUsed = web3.utils.fromWei(tx.gasUsed.toString(), 'ether');;//Then the transaction cost in gas

     // gasETH = web3.utils.fromWei(tokenNftTx.result[0].gasUsed.toString(), 'ether');
      gasUSD = parseFloat(gasETH * price.result[0].value);



      costETH = (Number(valueETH) + Number(gasETH));//Then the transaction cost in gas



      //Convert ETH to USD based on the price of ETH on that date
      costUSD = parseFloat(costETH * price.result[0].value);
      costUSD = (Number(gasUSD.toFixed(2)) + Number(costUSD.toFixed(2)));
   


      valueUSD = parseFloat(valueETH * price.result[0].value);

      const saveNFT = await etherscan._addWalletNFT(chain, address, contractaddress+tokenId, costUSD, costETH, valueUSD, valueETH, price.result[0].value, tokenNftTx.result[0].hash);
      console.log(saveNFT);
    


     //const currentPrice = await etherscan._ethPrice();

    //respond
    return responses.respond(
      {
        error: false,
        success: true,
        costETH,
        costUSD,
        valueETH,
        valueUSD,
        ethTransPriceUSD: price.result[0].value,
        etherScanTxUrl
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
    console.error("module.exports.tokenNftTx", res);
    return responses.respond(res, 201);
  }
};

module.exports.getEthPrice = async (event) => {

  try {

    //Check if the NFT already exists for this wallet
    const ethPrice = await etherscan._ethPrice();

    //respond
    return responses.respond(
      {
        error: false,
        success: true,
        result: ethPrice.result
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
    console.error("module.exports.getEthPrice", res);
    return responses.respond(res, 201);
  }
};
