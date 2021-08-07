<template>
  <div id="app">
    <app-header />
    <section class="section main">
      <div class="container is-max-desktop">
        <router-view v-if="connected" />
        <div v-else-if="!ethereum">
          <h1 class="title">No wallet found</h1>
          <p class="content">Please install MetaMask or another Ethereum compatible wallet.</p>
        </div>
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
  components: {
    AppHeader,
    AppFooter,
  },
  mounted() {
    this.$store.dispatch('ethers/init');
  },
  computed: {
    ...mapState('ethers', ['connected']),
    ethereum: () => ethersConnect.getEthereum(),
  },
};
</script>

<style>
.main {
  min-height: calc(100vh - 3.25rem - 13rem);
}
</style>
