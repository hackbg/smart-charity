const { accounts, contract } = require('@openzeppelin/test-environment');

const { time, expectRevert, constants, ether, BN } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;

const { expect } = require('chai');

const Campaign = contract.fromArtifact('Campaign');
const SimpleToken = contract.fromArtifact('ERC20Impl');

describe('Campaign', function () {
  const [author, beneficiary, donor] = accounts;

  const title = 'Test'
  const description = 'Test';
  const goal = ether('100');
  const donation = ether('1');

  before(async function () {
    await time.advanceBlock();
  });

  beforeEach(async function () {
    this.token = await SimpleToken.new();
    this.openingTime = (await time.latest()).add(time.duration.weeks(1));
    this.closingTime = this.openingTime.add(time.duration.weeks(1));
  });

  it('requiress title', async function() {
    await expectRevert(
      Campaign.new(beneficiary, this.token.address, goal, this.openingTime, this.closingTime, '', description, author),
      'Campaign: title is empty'
    );
  });

  it('requiress description', async function() {
    await expectRevert(
      Campaign.new(beneficiary, this.token.address, goal, this.openingTime, this.closingTime, title, '', author),
      'Campaign: description is empty'
    );
  });

  it('requiress author', async function() {
    await expectRevert(
      Campaign.new(beneficiary, this.token.address, goal, this.openingTime, this.closingTime, title, description, ZERO_ADDRESS),
      'Campaign: address is the zero addres'
    );
  });

  context('once deployed', async function() {
    beforeEach(async function() {
      this.campaign = await Campaign.new(beneficiary, this.token.address, goal, this.openingTime, this.closingTime, title, description, author);
      this.token.transfer(this.campaign.address, goal);
    });

    describe('record donors', function() {
      it('should record donor address', async function() {
        await time.increaseTo(this.openingTime);
        await this.campaign.send(donation, { from: donor });
        expect(await this.campaign.donors()).to.include(donor);
      });
  
      it('should record only unique donors', async function() {
        await time.increaseTo(this.openingTime);
        await this.campaign.send(donation, { from: donor });
        await this.campaign.send(donation, { from: donor });
        expect(await this.campaign.donors()).to.have.lengthOf(1);
      });
    });

    describe('record donor amounts', function() {
      it('should set donor amount', async function() {
        await time.increaseTo(this.openingTime);
        await this.campaign.send(donation, { from: donor });
        expect(await this.campaign.donorAmount(donor)).to.be.bignumber.equal(donation);
      });

      it('should compound amounts', async function() {
        await time.increaseTo(this.openingTime);
        await this.campaign.send(donation, { from: donor });
        await this.campaign.send(donation, { from: donor });
        const expectedAmount = new BN(donation).mul(new BN('2'));
        expect(await this.campaign.donorAmount(donor)).to.be.bignumber.equal(expectedAmount);
      })
    });
  });
});
