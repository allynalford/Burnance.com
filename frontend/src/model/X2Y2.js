import {
  init,
  offer,
  acceptOffer,
  cancelOffer,
  list,
  cancelList,
  buy,
  lowerPrice,
} from '@x2y2-io/sdk';

//init(process.env.REACT_APP_X2Y2_API_KEY);



/**
 * constructor for X2Y2 Object
 * X2Y2 allows you to list items for sale and make WETH offers on others' items without having to send separate transactions each time.
 * @author Allyn j. Alford <Allyn@tenablylabs.com>
 * @function X2Y2
 * @param {String} network - mainnet | rinkeby
 * @param {String} signer - Signer of the seller |  Signer of the buyer
 * @param {Bool} isCollection - bool, set true for collection offer
 * @param {String} tokenAddress - contract address of NFT collection
 * @param {String} tokenId - token ID of the NFT, use empty string for collection offer
 * @param {String} currency - contract address of WETH
 * @param {String} price - eg. '1000000000000000000' for 1 WETH
 * @param {Number} expirationTime - the unix timestamp when the listing will expire, in seconds
 * @example <caption>Example usage of X2Y2 Object.</caption>
 * // new X2Y2(network, signer, isCollection, tokenAddress, tokenId, currency);
 * @return {X2Y2} X2Y2 Instance Object
 */
function X2Y2(network, signer, isCollection, tokenAddress, tokenId, currency) {
  this.network = network;
  this.isCollection = isCollection;
  this.tokenAddress = tokenAddress;
  this.tokenId = tokenId;
  this.currency = currency;
  this.signer = signer;

  this.Offer.bind(this);
  this.List.bind(this);

  init(process.env.REACT_APP_X2Y2_API_KEY);

  const proto = Object.getPrototypeOf(this);
  console.log(Object.getOwnPropertyNames(proto));
}

X2Y2.prototype.Offer = async function () {
  return await offer({
    network: this.network,
    signer: this.signer, // Signer of the buyer
    isCollection: this.isCollection, // bool, set true for collection offer
    tokenAddress: this.tokenAddress, // string, contract address of NFT collection
    tokenId: this.tokenId, // string, token ID of the NFT, use empty string for collection offer
    currency: this.currency, // string, contract address of WETH
    price: this.price, // string, eg. '1000000000000000000' for 1 WETH
    expirationTime: this.expirationTime, // number, the unix timestamp when the listing will expire, in seconds
  });
};

X2Y2.prototype.List = async function () {
  return await list({
    network: this.network,
    signer: this.signer, // Signer of the seller
    tokenAddress: this.tokenAddress, // string, contract address of NFT collection
    tokenId: this.tokenId, // string, token ID of the NFT
    price: this.price, // string, sale price in wei eg. '1000000000000000000' for 1 ETH
    expirationTime: this.expirationTime, // number, the unix timestamp when the listing will expire, in seconds. Must be at least 15 minutes later in the future.
  });
};

X2Y2.prototype.CancelList = async function (orderId) {
  return await cancelList({
    network: this.network,
    signer: this.signer, // Signer of the seller
    tokenAddress: this.tokenAddress, // string, contract address of NFT collection
    tokenId: this.tokenId, // string, token ID of the NFT
  });
};

X2Y2.prototype.Buy = async function () {
  return await buy({
    network: this.network,
    signer: this.signer, // Signer of the seller
    tokenAddress: this.tokenAddress, // string, contract address of NFT collection
    tokenId: this.tokenId, // string, token ID of the NFT
    price: this.price, // string, sale price in wei eg. '1000000000000000000' for 1 ETH
  });
};

X2Y2.prototype.Accept = async function (orderId) {
  return await acceptOffer({
    network: this.network,
    signer: this.signer, // Signer of the seller
    tokenId: this.tokenId, // string, token ID of the NFT
    orderId, // number, id of the offer
  });
};

X2Y2.prototype.CancelOffer = async function (orderId) {
  return await cancelOffer({
    network: this.network,
    signer: this.signer, // Signer of the seller
    orderId, // number, id of the offer
  });
};

X2Y2.prototype.LowerPrice = async function () {
  return await lowerPrice({
    network: this.network,
    signer: this.signer, // Signer of the seller
    tokenAddress: this.tokenAddress, // string, contract address of NFT collection
    tokenId: this.tokenId, // string, token ID of the NFT
    price: this.price, // string, sale price in wei eg. '1000000000000000000' for 1 ETH
    expirationTime: this.expirationTime, // number, the unix timestamp when the listing will expire, in seconds. Must be at least 15 minutes later in the future.
  });
};
