var storage = require('sessionstorage')
/**
 * constructor for Batch Object
 *
 * @author Allyn j. Alford <Allyn@tenablylabs.com>
 * @function Collections
 * @param {String} address - Collection contract address
 * @example <caption>Example usage of Collection Object.</caption>
 * // new Collection(address);
 * @return {Collections} Solution Instance Object
 */
function Collections(wallet) { 
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

Collections.prototype.get = (wallet, expiresMins) => {
    console.log({wallet: this.wallet})
    const obj = JSON.parse(storage.getItem(wallet));
    if(obj !== null && expired(obj.date, expiresMins) === false){
        return null
    }else if(obj !== null){
        return obj;
    }
    return null;
}

Collections.prototype.set = (wallet, payload) => {
    storage.setItem(wallet, JSON.stringify(payload));
}


Collections.prototype.remove = (wallet) => {;
    storage.removeItem(wallet);
}

Collections.prototype.exists = (wallet) => {
  const obj = JSON.parse(storage.getItem(wallet));
  if (obj !== null && this.expired(obj.date) === false) {
    return false;
  } else if (obj !== null) {
    return true;
  }
  return false;
};


module.exports = Collections;