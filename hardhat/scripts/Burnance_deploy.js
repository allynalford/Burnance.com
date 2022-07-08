const hre = require("hardhat");

async function main() {

  const Burnance = await hre.ethers.getContractFactory("Burnance");
  console.log('Deploying Burnance ERC721 token...');
  const token = await Burnance.deploy();

  console.log("Burnance:", token);

  await token.deployed();
  console.log("Burnance deployed to:", token.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });