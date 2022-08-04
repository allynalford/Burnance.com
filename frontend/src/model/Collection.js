var storage = require('sessionstorage')
/**
 * constructor for Batch Object
 *
 * @author Allyn j. Alford <Allyn@tenablylabs.com>
 * @function Collection
 * @param {String} address - Collection contract address
 * @example <caption>Example usage of Collection Object.</caption>
 * // new Collection(address);
 * @return {Collection} Solution Instance Object
 */
function Collection(wallet, address) { 
    this.address  = address;
    this.wallet  = wallet;
}

function expired (date, expiresMins) {
    const today = new Date();
    var Christmas = new Date(date);
    var diffMs = (today - Christmas); // milliseconds between now & Christmas
    var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
    console.log(diffMins);
    return (diffMins < expiresMins ? false : true);
}

Collection.prototype.get = (wallet, address, expiresMins) => {
    console.log({wallet: this.wallet, address: this.address})
    const obj = JSON.parse(storage.getItem(wallet+':'+address));
    if(obj !== null && expired(obj.date, expiresMins) === false){
        return null
    }else if(obj !== null){
        return obj;
    }
    return null;
}

Collection.prototype.set = (wallet, address, payload) => {
    storage.setItem(wallet+':'+address, JSON.stringify(payload));
}


Collection.prototype.remove = (wallet, address) => {;
    storage.removeItem(wallet+':'+address);
}

Collection.prototype.exists = (wallet, address) => {
  const obj = JSON.parse(storage.getItem(wallet + ':' + address));
  if (obj !== null && this.expired(obj.date) === false) {
    return false;
  } else if (obj !== null) {
    return true;
  }
  return false;
};


module.exports = Collection;