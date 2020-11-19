const Campaign = artifacts.require("Campaign");
const BeneficiaryRepository = artifacts.require("BeneficiaryRepository.sol");

const { time } = require("openzeppelin-test-helpers");
const { nextDayInSec } = require("./utils/time");
const assertRevert = require("./utils/assertRevert");

const toBN = (num) => new web3.utils.BN(num);

const getTxCost = async (tx) => {
  const gasUsed = tx.receipt.gasUsed;
  const gasPrice = (await web3.eth.getTransaction(tx.tx)).gasPrice;
  return toBN(gasUsed).mul(toBN(gasPrice));
};

contract("Campagin", ([author, donor, donor2, notDonor, beneficiary]) => {
  let campaign;
  let campaignEnd;
  const campaignTarget = 1000;
  const beneficiaryAmount = 1000;

  const newCampaignWithBeneficiary = async () => {
    campaignEnd = await nextDayInSec();
    campaign = await Campaign.new(
      "test",
      "test",
      campaignTarget,
      campaignEnd,
      author
    );
    const beneficiaryRepoAddress = await campaign.beneficiaryRepo();
    const beneficiaryRepo = await BeneficiaryRepository.at(
      beneficiaryRepoAddress
    );
    await beneficiaryRepo.addBeneficiary(
      "test",
      "test",
      beneficiaryAmount,
      beneficiary
    );
  };

  before(newCampaignWithBeneficiary);

  it("should set data correctly", async () => {
    const [
      title,
      description,
      targetAmount,
      endTimestamp,
      campaignAuthor,
    ] = await Promise.all([
      campaign.title(),
      campaign.description(),
      campaign.targetAmount(),
      campaign.endTimestamp(),
      campaign.author(),
    ]);

    assert.equal(title, "test");
    assert.equal(description, "test");
    assert.equal(targetAmount.toString(), 1000);
    assert.equal(endTimestamp.toString(), campaignEnd);
    assert.equal(campaignAuthor, author);
  });

  context("Donations", () => {
    it("should require donation value more than 0", async () => {
      await assertRevert(
        campaign.donate({
          value: 0,
          from: donor,
        }),
        "Insufficient amount"
      );
    });

    it("should keep record of donation amounts", async () => {
      await campaign.donate({
        value: 100,
        from: donor,
      });
      await campaign.donate({
        value: 50,
        from: donor,
      });
      const donatedAmount = await campaign.donorsAmounts(donor);
      assert.equal(150, donatedAmount.toNumber());
    });

    it("should count unique donors", async () => {
      await campaign.donate({
        value: 50,
        from: donor2,
      });
      const donorCount = await campaign.getDonorsCount();
      assert.equal(2, donorCount.toNumber());
    });

    it("should make users who donate donors", async () => {
      const isDonor = await campaign.isDonor(donor);
      assert.ok(isDonor);
    });

    it("should not allow donations when fulfilled", async () => {
      // fulfils the target
      await campaign.donate({
        value: 800,
        from: donor,
      });
      await assertRevert(
        campaign.donate({
          value: 100,
          from: donor2,
        }),
        "Fulfilled"
      );
    });

    it("should not allow donations after ending", async () => {
      await time.increase(time.duration.days(2));
      await assertRevert(
        campaign.donate({
          value: 100,
          from: donor,
        })
      );
    });
  });

  context("Refunds", () => {
    before(async () => {
      await newCampaignWithBeneficiary();
      await campaign.donate({
        value: 100,
        from: donor,
      });
    });

    it("should not allow refund if campaign is active", async () => {
      await assertRevert(
        campaign.claimRefund({ from: donor }),
        "Active campaign"
      );
    });

    it("should not process refunds to to non-donors", async () => {
      await assertRevert(
        campaign.claimRefund({ from: notDonor }),
        "Not a donor"
      );
    });

    it("should process refunds correctly", async () => {
      await time.increase(time.duration.days(2));

      const donorInitialBalance = await web3.eth.getBalance(donor);
      const refundTx = await campaign.claimRefund({ from: donor });
      const donorFinalBalance = await web3.eth.getBalance(donor);
      const refundTxCost = await getTxCost(refundTx);

      assert.deepEqual(
        toBN(donorInitialBalance),
        toBN(donorFinalBalance).sub(toBN(100)).add(refundTxCost)
      );
    });

    it("should allow donor claiming a refund only once", async () => {
      await assertRevert(campaign.claimRefund({ from: donor }), "Not a donor");
    });
  });

  context("Payout", () => {
    before(newCampaignWithBeneficiary);

    it("should not pay funds to non-beneficiaries", async () => {
      await assertRevert(
        campaign.claimFunds({ from: donor }),
        "Not a beneficiary"
      );
    });

    it("shot not pay beneficiaries until campaign fulfilled", async () => {
      await assertRevert(
        campaign.claimFunds({ from: beneficiary }),
        "Unfulfilled"
      );
    });

    it("should pay beneficiaries correctly", async () => {
      // fulfils the target
      await campaign.donate({
        value: campaignTarget,
        from: donor,
      });
      await time.increase(time.duration.days(2));

      const beneficiaryInitialBalance = await web3.eth.getBalance(beneficiary);
      const claimFundsTx = await campaign.claimFunds({ from: beneficiary });
      const claimFundsTxCost = await getTxCost(claimFundsTx);
      const beneficiaryFinalBalance = await web3.eth.getBalance(beneficiary);

      assert.deepEqual(
        toBN(beneficiaryInitialBalance),
        toBN(beneficiaryFinalBalance)
          .sub(toBN(beneficiaryAmount))
          .add(claimFundsTxCost)
      );
    });

    it("should allow beneficiaries to claim funds only once", async () => {
      await assertRevert(
        campaign.claimFunds({ from: beneficiary }),
        "Already paid"
      );
    });
  });
});
