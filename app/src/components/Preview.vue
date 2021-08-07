<template>
  <div class="box">
    <article class="media">
      <div class="media-content">
        <div class="content">
          <router-link :to="`campaign/${id}`">
            <strong>{{ title }}</strong>
          </router-link>
          <span class="pl-2">
            <b-icon icon="coins" />
            <small>{{ goal | formatEther }} ETH</small>
          </span>
          <p>{{ description }}</p>
          <colored-progress :value="completedPercent" />
        </div>
      </div>
    </article>
  </div>
</template>

<script>
import ColoredProgress from '@/components/ColoredProgress.vue';
import { utils } from 'ethers';

export default {
  name: 'Preview',
  props: ['id', 'title', 'goal', 'description', 'completedPercent'],
  components: { ColoredProgress },
  filters: {
    formatEther: (wei) => utils.formatEther(wei),
  },
};
</script>
