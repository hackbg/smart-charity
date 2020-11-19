const BeneficiaryRepository = artifacts.require("BeneficiaryRepository.sol");
const Campaign = artifacts.require("Campaign");
const ChangeBallot = artifacts.require("ChangeBallot");

const { time, constants } = require("openzeppelin-test-helpers");
const { nextDayInSec } = require("./utils/time");
const assertRevert = require("./utils/assertRevert");

const { ZERO_ADDRESS } = constants;

contract(
  "BeneficiaryRepository",
  ([author, beneficiary, beneficiary2, donor]) => {
    let beneficiaryRepo;
    let campaign;
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
      beneficiaryRepo = await BeneficiaryRepository.at(beneficiaryRepoAddress);
      await beneficiaryRepo.addBeneficiary(
        "test",
        "test",
        beneficiaryAmount,
        beneficiary
      );
    };

    before(newCampaignWithBeneficiary);

    context("Add beneficiery", () => {
      it("should set beneficiary data correctly", async () => {
        const beneficiaryAddresses = await beneficiaryRepo.getBeneficiaryAddresses();
        const {
          0: name,
          1: description,
          2: amount,
        } = await beneficiaryRepo.getBeneficiaryByAddress(beneficiary);

        assert.include(beneficiaryAddresses, beneficiary);
        assert.equal(name, "test");
        assert.equal(description, "test");
        assert.equal(amount.toString(), beneficiaryAmount);
      });

      it("should require beneficiary amount to be more than 0", async () => {
        await assertRevert(
          beneficiaryRepo.addBeneficiary("test", "test", 0, beneficiary2),
          "Amount greater than 0 is required"
        );
      });

      it("should not allow adding beneficiaries when threre are donors", async () => {
        await campaign.donate({
          value: 100,
          from: donor,
        });
        await assertRevert(
          beneficiaryRepo.addBeneficiary("test", "test", 10000, beneficiary2),
          "Already have donors"
        );
      });
    });

    context("Request change", () => {
      before(async () => {
        await beneficiaryRepo.addPendingBeneficiary(
          "test2",
          "test2",
          beneficiaryAmount,
          beneficiary2
        );
        const ballotEnd = await nextDayInSec();
        await beneficiaryRepo.requestBeneficiaryChange(
          beneficiary,
          beneficiary2,
          "test",
          ballotEnd
        );
      });

      it("should add pending beneficiary correctly", async () => {
        const {
          name,
          reason,
          amount,
        } = await beneficiaryRepo.pendingBeneficiaries(beneficiary2);

        assert.equal(name, "test2");
        assert.equal(reason, "test2");
        assert.equal(amount.toString(), beneficiaryAmount);
      });

      it("should request beneficiary change correctly", async () => {
        const {
          removeBeneficiary,
          addPendingBeneficiary,
          description,
          ballot,
        } = await beneficiaryRepo.changeRequests(0);

        assert.equal(removeBeneficiary, beneficiary);
        assert.equal(addPendingBeneficiary, beneficiary2);
        assert.equal(description, "test");
        assert.ok(ballot);
      });

      it("should request adding new beneficiary", async () => {
        const ballotEnd = await nextDayInSec();
        await beneficiaryRepo.requestBeneficiaryChange(
          ZERO_ADDRESS,
          beneficiary2,
          "test",
          ballotEnd
        );

        const {
          removeBeneficiary,
          addPendingBeneficiary,
          description,
          ballot,
        } = await beneficiaryRepo.changeRequests(1);

        assert.equal(removeBeneficiary, ZERO_ADDRESS);
        assert.equal(addPendingBeneficiary, beneficiary2);
        assert.equal(description, "test");
        assert.ok(ballot);
      });

      it("should request removing beneficiary", async () => {
        ballotEnd = await nextDayInSec();
        await beneficiaryRepo.requestBeneficiaryChange(
          beneficiary,
          ZERO_ADDRESS,
          "test",
          ballotEnd
        );

        const {
          removeBeneficiary,
          addPendingBeneficiary,
          description,
          ballot,
        } = await beneficiaryRepo.changeRequests(2);

        assert.equal(removeBeneficiary, beneficiary);
        assert.equal(addPendingBeneficiary, ZERO_ADDRESS);
        assert.equal(description, "test");
        assert.ok(ballot);
      });

      context("Commit change", () => {
        it("should not commit change before ballot ends", async () => {
          await assertRevert(
            beneficiaryRepo.commitBeneficiaryChange(0),
            "Ballot not finished yet"
          );
        });

        it("should commit accepted beneficiary change", async () => {
          await campaign.donate({
            from: donor,
            value: campaignTarget,
          });
          await time.increase(time.duration.days(2));

          await beneficiaryRepo.commitBeneficiaryChange(0);
          const beneficiaryAddresses = await beneficiaryRepo.getBeneficiaryAddresses();

          assert.include(beneficiaryAddresses, beneficiary2);
          assert.notInclude(beneficiaryAddresses, beneficiary);
        });

        it("should not commit rejected change", async () => {
          const ballotEnd = await nextDayInSec();
          await beneficiaryRepo.requestBeneficiaryChange(
            beneficiary,
            beneficiary2,
            "test",
            ballotEnd
          );
          const { ballot } = await beneficiaryRepo.changeRequests(3);
          const changeBallot = await ChangeBallot.at(ballot);
          await changeBallot.voteAgainst({ from: donor });

          await time.increase(time.duration.days(2));

          await assertRevert(
            beneficiaryRepo.commitBeneficiaryChange(3),
            "Donors rejected request"
          );
        });
      });
    });
  }
);
