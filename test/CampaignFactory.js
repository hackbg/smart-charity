const CampaignFactory = artifacts.require("CampaignFactory");

const truffleAssert = require("truffle-assertions");
const { nextDayInSec } = require("./utils/time");

contract("CampaignFactory", () => {
  it("should deploy a new campaign", async () => {
    const campaignFactory = await CampaignFactory.deployed();
    const campaignEnd = await nextDayInSec();
    createCampaignResult = await campaignFactory.createCampaign(
      "test",
      "test",
      1000,
      campaignEnd
    );
    deployedCampaigns = await campaignFactory.getDeployedCampaigns();

    truffleAssert.eventEmitted(
      createCampaignResult,
      "LogCreateCampaign",
      (event) => {
        assert.equal(
          event._campaignAddress,
          deployedCampaigns[0],
          "Unable to deploy new campaign"
        );
        return true;
      }
    );
  });
});
