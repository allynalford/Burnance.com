/*jshint esversion: 8 */
/* jshint -W117 */
/* jshint -W097 */
"use strict";
const cruds = require('./cruds');
const s3 = require('./s3Utils');
const endpoint = require('./endpoint');
const etherScan = require('../etherscan/ethUtils');
const log = require('lambda-log');
const axios = require('axios');
var path = require('path');
const dateformat = require("dateformat");
const uuid = require("uuid");
const _ = require('lodash');


module.exports._getNFTUrl = async (chain, contractAddress, tokenId, imageUrl) => {
    try {
        
        var imageExt = path.extname(imageUrl);

        //Make sure there is an ext
        if (imageExt === "") {
            imageExt = ".png"
        };


        const cleanExt = imageExt.replace(".", "");
        //Create the key to store it
        const Key = `${chain}/${contractAddress}/${tokenId}${imageExt}`;

        //Create the content type
        const ContentType = `image/${cleanExt === "jpg" ? "jpeg" : cleanExt}`;

        //Download the image
        const resp = await axios.get(imageUrl, {
            decompress: false,
            responseType: "arraybuffer",
        });

        //Upload the image to S3
        const saved = await s3._put({
            Bucket: process.env.NFT_IMAGE_CDN_BUCKET,
            Key,
            Body: resp.data,
            ContentType,
            ACL: 'public-read'
        });

        //console.log(`Saved(${Key}):`, saved);


        //Save the Image key data to DB
        await cruds._saveNFTImage(chain, contractAddress, tokenId, Key);

        // const generatedImageUrl = s3._generateGetUrl(
        //     process.env.NFT_IMAGE_CDN_BUCKET,
        //     Key,
        //     Expires
        // );

       return `https://${process.env.NFT_IMAGE_CDN_BUCKET}/${Key}`;


    } catch (e) {
        console.error('module.exports._getNFTUrl', e);
        log.error(e);
        throw e;
    }
};







module.exports.getNFTImage = async (chain, contractAddress, tokenId, imageUrl, Expires) => {
    let 
        dt,
        metaData = [],
        ABI = [],
        abiResp = {},
        timestamp
    try {
        //Logging
        log.options.meta.event = event;
        // add additional tags to all logs
        log.options.tags.push(event.env);

        //Time
        dt = dateformat(new Date(), "isoUtcDateTime");
        timestamp = new Date().getTime();


    } catch (e) {
        console.error(e);
        throw e;
    }

    try {


        //If we pass in a imageURL, download it, save it and return a generatedURL
        if (typeof imageUrl !== "undefined" && imageUrl !== "") {

            const generatedImageUrl = await this._getNFTUrl(chain, contractAddress, tokenId, imageUrl);

            return responses.respond(
                { error: false, success: true, dt, imageUrl: generatedImageUrl, imageAvail: true },
                200
            );
        }

        //check if the image exists in the database
        const NFTImage = await cruds._getNFTImage(contractAddress, tokenId, chain);

        if (typeof NFTImage !== "undefined") {
            // const generatedImageUrl = s3._generateGetUrl(
            //     process.env.NFT_IMAGE_CDN_BUCKET,
            //     NFTImage.key,
            //     180
            // );

            //Update the activity
            cruds._updateNFTImageLastActivityDate(chain, contractAddress, tokenId);

            return { error: false, success: true, dt, imageUrl: `https://${process.env.NFT_IMAGE_CDN_BUCKET}/${NFTImage.key}`, saved: true };
        }

        //Let's see if the NFT already exists within the database
        const NFT = await cruds._getNFT(contractAddress, String(tokenId), chain);

        //Check if we have it, if so return it fast
        if (typeof NFT !== "undefined") {
      
            const generatedImageUrl = await this._getNFTUrl(chain, contractAddress, tokenId, NFT.imageUrl);

            return { error: false, success: true, dt, imageUrl: generatedImageUrl };
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
                return  {
                    error: false,
                    success: false,
                    dt,
                    message: "Could not retrieve NFT",
                    imageUrl: `https://${process.env.NFT_IMAGE_CDN_BUCKET}/default-image.jpg`
                };
            }

            //Grab the results array
            ABI = abiResp.result;
            //console.log('ABI', ABI)
            console.log("ABI is an Array", Array.isArray(ABI));
            //Make sure it's not blank
            if ((typeof ABI === "undefined") | (ABI.length === 0)) {
                console.info("ABI is empty");
                return {
                    error: false,
                    success: false,
                    dt,
                    abiResp,
                    message: "Could not retrieve NFT",
                    imageUrl: `https://${process.env.NFT_IMAGE_CDN_BUCKET}/default-image.jpg`
                };
            }

            //Save the ABI
            await cruds._saveABI({
                contractAddress,
                chain,
                abi: ABI,
                abiuuid: uuid.v4(),
                createdBy: "System",
                updatedBy: null,
                createdAt: timestamp,
                updatedAt: timestamp,
                createdDateGMT: dateformat(new Date(), "isoUtcDateTime"),
            });
        }

        let tokenURI;
        try {
            //Let's grab a provider for contract interactions
            const provider = await etherScan._getProvider(process.env.NODE);

            //Use the provider and key to grab the wallet
            const wallet = await etherScan._createWallet(process.env.KEY, provider);

            // initiating a new Contract with the contractAddress, ABI and wallet
            let contract = await etherScan._getContract(contractAddress, ABI, wallet);

            //Grab the metadata use the contract to call the URL function with the tokenID
            tokenURI = await etherScan._tokenURI(contract, tokenId);
        } catch (e) {
            return {
                error: true,
                success: false,
                dt,
                message: e.message,
                imageUrl: `https://${process.env.NFT_IMAGE_CDN_BUCKET}/default-image.jpg`
            };
        }

        //Make sure the URI isn't blank
        if (tokenURI.length === 0) {
            //respond
            return {
                error: false,
                success: false,
                dt,
                message: "Could not retrieve NFT",
                imageUrl: `https://${process.env.NFT_IMAGE_CDN_BUCKET}/default-image.jpg`
            }
        }

        //We may have several different metadata host
        if (tokenURI.includes("ipfs://")) {
            //Construct a URL for IPFS to get the metadata
            metaData.push({
                text: "metadata",
                href: `https://ipfs.io/ipfs/${tokenURI.replace("ipfs://", "")}`,
            });
        } else {
            metaData.push({ text: "metadata", href: tokenURI });
        }

        //Grab the token URL and get the metadata
        var url = _.find(metaData, { text: "metadata" });

        //Call the get function on the URL
        let nftMetaData = await endpoint._get(url.href);

        //Get the data
        nftMetaData = nftMetaData.data;

        //Create the image URL, we may have various host for the image
        if (nftMetaData.image.includes("/ipfs/")) {
            nftMetaData.imageUrl = `https://ipfs.io${nftMetaData.image.substring(
                nftMetaData.image.indexOf("/ipfs/")
            )}`;
        } else if (nftMetaData.image.includes("ipfs://")) {
            nftMetaData.imageUrl = `https://ipfs.io/ipfs/${nftMetaData.image.replace(
                "ipfs://",
                ""
            )}`;
        } else {
            nftMetaData.imageUrl = nftMetaData.image;
        }

        //Save the NFT so we can respond faster
        await cruds._saveNFT({
            chainContractAddress: chain + "-" + contractAddress,
            tokenId,
            chain,
            contractAddress,
            nftuuid: uuid.v4(),
            imageUrl: nftMetaData.imageUrl,
            nftMetaData,
            metaData,
            createdBy: "System",
            updatedBy: null,
            createdAt: timestamp,
            updatedAt: timestamp,
            createdDateGMT: dateformat(new Date(), "isoUtcDateTime"),
        });

        //Grab the extention of the image

        const generatedImageUrl = await this._getNFTUrl(chain, contractAddress, tokenId, nftMetaData.imageUrl);

        //respond
        return {
            error: false,
            success: true,
            imageUrl: generatedImageUrl
        };
    } catch (err) {
        console.error(err);
        const res = {
            error: true,
            success: false,
            message: err.message,
            e: err,
            code: 201,
            imageUrl: `https://${process.env.NFT_IMAGE_CDN_BUCKET}/default-image.jpg`
        };
        console.error("module.exports.getNFTImage", res);
        return res;
    }
};