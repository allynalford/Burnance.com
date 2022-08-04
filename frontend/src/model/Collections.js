//var storage = require('sessionstorage');
var storage = require('lscache');

/**
 * constructor for Collections Object
 *
 * @author Allyn j. Alford <Allyn@tenablylabs.com>
 * @function Collections
 * @param {String} address - Collection contract address
 * @example <caption>Example usage of Collection Object.</caption>
 * // new Collection(address);
 * @return {Collections} Solution Instance Object
 */
function Collections(wallet) { 
    this.wallet = wallet;

};

Collections.prototype.get = (wallet) => {
    //console.log('Collections Cache Hit', wallet);
    return storage.get(wallet);
};

Collections.prototype.set = (wallet, payload) => {
    //console.log('Collections Cache Set', wallet);
    return storage.set(wallet, payload, 2);
};

Collections.prototype.remove = (wallet) => {;
    storage.remove(wallet);
};
Collections.prototype.exists = (wallet) => {
  const obj = storage.get(wallet);
  if (obj !== null) {
    return true;
  }; 
  return false;
};

module.exports = Collections;