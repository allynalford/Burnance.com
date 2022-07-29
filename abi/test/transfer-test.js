// We import Chai to use its asserting functions here.
const { expect } = require("chai");
const ethers = require('ethers');
const dotenv = require("dotenv");
const etherScan = require('../ethUtils');
dotenv.config();

const API_KEY = process.env.RINKEBY_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = "0x724bf64860F7284Bec4CC7dc9B31A3E1F97A26aD";
const contractABI = require("../ABIs/Burnance.json");
const alchemyProvider = new ethers.providers.AlchemyProvider(network="rinkeby", API_KEY);
const signer = new ethers.Wallet(PRIVATE_KEY, alchemyProvider);
const burnanceContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer);


async function main() {
  //console.log('NODE',process.env.RINKEBY_URL)
  console.log(burnanceContract);

  //Let's grab a provider for contract interactions
  const provider = await etherScan._getProvider(process.env.RINKEBY_URL);

  //Use the provider and key to grab the wallet
  const wallet = await etherScan._createWallet(process.env.PRIVATE_KEY, provider);

  // initiating a new Contract with the contractAddress, ABI and wallet
  let contract = await etherScan._getContract(CONTRACT_ADDRESS, contractABI.abi, wallet);

  //Grab the metadata use the contract to call the URL function with the tokenID
  const batchTransfer = await contract.batchTransfer([0x077E9BEb7ac6ef64EF255ebDed0dE4200749A2a2], [48,49], [1,1]);
  
  //const batchTransfer = await burnanceContract.batchTransfer([0x077E9BEb7ac6ef64EF255ebDed0dE4200749A2a2], [48,49], [1,1]);
  //await batchTransfer.wait();
  
  console.log('Batch',batchTransfer);
}

main();
