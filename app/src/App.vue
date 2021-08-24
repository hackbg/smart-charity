<template>
  <div id="app">
    <app-header />
    <section class="section main">
      <div class="container is-max-desktop">
        <router-view v-if="connected && factoryContract" />
        <wallet-connect v-else />
      </div>
    </section>
    <app-footer />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import AppHeader from '@/components/Header.vue';
import AppFooter from '@/components/Footer.vue';
import WalletConnect from '@/components/WalletConnect.vue';

export default {
  name: 'App',
  components: { AppHeader, AppFooter, WalletConnect },
  created() {
    this.$store.dispatch('ethers/init');
    this.$store.watch(
      (state) => state.ethers.connected,
      () => this.$store.dispatch('campaigns/init')
    );
  },
  computed: {
    ...mapState('ethers', ['connected']),
    ...mapState('campaigns', ['factoryContract']),
  },
};
</script>

<style>
.main {
  min-height: calc(100vh - 3.25rem - 13rem);
}
</style>
