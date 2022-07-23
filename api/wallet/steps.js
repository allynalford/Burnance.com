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
    let req, dt, address, chain;
    try{
        //req = (event.body !== "" ? JSON.parse(event.body) : event);
        req = event;
        log.options.tags = ['log', '<<level>>'];
        dt = dateFormat(new Date(), "isoUtcDateTime");
        address  = req.address;
        chain  = req.chain;
        if(typeof address  === 'undefined') throw new Error("address is undefined");
        if(typeof chain  === 'undefined') throw new Error("chain is undefined");
    }catch(e){
      console.error(e);
      const error = new CustomError('HandledError', e.message);
      return error;
    }

    try{

        //Check Parameters are valid and pass them along
        
        //Init the quickNode utils module
        const quickNodeUtils = require('../quicknode/quickNodeUtils');

        //Load the full list of NFTs
        let walletNFTs = await quickNodeUtils._qn_fetchFullNFTs(address);

        //Loop the NFTs and check which are loaded
        let nfts = [], exists = [];
        const walletUtils = require('../wallet/utils');

        
 
        //Load the consts
        const pages = walletNFTs.totalPages;
        const totalItems = walletNFTs.totalItems;

        //Starting page number 1
        let pageNumber = walletNFTs.pageNumber;

         //Loop and call a new page
        while (pageNumber < pages) {

            console.info('Processing Page:',pageNumber);

            //Loop the page contents
            for (const nft of walletNFTs.assets) {

                //Check if the NFT exists within the data
                exists = await walletUtils._getWalletNFT(address, nft.collectionAddress + nft.collectionTokenId);

                if (exists.length === 0) {
                    //Since it's not in the database, add to the list for loading
                    nfts.push({address: nft.collectionAddress, tokenId: nft.collectionTokenId});
                };

            };

            //Increase the page Number
            pageNumber++;

            //Grab the next page
            walletNFTs = await quickNodeUtils._qn_fetchNFTs(address, pageNumber);
            console.info('Loaded Page:',pageNumber);
        }


        //Pass the list of non-loaded NFTs to the load step
        const response = {
            address, 
            chain,
            nfts
        };

        //console.info(response);
        console.info('NFT QTY:', totalItems);
        console.info('nftsToLoad QTY:', nftsToLoad.length);

       return response;
    }catch(e){
        console.error(e);
        const error = new CustomError('HandledError', e.message);
        return error;
    }
  
};




module.exports.loadWalletData = async event => {
    let req, dt, address, chain, nfts, pupUtils, etherUtils, walletUtils, web3;

    try{
        req = (event.body !== "" ? JSON.parse(event.body) : event);
        //req = event;
        log.options.tags = ['log', '<<level>>'];
        dt = dateFormat(new Date(), "isoUtcDateTime");
        address  = req.address;
        chain  = req.chain;
        nfts = req.nfts;

        if(typeof address  === 'undefined') throw new Error("address is undefined");
        if(typeof chain  === 'undefined') throw new Error("chain is undefined");
        if(typeof nfts  === 'undefined') throw new Error("nfts is undefined");
        if(nfts.length === 0) throw new Error("nfts is an empty Array");

        pupUtils = require('../pup/utils');
        etherUtils = require('../etherscan/ethUtils');
        walletUtils = require('../wallet/utils');
        const Web3 = require('web3');
        //add provider to it
        web3 = new Web3(process.env.QUICK_NODE_HTTP);
        
    }catch(e){
      log.error(e);
      const error = new CustomError('HandledError',e.message);
      return error;
    }

    try{

        const MAX_TRYS = 10, TRY_TIMEOUT = 800;
        function toTry() {
            return new Promise((ok, fail) => {
                setTimeout(() => Math.random() < 0.05 ? ok("OK!") : fail("Error"), TRY_TIMEOUT);
            });
        }
        async function tryNTimes(toTry, count = MAX_TRYS) {
            if (count > 0) {
                const result = await toTry().catch(e => e);
                if (result === "Error") { return await tryNTimes(toTry, count - 1) }
                return result
            }
            return `Tried ${MAX_TRYS} times and failed`;
        }

        var browser = await pupUtils.getBrowser();

        //Create a page
        //const page = await browser.newPage();
        const page = (await browser.pages())[0];

        await page.setUserAgent(pupUtils.getRandomAgent());

        await page.setRequestInterception(true);

        //if the page makes a  request to a resource type of image then abort that request
        page.on('request', request => {
            if (request.resourceType() === 'image')
                request.abort();
            else
                request.continue();
        });



        console.info('Browser Tabs: ', (await browser.pages()).length);

        //Start the loop thru the nfts
        let index = 0;
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
        for(const nft of nfts){

            console.log('processing: ',nft);
            //Get the data from API txs
            const tx = await etherUtils.getNFTtx(chain, address, nft.address, nft.tokenId);

            console.log('txs', tx);

            // costETH,
            // costUSD,
            // valueETH,
            // valueUSD,
            // ethTransPriceUSD: price.result[0].value,
            // etherScanTxUrl,
            // hash


            //Get the gas fees from Etherscan
            //const gasData = tryNTimes(pupUtils.getTxTransactionFee(txs.hash));
            const url = `https://etherscan.io/tx/${tx.hash}`;

            let gasData = {retry: true};


            if(typeof tx.gasData === "undefined"){
                while(typeof gasData.retry !== "undefined"){

                    gasData = await pupUtils.getTxTransactionFee(url, page);
                    
                    if(typeof gasData.retry !== "undefined"){
                        console.log("Delaying 12000");

                        //delay next call
                        await delay(12000);

                        //change the user agent
                        await page.setUserAgent(pupUtils.getRandomAgent());

                    }else{
                        let fields = [{name: 'status', value: 'loaded'},{name: 'gasData', value:  gasData}]
                       
                        //Update the NFT in the wallet
                        gasData.gasETH = web3.utils.fromWei(gasData.txFee.toString(), 'ether');
                        gasData.gasUSD = parseFloat(gasData.gasETH * gasData.closingPrice);

                        fields.push({ name: 'gasUSD', value:  gasData.gasUSD});
                        fields.push({name: 'gasETH', value:  gasData.gasETH});

                        

                        //Calculate the cost
                        gasData.costETH = (Number(gasData.gasETH) + Number(tx.valueETH));
                        gasData.costUSD = parseFloat(gasData.costETH * gasData.closingPrice);

                        console.log('costETH: ',gasData.costETH);
                        console.log('costUSD: ',gasData.costUSD);

                        fields.push({name: 'costETH', value:  gasData.costETH});
                        fields.push({name: 'costUSD', value:  gasData.costUSD});

                        nft.gasData = gasData;

                        const update = await walletUtils._updateWalletNFTFields(chain, nft.address + nft.tokenId, fields);
                        console.log('Update',update);
                    }
    
                    
                }
            }else{
                console.log("NFT already loaded");
            }


            index++;

            //Get the NFT Image
            if(index === 25){
                break;
            }


        };

        //Start cleaning up the browser session
        page.removeAllListeners();

        //Close the page
        await page.close();

        //Close the browser
        await browser.close();
        
       
        const resp = {

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



