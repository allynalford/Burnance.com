/*jshint esversion: 6 */
/* jshint -W117 */
/* global BigInt */
'use strict';
const responses = require('../common/responses.js');
const pupUtils = require('../pup/utils');
const dateFormat = require('dateformat');
const uuid = require('uuid');;
const _ = require('lodash');
const WalletTransaction = require('../model/WalletTransaction');
//Create a web3 object to convert data
var Web3 = require('web3');
//add provider to it
var web3 = new Web3(process.env.QUICK_NODE_HTTP);


	
module.exports.addTx = async event => {
    let req, dt, address, chainAddress, contractAddresses, tokenID, chain, type, transactionHash;
    let valueUSD, costUSD, valueETH, costETH, ethTransPriceUSD;
  
    try{
      req = JSON.parse(event.body);
      dt = dateFormat(new Date(), "isoUtcDateTime");

      chainAddress = req.chain + ":" + req.address;
      address = req.address;
      transactionHash = req.transactionHash;
      contractAddresses = req.contractAddresses;
      tokenID = req.tokenID;
      chain = req.chain;
      type = req.type;

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
      return responses.respond({
          success: false,
          error: true,
          message: e.message,
          e
        }, 416);
  };
  

    try {

        const tx = new WalletTransaction(chain, address, transactionHash, type, contractAddresses, tokenID);

      
        //Set passed values
        tx.valueUSD = valueUSD;
        tx.costUSD = costUSD;
        tx.valueETH = valueETH;
        tx.costETH = costETH;
        tx.ethTransPriceUSD = ethTransPriceUSD;
        tx.dt = dt;

        //Load the transaction Data
        await tx.loadTX();

        //Load the GasData
        await tx.loadGasData();


        //Save the transaction
        await tx.save();
       
       
        return responses.respond({tx}, 200);

    } catch (e) {
        console.error(e);
        return e;
    }
};


module.exports.getGuaranteesTxs = async event => {
    let req, dt, address, chain, chainAddress;
    const type = WalletTransaction.prototype.type.GUARANTEE
    try{
      req = JSON.parse(event.body);
      dt = dateFormat(new Date(), "isoUtcDateTime");

      chain = event.pathParameters.chain;
      address = event.pathParameters.address;

      chainAddress = chain + ":" + address;


      if(typeof address  === 'undefined') throw new Error("address is undefined");
      if(typeof chain  === 'undefined') throw new Error("chain is undefined");
      if(typeof chainAddress  === 'undefined') throw new Error("chainAddress is undefined");



  }catch(e){
    console.error(e);
      return responses.respond({
          success: false,
          error: true,
          message: e.message,
          e
        }, 416);
  };
  

    try {
        const Burnance = require('../abis/HarvestArt.json');
        const etherScan = require('../etherscan/ethUtils');
        const collectionUtils = require('../collection/collectionUtils');

        const provider = await etherScan._getProvider(process.env.NODE);

        //Use the provider and key to grab the wallet
        const wallet = await etherScan._createWallet(process.env.KEY, provider);

        // initiating a new Contract with the contractAddress, ABI and wallet
        let contract = await etherScan._getContract(Burnance.networks[4].address, Burnance.abi, wallet);

        const guarantees = await contract.getGuarantees(address);

          
       let collections = [], transactions = [];
        for(const token of guarantees){

          
            const contractAddress = token[0].toLowerCase();
            const tokenId = BigInt(token[1]).toString();

       
            //We need to grab the collection, Check if it's in the list already
            let collection = _.find(collections, ['contractAddress', contractAddress]);
           
            if(typeof collection === "undefined"){                            // 0x077e9beb7ac6ef64ef255ebded0de4200749a2a2
                collection = await collectionUtils._getCollection(chain, contractAddress);
                //console.log('dB:',collection);
                
                if(typeof collection === "undefined"){
                    collections.push(collection);
                }
            };

            let tx = new WalletTransaction(chain, address, null, type, contractAddress, Number(tokenId));
            //Load the data from the DB
            tx = await tx.getByTokenId();

            tx.title = collection.name + ' ' + tokenId;
            tx.type = type;

            transactions.push(tx);
        }

        return responses.respond({transactions}, 200);


    } catch (e) {
        console.error(e);
        return e;
    }
};