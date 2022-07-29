require("@nomiclabs/hardhat-waffle");
//import * as dotenv from "dotenv";
const dotenv = require("dotenv");

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.6",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    goerli: {
      url: process.env.GOERLI_URL || "https://eth-goerli.g.alchemy.com/v2/h_hOY9pBxQuJhdKPYF54Tw9Pgg-QpAoj",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : ['a78733a15d1973a20cce00a2e440f2ce32e616a49b16828947bf182f04c0e9fa'],
    },
    rinkeby: {
      url: process.env.RINKEBY_URL || "https://eth-rinkeby.alchemyapi.io/v2/tE71kIxqJuuWQmw8vQa1XSI1hz3PGi--",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : ['a78733a15d1973a20cce00a2e440f2ce32e616a49b16828947bf182f04c0e9fa'],
    },
  },
};
