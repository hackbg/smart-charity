<template>
  <b-progress
    :type="progressType"
    :value="value"
    format="percent"
    :precision="0"
    show-value
  ></b-progress>
</template>

<script>
export default {
  name: 'ColoredProgress',
  props: ['value'],
  computed: {
    progressType() {
      const percent = parseInt(this.value, 10);
      if (percent < 20) return 'is-light';
      if (percent < 40) return 'is-danger';
      if (percent < 80) return 'is-warning';
      return 'is-success';
    },
  },
};
</script>
