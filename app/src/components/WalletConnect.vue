<template>
  <b-message v-if="!ethereum" type="is-warning" title="No wallet found" :closable="false">
    Please install MetaMask or another Ethereum compatible wallet.
  </b-message>
  <b-message
    v-else-if="!factoryContract && connected"
    type="is-warning"
    :title="`Not available on ${network}`"
    :closable="false"
  >
    Please switch to Ropsten Test Network.
  </b-message>
  <b-message
    v-else-if="ethereum && !connected"
    type="is-warning"
    title="Not connected"
    :closable="false"
  >
    Please check MetaMask, etc.
  </b-message>
</template>

<script>
import { mapState } from 'vuex';
import ethersConnect from '@/store/modules/ethers/ethersConnect';

export default {
  computed: {
    ...mapState('ethers', ['connected', 'network']),
    ...mapState('campaigns', ['factoryContract']),
    ethereum: () => ethersConnect.getEthereum(),
  },
};
</script>
