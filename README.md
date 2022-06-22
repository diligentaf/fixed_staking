- running npx hardhat accounts
- hardhat.config.js -> add these lines:

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

- npx hardhat compile
- npx hardhat test -> deploy on local network
- npx hardhat run scripts/sample-script.js -> deploy on the testnet
- npx hardhat run scripts/sample-script.js --network localhost
- npx hardhat node -> connect with network

- npx hardhat run scripts/test_deploy.js --network localhost
- npx hardhat run scripts/test_test.js --network localhost
- npx hardhat run scripts/test_deploy.js --network testnet
- npx hardhat run scripts/test_correct.js --network testnet

- charlie's code
- npx hardhat run scripts/live_deploy.js --network mainnet

# npm i hardhat-gas-reporter
# how to re-send transaction with higher gas price using blah blah