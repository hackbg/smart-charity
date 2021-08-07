<template>
  <div v-if="items">
    <preview v-for="item in items" :key="item.id" v-bind="item" />
  </div>
  <b-loading v-else-if="loading" is-full-page v-model="loading"></b-loading>
  <div v-else-if="error">
    <h1 class="title">Oops!</h1>
    <p class="content">Something went wrong :(</p>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import Preview from '@/components/Preview.vue';

export default {
  name: 'Home',
  components: { Preview },
  data: () => ({ items: null, loading: true, error: null }),
  mounted() {
    this.getAll();
  },
  computed: mapState('ethers', ['network', 'connected']),
  methods: {
    ...mapActions('campaigns', ['fetchAll']),
    async getAll() {
      if (!this.connected) return;
      this.loading = true;
      this.fetchAll()
        .then((items) => {
          this.items = items;
        })
        .catch((error) => {
          this.error = error;
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>
