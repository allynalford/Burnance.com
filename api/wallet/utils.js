/*jshint esversion: 8 */
/* jshint -W117 */
/* jshint -W097 */
"use strict";




module.exports.getNFTImage = async (chain, contractAddress, tokenId) => {
    let dt,
        metaData = [],
        ABI = [],
        abiResp = {},
        timestamp,
        cruds
    try {
        //Logging
        log.options.meta.event = event;
        // add additional tags to all logs
        log.options.tags.push(event.env);

        //Time
        dt = dateformat(new Date(), "isoUtcDateTime");
        timestamp = new Date().getTime();


        cruds = require('../common/cruds');

        //Validations
        if (typeof contractAddress === "undefined") throw new Error("contractAddress is undefined");
        if (typeof tokenId === "undefined") throw new Error("tokenId is undefined");
        if (typeof chain === "undefined") throw new Error("chain is undefined");
    } catch (e) {
        console.error(e);
        throw e;
    }

    try {

        //Let's see if the NFT already exists within the database
        const NFT = await cruds._getNFT(contractAddress, String(tokenId), chain);

        //Check if we have it, if so return it fast
        if (typeof NFT !== "undefined") {
            const imageUtils = require("../common/imageUtils");
            const generatedImageUrl = await imageUtils._getNFTUrl(chain, contractAddress, tokenId, NFT.imageUrl);

            return { error: false, success: true, dt, imageUrl: generatedImageUrl }
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
                return {
                    error: false,
                    success: false,
                    dt,
                    message: "Could not retrieve NFT",
                    imageUrl: `https://${process.env.NFT_IMAGE_CDN_BUCKET}/default-image.jpg`
                }
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
                }
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
            }
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

        const generatedImageUrl = await imageUtils._getNFTUrl(chain, contractAddress, tokenId, nftMetaData.imageUrl);

        //respond
        return {
            error: false,
            success: true,
            imageUrl: generatedImageUrl
        }
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
        return responses.respond(res, 201);
    }
};

/**
* Returns NFT transaction data
*
* @author Allyn j. Alford <Allyn@tenablylabs.com>
* @async
* @function _getNftTxs
* @param {String} owner - nft owner ethereum wallet address
* @param {String} contractAddressTokenId - NFT Contract Address combined with tokenId
* @return {Promise<Array>} Response Array for next step to process.
*/
module.exports._getNftTxs = async (owner, contractAddressTokenId) => {
    try {
        const dynamo = require('../common/dynamo');
        const assets = await dynamo.qetFromDB({
            TableName: process.env.DYNAMODB_TABLE_WALLET_NFT_TX,
            Key: {
                owner,
                contractAddressTokenId
            }
        });
        return assets;
    } catch (e) {
        console.error(e);
        throw e;
    }
};

/**
* Add wallet
*
* @author Allyn j. Alford <Allyn@tenablylabs.com>
* @async
* @function _addWallet
* @param {String} chain - blockchain of address
* @param {String} owner - nft owner ethereum wallet address
* @return {Promise<Array>} Response Array for next step to process.
*/
module.exports._addWallet = async (chain, address) => {
    try {
        const dynamo = require('../common/dynamo');
        const dateformat = require("dateformat");
        return await dynamo.saveItemInDB({
            TableName: process.env.DYNAMODB_TABLE_WALLET,
            Item: {
                chain,
                address,
                dt: dateformat(new Date(), "isoUtcDateTime"),
                timestamp: new Date().getTime(),
            },
        });
    } catch (e) {
        console.error(e);
        throw e;
    }
};





/**
* Returns a wallet
*
* @author Allyn j. Alford <Allyn@tenablylabs.com>
* @async
* @function _getWallet
* @param {String} chain - blockchain of address
* @param {String} owner - nft owner ethereum wallet address
* @return {Promise<Array>} Response Array for next step to process.
*/
module.exports._getWallet = async (chain, address) => {
    try {
        const dynamo = require('../common/dynamo');
        const wallet = await dynamo.qetFromDB({
            TableName: process.env.DYNAMODB_TABLE_WALLET,
            Key: {
                chain, 
                address
            }
        });
        return wallet;
    } catch (e) {
        console.error(e);
        throw e;
    }
};

/**
* update wallet fields
*
* @author Allyn j. Alford <Allyn@tenablylabs.com>
* @async
* @function _updateWalletFields
* @param {string} chain 
* @param {string} address
* @param {list} fields 
*/
module.exports._updateWalletFields = async (chain, address, fields) => {
    try {
        const dateFormat = require('dateformat');
        const dynamo = require('../common/dynamo');

        var ExpressionAttributeValues = {}, ExpressionAttributeNames = {}
        var UpdateExpression = "set #dt = :dt";

        for (const f of fields) {
            ExpressionAttributeValues[`:${f.name}`] = f.value;
            ExpressionAttributeNames[`#${f.name}`] = f.name;
            UpdateExpression = UpdateExpression + `, #${f.name} = :${f.name}`
        };

        ExpressionAttributeNames["#dt"] = "updatedAt";
        ExpressionAttributeValues[":dt"] = dateFormat(new Date(), "isoUtcDateTime");

        //Save the profile to dynamoDB
        return await dynamo.updateDB({
            TableName: process.env.DYNAMODB_TABLE_WALLET,
            Key: { chain, address },
            UpdateExpression,
            ExpressionAttributeValues,
            ExpressionAttributeNames,
            ReturnValues: "UPDATED_NEW"
        });
    } catch (err) {
        console.error(JSON.stringify(err));
        throw err;
    };
};

/**
* Add NFT transaction
*
* @author Allyn j. Alford <Allyn@tenablylabs.com>
* @async
* @function _addNftTx
* @param {String} owner - nft owner ethereum wallet address
* @param {String} contractAddressTokenId - NFT Contract Address combined with tokenId
* @param {Number} cost
* @param {Number} value
* @param {Number} gasUsed
* @return {Promise<Array>} Response Array for next step to process.
*/
module.exports._addNftTx = async (owner, contractAddressTokenId, result) => {
    try {
        const dynamo = require('../common/dynamo');
        const dateformat = require("dateformat");
        return await dynamo.saveItemInDB({
            TableName: process.env.DYNAMODB_TABLE_WALLET_NFT_TX,
            Item: {
                owner,
                contractAddressTokenId,
                result,
                dt: dateformat(new Date(), "isoUtcDateTime"),
                timestamp: new Date().getTime(),
            },
        });
    } catch (e) {
        console.error(e);
        throw e;
    }
};
/**
* delete a wallet
*
* @author Allyn j. Alford <Allyn@tenablylabs.com>
* @async
* @function _deleteWallet
* @param {String} chain - blockchain of address
* @param {String} owner - nft owner ethereum wallet address
* @return {Promise<Array>} Response Array for next step to process.
*/
module.exports._deleteWallet = async (chain, address) => {
    try {
        const dynamo = require('../common/dynamo');
        const wallet = await dynamo.deleteItemFromDB({
            TableName: process.env.DYNAMODB_TABLE_WALLET,
            Key: {
                chain, 
                address
            }
        });
        return wallet;
    } catch (e) {
        console.error(e);
        throw e;
    }
};

/**
* Returns Wallet NFT data
*
* @author Allyn j. Alford <Allyn@tenablylabs.com>
* @async
* @function _getWalletNFT
* @param {String} owner - nft owner ethereum wallet address
* @param {String} contractAddressTokenId - NFT Contract Address combined with tokenId
* @return {Promise<Array>} Response Array for next step to process.
*/

module.exports._getWalletNFT = async (owner, contractAddressTokenId) => {
    try {
        const dynamo = require('../common/dynamo');
        return await dynamo.queryDB({
            TableName: process.env.DYNAMODB_TABLE_WALLET_NFT,
            IndexName: 'InstanceIdIndex',
            KeyConditionExpression: "#owner = :owner and #contractAddressTokenId = :contractAddressTokenId",
            ExpressionAttributeNames: {
                "#owner": "owner",
                "#contractAddressTokenId": "contractAddressTokenId"
            },
            ExpressionAttributeValues: {
                ":owner": owner,
                ":contractAddressTokenId": contractAddressTokenId
            },
        });

    } catch (e) {
        console.error(e.message);
        throw e;
    }
};

module.exports._getNftTxs = async (owner, contractAddressTokenId) => {
    try {
        const dynamo = require('../common/dynamo');
        const assets = await dynamo.qetFromDB({
            TableName: process.env.DYNAMODB_TABLE_WALLET_NFT_TX,
            Key: {
                owner,
                contractAddressTokenId
            }
        });
        return assets;
    } catch (e) {
        console.error(e);
        throw e;
    }
};

/**
* Add NFT transaction
*
* @author Allyn j. Alford <Allyn@tenablylabs.com>
* @async
* @function _addNftTx
* @param {String} owner - nft owner ethereum wallet address
* @param {String} contractAddressTokenId - NFT Contract Address combined with tokenId
* @param {Number} costETH
* @param {Number} costUSD
* @param {Number} valueUSD
* @param {Number} valueETH
* @param {Number} ethTransPriceUSD
* @param {String} hash
* @return {Promise<Array>} Response Array for next step to process.
*/
module.exports._addWalletNFT = async (chain, owner, contractAddressTokenId, costETH, costUSD, valueUSD, valueETH, ethTransPriceUSD, hash) => {
    try {
        const dynamo = require('../common/dynamo');
        const dateformat = require("dateformat");
        return await dynamo.saveItemInDB({
            TableName: process.env.DYNAMODB_TABLE_WALLET_NFT,
            Item: {
                chain,
                owner,
                contractAddressTokenId,
                costETH,
                costUSD,
                valueUSD,
                valueETH,
                ethTransPriceUSD,
                hash,
                createdatetime: dateformat(new Date(), "isoUtcDateTime"),
                timestamp: new Date().getTime(),
            },
        });
    } catch (e) {
        console.error(e);
        throw e;
    }
};


/**
* update NFT fields
*
* @author Allyn j. Alford <Allyn@tenablylabs.com>
* @async
* @function _updateWalletNFTFields
* @param {string} chain 
* @param {string} contractAddressTokenId 
* @param {list} fields 
*/
module.exports._updateWalletNFTFields = async (chain, contractAddressTokenId, fields) => {
    try {
        const dateFormat = require('dateformat');
        const dynamo = require('../common/dynamo');

        var ExpressionAttributeValues = {}, ExpressionAttributeNames = {}
        var UpdateExpression = "set #dt = :dt";

        for (const f of fields) {
            ExpressionAttributeValues[`:${f.name}`] = f.value;
            ExpressionAttributeNames[`#${f.name}`] = f.name;
            UpdateExpression = UpdateExpression + `, #${f.name} = :${f.name}`
        };

        ExpressionAttributeNames["#dt"] = "updatedAt";
        ExpressionAttributeValues[":dt"] = dateFormat(new Date(), "isoUtcDateTime");

        //Save the profile to dynamoDB
        return await dynamo.updateDB({
            TableName: process.env.DYNAMODB_TABLE_WALLET_NFT,
            Key: { chain, contractAddressTokenId },
            UpdateExpression,
            ExpressionAttributeValues,
            ExpressionAttributeNames,
            ReturnValues: "UPDATED_NEW"
        });
    } catch (err) {
        console.error(JSON.stringify(err));
        throw err;
    };
};


/**
* Returns wallet collections
*
* @author Allyn j. Alford <Allyn@tenablylabs.com>
* @async
* @function _getWalletCollection
* @param {String} chain - ethereum
* @param {String} address -  wallet owner address
* @return {Promise<Array>} Response Array for next step to process.
*/
module.exports._getWalletCollectionFromCache = async (chain, address) => {
    try {
        const dynamo = require('../common/dynamo');
        const results = await dynamo.qetFromDB({
            TableName: process.env.DYNAMODB_TABLE_WALLET_COLLECTION_CACHE,
            Key: {
              chain,
             address
            }
        });

        return (typeof results !== "undefined" ? results.collections : results);
    } catch (e) {
        console.error(e);
        throw e;
    }
  };


  /**
* Add NFT transaction
*
* @author Allyn j. Alford <Allyn@tenablylabs.com>
* @async
* @function _addNftTx
* @param {String} chain - ethereum
* @param {String} address - wallet owner address
* @param {Number} collections list of NFT collections the wallet contains
* @return {Promise<Array>} Response Array for next step to process.
*/
module.exports._addWalletCollectionToCache = async (chain, address, collections) => {
    try {
        const dynamo = require('../common/dynamo');
        const dateformat = require("dateformat");
        return await dynamo.saveItemInDB({
            TableName: process.env.DYNAMODB_TABLE_WALLET_COLLECTION_CACHE,
            Item: {
                chain,
                address,
                collections,
                updatedAt: dateformat(new Date(), "isoUtcDateTime"),
                createdatetime: dateformat(new Date(), "isoUtcDateTime"),
                timestamp: new Date().getTime(),
            },
        });
    } catch (e) {
        console.error(e);
        throw e;
    }
};