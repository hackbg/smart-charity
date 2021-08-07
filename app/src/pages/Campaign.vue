<template>
  <div class="box" v-if="data">
    <div class="is-flex is-justify-content-space-between">
      <h1 class="title">{{ data.title }}</h1>
      <b-button v-if="data.isOpen && !data.goalReached" @click="promptDonateDialog" type="is-info">
        <b-icon icon="donate" />
        <strong>Donate</strong>
      </b-button>
      <b-button
        v-else-if="!data.goalReached && data.hasClosed"
        @click="promptRefundDialog"
        type="is-info"
      >
        <b-icon icon="donate" />
        <strong>Refund</strong>
      </b-button>
      <b-button v-else-if="data.goalReached" @click="promptClaimFundsDialog" type="is-info">
        <b-icon icon="funnel-dollar" />
        <strong>Claim Funds</strong>
      </b-button>
    </div>

    <div class="py-2">
      <colored-progress :value="data.completedPercent" />
    </div>

    <nav class="level pt-4">
      <div class="level-item has-text-centered">
        <div>
          <p class="heading"><b-icon icon="coins" />Target</p>
          <p class="title">
            {{ data.goal | formatEther }}
            <span class="currency">ETH</span>
          </p>
        </div>
      </div>
      <div class="level-item has-text-centered">
        <div>
          <p class="heading"><b-icon icon="users" />Donors</p>
          <p class="title">{{ data.donors.length }}</p>
        </div>
      </div>
      <div class="level-item has-text-centered">
        <div>
          <p class="heading"><b-icon icon="calendar-day" />Days left</p>
          <p class="title">{{ data.daysLeft }}</p>
        </div>
      </div>
    </nav>

    <b-tabs v-model="tabIdx">
      <b-tab-item label="Story">
        <div class="content">
          {{ data.description }}
        </div>
      </b-tab-item>
      <b-tab-item label="Beneficiaries">
        <b-message v-if="!data.goalReached" type="is-info">
          Beneficiaries will be able to claim the amount of funds once the campaign is fulfilled.
        </b-message>
        <beneficiary-table v-if="beneficiaries" :items="beneficiaries" />
      </b-tab-item>
      <b-tab-item label="Author">
        <user-address truncate :address="data.author" />
      </b-tab-item>
    </b-tabs>
  </div>
  <b-loading v-else-if="loading" is-full-page v-model="loading"></b-loading>
  <div v-else>
    <h1 class="title">Oops!</h1>
    <p class="content">Something went wrong :(</p>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { utils } from 'ethers';
import BeneficiaryTable from '@/components/BeneficiaryTable.vue';
import UserAddress from '@/components/UserAddress.vue';
import ColoredProgress from '@/components/ColoredProgress.vue';

export default {
  name: 'Campaign',
  components: { BeneficiaryTable, UserAddress, ColoredProgress },
  data: () => ({ data: null, beneficiaries: null, loading: true, tabIdx: 0 }),
  mounted() {
    this.getCampaign();
  },
  computed: {
    ...mapState('ethers', ['connected']),
    campaignId() {
      return this.$route.params.id;
    },
  },
  filters: {
    formatEther: (wei) => utils.formatEther(wei),
  },
  watch: {
    tabIdx(newValue) {
      if (newValue === 1 && !this.beneficiaries) {
        this.getBeneficiaries();
      }
    },
  },
  methods: {
    ...mapActions('campaigns', ['fetch', 'fetchBeneficiaries', 'donate', 'refund', 'claimFunds']),
    getCampaign() {
      if (!this.connected) return;
      this.fetch(this.campaignId)
        .then((data) => {
          this.data = data;
        })
        .catch(this.toastError)
        .finally(() => {
          this.loading = false;
        });
    },
    getBeneficiaries() {
      if (!this.connected) return;
      this.fetchBeneficiaries(this.campaignId)
        .then((items) => {
          this.beneficiaries = items;
        })
        .catch(this.toastError)
        .finally(() => {
          this.loading = false;
        });
    },
    promptDonateDialog() {
      this.$buefy.dialog.prompt({
        title: `Donate`,
        message: 'How much would you like to contribute?',
        inputAttrs: {
          type: 'float',
          placeholder: 'Type a number',
          value: 0.0,
        },
        trapFocus: true,
        onConfirm: this.onDonateConfirm,
      });
    },
    onDonateConfirm(value) {
      this.loading = true;
      this.donate({ id: this.campaignId, value })
        .then(() => this.$buefy.toast.open(`Your donation of ${value} was successfuly completed`))
        .catch(this.toastError)
        .finally(() => {
          this.loading = false;
        });
    },
    promptRefundDialog() {
      this.$buefy.dialog.confirm({
        message: 'Confirm to get refunded for your donations.',
        onConfirm: this.onRefundConfirm,
      });
    },
    onRefundConfirm() {
      this.loading = true;
      this.refund(this.campaignId)
        .then(() => this.$buefy.toast.open('Refund completed'))
        .catch(this.toastError)
        .finally(() => {
          this.loading = false;
        });
    },
    promptClaimFundsDialog() {
      this.$buefy.dialog.confirm({
        message: 'Claim funds as beneficiary to get your share transferred to you.',
        onConfirm: this.onClaimFundsConfirm,
      });
    },
    onClaimFundsConfirm() {
      this.loading = true;
      this.claimFunds(this.campaignId)
        .then(() => this.$buefy.toast.open('Funds transferred'))
        .catch(this.toastError)
        .finally(() => {
          this.loading = false;
        });
    },
    toastError(error) {
      this.$buefy.toast.open({
        message: `Something went wrong... ${error.data?.message || error.message || ''}`,
        type: 'is-danger',
      });
    },
  },
};
</script>
