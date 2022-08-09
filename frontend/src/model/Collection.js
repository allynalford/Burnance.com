//var storage = require('sessionstorage')
var storage = require('lscache');
/**
 * constructor for Collection Object
 *
 * @author Allyn j. Alford <Allyn@tenablylabs.com>
 * @function Collection
 * @param {String} address - Collection contract address
 * @example <caption>Example usage of Collection Object.</caption>
 * // new Collection(address);
 * @return {Collection} Collection Instance Object
 */
function Collection(wallet, address) { 
    this.address  = address;
    this.wallet  = wallet;
};

Collection.prototype.get = (wallet, address) => {
    return storage.get(wallet+':'+address);
}

Collection.prototype.set = (wallet, address, payload) => {
    return storage.set(wallet+':'+address, payload, 2);
};

Collection.prototype.remove = (wallet, address) => {;
    storage.remove(wallet+':'+address);
};

Collection.prototype.exists = (wallet, address) => {
  const obj = storage.get(wallet+':'+address);
  if (obj !== null) {
    return true;
  } 
  return false;
};

module.exports = Collection;