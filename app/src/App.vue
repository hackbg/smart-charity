<template>
  <div id="app">
    <app-header />
    <section class="section main">
      <div class="container is-max-desktop">
        <div v-if="!ethereum">
          <h1 class="title">No wallet found</h1>
          <p class="content">Please install MetaMask or another Ethereum compatible wallet.</p>
        </div>
        <div v-else-if="!factoryContract && connected">
          <h1 class="title">Not available on {{ network }}</h1>
          <p class="content">Please switch to Ropsten Test Network.</p>
        </div>
        <router-view v-else-if="connected" />
      </div>
    </section>
    <app-footer />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import AppHeader from '@/components/Header.vue';
import AppFooter from '@/components/Footer.vue';
import ethersConnect from './store/modules/ethers/ethersConnect';

export default {
  name: 'App',
  components: { AppHeader, AppFooter },
  created() {
    this.$store.dispatch('ethers/init');
    this.$store.watch(
      (state) => state.ethers.connected,
      () => this.$store.dispatch('campaigns/init')
    );
  },
  computed: {
    ...mapState('ethers', ['connected', 'network']),
    ...mapState('campaigns', ['factoryContract']),
    ethereum: () => ethersConnect.getEthereum(),
  },
};
</script>

<style>
.main {
  min-height: calc(100vh - 3.25rem - 13rem);
}
</style>
