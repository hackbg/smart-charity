const { time } = require('@openzeppelin/test-helpers');
const { assert } = require('chai');

const CampaignFactory = artifacts.require('CampaignFactory');
const SimpleToken = artifacts.require('ERC20Impl');

contract('CampaignFactory', function (accounts) {
  const [beneficiary] = accounts;

  const title = 'Test'
  const description = 'Test';
  const goal = 1000;

  beforeEach(async function () {
    this.factory = await CampaignFactory.deployed();
    this.token = await SimpleToken.new();
    this.openingTime = (await time.latest()).add(time.duration.weeks(1));
    this.closingTime = this.openingTime.add(time.duration.weeks(1));
  });

  it('should create campaign', async function() {
    await this.factory.createCampaign(beneficiary, this.token.address, goal,
      this.openingTime, this.closingTime, title, description);
  });

  it('should list campaign', async function() {
    await this.factory.createCampaign(beneficiary, this.token.address, goal,
      this.openingTime, this.closingTime, title, description);

    expect(await this.factory.deployedCampaigns()).to.not.be.empty;
  });
});
