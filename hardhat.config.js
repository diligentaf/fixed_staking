require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-truffle5");
const fs = require("fs")
const file = JSON.parse(fs.readFileSync('.secret', 'utf8'));
const privateKey = file.privateKey.toString()
const publicAddress = file.publicAddress.toString()
const mainnetGwei = 21;

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

module.exports = {
  gasReporter: {
    enabled: true
  },
  solidity: {
    version: "0.8.7",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    testnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      gasPrice: 20e9,
      gas: 25e6,
      accounts: [privateKey]
    },
    mainnet: {
      url: "https://bsc-dataseed.binance.org/",
      chainId: 56,
      gasPrice: 20e9,
      gas: 25e6,
      accounts: [privateKey]
    },
    localhost: {
      url: "http://127.0.0.1:7545",
      gasPrice: 20e9,
      // gas: 25e6,
      accounts: [privateKey]
    }
  },
};
