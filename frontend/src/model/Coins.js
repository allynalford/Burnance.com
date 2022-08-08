//var storage = require('sessionstorage');
var storage = require('lscache');

/**
 * constructor for Coins Object
 *
 * @author Allyn j. Alford <Allyn@tenablylabs.com>
 * @function Coins
 * @param {String} address - Collection contract address
 * @example <caption>Example usage of Collection Object.</caption>
 * // new Collection(address);
 * @return {Coins} Coins Object
 */
function Coins(chain, address) { 
    this.address = address;
    this.chain = chain;
};

Coins.prototype.get = (chain, address) => {
    //console.log('Collections Cache Hit', wallet);
    return storage.get(chain+":"+address);
};

Coins.prototype.set = (chain, address, payload) => {
    //console.log('Collections Cache Set', wallet);
    return storage.set(chain+":"+address, payload, 5);
};

Coins.prototype.remove = (chain, address) => {;
    storage.remove(chain+":"+address);
};
Coins.prototype.exists = (chain, address) => {
  const obj = storage.get(chain+":"+address);
  if (obj !== null) {
    return true;
  }; 
  return false;
};

module.exports = Coins;