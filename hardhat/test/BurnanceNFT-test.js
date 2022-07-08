const { expect } = require("chai");

describe("BurnanceNFT contract", function () {
  let BadgeToken;
  let token721;
  let _name='BurnanceNFT';
  let _symbol='Burnance';
  let account1,otheraccounts;

  beforeEach(async function () {
    BadgeToken = await ethers.getContractFactory("BurnanceNFT");
   [owner, account1, ...otheraccounts] = await ethers.getSigners();

    token721 = await BadgeToken.deploy();
  });

  // You can nest describe calls to create subsections.
  describe("Deployment", function () {

    it("Should has the correct name and symbol ", async function () {
      expect(await token721.name()).to.equal(_name);
      expect(await token721.symbol()).to.equal(_symbol);
    });

    it("Should mint a token with token ID 1 & 2 to account1", async function () {
      const address1=account1.address;
      //const address1 = "0x09e0D0d2FBBdF81E411EAd4D0323C7879879EC65";
      const mint1 = await token721.mintTo(address1, 1);
      console.log(address1)
      expect(await token721.ownerOf(1)).to.equal(address1);

      const mint2 = await token721.mintTo(address1, 1);
      //console.log(mint2)
      expect(await token721.ownerOf(2)).to.equal(address1);

      expect(await token721.balanceOf(address1)).to.equal(2);      
    });
  });
});