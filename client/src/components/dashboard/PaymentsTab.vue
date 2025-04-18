<template>
  <div class="users-table-container">
    <h2>Zakat Payments</h2>
    <div v-if="loading" class="loading">Loading data...</div>
    <table v-else class="users-table">
      <thead>
        <tr>
          <th>User</th>
          <th>Date</th>
          <th>Amount (RM)</th>
          <th>Amount (Crypto)</th>
          <th>Wallet Address</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="payment in zakatPayments" :key="payment.id">
          <td>{{ payment.userName }}</td>
          <td>{{ formatDate(payment.date) }}</td>
          <td>RM {{ payment.amountRM.toFixed(2) }}</td>
          <td>{{ payment.amountCrypto.toFixed(8) }} {{ payment.cryptoType }}</td>
          <td class="wallet-address">{{ payment.walletAddress.substring(0, 10) }}...{{ payment.walletAddress.substring(payment.walletAddress.length - 6) }}</td>
          <td>
            <span :class="'status-badge ' + payment.status.toLowerCase()">
              {{ payment.status }}
            </span>
          </td>
          <td>
            <button @click="viewDetails(payment)" class="action-btn view-btn">View</button>
          </td>
        </tr>
        <tr v-if="zakatPayments.length === 0">
          <td colspan="7" class="no-data">No zakat payments found</td>
        </tr>
      </tbody>
    </table>
    
    <!-- Payment Details Modal -->
    <div v-if="selectedPayment" class="modal">
      <div class="modal-content">
        <span class="close-btn" @click="selectedPayment = null">&times;</span>
        <h2>Payment Details</h2>
        <div class="payment-details">
          <div class="detail-row">
            <span class="detail-label">User:</span>
            <span class="detail-value">{{ selectedPayment.userName }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Email:</span>
            <span class="detail-value">{{ selectedPayment.userEmail }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date:</span>
            <span class="detail-value">{{ formatDate(selectedPayment.date) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Amount (RM):</span>
            <span class="detail-value">RM {{ selectedPayment.amountRM.toFixed(2) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Amount (Crypto):</span>
            <span class="detail-value">{{ selectedPayment.amountCrypto.toFixed(8) }} {{ selectedPayment.cryptoType }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Wallet Address:</span>
            <span class="detail-value wallet-address">{{ selectedPayment.walletAddress }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Transaction ID:</span>
            <span class="detail-value">{{ selectedPayment.transactionId }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Status:</span>
            <span class="detail-value status-badge" :class="selectedPayment.status.toLowerCase()">
              {{ selectedPayment.status }}
            </span>
          </div>
        </div>
        <div class="modal-actions">
          <button 
            v-if="selectedPayment.status === 'Pending'" 
            @click="updatePaymentStatus(selectedPayment.id, 'Approved')" 
            class="approve-btn"
          >
            Approve
          </button>
          <button 
            v-if="selectedPayment.status === 'Pending'" 
            @click="updatePaymentStatus(selectedPayment.id, 'Rejected')" 
            class="reject-btn"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PaymentsTab',
  props: {
    zakatPayments: {
      type: Array,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      selectedPayment: null
    };
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString('en-MY', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    viewDetails(payment) {
      this.selectedPayment = payment;
    },
    updatePaymentStatus(paymentId, status) {
      this.$emit('update-payment-status', paymentId, status);
      this.selectedPayment = null;
    }
  }
};
</script> 