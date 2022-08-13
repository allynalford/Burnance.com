import { MakerOrder, TakerOrder } from '@looksrare/sdk';
/**
 * constructor for LooksRare Object
 * The MakerOrder struct contains 13 distinct parameters and 3 signature parameters:
 * @author Allyn j. Alford <Allyn@tenablylabs.com>
 * @function LooksRare
 * @param {Bool} isOrderAsk  -Whether the order is an ask (sending a passive order to sell a NFT) or a bid (sending a passive order to buy an NFT).
 * @param {String} signer - The address of the signer of the maker order.
 * @param {String} collection  -  The specific collection address.
 * @param {String} tokenAddress - contract address of NFT collection
 * @param {BigNumberish} tokenId - The id of the token for the order. For collection orders, this field is not used in the execution and set it at 0 if you use the exchange frontend available at looksrare.org.
 * @param {BigNumberish} amount - The amount of tokens transferred. It is only used for ERC-1155 tokens (e.g., “2 items for a given tokenId”). For ERC-721 tokens, it is set at 1 if you use the exchange frontend available at looksrare.org.
 * @param {String} strategy  - The execution strategy address for the trade execution for this order.
 * @param {String} currency - The currency address for this order.
 * @param {BigNumberish} nonce - The order nonce of the sender.
 * @param {BigNumberish} startTime - The start time for the order (in epoch format).
 * @param {BigNumberish} endTime - The end time for the order (in epoch format).
 * @param {BigNumberish} minPercentageToAsk - The minimum percentage required to be transferred to the ask or the trade is rejected (e.g., 8500 = 85% of the trade price).
 * @param {Array}  params - Can contain additional parameters that are not used for standard orders (e.g., maximum price for a Dutch auction, recipient address for a private sale, or a Merkle root... for future advanced order types!). If it doesn't, it is displayed "0x" (using the exchange frontend available at looksrare.org)
 * @param {BigNumberish} price - The price of the order. The price is expressed in BigNumber based on the number of decimals of the “currency”. For Dutch auction, it is the minimum price at the end of the auction.
 * @param {Number} expirationTime - the unix timestamp when the listing will expire, in seconds
 * @example <caption>Example usage of X2Y2 Object.</caption>
 * // new LooksRare(isOrderAsk, signer, price, tokenId, minPercentageToAsk, params, strategy, collection, amount, currency, nonce, startTime, endTime);
 * // new LooksRare(isOrderAsk, signer, price, tokenId, minPercentageToAsk, params, null, null, null, null, null, null, null)
 * @return {LooksRare} LooksRare Instance Object
 */
class LooksRare {
  constructor(
    isOrderAsk,
    signer,
    price,
    tokenId,
    minPercentageToAsk,
    params,
    strategy,
    collection,
    amount,
    currency,
    nonce,
    startTime,
    endTime,
  ) {
    this.isOrderAsk = isOrderAsk;
    this.signer = signer;
    this.price = price;
    this.params = params;
    this.tokenId = tokenId;
    this.minPercentageToAsk = minPercentageToAsk;
    this.currency = currency || null;
    this.strategy = strategy || null;
    this.collection = collection || null;
    this.amount = amount || null;
    this.currency = currency || null;
    this.nonce = nonce || null;
    this.startTime = startTime || null;
    this.endTime = endTime || null;
  }


  List = async function () {
    return await TakerOrder({
      isOrderAsk: this.isOrderAsk, // true --> ask / false --> bid
      taker: this.signer, // Taker address
      price: this.price, // price for the purchase
      tokenId: this.tokenId,
      minPercentageToAsk: this.minPercentageToAsk,
      params: this.params, // params (e.g., price)
    });
  };

  Buy = async function () {
    return await MakerOrder({
      isOrderAsk: this.isOrderAsk, // true --> ask / false --> bid
      signer: this.signer, // signer address of the maker order
      collection: this.collection, // collection address
      price: this.price,
      tokenId: this.tokenId, // id of the token
      amount: this.amount, // amount of tokens to sell/purchase (must be 1 for ERC721, 1+ for ERC1155)
      strategy: this.strategy, // strategy for trade execution (e.g., DutchAuction, StandardSaleForFixedPrice)
      currency: this.currency, // currency address
      nonce: this.nonce, // order nonce (must be unique unless new maker order is meant to override existing one e.g., lower ask price)
      startTime: this.startTime, // startTime in timestamp
      endTime: this.endTime, // endTime in timestamp
      minPercentageToAsk: this.minPercentageToAsk,
      params: this.params, // params (e.g., price, target account for private sale)
    });
  };
}
