<template>
  <div class="admin-dashboard">
    <header class="dashboard-header">
      <h1>Admin Dashboard</h1>
      <button @click="handleLogout" class="logout-btn">Logout</button>
    </header>
    
    <div class="dashboard-stats">
      <div class="stat-card">
        <h3>Total Users</h3>
        <p class="stat-value">{{ totalUsers }}</p>
      </div>
      <div class="stat-card">
        <h3>Total Zakat (RM)</h3>
        <p class="stat-value">RM {{ totalZakatRM.toFixed(2) }}</p>
      </div>
      <div class="stat-card">
        <h3>Total Zakat (Crypto)</h3>
        <p class="stat-value">{{ totalZakatCrypto.toFixed(8) }} BTC</p>
      </div>
      <div class="stat-card">
        <h3>Distributed Zakat</h3>
        <p class="stat-value">RM {{ totalDistributedRM.toFixed(2) }}</p>
      </div>
    </div>
    
    <div class="dashboard-tabs">
      <button 
        @click="activeTab = 'payments'" 
        :class="{ 'active-tab': activeTab === 'payments' }"
        class="tab-btn"
      >
        Zakat Payments
      </button>
      <button 
        @click="activeTab = 'distributions'" 
        :class="{ 'active-tab': activeTab === 'distributions' }"
        class="tab-btn"
      >
        Zakat Distributions
      </button>
      <button 
        @click="activeTab = 'asnaf'" 
        :class="{ 'active-tab': activeTab === 'asnaf' }"
        class="tab-btn"
      >
        Asnaf Listing
      </button>
    </div>
    
    <!-- Zakat Payments Tab -->
    <div v-if="activeTab === 'payments'" class="users-table-container">
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
    </div>
    
    <!-- Zakat Distributions Tab -->
    <div v-if="activeTab === 'distributions'" class="users-table-container">
      <h2>Zakat Distributions</h2>
      <div class="action-bar">
        <button @click="showAddDistributionModal = true" class="add-btn">Add New Distribution</button>
      </div>
      <div v-if="loadingDistributions" class="loading">Loading data...</div>
      <table v-else class="users-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Recipient</th>
            <th>Category</th>
            <th>Amount (RM)</th>
            <th>Description</th>
            <th>Source</th>
            <th>Evidence</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="distribution in zakatDistributions" :key="distribution.id">
            <td>{{ formatDate(distribution.date) }}</td>
            <td>{{ distribution.recipientName }}</td>
            <td>{{ distribution.category }}</td>
            <td>RM {{ distribution.amountRM.toFixed(2) }}</td>
            <td>{{ distribution.description }}</td>
            <td>
              <div v-if="distribution.sourcePayments && distribution.sourcePayments.length > 0" class="source-payments">
                <button @click="viewSourceDetails(distribution)" class="source-btn">
                  {{ distribution.sourcePayments.length }} donor(s)
                </button>
              </div>
              <span v-else>Not specified</span>
            </td>
            <td>
              <a v-if="distribution.evidenceUrl" :href="distribution.evidenceUrl" target="_blank" class="evidence-link">
                View Evidence
              </a>
              <span v-else>No evidence</span>
            </td>
            <td>
              <button @click="editDistribution(distribution)" class="action-btn edit-btn">Edit</button>
            </td>
          </tr>
          <tr v-if="zakatDistributions.length === 0">
            <td colspan="8" class="no-data">No zakat distributions found</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Asnaf Listing Tab -->
    <div v-if="activeTab === 'asnaf'" class="users-table-container">
      <h2>Asnaf (Eligible Recipients) Listing</h2>
      <div class="action-bar">
        <button @click="showAddAsnafModal = true" class="add-btn">Add New Asnaf</button>
      </div>
      <div v-if="loadingAsnaf" class="loading">Loading data...</div>
      <div v-else class="asnaf-categories">
        <div v-for="(asnafList, category) in groupedAsnaf" :key="category" class="asnaf-category">
          <h3>{{ category }} <span class="asnaf-count">({{ asnafList.length }})</span></h3>
          <div class="asnaf-cards">
            <div v-for="asnaf in asnafList" :key="asnaf.id" class="asnaf-card">
              <div class="asnaf-header">
                <h4>{{ asnaf.name }}</h4>
                <div class="asnaf-actions">
                  <button @click="editAsnaf(asnaf)" class="action-btn edit-btn">Edit</button>
                </div>
              </div>
              <div class="asnaf-details">
                <p><strong>Contact:</strong> {{ asnaf.contact }}</p>
                <p><strong>Location:</strong> {{ asnaf.location }}</p>
                <p><strong>Needs:</strong> {{ asnaf.needs }}</p>
                <p><strong>Status:</strong> 
                  <span :class="'status-badge ' + asnaf.status.toLowerCase()">
                    {{ asnaf.status }}
                  </span>
                </p>
                <p v-if="asnaf.notes"><strong>Notes:</strong> {{ asnaf.notes }}</p>
              </div>
            </div>
            <div v-if="asnafList.length === 0" class="no-data">No recipients in this category</div>
          </div>
        </div>
      </div>
    </div>
    
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
    
    <!-- Add Distribution Modal -->
    <div v-if="showAddDistributionModal" class="modal">
      <div class="modal-content distribution-modal">
        <span class="close-btn" @click="showAddDistributionModal = false">&times;</span>
        <h2>{{ editingDistribution ? 'Edit Distribution' : 'Add New Distribution' }}</h2>
        <form @submit.prevent="saveDistribution" class="distribution-form">
          <div class="form-group">
            <label for="recipientSelect">Select Recipient</label>
            <div class="recipient-selection">
              <select 
                id="recipientSelect" 
                v-model="selectedAsnafId"
                @change="handleAsnafSelection"
              >
                <option value="">Select from Asnaf list or enter manually</option>
                <optgroup v-for="(asnafList, category) in groupedAsnaf" :key="category" :label="category">
                  <option 
                    v-for="asnaf in asnafList" 
                    :key="asnaf.id" 
                    :value="asnaf.id"
                  >
                    {{ asnaf.name }}
                  </option>
                </optgroup>
              </select>
              <button type="button" @click="showAddAsnafModal = true" class="add-recipient-btn">
                <i class="fas fa-plus"></i> New
              </button>
            </div>
          </div>
          
          <div class="form-group">
            <label for="recipientName">Recipient Name</label>
            <input 
              type="text" 
              id="recipientName" 
              v-model="distributionForm.recipientName" 
              required
            />
          </div>
          
          <div class="form-group">
            <label for="category">Category</label>
            <select id="category" v-model="distributionForm.category" required>
              <option value="">Select a category</option>
              <option value="Poor">Poor (Fakir)</option>
              <option value="Needy">Needy (Miskin)</option>
              <option value="Zakat Administrator">Zakat Administrator (Amil)</option>
              <option value="New Muslim">New Muslim (Muallaf)</option>
              <option value="Slave">To Free Slaves (Riqab)</option>
              <option value="Debtor">Debtor (Gharimin)</option>
              <option value="Allah's Cause">Allah's Cause (Fi Sabilillah)</option>
              <option value="Traveler">Traveler (Ibnus Sabil)</option>
            </select>
          </div>
          
          <!-- Recipient details preview when selected from asnaf list -->
          <div v-if="selectedAsnafDetails" class="recipient-preview">
            <div class="recipient-preview-header">
              <h4>Recipient Details</h4>
            </div>
            <div class="recipient-preview-content">
              <p><strong>Contact:</strong> {{ selectedAsnafDetails.contact }}</p>
              <p><strong>Location:</strong> {{ selectedAsnafDetails.location }}</p>
              <p><strong>Needs:</strong> {{ selectedAsnafDetails.needs }}</p>
            </div>
          </div>
          
          <div class="form-group">
            <label for="amountRM">Amount (RM)</label>
            <input 
              type="number" 
              id="amountRM" 
              v-model="distributionForm.amountRM" 
              step="0.01" 
              min="0" 
              required
            />
          </div>
          
          <div class="form-group">
            <label for="description">Description</label>
            <textarea 
              id="description" 
              v-model="distributionForm.description" 
              rows="3"
              required
            ></textarea>
          </div>
          
          <div class="form-group">
            <label for="evidence">Evidence (Image/PDF)</label>
            <input 
              type="file" 
              id="evidence" 
              @change="handleFileUpload" 
              accept="image/*,application/pdf"
            />
            <div v-if="uploadProgress > 0 && uploadProgress < 100" class="progress-bar">
              <div class="progress" :style="{ width: uploadProgress + '%' }"></div>
              <span>{{ uploadProgress }}%</span>
            </div>
            <div v-if="distributionForm.evidenceUrl" class="evidence-preview">
              <a :href="distributionForm.evidenceUrl" target="_blank">View Current Evidence</a>
            </div>
          </div>
          
          <!-- New section for selecting source payments -->
          <div class="form-group source-payments-section">
            <label>Source of Funds</label>
            <div class="available-funds">
              <p>Available Zakat Funds: <strong>RM {{ availableZakatFunds.toFixed(2) }}</strong></p>
            </div>
            
            <div class="source-selection">
              <div class="source-header">
                <h4>Select Source Payments</h4>
                <p class="source-help">Select which donations to use for this distribution</p>
              </div>
              
              <div v-if="loading" class="loading">Loading available payments...</div>
              <div v-else-if="availablePayments.length === 0" class="no-data">No available payments</div>
              <div v-else class="payment-selection-list">
                <div v-for="payment in availablePayments" :key="payment.id" class="payment-selection-item">
                  <label class="payment-checkbox">
                    <input 
                      type="checkbox" 
                      :value="payment.id" 
                      v-model="selectedPaymentIds"
                      @change="updateSelectedAmount"
                    />
                    <div class="payment-info">
                      <div class="payment-user">{{ payment.userName }}</div>
                      <div class="payment-amount">RM {{ payment.amountRM.toFixed(2) }}</div>
                      <div class="payment-date">{{ formatDate(payment.date) }}</div>
                      <div class="payment-wallet">{{ payment.walletAddress.substring(0, 8) }}...{{ payment.walletAddress.substring(payment.walletAddress.length - 6) }}</div>
                    </div>
                  </label>
                </div>
              </div>
              
              <div class="selected-amount">
                <p>Selected Amount: <strong>RM {{ selectedAmount.toFixed(2) }}</strong></p>
                <p :class="{'amount-warning': selectedAmount < distributionForm.amountRM}">
                  {{ selectedAmount >= distributionForm.amountRM ? '✓ Sufficient funds selected' : '⚠️ Insufficient funds selected' }}
                </p>
              </div>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" @click="showAddDistributionModal = false" class="cancel-btn">Cancel</button>
            <button type="submit" class="save-btn" :disabled="uploading || selectedAmount < distributionForm.amountRM">
              {{ editingDistribution ? 'Update' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Add/Edit Asnaf Modal -->
    <div v-if="showAddAsnafModal" class="modal">
      <div class="modal-content">
        <span class="close-btn" @click="showAddAsnafModal = false">&times;</span>
        <h2>{{ editingAsnaf ? 'Edit Asnaf Recipient' : 'Add New Asnaf Recipient' }}</h2>
        <form @submit.prevent="saveAsnaf" class="distribution-form">
          <div class="form-group">
            <label for="asnafName">Name</label>
            <input 
              type="text" 
              id="asnafName" 
              v-model="asnafForm.name" 
              required
            />
          </div>
          
          <div class="form-group">
            <label for="asnafCategory">Category</label>
            <select id="asnafCategory" v-model="asnafForm.category" required>
              <option value="">Select a category</option>
              <option value="Poor (Fakir)">Poor (Fakir)</option>
              <option value="Needy (Miskin)">Needy (Miskin)</option>
              <option value="Zakat Administrator (Amil)">Zakat Administrator (Amil)</option>
              <option value="New Muslim (Muallaf)">New Muslim (Muallaf)</option>
              <option value="To Free Slaves (Riqab)">To Free Slaves (Riqab)</option>
              <option value="Debtor (Gharimin)">Debtor (Gharimin)</option>
              <option value="Allah's Cause (Fi Sabilillah)">Allah's Cause (Fi Sabilillah)</option>
              <option value="Traveler (Ibnus Sabil)">Traveler (Ibnus Sabil)</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="asnafContact">Contact</label>
            <input 
              type="text" 
              id="asnafContact" 
              v-model="asnafForm.contact" 
              required
            />
          </div>
          
          <div class="form-group">
            <label for="asnafLocation">Location</label>
            <input 
              type="text" 
              id="asnafLocation" 
              v-model="asnafForm.location" 
              required
            />
          </div>
          
          <div class="form-group">
            <label for="asnafNeeds">Needs</label>
            <textarea 
              id="asnafNeeds" 
              v-model="asnafForm.needs" 
              rows="2"
              required
            ></textarea>
          </div>
          
          <div class="form-group">
            <label for="asnafStatus">Status</label>
            <select id="asnafStatus" v-model="asnafForm.status" required>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="asnafNotes">Notes (Optional)</label>
            <textarea 
              id="asnafNotes" 
              v-model="asnafForm.notes" 
              rows="2"
            ></textarea>
          </div>
          
          <div class="form-actions">
            <button type="button" @click="showAddAsnafModal = false" class="cancel-btn">Cancel</button>
            <button type="submit" class="save-btn">
              {{ editingAsnaf ? 'Update' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Source Payments Details Modal -->
    <div v-if="selectedDistribution" class="modal">
      <div class="modal-content">
        <span class="close-btn" @click="selectedDistribution = null">&times;</span>
        <h2>Distribution Source Details</h2>
        <div class="distribution-summary">
          <p><strong>Recipient:</strong> {{ selectedDistribution.recipientName }}</p>
          <p><strong>Amount:</strong> RM {{ selectedDistribution.amountRM.toFixed(2) }}</p>
          <p><strong>Date:</strong> {{ formatDate(selectedDistribution.date) }}</p>
        </div>
        
        <h3>Source Payments</h3>
        <div class="source-payments-list">
          <div v-for="(source, index) in selectedDistributionSources" :key="index" class="source-payment-item">
            <div class="source-payment-header">
              <span class="source-payment-user">{{ source.userName }}</span>
              <span class="source-payment-amount">RM {{ source.amountRM.toFixed(2) }}</span>
            </div>
            <div class="source-payment-details">
              <p><strong>Date:</strong> {{ formatDate(source.date) }}</p>
              <p><strong>Wallet:</strong> <span class="wallet-address">{{ source.walletAddress }}</span></p>
              <p><strong>Transaction ID:</strong> {{ source.transactionId }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, updateDoc, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'vue-router';

export default {
  name: 'AdminDashboardView',
  setup() {
    const router = useRouter();
    const db = getFirestore();
    const storage = getStorage();
    const zakatPayments = ref([]);
    const zakatDistributions = ref([]);
    const loading = ref(true);
    const loadingDistributions = ref(true);
    const selectedPayment = ref(null);
    const activeTab = ref('payments');
    const showAddDistributionModal = ref(false);
    const editingDistribution = ref(null);
    const uploadProgress = ref(0);
    const uploading = ref(false);
    
    const distributionForm = ref({
      recipientName: '',
      category: '',
      amountRM: 0,
      description: '',
      evidenceUrl: '',
      date: null
    });
    
    const asnafRecipients = ref([]);
    const loadingAsnaf = ref(true);
    const showAddAsnafModal = ref(false);
    const editingAsnaf = ref(null);
    
    const asnafForm = ref({
      name: '',
      category: '',
      contact: '',
      location: '',
      needs: '',
      status: 'Active',
      notes: ''
    });
    
    const totalUsers = computed(() => {
      // Get unique users who have made payments
      const uniqueUsers = new Set(zakatPayments.value.map(payment => payment.userId));
      return uniqueUsers.size;
    });
    
    const totalZakatRM = computed(() => {
      return zakatPayments.value.reduce((total, payment) => {
        return total + payment.amountRM;
      }, 0);
    });
    
    const totalZakatCrypto = computed(() => {
      return zakatPayments.value.reduce((total, payment) => {
        return total + payment.amountCrypto;
      }, 0);
    });
    
    const totalDistributedRM = computed(() => {
      return zakatDistributions.value.reduce((total, dist) => {
        return total + dist.amountRM;
      }, 0);
    });
    
    // Group asnaf by category
    const groupedAsnaf = computed(() => {
      const grouped = {};
      const categories = [
        'Poor (Fakir)', 
        'Needy (Miskin)', 
        'Zakat Administrator (Amil)', 
        'New Muslim (Muallaf)',
        'To Free Slaves (Riqab)',
        'Debtor (Gharimin)',
        'Allah\'s Cause (Fi Sabilillah)',
        'Traveler (Ibnus Sabil)'
      ];
      
      // Initialize all categories
      categories.forEach(category => {
        grouped[category] = [];
      });
      
      // Populate with data
      asnafRecipients.value.forEach(asnaf => {
        if (grouped[asnaf.category]) {
          grouped[asnaf.category].push(asnaf);
        } else {
          // Handle any miscategorized entries
          if (!grouped['Other']) grouped['Other'] = [];
          grouped['Other'].push(asnaf);
        }
      });
      
      return grouped;
    });
    
    const fetchZakatPayments = async () => {
      try {
        loading.value = true;
        
        // In a real app, this would fetch from Firestore
        // For now, we'll use dummy data
        const dummyPayments = [
          {
            id: '1',
            userId: 'user1',
            userName: 'Ahmad bin Abdullah',
            userEmail: 'ahmad@example.com',
            date: new Date(2023, 10, 15, 9, 30), // Nov 15, 2023, 9:30 AM
            amountRM: 2500.00,
            amountCrypto: 0.03245,
            cryptoType: 'BTC',
            transactionId: 'tx_btc_123456789',
            walletAddress: '0x1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0',
            status: 'Approved'
          },
          {
            id: '2',
            userId: 'user2',
            userName: 'Fatimah binti Hassan',
            userEmail: 'fatimah@example.com',
            date: new Date(2023, 10, 18, 14, 45), // Nov 18, 2023, 2:45 PM
            amountRM: 1200.00,
            amountCrypto: 0.01560,
            cryptoType: 'BTC',
            transactionId: 'tx_btc_987654321',
            walletAddress: '0x2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1',
            status: 'Approved'
          },
          {
            id: '3',
            userId: 'user3',
            userName: 'Muhammad bin Ibrahim',
            userEmail: 'muhammad@example.com',
            date: new Date(2023, 11, 5, 11, 20), // Dec 5, 2023, 11:20 AM
            amountRM: 3000.00,
            amountCrypto: 0.03896,
            cryptoType: 'BTC',
            transactionId: 'tx_btc_456789123',
            walletAddress: '0x3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2',
            status: 'Approved'
          },
          {
            id: '4',
            userId: 'user4',
            userName: 'Nurul binti Aziz',
            userEmail: 'nurul@example.com',
            date: new Date(2023, 11, 12, 16, 10), // Dec 12, 2023, 4:10 PM
            amountRM: 1800.00,
            amountCrypto: 0.02338,
            cryptoType: 'BTC',
            transactionId: 'tx_btc_789123456',
            walletAddress: '0x4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3',
            status: 'Approved'
          },
          {
            id: '5',
            userId: 'user5',
            userName: 'Ismail bin Yusof',
            userEmail: 'ismail@example.com',
            date: new Date(2023, 11, 20, 10, 5), // Dec 20, 2023, 10:05 AM
            amountRM: 5000.00,
            amountCrypto: 0.06494,
            cryptoType: 'BTC',
            transactionId: 'tx_btc_321654987',
            walletAddress: '0x5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4',
            status: 'Approved'
          },
          {
            id: '7',
            userId: 'user7',
            userName: 'Hakim bin Razak',
            userEmail: 'hakim@example.com',
            date: new Date(2024, 0, 15, 9, 50), // Jan 15, 2024, 9:50 AM
            amountRM: 1500.00,
            amountCrypto: 0.01948,
            cryptoType: 'BTC',
            transactionId: 'tx_btc_987321654',
            walletAddress: '0x7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6',
            status: 'Pending'
          },
          {
            id: '8',
            userId: 'user8',
            userName: 'Aishah binti Kamal',
            userEmail: 'aishah@example.com',
            date: new Date(2024, 0, 22, 15, 40), // Jan 22, 2024, 3:40 PM
            amountRM: 3500.00,
            amountCrypto: 0.04545,
            cryptoType: 'BTC',
            transactionId: 'tx_btc_123789456',
            walletAddress: '0x8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7',
            status: 'Pending'
          },
          {
            id: '9',
            userId: 'user1',
            userName: 'Ahmad bin Abdullah',
            userEmail: 'ahmad@example.com',
            date: new Date(2024, 1, 5, 11, 15), // Feb 5, 2024, 11:15 AM
            amountRM: 2000.00,
            amountCrypto: 0.02597,
            cryptoType: 'BTC',
            transactionId: 'tx_btc_456123789',
            walletAddress: '0x1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0',
            status: 'Pending'
          },
          {
            id: '10',
            userId: 'user9',
            userName: 'Siti binti Rahman',
            userEmail: 'siti@example.com',
            date: new Date(2024, 1, 10, 14, 30), // Feb 10, 2024, 2:30 PM
            amountRM: 1000.00,
            amountCrypto: 0.01299,
            cryptoType: 'BTC',
            transactionId: 'tx_btc_789456123',
            walletAddress: '0x9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7A8',
            status: 'Rejected'
          }
        ];
        
        zakatPayments.value = dummyPayments;
        
        // Comment out the Firestore code for now
        /*
        const querySnapshot = await getDocs(collection(db, 'zakatPayments'));
        const payments = [];
        
        querySnapshot.forEach((doc) => {
          payments.push({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date?.toDate() || new Date()
          });
        });
        
        zakatPayments.value = payments;
        */
        
      } catch (error) {
        console.error('Error fetching zakat payments:', error);
      } finally {
        loading.value = false;
      }
    };
    
    const fetchZakatDistributions = async () => {
      try {
        loadingDistributions.value = true;
        
        // In a real app, this would fetch from Firestore
        // For now, we'll use dummy data with source payments
        const dummyDistributions = [
          {
            id: '1',
            recipientName: 'Zamir bin Abdullah',
            category: 'Poor',
            amountRM: 3700.00,
            description: 'Monthly assistance for basic necessities',
            evidenceUrl: 'https://example.com/evidence1.pdf',
            date: new Date(2023, 10, 20, 10, 0), // Nov 20, 2023, 10:00 AM
            sourcePayments: ['1', '2'] // IDs of source payments
          },
          {
            id: '2',
            recipientName: 'Fatimah binti Hassan',
            category: 'Poor',
            amountRM: 800.00,
            description: 'Education support for children',
            evidenceUrl: 'https://example.com/evidence2.pdf',
            date: new Date(2023, 11, 5, 14, 30), // Dec 5, 2023, 2:30 PM
            sourcePayments: ['3'] // IDs of source payments
          },
          {
            id: '3',
            recipientName: 'Muhammad bin Ibrahim',
            category: 'Needy',
            amountRM: 1200.00,
            description: 'Medical treatment assistance',
            evidenceUrl: 'https://example.com/evidence3.pdf',
            date: new Date(2023, 11, 15, 11, 45), // Dec 15, 2023, 11:45 AM
            sourcePayments: ['4'] // IDs of source payments
          },
          {
            id: '4',
            recipientName: 'Nurul Iman Foundation',
            category: 'Zakat Administrator',
            amountRM: 2000.00,
            description: 'Operational costs for zakat distribution',
            evidenceUrl: 'https://example.com/evidence4.pdf',
            date: new Date(2023, 11, 28, 9, 15), // Dec 28, 2023, 9:15 AM
            sourcePayments: ['5'] // IDs of source payments
          },
          {
            id: '5',
            recipientName: 'Ali bin Razak',
            category: 'New Muslim',
            amountRM: 1500.00,
            description: 'Support for Islamic education and community integration',
            evidenceUrl: 'https://example.com/evidence5.pdf',
            date: new Date(2024, 0, 10, 13, 0), // Jan 10, 2024, 1:00 PM
            sourcePayments: ['6'] // IDs of source payments
          },
          {
            id: '6',
            recipientName: 'Refugee Support Center',
            category: 'Allah\'s Cause',
            amountRM: 3000.00,
            description: 'Funding for refugee education program',
            evidenceUrl: 'https://example.com/evidence6.pdf',
            date: new Date(2024, 0, 22, 15, 30), // Jan 22, 2024, 3:30 PM
            sourcePayments: ['7'] // IDs of source payments
          },
          {
            id: '7',
            recipientName: 'Zainab binti Omar',
            category: 'Debtor',
            amountRM: 2500.00,
            description: 'Assistance with medical debt',
            evidenceUrl: 'https://example.com/evidence7.pdf',
            date: new Date(2024, 1, 5, 10, 45), // Feb 5, 2024, 10:45 AM
            sourcePayments: ['8'] // IDs of source payments
          }
        ];
        
        zakatDistributions.value = dummyDistributions;
        
        // Comment out the Firestore code for now
        /*
        const querySnapshot = await getDocs(collection(db, 'zakatDistributions'));
        const distributions = [];
        
        querySnapshot.forEach((doc) => {
          distributions.push({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date?.toDate() || new Date(),
            sourcePayments: doc.data().sourcePayments || []
          });
        });
        
        zakatDistributions.value = distributions;
        */
        
      } catch (error) {
        console.error('Error fetching zakat distributions:', error);
      } finally {
        loadingDistributions.value = false;
      }
    };
    
    const fetchAsnafRecipients = async () => {
      try {
        loadingAsnaf.value = true;
        
        // In a real app, this would fetch from Firestore
        // For now, we'll use dummy data
        const dummyAsnaf = [
          {
            id: '1',
            name: 'Ahmad bin Abdullah',
            category: 'Poor (Fakir)',
            contact: '012-3456789',
            location: 'Kampung Baru, Kuala Lumpur',
            needs: 'Basic necessities, medical support',
            status: 'Active',
            notes: 'Single father with 3 children'
          },
          {
            id: '2',
            name: 'Fatimah binti Hassan',
            category: 'Poor (Fakir)',
            contact: '019-8765432',
            location: 'Chow Kit, Kuala Lumpur',
            needs: 'Food, education for children',
            status: 'Active',
            notes: 'Widow with 2 school-age children'
          },
          {
            id: '3',
            name: 'Muhammad bin Ibrahim',
            category: 'Needy (Miskin)',
            contact: '013-5557777',
            location: 'Sentul, Kuala Lumpur',
            needs: 'Rent assistance, job training',
            status: 'Active',
            notes: 'Recently lost job due to disability'
          },
          {
            id: '4',
            name: 'Nurul Iman Foundation',
            category: 'Zakat Administrator (Amil)',
            contact: '03-21234567',
            location: 'Shah Alam, Selangor',
            needs: 'Operational costs',
            status: 'Active',
            notes: 'Local zakat distribution organization'
          },
          {
            id: '5',
            name: 'Ali bin Razak',
            category: 'New Muslim (Muallaf)',
            contact: '014-9998888',
            location: 'Petaling Jaya, Selangor',
            needs: 'Islamic education, community support',
            status: 'Active',
            notes: 'Converted 6 months ago'
          },
          {
            id: '6',
            name: 'Refugee Support Center',
            category: 'Allah\'s Cause (Fi Sabilillah)',
            contact: '03-87654321',
            location: 'Ampang, Kuala Lumpur',
            needs: 'Funding for refugee education program',
            status: 'Active',
            notes: 'Supporting 50 refugee children'
          },
          {
            id: '7',
            name: 'Zainab binti Omar',
            category: 'Debtor (Gharimin)',
            contact: '017-1112222',
            location: 'Klang, Selangor',
            needs: 'Medical debt assistance',
            status: 'Pending',
            notes: 'Needs help with hospital bills'
          },
          {
            id: '8',
            name: 'Ismail bin Yusof',
            category: 'Traveler (Ibnus Sabil)',
            contact: '018-3334444',
            location: 'Currently stranded in Kuala Lumpur',
            needs: 'Temporary accommodation, travel funds',
            status: 'Active',
            notes: 'Student who lost wallet and documents'
          }
        ];
        
        asnafRecipients.value = dummyAsnaf;
        
        // In a real implementation, you would fetch from Firestore like this:
        /*
        const querySnapshot = await getDocs(collection(db, 'asnafRecipients'));
        const recipients = [];
        
        querySnapshot.forEach((doc) => {
          recipients.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        asnafRecipients.value = recipients;
        */
        
      } catch (error) {
        console.error('Error fetching asnaf recipients:', error);
      } finally {
        loadingAsnaf.value = false;
      }
    };
    
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-MY', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };
    
    const viewDetails = (payment) => {
      selectedPayment.value = payment;
    };
    
    const updatePaymentStatus = async (paymentId, status) => {
      try {
        const paymentRef = doc(db, 'zakatPayments', paymentId);
        await updateDoc(paymentRef, {
          status: status
        });
        
        // Update local state
        const index = zakatPayments.value.findIndex(p => p.id === paymentId);
        if (index !== -1) {
          zakatPayments.value[index].status = status;
        }
        
        // Close modal
        selectedPayment.value = null;
      } catch (error) {
        console.error('Error updating payment status:', error);
      }
    };
    
    const selectedDistribution = ref(null);
    const selectedDistributionSources = ref([]);
    const availablePayments = ref([]);
    const selectedPaymentIds = ref([]);
    const selectedAmount = ref(0);
    
    // Computed property for available zakat funds
    const availableZakatFunds = computed(() => {
      // Total zakat received minus total distributed
      return totalZakatRM.value - totalDistributedRM.value;
    });
    
    const fetchAvailablePayments = () => {
      // In a real app, this would fetch payments that still have available funds
      // For now, we'll filter the approved payments that haven't been fully used
      availablePayments.value = zakatPayments.value.filter(payment => 
        payment.status === 'Approved' && 
        (!payment.usedAmount || payment.usedAmount < payment.amountRM)
      ).map(payment => ({
        ...payment,
        // Calculate remaining amount
        remainingAmount: payment.usedAmount ? payment.amountRM - payment.usedAmount : payment.amountRM
      }));
    };
    
    const updateSelectedAmount = () => {
      selectedAmount.value = 0;
      selectedPaymentIds.value.forEach(id => {
        const payment = availablePayments.value.find(p => p.id === id);
        if (payment) {
          selectedAmount.value += payment.remainingAmount;
        }
      });
    };
    
    const viewSourceDetails = (distribution) => {
      selectedDistribution.value = distribution;
      
      // Find the source payments based on the IDs stored in the distribution
      if (distribution.sourcePayments && distribution.sourcePayments.length > 0) {
        selectedDistributionSources.value = distribution.sourcePayments.map(sourceId => {
          const payment = zakatPayments.value.find(p => p.id === sourceId);
          return payment || { 
            userName: 'Unknown', 
            amountRM: 0, 
            date: new Date(), 
            walletAddress: 'N/A',
            transactionId: 'N/A'
          };
        });
      } else {
        selectedDistributionSources.value = [];
      }
    };
    
    const editDistribution = (distribution) => {
      editingDistribution.value = distribution;
      distributionForm.value = {
        recipientName: distribution.recipientName,
        category: distribution.category,
        amountRM: distribution.amountRM,
        description: distribution.description,
        evidenceUrl: distribution.evidenceUrl,
        date: distribution.date
      };
      
      // Set selected payment IDs if they exist
      selectedPaymentIds.value = distribution.sourcePayments || [];
      updateSelectedAmount();
      
      showAddDistributionModal.value = true;
    };
    
    const saveDistribution = async () => {
      try {
        if (uploading.value) {
          alert('Please wait for the file to finish uploading');
          return;
        }
        
        if (selectedAmount.value < distributionForm.value.amountRM) {
          alert('Insufficient funds selected. Please select more source payments.');
          return;
        }
        
        const distributionData = {
          ...distributionForm.value,
          amountRM: Number(distributionForm.value.amountRM),
          date: serverTimestamp(),
          updatedAt: serverTimestamp(),
          // Store reference to the asnaf if selected from list
          asnafId: selectedAsnafId.value || null,
          // Store the source payment IDs
          sourcePayments: selectedPaymentIds.value
        };
        
        if (editingDistribution.value) {
          // Update existing distribution
          const distributionRef = doc(db, 'zakatDistributions', editingDistribution.value.id);
          await updateDoc(distributionRef, distributionData);
          
          // Update local state
          const index = zakatDistributions.value.findIndex(d => d.id === editingDistribution.value.id);
          if (index !== -1) {
            zakatDistributions.value[index] = {
              ...zakatDistributions.value[index],
              ...distributionData,
              date: new Date()
            };
          }
        } else {
          // Add new distribution
          const docRef = await addDoc(collection(db, 'zakatDistributions'), distributionData);
          
          // Add to local state
          zakatDistributions.value.push({
            id: docRef.id,
            ...distributionData,
            date: new Date()
          });
        }
        
        // Update the used amount for each source payment
        // In a real implementation, you would update this in Firestore
        selectedPaymentIds.value.forEach(paymentId => {
          const paymentIndex = zakatPayments.value.findIndex(p => p.id === paymentId);
          if (paymentIndex !== -1) {
            if (!zakatPayments.value[paymentIndex].usedAmount) {
              zakatPayments.value[paymentIndex].usedAmount = 0;
            }
            zakatPayments.value[paymentIndex].usedAmount += distributionForm.value.amountRM / selectedPaymentIds.value.length;
          }
        });
        
        // Update asnaf record with distribution reference
        if (selectedAsnafId.value) {
          // In a real implementation, you would update the asnaf record in Firestore
          console.log(`Updated asnaf ${selectedAsnafId.value} with new distribution reference`);
        }
        
        resetDistributionForm();
        showAddDistributionModal.value = false;
      } catch (error) {
        console.error('Error saving distribution:', error);
        alert('Error saving distribution. Please try again.');
      }
    };
    
    const resetDistributionForm = () => {
      distributionForm.value = {
        recipientName: '',
        category: '',
        amountRM: 0,
        description: '',
        evidenceUrl: '',
        date: null
      };
      editingDistribution.value = null;
      uploadProgress.value = 0;
      selectedAsnafId.value = '';
      selectedAsnafDetails.value = null;
      selectedPaymentIds.value = [];
      selectedAmount.value = 0;
    };
    
    const editAsnaf = (asnaf) => {
      editingAsnaf.value = asnaf;
      asnafForm.value = { ...asnaf };
      showAddAsnafModal.value = true;
    };
    
    const resetAsnafForm = () => {
      asnafForm.value = {
        name: '',
        category: '',
        contact: '',
        location: '',
        needs: '',
        status: 'Active',
        notes: ''
      };
      editingAsnaf.value = null;
    };
    
    const saveAsnaf = async () => {
      try {
        // In a real app, this would save to Firestore
        if (editingAsnaf.value) {
          // Update existing asnaf
          const index = asnafRecipients.value.findIndex(a => a.id === editingAsnaf.value.id);
          if (index !== -1) {
            asnafRecipients.value[index] = {
              ...asnafRecipients.value[index],
              ...asnafForm.value
            };
          }
          
          // In a real implementation:
          /*
          const asnafRef = doc(db, 'asnafRecipients', editingAsnaf.value.id);
          await updateDoc(asnafRef, asnafForm.value);
          */
        } else {
          // Add new asnaf
          const newAsnaf = {
            id: Date.now().toString(), // Generate a dummy ID
            ...asnafForm.value
          };
          asnafRecipients.value.push(newAsnaf);
          
          // In a real implementation:
          /*
          const docRef = await addDoc(collection(db, 'asnafRecipients'), asnafForm.value);
          asnafRecipients.value.push({
            id: docRef.id,
            ...asnafForm.value
          });
          */
        }
        
        resetAsnafForm();
        showAddAsnafModal.value = false;
      } catch (error) {
        console.error('Error saving asnaf:', error);
        alert('Error saving asnaf recipient. Please try again.');
      }
    };
    
    const handleLogout = async () => {
      try {
        const auth = getAuth();
        await signOut(auth);
        router.push('/admin/login');
      } catch (error) {
        console.error('Error signing out:', error);
      }
    };
    
    const selectedAsnafId = ref('');
    const selectedAsnafDetails = ref(null);
    
    const handleAsnafSelection = () => {
      if (selectedAsnafId.value) {
        const selectedAsnaf = asnafRecipients.value.find(asnaf => asnaf.id === selectedAsnafId.value);
        if (selectedAsnaf) {
          // Populate the distribution form with asnaf details
          distributionForm.value.recipientName = selectedAsnaf.name;
          
          // Convert category format if needed
          const categoryMap = {
            'Poor (Fakir)': 'Poor',
            'Needy (Miskin)': 'Needy',
            'Zakat Administrator (Amil)': 'Zakat Administrator',
            'New Muslim (Muallaf)': 'New Muslim',
            'To Free Slaves (Riqab)': 'Slave',
            'Debtor (Gharimin)': 'Debtor',
            'Allah\'s Cause (Fi Sabilillah)': 'Allah\'s Cause',
            'Traveler (Ibnus Sabil)': 'Traveler'
          };
          
          distributionForm.value.category = categoryMap[selectedAsnaf.category] || selectedAsnaf.category;
          
          // Store selected asnaf details for display
          selectedAsnafDetails.value = selectedAsnaf;
        }
      } else {
        selectedAsnafDetails.value = null;
      }
    };
    
    const handleFileUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      try {
        uploading.value = true;
        uploadProgress.value = 0;
        
        // Create a storage reference
        const fileRef = storageRef(storage, `distribution-evidence/${Date.now()}_${file.name}`);
        
        // Upload the file with progress tracking
        const uploadTask = uploadBytesResumable(fileRef, file);
        
        // Monitor upload progress
        uploadTask.on('state_changed', 
          (snapshot) => {
            // Track progress
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            uploadProgress.value = Math.round(progress);
          },
          (error) => {
            // Handle errors
            console.error('Upload error:', error);
            alert('Error uploading file. Please try again.');
            uploading.value = false;
          },
          async () => {
            // Upload completed successfully
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            distributionForm.value.evidenceUrl = downloadURL;
            uploading.value = false;
          }
        );
      } catch (error) {
        console.error('File upload error:', error);
        alert('Error uploading file. Please try again.');
        uploading.value = false;
      }
    };
    
    onMounted(() => {
      fetchZakatPayments();
      fetchZakatDistributions();
      fetchAsnafRecipients();
    });
    
    // Watch for changes in activeTab to load available payments when needed
    watch(activeTab, (newTab) => {
      if (newTab === 'distributions') {
        fetchAvailablePayments();
      }
    });
    
    // Watch for showAddDistributionModal to load available payments when opened
    watch(showAddDistributionModal, (isOpen) => {
      if (isOpen) {
        fetchAvailablePayments();
      }
    });
    
    return {
      zakatPayments,
      zakatDistributions,
      loading,
      loadingDistributions,
      selectedPayment,
      totalUsers,
      totalZakatRM,
      totalZakatCrypto,
      totalDistributedRM,
      formatDate,
      viewDetails,
      updatePaymentStatus,
      handleLogout,
      activeTab,
      showAddDistributionModal,
      distributionForm,
      editingDistribution,
      uploadProgress,
      uploading,
      editDistribution,
      handleFileUpload,
      saveDistribution,
      asnafRecipients,
      loadingAsnaf,
      showAddAsnafModal,
      asnafForm,
      editingAsnaf,
      groupedAsnaf,
      editAsnaf,
      saveAsnaf,
      selectedAsnafId,
      selectedAsnafDetails,
      handleAsnafSelection,
      selectedDistribution,
      selectedDistributionSources,
      availablePayments,
      selectedPaymentIds,
      selectedAmount,
      availableZakatFunds,
      updateSelectedAmount,
      viewSourceDetails,
      fetchAvailablePayments
    };
  }
}
</script>

<style scoped>
.admin-dashboard {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.logout-btn {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: bold;
  margin-top: 0.5rem;
  color: #4CAF50;
}

.users-table-container {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.users-table th,
.users-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.users-table th {
  background-color: #f5f5f5;
  font-weight: 600;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
}

.status-badge.pending {
  background-color: #FFC107;
  color: #333;
}

.status-badge.approved {
  background-color: #4CAF50;
  color: white;
}

.status-badge.rejected {
  background-color: #f44336;
  color: white;
}

.action-btn {
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.view-btn {
  background-color: #2196F3;
  color: white;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.no-data {
  text-align: center;
  color: #666;
  padding: 1rem;
}

/* Modal styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 1.5rem;
  cursor: pointer;
}

.payment-details {
  margin-top: 1.5rem;
}

.detail-row {
  display: flex;
  margin-bottom: 0.75rem;
}

.detail-label {
  font-weight: 600;
  width: 150px;
}

.modal-actions {
  margin-top: 1.5rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.approve-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.reject-btn {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.dashboard-tabs {
  display: flex;
  margin-bottom: 1rem;
  border-bottom: 1px solid #ddd;
}

.tab-btn {
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
}

.active-tab {
  border-bottom: 3px solid #4CAF50;
  color: #4CAF50;
  font-weight: 600;
}

.action-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.add-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.edit-btn {
  background-color: #FF9800;
  color: white;
}

.distribution-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.cancel-btn {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.save-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.save-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.evidence-link {
  color: #2196F3;
  text-decoration: underline;
}

.progress-bar {
  height: 20px;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin-top: 0.5rem;
  position: relative;
  overflow: hidden;
}

.progress {
  height: 100%;
  background-color: #4CAF50;
  transition: width 0.3s ease;
}

.progress-bar span {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  text-align: center;
  line-height: 20px;
  color: white;
  font-size: 0.75rem;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
}

.evidence-preview {
  margin-top: 0.5rem;
}

.asnaf-categories {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.asnaf-category h3 {
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
}

.asnaf-count {
  font-size: 0.9rem;
  color: #666;
  margin-left: 0.5rem;
}

.asnaf-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.asnaf-card {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.asnaf-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.asnaf-header h4 {
  margin: 0;
  font-size: 1.1rem;
}

.asnaf-details p {
  margin: 0.5rem 0;
  font-size: 0.9rem;
}

.asnaf-details .status-badge {
  margin-left: 0.25rem;
}

.status-badge.active {
  background-color: #4CAF50;
  color: white;
}

.status-badge.pending {
  background-color: #FFC107;
  color: #333;
}

.status-badge.inactive {
  background-color: #9E9E9E;
  color: white;
}

.recipient-selection {
  display: flex;
  gap: 0.5rem;
}

.recipient-selection select {
  flex: 1;
}

.add-recipient-btn {
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.recipient-preview {
  background-color: #f5f5f9;
  border-radius: 4px;
  padding: 1rem;
  margin-top: 0.5rem;
  border-left: 3px solid #4CAF50;
}

.recipient-preview-header {
  margin-bottom: 0.5rem;
}

.recipient-preview-header h4 {
  margin: 0;
  font-size: 1rem;
  color: #4CAF50;
}

.recipient-preview-content p {
  margin: 0.25rem 0;
  font-size: 0.9rem;
}

.wallet-address {
  font-family: monospace;
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}

.distribution-modal {
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
}

.source-payments-section {
  margin-top: 1.5rem;
  border-top: 1px solid #eee;
  padding-top: 1.5rem;
}

.available-funds {
  background-color: #f5f5f5;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.source-header {
  margin-bottom: 1rem;
}

.source-header h4 {
  margin: 0 0 0.25rem 0;
  color: #333;
}

.source-help {
  margin: 0;
  font-size: 0.85rem;
  color: #666;
}

.payment-selection-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.payment-selection-item {
  padding: 0.75rem;
  border-bottom: 1px solid #eee;
}

.payment-selection-item:last-child {
  border-bottom: none;
}

.payment-checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.payment-info {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.payment-user {
  font-weight: 500;
}

.payment-amount {
  font-weight: 600;
  color: #4CAF50;
  text-align: right;
}

.payment-date, .payment-wallet {
  font-size: 0.85rem;
  color: #666;
}

.selected-amount {
  background-color: #e8f5e9;
  padding: 0.75rem;
  border-radius: 4px;
  margin-top: 1rem;
}

.amount-warning {
  color: #f44336;
}

.source-btn {
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  font-size: 0.85rem;
}

.distribution-summary {
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.source-payments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.source-payment-item {
  background-color: #f9f9f9;
  border-radius: 4px;
  padding: 1rem;
  border-left: 3px solid #4CAF50;
}

.source-payment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
}

.source-payment-user {
  font-weight: 500;
}

.source-payment-amount {
  font-weight: 600;
  color: #4CAF50;
}

.source-payment-details p {
  margin: 0.5rem 0;
  font-size: 0.9rem;
}
</style> 