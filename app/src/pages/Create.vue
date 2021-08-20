<template>
  <b-loading v-if="loading" is-full-page v-model="loading"></b-loading>
  <div v-else class="box">
    <div v-if="submitted">
      <h1 class="title">Congratulations</h1>
      <p class="content">
        You have successfully created a new campaign. It will be active in 5 mins. Good luck!
      </p>
      <p class="content">
        <router-link to="/">View all campaigns</router-link>
      </p>
    </div>
    <form v-else @submit.prevent="handleSubmit">
      <div class="is-flex is-justify-content-space-between">
        <h1 class="title">New Campaign</h1>
        <button type="submit" class="button is-info">
          <b-icon icon="magic" />
          <strong>Create</strong>
        </button>
      </div>
      <b-field label="Title">
        <b-input v-model="data.title" ref="title" minlength="10"></b-input>
      </b-field>
      <b-field label="Story">
        <b-input v-model="data.story" minlength="50" maxlength="800" type="textarea"></b-input>
      </b-field>
      <b-field label="Target ETH">
        <b-input v-model="data.target" placeholder="Number" type="number" min="1"></b-input>
      </b-field>
      <b-field label="Closing">
        <b-datetimepicker
          v-model="data.closing"
          icon="calendar"
          placeholder="Click to select..."
          horizontal-time-picker
          rounded
          required
        >
        </b-datetimepicker>
      </b-field>
      <div class="pt-1">
        <label class="label">Beneficiaries</label>
        <b-button
          @click="beneficiaryModalOpen = true"
          outlined
          type="is-small"
          class="is-primary"
          icon-left="plus"
        >
          Add
        </b-button>
        <beneficiary-table v-if="data.beneficiaries.length" :items="data.beneficiaries" />
      </div>
      <b-modal v-model="beneficiaryModalOpen">
        <template #default="props" has-modal-card trap-focus :destroy-on-hide="false">
          <add-beneficiary-form @close="props.close" @add="addBeneficiary" />
        </template>
      </b-modal>
    </form>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import BeneficiaryTable from '@/components/BeneficiaryTable.vue';
import AddBeneficiaryForm from '@/components/AddBeneficiary.vue';

export default {
  name: 'Create',
  components: { BeneficiaryTable, AddBeneficiaryForm },
  data() {
    return {
      data: {
        title: null,
        story: null,
        target: null,
        closing: null,
        beneficiaries: [],
      },
      beneficiaryModalOpen: false,
      submitted: false,
      newCampaignId: null,
      loading: false,
    };
  },
  methods: {
    ...mapActions('campaigns', ['create']),
    handleSubmit() {
      // TODO: validate form data
      this.loading = true;
      this.create(this.data)
        .then((result) => {
          this.submitted = true;
          this.newCampaignId = result;
        })
        .catch((error) => {
          this.$buefy.toast.open({
            message: `Something went wrong... ${error.data?.message || error.message || ''}`,
            type: 'is-danger',
          });
        })
        .finally(() => {
          this.loading = false;
        });
    },
    addBeneficiary(data) {
      this.data.beneficiaries.push(data);
      this.beneficiaryModalOpen = false;
    },
  },
};
</script>
