const { expect } = require("chai");
const { ethers } = require("hardhat");

const web3js = require('web3')
const toWei = web3js.utils.toWei
//const toWei = (x) => x

let alice, bob, carol, dev, minter;
before("provider & account settings", async() => {
  [alice, bob, carol, dev, minter] = await ethers.getSigners();
})

let VCToken, MasterChefFactory, MockERC20Factory;
before("fetch contract factories", async() => {
  VCToken = await ethers.getContractFactory('VCT')
  MasterChefFactory = await ethers.getContractFactory('MasterChef')
  MockERC20Factory = await ethers.getContractFactory('MockERC20')
  NFTFactory = await ethers.getContractFactory('ERC721WithLock')
})

let vct, masterchef, lp0, lp1, lp2, lp3;
beforeEach('deploy contracts', async() => {
  vct = await VCToken.connect(minter).deploy()
  await vct.deployed()

  nft = await NFTFactory.connect(minter).deploy("Limbo", "LMB")
  await nft.deployed()

  // 10 vctPerBlock, startBlock = 1, bonusEndBlock = 100

  let temp = 10 * 10 ** 18

  masterchef = await MasterChefFactory.connect(minter).deploy(vct.address, nft.address, dev.address, temp.toString(), 1, 100000)
  await masterchef.deployed()

  await vct.connect(minter).transferOwnership(masterchef.address)

  let tmp = toWei('100000')
  lp0 = await MockERC20Factory.connect(minter).deploy('LPToken', 'LP_0', tmp)
  await lp0.deployed()
  lp1 = await MockERC20Factory.connect(minter).deploy('LPToken', 'LP_1', tmp)
  await lp1.deployed()
  lp2 = await MockERC20Factory.connect(minter).deploy('LPToken', 'LP_2', tmp)
  await lp2.deployed()

  tmp = toWei('2000')
  await lp0.connect(minter).transfer(alice.address, tmp);
  await lp1.connect(minter).transfer(alice.address, tmp);
  await lp2.connect(minter).transfer(alice.address, tmp);

  await lp0.connect(minter).transfer(bob.address, tmp);
  await lp1.connect(minter).transfer(bob.address, tmp);
  await lp2.connect(minter).transfer(bob.address, tmp);

  nft.connect(minter).giveNewItem(minter.address, "A sword");
  nft.connect(minter).giveNewItem(bob.address, "A shield");
  nft.connect(minter).giveNewItem(bob.address, "A grove bow");
  nft.connect(minter).giveNewItem(bob.address, "A torch");

  nft.connect(bob).lockItem(4, masterchef.address)
})

describe('check add liquidity provider', () => {
  it('testing', async () => {
    await masterchef.connect(minter).add('2000', lp0.address, true)
    await masterchef.connect(minter).add('2000', lp1.address, true)

    expect((await masterchef.poolLength()).toString()).to.equal('2')

    await lp0.connect(alice).approve(masterchef.address, toWei('1000'))
    await lp1.connect(bob).approve(masterchef.address, toWei('1000'))

    await masterchef.connect(alice).deposit(0, toWei('20'))
    await masterchef.connect(alice).deposit(0, toWei('10'))
    expect(
        (await lp0.balanceOf(alice.address)).toString()
    ).to.equal(toWei('1970'))

    await masterchef.connect(bob).deposit(1, toWei('20'))
    await masterchef.connect(bob).deposit(1, toWei('10'))

    expect(
        (await lp1.balanceOf(bob.address)).toString()
    ).to.equal(toWei('1970'))

    /* * In this moment, Alice receive vct before update user.amount 20 -> 30
    *   user.amount = 20
    *   pool.accVCTPerShare = 2
    *   user.rewardDebt = 0
    *  */

    expect(
        (await vct.balanceOf(alice.address)).toString()
    ).to.equal(toWei('40'))

    expect(
        (await vct.balanceOf(bob.address)).toString()
    ).to.equal(toWei('42'))

    // dev receive 10 VCT
    expect(
        (await vct.balanceOf(dev.address)).toString()
    ).to.equal(toWei('10'))

    //console.log("-----------Alice's action begin---------")
    // alice withdraw 10 LP_0 from pool 0
    await masterchef.connect(alice).withdraw(0, toWei('10'))
    expect(
        (await vct.balanceOf(alice.address)).toString()
    ).to.equal(toWei('190'))

    //console.log("-----------Bob's action begin---------")
    // bob withdraw 10 VCT from pool 1
    await masterchef.connect(bob).withdraw(1, toWei('10'))
    expect(
        (await vct.balanceOf(bob.address)).toString()
    ).to.equal(toWei('136.5'))

    expect(
        (await lp0.balanceOf(alice.address)).toString()
    ).to.equal(toWei('1980'))

    expect(
        (await vct.balanceOf(dev.address)).toString()
    ).to.equal(toWei('35'))
  })
})

