const CampaignFactory = artifacts.require("CampaignFactory");

module.exports = async function (deployer) {
  await deployer.deploy(CampaignFactory);
};
