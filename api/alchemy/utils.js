/*jshint esversion: 8 */
/* jshint -W117 */
/* jshint -W097 */
"use strict";

const endpoint = require('../common/endpoint');
const alchemySDK = require('@alch/alchemy-sdk');

// replace with your Alchemy api key
const baseURL = `https://eth-mainnet.alchemyapi.io/nft/v2/${process.env.ALCHEMY_API_KEY}`;


// Optional Config object, but defaults to demo api-key and eth-mainnet.
const settings = {
  apiKey: process.env.ALCHEMY_API_KEY, // Replace with your Alchemy API Key.
  network: alchemySDK.Network.ETH_MAINNET, // Replace with your network.
  maxRetries: 10,
};


const alchemy = alchemySDK.initializeAlchemy(settings);

/**
* Gets all NFTs currently owned by a given address
* This endpoint is supported on the following chains and networks:
* Ethereum: Mainnet, Rinkeby, Kovan, Goerli, Ropsten
* Polygon: Mainnet and Mumbai
* Flow: Mainnet and Testnet (see docs here)
*
* @author Allyn j. Alford <Allyn@tenablylabs.com>
* @async
* @function getNFTs
* @param {String} chain - ETHEREUM|FLOW|TEZOS|POLYGON|SOLANA
* @param {String} address -  address for NFT owner (can be in ENS format!)
* @return {Promise<Array>} Response Array
*/
module.exports.getCollections = async (chain, address) => {
    try {
      //const results = await endpoint._get(`${baseURL}/getNFTs/?owner=${address}`);

      // Print total NFT count returned in the response:
      const nfts = await this.getNFTs(chain, address);
      //console.log('API First Pull FULL',nfts);
      //Add the wallet
      var wallet = [...nfts.ownedNfts];
      console.log('API First Pull',{length: wallet.length, key: nfts.pageKey});

      //Check if the list has more NFTs
      if (typeof nfts.pageKey !== "undefined") {
        const page = await this.getNFTsByPageKey(
          chain,
          address,
          nfts.pageKey
        );
        //console.log("Next Page", page);
        wallet.push(...page.ownedNfts);
      }

      const _ = require('lodash');

      //Filter out the addresses for collections
      const addresses = _.uniq(_.map(wallet, 'contract.address'));

      //Responses object
      let resp = [];

      //Loop the addresses and produce a NFT count
      for(const address of addresses){
        //Count the amount of NFTs with the same contract address
        const obj = _.countBy(wallet, (rec) => {
            return rec.contract.address === address;
        });

        //Add the address tot he response with the count
        resp.push({address, count: obj.true});

      };

      return resp;
    } catch (e) {
        console.error(e);
        throw e;
    }
};


/**
* Gets all NFTs currently owned by a given address
* This endpoint is supported on the following chains and networks:
* Ethereum: Mainnet, Rinkeby, Kovan, Goerli, Ropsten
* Polygon: Mainnet and Mumbai
* Flow: Mainnet and Testnet (see docs here)
*
* @author Allyn j. Alford <Allyn@tenablylabs.com>
* @async
* @function getCollectionsAndTokenIds
* @param {String} chain - ETHEREUM|FLOW|TEZOS|POLYGON|SOLANA
* @param {String} address -  address for NFT owner (can be in ENS format!)
* @return {Promise<Array>} Response Array
*/
module.exports.getCollectionsAndTokenIds = async (chain, address) => {
    try {
      //const results = await endpoint._get(`${baseURL}/getNFTs/?owner=${address}`);

      // Print total NFT count returned in the response:
      const nfts = await this.getNFTs(chain, address);
      //console.log('API First Pull FULL',nfts);
      //Add the wallet
      var wallet = [...nfts.ownedNfts];
      console.log('API First Pull',{length: wallet.length, key: nfts.pageKey});

      //Check if the list has more NFTs
      if (typeof nfts.pageKey !== "undefined") {
        const page = await this.getNFTsByPageKey(
          chain,
          address,
          nfts.pageKey
        );
        //console.log("Next Page", page);
        wallet.push(...page.ownedNfts);
      }

      const _ = require('lodash');

      //Filter out the addresses for collections
      const addresses = _.uniq(_.map(wallet, 'contract.address'));

      //mintTokenIds = _.uniq(_.map(tokenNftTx.result, 'tokenID'));

      //Loop the list of addresses
      const addresses and 
      tokenNftTx = 



      //Responses object
      let resp = [];

      //Loop the addresses and produce a NFT count
      for(const address of addresses){
        //Count the amount of NFTs with the same contract address
        const obj = _.countBy(wallet, (rec) => {
            return rec.contract.address === address;
        });

        const nfts = _.find(wallet, function (o) { return o.contract.address === address;  });
        console.log('nfts', nfts);

        //Add the address tot he response with the count
        resp.push({address, count: obj.true});

      };

      return resp;
    } catch (e) {
        console.error(e);
        throw e;
    }
};


/**
* Gets all NFTs currently owned by a given address
* This endpoint is supported on the following chains and networks:
* Ethereum: Mainnet, Rinkeby, Kovan, Goerli, Ropsten
* Polygon: Mainnet and Mumbai
* Flow: Mainnet and Testnet (see docs here)
*
* @author Allyn j. Alford <Allyn@tenablylabs.com>
* @async
* @function getNFTs
* @param {String} chain - ETHEREUM|FLOW|TEZOS|POLYGON|SOLANA
* @param {String} address -  address for NFT owner (can be in ENS format!)
* @return {Promise<Array>} Response Array
*/
module.exports.getNFTs = async (chain, address) => {
    try {

        //const results = await endpoint._get(`${baseURL}/getNFTs/?owner=${address}`);    

        // Print total NFT count returned in the response:
        const results = await alchemySDK.getNftsForOwner(alchemy, address);

        return results;

    } catch (e) {
        console.error(e);
        throw e;
    }
};

/**
* Gets all NFTs currently owned by a given address
* This endpoint is supported on the following chains and networks:
* Ethereum: Mainnet, Rinkeby, Kovan, Goerli, Ropsten
* Polygon: Mainnet and Mumbai
* Flow: Mainnet and Testnet (see docs here)
*
* @author Allyn j. Alford <Allyn@tenablylabs.com>
* @async
* @function getNFTsByPageKey
* @param {String} chain - ETHEREUM|FLOW|TEZOS|POLYGON|SOLANA
* @param {String} address - address for NFT owner (can be in ENS format!)
* @param {String} pageKey - UUID for pagination. If more results are available, a UUID pageKey will be returned in the response. Pass that UUID into pageKey to fetch the next 100 NFTs. NOTE: pageKeys expire after 10 minutes.
* @return {Promise<Array>} Response Array
*/
module.exports.getNFTsByPageKey = async (chain, address, pageKey) => {
    try {

        //const results = await endpoint._get(`${baseURL}/getNFTs/?owner=${address}&pageKey=${pageKey}`);
        const results = await alchemySDK.getNftsForOwner(alchemy, address, {pageKey});

        return results;

    } catch (e) {
        console.error(e);
        throw e;
    }
};

/**
* Gets all NFTs currently owned by a given address
* This endpoint is supported on the following chains and networks:
* Ethereum: Mainnet, Rinkeby, Kovan, Goerli, Ropsten
* Polygon: Mainnet and Mumbai
* Flow: Mainnet and Testnet (see docs here)
*
* @author Allyn j. Alford <Allyn@tenablylabs.com>
* @async
* @function getNFTsByContract
* @param {String} chain - ETHEREUM|FLOW|TEZOS|POLYGON|SOLANA
* @param {String} address - address for NFT owner (can be in ENS format!)
* @param {Array} contractAddresses - array of contract addresses to filter the responses with. Max limit 20 contracts
* @return {Promise<Array>} Response Array
*/
module.exports.getNFTsByContract = async (chain, address, contractAddresses) => {
    try {

        //const results = await endpoint._get(`${baseURL}/getNFTs/?owner=${address}&contractAddresses=${contractAddresses}`);
        const results = await alchemySDK.getNftsForOwner(alchemy, address, {contractAddresses});
        return results;

    } catch (e) {
        console.error(e);
        throw e;
    }
};

/**
* Gets the metadata associated with a given NFT.
*
* @author Allyn j. Alford <Allyn@tenablylabs.com>
* @async
* @function getNFTMetadata
* @param {String} chain - ETHEREUM|FLOW|TEZOS|POLYGON|SOLANA
* @param {String} contractAddress - NFT Contract Address
* @param {String} tokenId - the id of the NFT token
* @param {String} tokenType - erc721 | erc1155
* @return {Promise<Array>} Response Array
*/
module.exports.getNFTMetadata = async (chain, contractAddress, tokenId, tokenType) => {
    try {

        //const results = await endpoint._get(`${baseURL}/getNFTMetadata/?contractAddress=${contractAddress}&tokenId=${tokenId}&tokenType=${tokenType}`);
        const results = await alchemySDK.getNftMetadata(
            alchemy,
            contractAddress,
            tokenId,
            tokenType
        );

        return results;

    } catch (e) {
        console.error(e);
        throw e;
    }
};

/**
* Queries NFT high-level collection/contract level information
*
* @author Allyn j. Alford <Allyn@tenablylabs.com>
* @async
* @function getContractMetadata
* @param {String} chain - ETHEREUM|FLOW|TEZOS|POLYGON|SOLANA
* @param {String} contractAddress - NFT Contract Address
* @return {Promise<Array>} Response Array
*/
module.exports.getContractMetadata = async (chain, contractAddress) => {
    try {

        const results = await endpoint._get(`${baseURL}/getContractMetadata/?contractAddress=${contractAddress}`);

        // {
        //     "address": "0x004dd1904b75b7e8a46711dde8a0c608578e0302",
        //     "contractMetadata": {
        //         "name": "JetPack420",
        //         "symbol": "DCL-JTPCK420",
        //         "totalSupply": "307",
        //         "tokenType": "erc721"
        //     }
        // }

        return results.data;

    } catch (e) {
        console.error(e);
        throw e;
    }
};


/**
* Returns whether a contract is marked as spam or not by Alchemy
*
* @author Allyn j. Alford <Allyn@tenablylabs.com>
* @async
* @function isSpamContract
* @param {String} chain - ETHEREUM|FLOW|TEZOS|POLYGON|SOLANA
* @param {String} contractAddress - NFT Contract Address
* @return {Promise<Array>} Response Array
*/
module.exports.isSpamContract = async (chain, contractAddress) => {
    try {

        const results = await endpoint._get(`${baseURL}/isSpamContract/?contractAddress=${contractAddress}`);

        return results;

    } catch (e) {
        console.error(e);
        throw e;
    }
};

/**
* Returns the floor prices of a NFT collection by marketplace
* This endpoint is supported on the following chains and networks:
* Ethereum: Mainnet
*
* @author Allyn j. Alford <Allyn@tenablylabs.com>
* @async
* @function getFloorPrice
* @param {String} chain - ETHEREUM|FLOW|TEZOS|POLYGON|SOLANA
* @param {String} contractAddress - NFT Contract Address
* @return {Promise<Array>} Response Array
*/
module.exports.getFloorPrice = async (chain, contractAddress) => {
    try {
        const results = await endpoint._get(`${baseURL}/getFloorPrice/?contractAddress=${contractAddress}`);
        return results.data;
    } catch (e) {
        console.error(e);
        throw e;
    }
};

/**
* Get the owner(s) for a token.
* This endpoint is supported on the following chains and networks:
* Ethereum: Mainnet, Goerli
* Polygon: Mainnet and Mumbai
* https://docs.alchemy.com/alchemy/enhanced-apis/nft-api/getOwnersForToken
* @author Allyn j. Alford <Allyn@tenablylabs.com>
* @async
* @function getOwnersForToken
* @param {String} chain - ETHEREUM|FLOW|TEZOS|POLYGON|SOLANA
* @param {String} contractAddress - The address of the contract that the token belongs to. We currently support both ERC721 and ERC1155 contracts.
* @param {String} tokenId The ID of the token. Can be in hex or decimal format.
* @return {Promise<Array>} Response Array
*/
module.exports.getOwnersForToken = async (chain, contractAddress, tokenId) => {
    try {

        //const results = await endpoint._get(`${baseURL}/getOwnersForToken/?contractAddress=${contractAddress}&tokenId=${tokenId}`);
        const results = await alchemySDK.getOwnersForNft(
            alchemy,
            contractAddress,
            tokenId
          );
        return results;

    } catch (e) {
        console.error(e);
        throw e;
    }
};