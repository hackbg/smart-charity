import { ethers } from 'ethers';
import { getProvider, getWallet, getNetworkAddress } from './ethers/ethersConnect';
import CampaignFactory from '../../../../build/contracts/CampaignFactory.json';
import CampaignWallet from '../../../../build/contracts/CampaignWallet.json';
import Campaign from '../../../../build/contracts/Campaign.json';

export default {
  namespaced: true,
  state: {
    factoryContract: null,
    tokenAddress: null,
  },
  mutations: {
    setFactoryContract(state, payload) {
      state.factoryContract = payload;
    },
    setTokenAddress(state, payload) {
      state.tokenAddress = payload;
    },
  },
  actions: {
    init({ commit, dispatch }) {
      const address = getNetworkAddress(CampaignFactory.networks);
      if (address) {
        const contract = new ethers.Contract(address, CampaignFactory.abi, getProvider());
        commit('setFactoryContract', contract);
        dispatch('setTokenAddress');
      }
    },
    async fetch(_, id) {
      const campaign = new ethers.Contract(id, Campaign.abi, getProvider());
      const [
        title,
        description,
        author,
        goal,
        raised,
        openingTime,
        closingTime,
        hasClosed,
        isOpen,
        goalReached,
        donors,
      ] = await Promise.all([
        campaign.title(),
        campaign.description(),
        campaign.author(),
        campaign.goal(),
        campaign.weiRaised(),
        campaign.openingTime(),
        campaign.closingTime(),
        campaign.hasClosed(),
        campaign.isOpen(),
        campaign.goalReached(),
        campaign.donors(),
      ]);
      const completedPercent = raised > 0 ? (raised / goal) * 100 : 0;
      const openingDate = new Date(openingTime.toNumber() * 1000);
      const closingDate = new Date(closingTime.toNumber() * 1000);
      const diffTime = closingDate - Date.now();
      const daysLeft = diffTime > 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0;
      return {
        id,
        title,
        description,
        goal,
        completedPercent,
        author,
        openingDate,
        closingDate,
        daysLeft,
        isOpen,
        hasClosed,
        goalReached,
        donors,
      };
    },
    async fetchAll({ state, dispatch }) {
      const deployed = await state.factoryContract.deployedCampaigns();
      const result = await Promise.all(deployed.map((campaignId) => dispatch('fetch', campaignId)));
      return result.sort((a, b) => a.openingDate < b.openingDate);
    },
    async fetchBeneficiaries(_, id) {
      const campaign = new ethers.Contract(id, Campaign.abi, getProvider());
      const walletId = await campaign.wallet();
      const campaignWallet = new ethers.Contract(walletId, CampaignWallet.abi, getProvider());
      const beneficiaries = await campaignWallet.beneficiaries();
      const result = await Promise.all(
        beneficiaries.map(async ([address, name, reason]) => ({
          address,
          name,
          reason,
          amount: (await campaignWallet.shares(address)).toNumber(),
        }))
      );
      return result;
    },
    async setTokenAddress({ state, commit }) {
      const address = await state.factoryContract.token();
      commit('setTokenAddress', address);
    },
    async create({ state, dispatch, rootState }, payload) {
      const walletId = await dispatch('createWallet', payload.beneficiaries);
      const signer = getProvider().getSigner(rootState.ethers.address);
      const campaignFactory = state.factoryContract.connect(signer);
      const openingTime = Math.floor(new Date().getTime() / 1000.0) + 5 * 60;
      const closingTime = Math.floor(payload.closing.getTime() / 1000.0);
      await campaignFactory.createCampaign(
        walletId,
        ethers.utils.parseEther(payload.target),
        openingTime,
        closingTime,
        payload.title,
        payload.story
      );
    },
    async createWallet({ rootState }, payload) {
      const signer = getProvider().getSigner(rootState.ethers.address);
      const beneficiaryAddresses = payload.map((b) => b.address);
      const shares = payload.map((b) => b.amount);
      const beneficiaryNames = payload.map((b) => b.name);
      const beneficiaryReasons = payload.map((b) => b.reason);
      const campaignWallet = await new ethers.ContractFactory(
        CampaignWallet.abi,
        CampaignWallet.bytecode,
        signer
      ).deploy(beneficiaryAddresses, shares, beneficiaryNames, beneficiaryReasons);
      return campaignWallet.address;
    },
    async donate(_, { id, value }) {
      const userWallet = getWallet();
      await userWallet.sendTransaction({
        to: id,
        value: ethers.utils.parseEther(value),
      });
    },
    async refund({ dispatch, rootState }, id) {
      await dispatch('finalize', id);
      const signer = getProvider().getSigner(rootState.ethers.address);
      const campaign = new ethers.Contract(id, Campaign.abi, signer);
      await campaign.claimRefund(rootState.ethers.address);
    },
    async claimFunds({ dispatch, rootState }, id) {
      await dispatch('finalize', id);
      const signer = getProvider().getSigner(rootState.ethers.address);
      const campaign = new ethers.Contract(id, Campaign.abi, signer);
      const walletId = await campaign.wallet();
      const campaignWallet = new ethers.Contract(walletId, CampaignWallet.abi, signer);
      await campaignWallet.release(rootState.ethers.address);
    },
    async finalize({ rootState }, id) {
      const signer = getProvider().getSigner(rootState.ethers.address);
      const campaign = new ethers.Contract(id, Campaign.abi, signer);
      const finalzied = await campaign.finalized();
      if (!finalzied) await campaign.finalize();
    },
  },
};
