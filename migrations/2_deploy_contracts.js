const CampaignFactory = artifacts.require("CampaignFactory");
const CampaignWallet = artifacts.require("CampaignWallet");

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(CampaignFactory);

  if (network === 'ganache') {
    await deployer.deploy(CampaignWallet, [accounts[1], accounts[2]], [50, 50], ['FoodCo', 'BuildCo'], ['Food', 'Construction']);
    const factory = await CampaignFactory.deployed();
    const now = Math.floor(new Date().getTime() / 1000);
    await factory.createCampaign(CampaignWallet.address, 1e18.toString(), now, now + 100000, 'Sample title', 'Sample description');
  }
};
