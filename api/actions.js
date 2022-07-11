/*jshint esversion: 8 */
/* jshint -W117 */
/* jshint -W097 */
"use strict";
const responses = require("./common/responses.js");
const log = require("lambda-log");
const dateformat = require("dateformat");
const uuid = require("uuid");
const endpoint = require('./common/endpoint');
const _ = require('lodash');
const cruds = require('./common/cruds');
const openAi = require('./gpt-3/gpt3Utils');
const etherScan = require('./etherscan/ethUtils');

module.exports.view = async (event) => {
    let req, dt, contractAddress, tokenId, chain, metaData = [], altText = {}, ABI = [], abiResp = {}, timestamp;

    try {
        //Logging
        log.options.meta.event = event;
        // add additional tags to all logs
        log.options.tags.push(event.env);

        //Time
        dt = dateformat(new Date(), "isoUtcDateTime");
        timestamp = new Date().getTime();

        //Request
        req = JSON.parse(event.body);

        //Request Parameters
        chain = req.chain;
        contractAddress = req.contractAddress;
        tokenId = req.tokenId;

        //Validations
        if (typeof contractAddress === "undefined")
            throw new Error("contractAddress is undefined");
        if (typeof tokenId === "undefined")
            throw new Error("tokenId is undefined");
        if (typeof chain === "undefined")
            throw new Error("chain is undefined");
    } catch (e) {
        console.error(e);
        return responses.respond(
            {
                success: false,
                error: true,
                message: e.message
            },
            416
        );
    }

    try {
        //Let's see if the NFT already exists within the database
        const NFT = await cruds._getNFT(contractAddress, tokenId, chain);

        //Check if we have it, if so return it fast
        if (typeof NFT !== "undefined") {
            return responses.respond(
                { error: false, success: true, dt, metadata: NFT.nftMetaData },
                200
            );
        }

        //Check if we have the ABI already
        abiResp = await cruds._getABI(contractAddress, "Ethereum");

        //Check if it exists
        if (typeof abiResp !== "undefined") {
            //If so, use it
            ABI = abiResp.abi;
        } else {
            //If not grab it from the service
            abiResp = await etherScan._getContractAbi(contractAddress);

            

            //Make sure it's not blank
            if (typeof abiResp === "undefined") {

                console.info("Could not find ABI");
                return responses.respond({
                    error: false,
                    success: false,
                    dt,
                    message: "Could not retrieve NFT"
                },
                    200);
            }

            //Grab the results array
            ABI = abiResp.result;
            //console.log('ABI', ABI)
            console.log('ABI is an Array', Array.isArray(ABI));
            //Make sure it's not blank
            if (typeof ABI === "undefined" | ABI.length === 0) {

                console.info("ABI is empty");
                return responses.respond({
                    error: false,
                    success: false,
                    dt,
                    abiResp,
                    message: "Could not retrieve NFT"
                },
                    200);
            }

            //Save the ABI
            await cruds._saveABI({
                contractAddress,
                chain,
                abi: ABI,
                abiuuid: uuid.v4(),
                createdBy: 'System',
                updatedBy: null,
                createdAt: timestamp,
                updatedAt: timestamp,
                createdDateGMT: dateformat(new Date(), "isoUtcDateTime")
            });
        }


        //Let's grab a provider for contract interactions
        const provider = await etherScan._getProvider(process.env.NODE);

        //Use the provider and key to grab the wallet
        const wallet = await etherScan._createWallet(process.env.KEY, provider);

        // initiating a new Contract with the contractAddress, ABI and wallet
        let contract = await etherScan._getContract(contractAddress, ABI, wallet);

        //Grab the metadata use the contract to call the URL function with the tokenID
        let tokenURI = await etherScan._tokenURI(contract, tokenId);

        //Make sure the URI isn't blank
        if (tokenURI.length === 0) {
            //respond
            return responses.respond({
                error: false,
                success: false,
                dt,
                message: "Could not retrieve NFT"
            },
                200);
        }

        //We may have several different metadata host
        if (tokenURI.includes('ipfs://')) {
            //Construct a URL for IPFS to get the metadata
            metaData.push({ text: "metadata", href: `https://ipfs.io/ipfs/${tokenURI.replace('ipfs://', '')}` });
        } else {
            metaData.push({ text: "metadata", href: tokenURI });
        }


        //Grab the token URL and get the metadata
        var url = _.find(metaData, { text: 'metadata' });

        //Call the get function on the URL
        let nftMetaData = await endpoint._get(url.href);

        //Get the data
        nftMetaData = nftMetaData.data;


        //Create the image URL, we may have various host for the image
        if (nftMetaData.image.includes('/ipfs/')) {
            nftMetaData.imageUrl = `https://ipfs.io${nftMetaData.image.substring(nftMetaData.image.indexOf('/ipfs/'))}`;
        } else if (nftMetaData.image.includes('ipfs://')) {
            nftMetaData.imageUrl = `https://ipfs.io/ipfs/${nftMetaData.image.replace('ipfs://', '')}`;
        } else {
            nftMetaData.imageUrl = nftMetaData.image;
        }




        //Save the NFT so we can respond faster
        await cruds._saveNFT({
            chainContractAddress: chain + '-' + contractAddress,
            tokenId,
            chain,
            contractAddress,
            nftuuid: uuid.v4(),
            imageUrl: nftMetaData.imageUrl,
            nftMetaData,
            metaData,
            createdBy: 'System',
            updatedBy: null,
            createdAt: timestamp,
            updatedAt: timestamp,
            createdDateGMT: dateformat(new Date(), "isoUtcDateTime")
        });


        //Push the basic explorer URLs only for the response
        metaData.push({ text: 'address', href: `https://etherscan.io/address/${contractAddress}` });
        metaData.push({ text: 'nft', href: `https://etherscan.io/nft/${contractAddress}/${tokenId}` });
        metaData.push({ text: 'token', href: `https://etherscan.io/token/${contractAddress}?a=${tokenId}` });

        //respond
        return responses.respond({
            error: false,
            success: true,
            dt,
            altText,
            metadata: nftMetaData
        },
            200);
    } catch (err) {
        console.error(err);
        const res = {
            error: true,
            success: false,
            message: err.message,
            e: err,
            code: 201,
        };
        console.error("module.exports.view", res);
        return responses.respond(res, 201);
    }
};
