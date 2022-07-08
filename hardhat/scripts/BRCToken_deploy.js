const hre = require("hardhat");

async function main() {

  const BRCToken = await hre.ethers.getContractFactory("contracts/BRCToken.sol:BRCToken");
  console.log('Deploying BRCToken...');
  const token = await BRCToken.deploy();

  await token.deployed();
  console.log("BRCToken deployed to:", token.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });