const { time, expectRevert, constants } = require('@openzeppelin/test-helpers');

const { ZERO_ADDRESS } = constants;

const Campaign = artifacts.require('Campaign');
const SimpleToken = artifacts.require('ERC20Impl');

contract('Campaign', function (accounts) {
  const [author, beneficiary] = accounts;

  const title = 'Test'
  const description = 'Test';
  const goal = 1000;

  beforeEach(async function () {
    this.token = await SimpleToken.new();
    this.openingTime = (await time.latest()).add(time.duration.weeks(1));
    this.closingTime = this.openingTime.add(time.duration.weeks(1));
  });

  it('requiress title', async function() {
    await expectRevert(
      Campaign.new(beneficiary, this.token.address, goal,
        this.openingTime, this.closingTime, '', description, author),
      'Campaign: title is empty'
    );
  });

  it('requiress description', async function() {
    await expectRevert(
      Campaign.new(beneficiary, this.token.address, goal,
        this.openingTime, this.closingTime, title, '', author),
      'Campaign: description is empty'
    );
  });

  it('requiress author', async function() {
    await expectRevert(
      Campaign.new(beneficiary, this.token.address, goal,
        this.openingTime, this.closingTime, title, description, ZERO_ADDRESS),
        'Campaign: address is the zero addres'
    );
  });
});
