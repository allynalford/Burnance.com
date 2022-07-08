// We import Chai to use its asserting functions here.
const { expect } = require("chai");

describe("BRCToken contract", function () {
  let totalSupply = '10000000000000000000000'; // 10000 * 1e18
  let Token;
  let hardhatToken;
  let owner;
  //let addr1 = {address: '0x271f5a218d2010c83a77BdD02CF866D5d5a6D76f'};
  let addr1 = {address: '0x271f5a218d2010c83a77BdD02CF866D5d5a6D76f'};
  let addr2;
  let addrs;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    Token = await ethers.getContractFactory("BRCToken");
    //[owner, ...addrs] = await ethers.getSigners();
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    hardhatToken = await Token.deploy();
  });

  // You can nest describe calls to create subsections.
  describe("Deployment", function () {

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await hardhatToken.balanceOf(owner.address);
      console.log('ownerBalance: ', ownerBalance)
      expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Transactions", function () {

    it("Should transfer tokens between accounts", async function () {
        const ownerBalance = await hardhatToken.balanceOf(owner.address);
        console.log('ownerBalance: ', ownerBalance)

        console.log('addr1: ', addr1.address)

        // Transfer 50 tokens from owner to addr1
      const transfer = await hardhatToken.transfer(addr1.address, 500);
      console.log('transfer: ',transfer);

      const addr1Balance = await hardhatToken.balanceOf(addr1.address);
      console.log('addr1Balance:',addr1Balance);
      expect(addr1Balance).to.equal(500);

      // Transfer 50 tokens from addr1 to addr2
      // We use .connect(signer) to send a transaction from another account
      await hardhatToken.connect(addr1).transfer(addr2.address, 500);
      const addr2Balance = await hardhatToken.balanceOf(addr2.address);
      console.log('addr2Balance:',addr1Balance);
      expect(addr2Balance).to.equal(500);
    });

    it("Should fail if sender doesn’t have enough tokens", async function () {
      const initialOwnerBalance = await hardhatToken.balanceOf(owner.address);

      // Try to send 1 token from addr1 (0 tokens) to owner (1000000 tokens).
      // `require` will evaluate false and revert the transaction.
      await expect(
        hardhatToken.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

      // Owner balance shouldn't have changed.
      expect(await hardhatToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });

  });
});