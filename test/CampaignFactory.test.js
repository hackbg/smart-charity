const { time, ether } = require('@openzeppelin/test-helpers');

const { expect } = require('chai');

const CampaignFactory = artifacts.require('CampaignFactory');
const ERC20 = artifacts.require('ERC20Impl');

contract('CampaignFactory', function (accounts) {
  const [beneficiary] = accounts;

  const title = 'Test'
  const description = 'Test';
  const goal = ether('1');

  beforeEach(async function () {
    this.factory = await CampaignFactory.deployed();
    this.openingTime = (await time.latest()).add(time.duration.weeks(1));
    this.closingTime = this.openingTime.add(time.duration.weeks(1));
  });

  it('should create token', async function() {
    expect(await this.factory.token()).to.not.be.empty;
  });

  it('should create campaign', async function() {
    await this.factory.createCampaign(beneficiary, goal, this.openingTime, this.closingTime, title, description);
  });

  it('should transfer tokens to campaign', async function() {
    await this.factory.createCampaign(beneficiary, goal, this.openingTime, this.closingTime, title, description);
    const tokenId = await this.factory.token();
    const token = await ERC20.at(tokenId);
    const campaigns = await this.factory.deployedCampaigns();
    const campaignBalance = await token.balanceOf(campaigns[0]);
    expect(campaignBalance).to.be.bignumber.equal(goal);
  });

  it('should list campaign', async function() {
    await this.factory.createCampaign(beneficiary, goal, this.openingTime, this.closingTime, title, description);
    expect(await this.factory.deployedCampaigns()).to.not.be.empty;
  });
});
