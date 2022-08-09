// We import Chai to use its asserting functions here.
const { expect } = require("chai");
var assert = require('assert');
const ethers = require('ethers');

describe("Burnance TranSfer contract", function () {
    const API_KEY = process.env.RINKEBY_KEY;
    const PRIVATE_KEY = process.env.PRIVATE_KEY;
    const CONTRACT_ADDRESS = "0x724bf64860F7284Bec4CC7dc9B31A3E1F97A26aD";
    const contract = require("../ABIs/Burnance.json");
    const alchemyProvider = new ethers.providers.AlchemyProvider(network="goerli", API_KEY);
    const signer = new ethers.Wallet(PRIVATE_KEY, alchemyProvider);
    const burnanceContract = new ethers.Contract(CONTRACT_ADDRESS, contract.abi, signer);

//   beforeEach(async function () {
//     // Get the ContractFactory and Signers here.
//     Token = await ethers.getContractFactory("BRCToken");
//     //[owner, ...addrs] = await ethers.getSigners();
//     [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

//     hardhatToken = await Token.deploy();
//   });

  // You can nest describe calls to create subsections.
  describe("Check if i have NFTs", function () {

    it("Batch Transfer", async function () {
      const batchTransfer = await burnanceContract.batchTransfer([0x077E9BEb7ac6ef64EF255ebDed0dE4200749A2a2], [48,49], [1,1]);
      await batchTransfer.wait();

      console.log(batchTransfer);
    });
  });


});