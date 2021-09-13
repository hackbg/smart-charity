<template>
  <b-tag rounded class="user-address">
    <span class="address" :title="address">
      <img :src="avatarUrl" class="img mr-1" />
      <a target="_blank" :href="explorerUrl">
        <template v-if="truncate">{{ address | truncate(10) }}</template>
        <template v-else>{{ address }}</template>
      </a>
    </span>
  </b-tag>
</template>

<script>
import ethersConnect from '@/store/modules/ethers/ethersConnect';

export default {
  name: 'UserAddress',
  props: {
    address: { type: String, required: true },
    truncate: { type: Boolean, default: false },
  },
  computed: {
    avatarUrl() {
      return `https://avatars.dicebear.com/api/jdenticon/${this.address}.svg`;
    },
    explorerUrl() {
      return ethersConnect.getExplorerUrl() + 'address/' + this.address;
    },
  },
};
</script>

<style lang="scss" scoped>
.user-address {
  .address {
    display: flex;
    align-items: center;

    .img {
      width: 16px;
      height: 16px;
    }
  }
}
</style>
