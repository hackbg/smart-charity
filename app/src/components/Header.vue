<template>
  <header class="header has-background-primary">
    <b-navbar class="container is-max-desktop" type="is-primary">
      <template slot="brand">
        <b-navbar-item tag="router-link" :to="{ path: '/' }">
          <logo />
        </b-navbar-item>
      </template>
      <template slot="start">
        <b-navbar-item tag="router-link" :to="{ path: '/' }">Home</b-navbar-item>
        <b-navbar-item href="#">About</b-navbar-item>
      </template>
      <template slot="end">
        <template v-if="connected">
          <b-navbar-item tag="div">
            <b-button
              size="is-primary is-small"
              icon-left="plus"
              @click="$router.push('/campaign/new')"
            >
              New Campaign
            </b-button>
          </b-navbar-item>
          <b-navbar-item tag="div">
            <user-address truncate :address="address" v-if="connected" />
          </b-navbar-item>
        </template>
        <b-navbar-item tag="div" v-else>
          <b-button size="is-light is-small" @click="connect">Connect Wallet</b-button>
        </b-navbar-item>
      </template>
    </b-navbar>
  </header>
</template>

<script>
import { mapState } from 'vuex';
import Logo from '@/components/Logo.vue';
import UserAddress from '@/components/UserAddress.vue';
import { connect } from '../store/modules/ethers/ethersConnect';

export default {
  name: 'Header',
  components: { Logo, UserAddress },
  computed: mapState('ethers', ['connected', 'address']),
  methods: { connect },
};
</script>
