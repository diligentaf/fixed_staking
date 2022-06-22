const Token = artifacts.require("Token");
const { expect } = require("chai");

describe("Token contract", function () {
  let TokenContract;
  let Token;
  let FixedStakingContract;
  let FixedStaking;
  let owner;
  let addr1;
  let addr2;
  let addrs;
  let ts;
  let pool1;
  let pool2;
  let pool3;
  let reward1;
  let reward2;
  let reward3;

  before(async function () {
    TokenContract = await ethers.getContractFactory("Token");
    FixedStakingContract = await ethers.getContractFactory("FixStaking");

    Token = await TokenContract.deploy();
    FixedStaking = await FixedStakingContract.deploy(Token.address);

    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    reward1 = BigInt(2500000000000000000000000)
    reward2 = BigInt(5000000000000000000000000)
    reward3 = BigInt(7500000000000000000000000)
  });

  describe("Fixed Staking", function () {
    it("Checking whether deployment was successful", async function () {
      const ownerBalance = await Token.balanceOf(owner.address);
      expect(await Token.totalSupply()).to.equal(ownerBalance);
    });

    it("transferring token from one wallet to another", async function () {
      const ownerBalance = await Token.balanceOf(owner.address);
      let addr1Balance = await Token.balanceOf(addr1.address);
      expect(await ownerBalance).to.equal(await Token.totalSupply());
      expect(addr1Balance).to.equal(0);

      await Token.transfer(addr1.address, 100);

      addr1Balance = await Token.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(100);
    });

    it("testing approve && allowance method", async function () {
      const approveAmount = 50
      await Token.approve(FixedStaking.address, approveAmount)
      const allowance = await Token.allowance(owner.address, FixedStaking.address)
      expect(allowance).to.equal(approveAmount)
    });

    it("set system time", async function () {
      await FixedStaking.setSystemTime()
      ts = await FixedStaking.ts()
    });

    it("first pool", async function () {
      const startTime = ts.toNumber() + 30
      const duration = 7776000
      const apy = BigInt(16666666666666667)
      const mainPenaltyRate = 0
      const subPenaltyRate = BigInt(700000000000000000)
      const lockedLimit = BigInt(50000000000000000000000000)
      const nftReward = false

      await FixedStaking.createPool(startTime, duration, apy, mainPenaltyRate, subPenaltyRate, lockedLimit, nftReward)

      pool1 = await FixedStaking.pools(0)
    });

    it("second pool", async function () {
      const startTime = ts.toNumber() + 30
      const duration = 15552000
      const apy = BigInt(20000000000000003)
      const mainPenaltyRate = 0
      const subPenaltyRate = BigInt(700000000000000000)
      const lockedLimit = BigInt(41666666666666700000000000)
      const nftReward = false

      await FixedStaking.createPool(startTime, duration, apy, mainPenaltyRate, subPenaltyRate, lockedLimit, nftReward)

      pool2 = await FixedStaking.pools(1)
    });

    it("third pool", async function () {
      const startTime = ts.toNumber() + 30
      const duration = 31536000
      const apy = BigInt(20547945205479455)
      const mainPenaltyRate = 0
      const subPenaltyRate = BigInt(700000000000000000)
      const lockedLimit = BigInt(30000000000000000000000000)
      const nftReward = false

      await FixedStaking.createPool(startTime, duration, apy, mainPenaltyRate, subPenaltyRate, lockedLimit, nftReward)

      pool3 = await FixedStaking.pools(2)
    });

    // it("calculate rewards", async function () {
    //   // const reward1 = await FixedStaking.calculateRew(BigInt(pool1.lockedLimit), BigInt(pool1.apy), BigInt(pool1.duration))
    //   const reward1 = await FixedStaking.calculateRew(100000000, BigInt(pool1.apy), BigInt(pool1.duration))
    //   console.log(reward1.toBigInt())
    //   // const reward2 = await FixedStaking.calculateRew(BigInt(pool2.lockedLimit), BigInt(pool2.apy), BigInt(pool2.duration))
    //   const reward2 = await FixedStaking.calculateRew(100000000, BigInt(pool2.apy), BigInt(pool2.duration))
    //   console.log(reward2.toBigInt())
    //   // const reward3 = await FixedStaking.calculateRew(BigInt(pool3.lockedLimit), BigInt(pool3.apy), BigInt(pool3.duration))
    //   const reward3 = await FixedStaking.calculateRew(100000000, BigInt(pool3.apy), BigInt(pool3.duration))
    //   console.log(reward3.toBigInt())
    // });

    it("setMinMaxStake, setPenaltyDuration", async function () {
      await FixedStaking.setMinMaxStake(1, BigInt(pool2.lockedLimit))
      expect(await FixedStaking.minStake()).to.equal(1);
      expect(await FixedStaking.maxStake()).to.equal(BigInt(pool2.lockedLimit));

      await FixedStaking.setPenaltyDuration(432000)
      expect(await FixedStaking.penaltyDuration()).to.equal(432000);
    });

    it("fundPool(s)", async function () {
      totalReward = reward1 + reward2 + reward3
      await Token.approve(FixedStaking.address, totalReward)
      const allowance = await Token.allowance(owner.address, FixedStaking.address)
      expect(allowance).to.equal(totalReward)

      await FixedStaking.fundPool(0, reward1)
      pool1 = await FixedStaking.pools(0)
      expect(pool1.reserve.toBigInt()).to.equal(reward1)

      await FixedStaking.fundPool(1, reward2)
      pool2 = await FixedStaking.pools(1)
      expect(pool2.reserve.toBigInt()).to.equal(reward2)

      await FixedStaking.fundPool(2, reward3)
      pool3 = await FixedStaking.pools(2)
      expect(pool3.reserve.toBigInt()).to.equal(reward3)
    });

    it("deposit", async function () {
      await network.provider.send("evm_increaseTime", [3600])

      const depositAmount = 10000
      await Token.approve(FixedStaking.address, depositAmount)
      await FixedStaking.deposit(depositAmount, 1)
      const stakerInfo = await FixedStaking.stakerInfo(owner.address, 0)
      expect(stakerInfo["stakerInf"].amount.toNumber()).to.equal(depositAmount)
    });
  })
});