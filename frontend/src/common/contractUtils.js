module.exports.ERC721 = (address) => {
    const web3 = window.web3;
    const abi = require('../abis/ERC721.json');
    return new web3.eth.Contract(abi, address); 
};

module.exports.ERC1155 = (address) => {
    const web3 = window.web3;
    const abi = require('../abis/ERC1155.json');
    return new web3.eth.Contract(abi, address); 
};

module.exports.ERC20 = (address) => {
    const web3 = window.web3;
    const abi = require('../abis/ERC20.json');
    return new web3.eth.Contract(abi, address); 
};