const hre = require("hardhat");

async function main() {

  const BadgeToken = await hre.ethers.getContractFactory("BurnanceNFT");
  console.log('Deploying BurnanceNFT ERC721 token...');
  const token = await BadgeToken.deploy();

  await token.deployed();
  console.log("BurnanceNFT deployed to:", token.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });