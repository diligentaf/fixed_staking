// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const fs = require("fs")
const file = JSON.parse(fs.readFileSync('.secret', 'utf8'));
const publicAddress = file.publicAddress.toString()

async function main() {
  let gasUsed;
  let tx;
  let receipt;

  const ts = await hre.ethers.provider.getBlock("latest")
  console.log('- latest timestamp',ts.timestamp)

  const TokenContract = await ethers.getContractFactory("Token");
  const Token = await TokenContract.attach("0x509a51394CC4D6bb474FeFB2994b8975A55A6e79");

  const FixedStakingContract = await ethers.getContractFactory("FixStaking");
  const FixedStaking = await FixedStakingContract.deploy(Token.address);
  console.log('Token Address', Token.address)
  console.log('FixedStaking Address', FixedStaking.address)

  // tx = await FixedStaking.setSystemTime()
  // receipt = await tx.wait()
  // gasUsed = receipt.gasUsed.toBigInt()
  // console.log('- setSystem gas used', receipt.gasUsed.toBigInt())
  // ts = await FixedStaking.ts()

  // first pool
  let startTime = ts.timestamp + 200
  let duration = 7776000
  let apy = BigInt(16666666666666667)
  let mainPenaltyRate = 0
  let subPenaltyRate = BigInt(700000000000000000)
  let lockedLimit = BigInt(50000000000000000000000000)
  let nftReward = false
  tx = await FixedStaking.createPool(startTime, duration, apy, mainPenaltyRate, subPenaltyRate, lockedLimit, nftReward)
  receipt = await tx.wait()
  gasUsed = receipt.gasUsed.toBigInt()
  console.log('- creatPool1 gas used', receipt.gasUsed.toBigInt())
  let pool1 = await FixedStaking.pools(0)

  // second pool
  startTime = ts.timestamp + 200
  duration = 15552000
  apy = BigInt(20000000000000003)
  mainPenaltyRate = 0
  subPenaltyRate = BigInt(700000000000000000)
  lockedLimit = BigInt(41666666666666700000000000)
  nftReward = false
  tx = await FixedStaking.createPool(startTime, duration, apy, mainPenaltyRate, subPenaltyRate, lockedLimit, nftReward)
  receipt = await tx.wait()
  gasUsed += receipt.gasUsed.toBigInt()
  console.log('- creatPool2 gas used', receipt.gasUsed.toBigInt())
  let pool2 = await FixedStaking.pools(1)

  // third pool
  startTime = ts.timestamp + 200
  duration = 31536000
  apy = BigInt(20547945205479455)
  mainPenaltyRate = 0
  subPenaltyRate = BigInt(700000000000000000)
  lockedLimit = BigInt(30000000000000000000000000)
  nftReward = false
  tx = await FixedStaking.createPool(startTime, duration, apy, mainPenaltyRate, subPenaltyRate, lockedLimit, nftReward)
  receipt = await tx.wait()
  gasUsed += receipt.gasUsed.toBigInt()
  console.log('- creatPool3 gas used', receipt.gasUsed.toBigInt())
  let pool3 = await FixedStaking.pools(2)

  // setMinMaxStake
  tx = await FixedStaking.setMinMaxStake(1, BigInt(pool2.lockedLimit))
  receipt = await tx.wait()
  gasUsed += receipt.gasUsed.toBigInt()
  console.log('- setMinMaxStake gas used', receipt.gasUsed.toBigInt())
  expect(await FixedStaking.minStake()).to.equal(1);
  expect(await FixedStaking.maxStake()).to.equal(BigInt(pool2.lockedLimit));

  // setPenaltyDuration
  tx = await FixedStaking.setPenaltyDuration(432000)
  receipt = await tx.wait()
  gasUsed += receipt.gasUsed.toBigInt()
  console.log('- setPenaltyDuration gas used', receipt.gasUsed.toBigInt())
  expect(await FixedStaking.penaltyDuration()).to.equal(432000);

  // fundPools
  const reward1 = BigInt(2500000000000000000000000)
  const reward2 = BigInt(5000000000000000000000000)
  const reward3 = BigInt(7500000000000000000000000)
  totalReward = reward1 + reward2 + reward3
  tx = await Token.approve(FixedStaking.address, totalReward)
  receipt = await tx.wait()
  gasUsed += receipt.gasUsed.toBigInt()
  console.log('- approve gas used', receipt.gasUsed.toBigInt())
  const allowance = await Token.allowance(publicAddress, FixedStaking.address)
  expect(allowance).to.equal(totalReward)

  tx = await FixedStaking.fundPool(0, reward1)
  receipt = await tx.wait()
  gasUsed += receipt.gasUsed.toBigInt()
  console.log('- fundPool1 gas used', receipt.gasUsed.toBigInt())
  pool1 = await FixedStaking.pools(0)
  expect(pool1.reserve.toBigInt()).to.equal(reward1)

  tx = await FixedStaking.fundPool(1, reward2)
  receipt = await tx.wait()
  gasUsed += receipt.gasUsed.toBigInt()
  console.log('- fundPool2 gas used', receipt.gasUsed.toBigInt())
  pool2 = await FixedStaking.pools(1)
  expect(pool2.reserve.toBigInt()).to.equal(reward2)

  tx = await FixedStaking.fundPool(2, reward3)
  receipt = await tx.wait()
  gasUsed += receipt.gasUsed.toBigInt()
  console.log('- fundPool3 gas used', receipt.gasUsed.toBigInt())
  pool3 = await FixedStaking.pools(2)
  expect(pool3.reserve.toBigInt()).to.equal(reward3)

  console.log('Total gas used', gasUsed)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
