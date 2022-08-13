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

class X2Y2 {
  constructor(network, signer, isCollection, tokenAddress, tokenId, currency) {
    this.network = network;
    this.isCollection = isCollection;
    this.tokenAddress = tokenAddress;
    this.tokenId = tokenId;
    this.currency = currency;
    this.signer = signer;

    init(process.env.REACT_APP_X2Y2_API_KEY);
  };
  getNetwork() {
    return this.network;
  };
  Offer = async function () {
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
  List = async function () {
    return await list({
      network: this.network,
      signer: this.signer, // Signer of the seller
      tokenAddress: this.tokenAddress, // string, contract address of NFT collection
      tokenId: this.tokenId, // string, token ID of the NFT
      price: this.price, // string, sale price in wei eg. '1000000000000000000' for 1 ETH
      expirationTime: this.expirationTime, // number, the unix timestamp when the listing will expire, in seconds. Must be at least 15 minutes later in the future.
    });
  };
  CancelList = async function (orderId) {
    return await cancelList({
      network: this.network,
      signer: this.signer, // Signer of the seller
      tokenAddress: this.tokenAddress, // string, contract address of NFT collection
      tokenId: this.tokenId, // string, token ID of the NFT
    });
  };
  Buy = async function () {
    return await buy({
      network: this.network,
      signer: this.signer, // Signer of the seller
      tokenAddress: this.tokenAddress, // string, contract address of NFT collection
      tokenId: this.tokenId, // string, token ID of the NFT
      price: this.price, // string, sale price in wei eg. '1000000000000000000' for 1 ETH
    });
  };
  Accept = async function (orderId) {
    return await acceptOffer({
      network: this.network,
      signer: this.signer, // Signer of the seller
      tokenId: this.tokenId, // string, token ID of the NFT
      orderId, // number, id of the offer
    });
  };
  CancelOffer = async function (orderId) {
    return await cancelOffer({
      network: this.network,
      signer: this.signer, // Signer of the seller
      orderId, // number, id of the offer
    });
  };
  LowerPrice = async function () {
    return await lowerPrice({
      network: this.network,
      signer: this.signer, // Signer of the seller
      tokenAddress: this.tokenAddress, // string, contract address of NFT collection
      tokenId: this.tokenId, // string, token ID of the NFT
      price: this.price, // string, sale price in wei eg. '1000000000000000000' for 1 ETH
      expirationTime: this.expirationTime, // number, the unix timestamp when the listing will expire, in seconds. Must be at least 15 minutes later in the future.
    });
  };
}
