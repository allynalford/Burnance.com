const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Burnance", function () {

    let Burnance;
    let contract;
    let account1;
    let otheraccounts;
    let owner;
    let token721, token721BAYC;
    let BurnanceNFT;
    let _name='BurnanceNFT';
    let _symbol='Burnance';
    let nftAddress, baycAddress;
    let BAYC;
    let burnTo = "0x000000000000000000000000000000000000dEaD";

    beforeEach(async function () {
        
       [owner, account1, ...otheraccounts] = await ethers.getSigners();
    
       
      });

      it("Deploy Burnance Contract ", async function () {
        Burnance = await ethers.getContractFactory("Burnance");
        contract = await Burnance.deploy("0x202CCe504e04bEd6fC0521238dDf04Bc9E8E15aB");
        await contract.deployed();
      });

      it("Deploy Burnance NFT Contract ", async function () {
        BurnanceNFT = await ethers.getContractFactory("BurnanceNFT");
        token721 = await BurnanceNFT.deploy();

        await token721.deployed();
        nftAddress = token721.address;
        console.log("BurnanceNFT deployed to:", token721.address);
      });

      it("Burnance Should have the correct name and symbol ", async function () {
        expect(await token721.name()).to.equal(_name);
        expect(await token721.symbol()).to.equal(_symbol);
      });


      it("Deploy BBYC NFT Contract ", async function () {

        BAYC = await ethers.getContractFactory("BBYC");
        token721BAYC = await BAYC.deploy();
        await token721BAYC.deployed();
        baycAddress = token721BAYC.address;
        console.log("BBYC deployed to:", token721BAYC.address);

      });
      
      it("BAYC Should have the correct name and symbol ", async function () {
        expect(await token721BAYC.name()).to.equal("Bored Bits Yacht Club");
        expect(await token721BAYC.symbol()).to.equal("BBYC");
      });
      
      it("Mint the Burnance NFTs", async function () {
        console.log("NFT Owner", owner.address);
       const mint1 = await token721.mintTo(owner.address, 1);
       const actualOwner = await token721.ownerOf(1);
       console.log('Actual Owner:', actualOwner)
       expect(actualOwner).to.equal(owner.address);

       const mint2 = await token721.mintTo(owner.address, 1);
       expect(await token721.ownerOf(2)).to.equal(owner.address);

       expect(await token721.balanceOf(owner.address)).to.equal(2); 
        
  
      });

      it("Mint the BBYC NFTs", async function () {
        await token721BAYC.mint(2);
        expect(await token721BAYC.ownerOf(1)).to.equal(owner.address);
 
        await token721BAYC.mint(2);
        expect(await token721BAYC.ownerOf(2)).to.equal(owner.address);
 
        expect(await token721BAYC.balanceOf(owner.address)).to.equal(4); 
         
   
       });


       it("Run the BBYC transfer Function", async function () {
        
  
     
      const setTx = await contract.BurnAndTransfer(
          token721BAYC.address,//NFT
          1, 
          500);
  
      // wait until the transaction is mined
      const tx = await setTx.wait();
  
      console.log(tx);
  
      expect("ok").to.equal("ok");
    });

    it("Check Owner of Burnance NFT", async function () {
        expect(await token721.ownerOf(1)).to.equal(owner.address);
    });

    it("Check Approved of Burnance NFT", async function () {
        const approve = await token721.approve(burnTo, 1);
       // console.log('approve:',approve)
        if(approve.confirmations >= 1){
            expect(true).to.equal(true);
        }else{
            expect(false).to.equal(true);
        }
        
    });

  it("Run the transfer Function", async function () {
      


   
    const setTx = await contract.BurnAndTransfer(
        "0x202CCe504e04bEd6fC0521238dDf04Bc9E8E15aB",//Coin 
        token721.address,//NFT
        1, 
        500);

    // wait until the transaction is mined
    const tx = await setTx.wait();

    console.log(tx);

    expect("ok").to.equal("ok");
  });
});
