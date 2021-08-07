<template>
  <div class="box">
    <div>
      <h1 class="title">About</h1>
      <p class="content">
        SmartCharity Token Address: <code>{{ tokenAddress || 'Not found' }}</code>
      </p>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'About',
  computed: mapState('campaigns', ['tokenAddress']),
};
</script>
