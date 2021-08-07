<template>
  <b-tag rounded ellipsis class="user-address">
    <span class="address" :title="address">
      <img :src="avatarUrl" class="img mr-1" />
      <template v-if="truncate">{{ address | truncate(10) }}</template>
      <template v-else>{{ address }}</template>
    </span>
  </b-tag>
</template>

<script>
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
