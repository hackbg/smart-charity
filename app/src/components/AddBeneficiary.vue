<template>
  <div class="modal-card" style="width: auto">
    <form @submit.prevent="handleSubmit">
      <header class="modal-card-head">
        <p class="modal-card-title">Add Beneficiary</p>
        <button type="button" class="delete" @click="$emit('close')" />
      </header>
      <section class="modal-card-body">
        <b-field label="Official name">
          <b-input v-model="beneficiary.name" required minlength="5"></b-input>
        </b-field>
        <b-field label="Reason">
          <b-input v-model="beneficiary.reason" required minlength="20"></b-input>
        </b-field>
        <b-field label="Amount" min="1">
          <b-input v-model="beneficiary.amount" type="number" placeholder="0" prequired></b-input>
        </b-field>
        <b-field label="Address" minlength="27">
          <b-input v-model="beneficiary.address" required></b-input>
        </b-field>
      </section>
      <footer class="modal-card-foot">
        <button type="button" class="button" @click="$emit('close')">Close</button>
        <button type="submit" class="button is-primary">Add</button>
      </footer>
    </form>
  </div>
</template>

<script>
export default {
  name: 'AddBeneficiary',
  props: ['name', 'reason', 'amount', 'address'],
  data() {
    return {
      beneficiary: {
        name: this.name,
        reason: this.reason,
        amount: this.amount,
        address: this.address,
      },
    };
  },
  methods: {
    handleSubmit() {
      this.$emit('add', this.beneficiary);
    },
  },
};
</script>
