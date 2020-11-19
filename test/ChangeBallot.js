const ChangeBallot = artifacts.require("ChangeBallot");
const Campaign = artifacts.require("Campaign");

const { time } = require("openzeppelin-test-helpers");
const { nextDayInSec } = require("./utils/time");
const assertRevert = require("./utils/assertRevert");

contract("ChangeBallot", ([author, donor, donor2, notDonor]) => {
  let changeBallot;
  const campaignTarget = 1000;

  before(async () => {
    campaignEnd = await nextDayInSec();
    campaign = await Campaign.new(
      "test",
      "test",
      campaignTarget,
      campaignEnd,
      author
    );
    await Promise.all([
      campaign.donate({ value: 100, from: donor }),
      campaign.donate({ value: 100, from: donor2 }),
    ]);

    changeBallot = await ChangeBallot.new(campaignEnd, campaign.address);
  });

  context("Deciding winner", () => {
    it("should be accepted if more than 50% didn't reject", async () => {
      const isAccepted = await changeBallot.isAccepted();
      assert.strictEqual(isAccepted, true);
    });

    it("should be rejected if there's no majority", async () => {
      await changeBallot.voteAgainst({ from: donor });
      const isAccepted = await changeBallot.isAccepted();
      assert.strictEqual(isAccepted, false);
    });

    it("should be rejected if more than 50% reject", async () => {
      await changeBallot.voteAgainst({ from: donor2 });
      const isAccepted = await changeBallot.isAccepted();
      assert.strictEqual(isAccepted, false);
    });
  });

  context("Voting", () => {
    it("should allow only donors to vote", async () => {
      await assertRevert(
        changeBallot.voteAgainst({ from: notDonor }),
        "Not eligible to vote"
      );
    });

    it("should allow voting once", async () => {
      await assertRevert(
        changeBallot.voteAgainst({ from: donor }),
        "Already voted"
      );
    });

    it("should not allow voting once finished", async () => {
      await time.increase(time.duration.days(2));
      await assertRevert(changeBallot.voteAgainst({ from: donor }), "Expired");
    });
  });
});
