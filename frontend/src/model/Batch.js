var localStorage = require('localStorage')
/**
 * constructor for Batch Object
 *
 * @author Allyn j. Alford <Allyn@tenablylabs.com>
 * @function Batch
 * @param {String} address - wallet address
 * @example <caption>Example usage of Action Object.</caption>
 * // new Batch(address);
 * @return {Batch} Solution Instance Object
 */
function Batch(address) { 
    this.address  = address;
}

Batch.prototype.getBatch = (wallet) => {
    const batch = JSON.parse(localStorage.getItem('batch:'+wallet));
    if(batch !== null){
        return batch;
    }
    return [];
}

Batch.prototype.addToBatch = (wallet, name, address, tokenId, tokenType, qty, imgSrc, costUSD) => {
    let batch = JSON.parse(localStorage.getItem('batch:'+wallet));

    if(batch === null){
        batch = [{name, address, tokenId, tokenType, qty, imgSrc, costUSD}];
    }else{
        batch.push({name, address, tokenId, tokenType, qty, imgSrc, costUSD});
    }
    localStorage.setItem('batch:'+wallet, JSON.stringify(batch));

    return true;
}

Batch.prototype.qty = (wallet, address, tokenId) => {
    let batch = JSON.parse(localStorage.getItem('batch:' + wallet));
    const index = batch.findIndex(x => x.address === address && x.tokenId === tokenId); 

    return batch[index].qty;
}

Batch.prototype.increment = (wallet, address, tokenId) => {
    let batch = JSON.parse(localStorage.getItem('batch:' + wallet));

    const index = batch.findIndex(x => x.address === address && x.tokenId === tokenId);

    batch[index].qty = (batch[index].qty + 1);

    //Update the batch
    localStorage.setItem('batch:' + wallet, JSON.stringify(batch));
}

Batch.prototype.decrement = (wallet, address, tokenId) => {
    //Grab the batch
    let batch = JSON.parse(localStorage.getItem('batch:' + wallet));
    //Get the index of the NFT
    const index = batch.findIndex(x => x.address === address && x.tokenId === tokenId); 
    //Update the QTY
    batch[index].qty = (batch[index].qty - 1);
    //Update the batch
    localStorage.setItem('batch:' + wallet, JSON.stringify(batch));
}

Batch.prototype.removeFromBatch = (wallet, address, tokenId) => {;
     //Grab the batch
     let batch = JSON.parse(localStorage.getItem('batch:'+wallet));

     const index = batch.findIndex(x => x.address === address && x.tokenId === tokenId);

     //Filter out the item
     batch.splice(index, 1);

     //Update the batch
     localStorage.setItem('batch:'+wallet, JSON.stringify(batch));
}

Batch.prototype.delete = (wallet) => {;
    //delete the batch
    localStorage.removeItem('batch:'+wallet);
}

Batch.prototype.existsInBatch = (wallet, address, tokenId) => {
   //Grab the batch
    const batch = JSON.parse(localStorage.getItem('batch:'+wallet));
  
    if (batch !== null) {
        //We need lodash for this
        const _ = require('lodash');
        //Check if the NFT exists
        const exists = _.find(batch, function (obj) {
            return obj.address === address && obj.tokenId === tokenId;
        });

        if (typeof exists !== "undefined") {
            return true;
        };
    };
    return false;
}

Batch.prototype.batchExists = (wallet) => {
    const batch = JSON.parse(localStorage.getItem('batch:'+wallet));
    if(batch === null){
        return false
    }

    return true
}

Batch.prototype.length = (wallet) => {
    //Grab the batch
     const batch = JSON.parse(localStorage.getItem('batch:'+wallet));
   
     if (batch !== null) {
        return batch.length
     };
     return 0;
 }

module.exports = Batch;