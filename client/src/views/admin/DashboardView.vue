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
            <td colspan="6" class="no-data">No zakat payments found</td>
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
            <td colspan="7" class="no-data">No zakat distributions found</td>
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
      <div class="modal-content">
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
          
          <div class="form-actions">
            <button type="button" @click="showAddDistributionModal = false" class="cancel-btn">Cancel</button>
            <button type="submit" class="save-btn" :disabled="uploading">
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
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
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
      } catch (error) {
        console.error('Error fetching zakat payments:', error);
      } finally {
        loading.value = false;
      }
    };
    
    const fetchZakatDistributions = async () => {
      try {
        loadingDistributions.value = true;
        const querySnapshot = await getDocs(collection(db, 'zakatDistributions'));
        const distributions = [];
        
        querySnapshot.forEach((doc) => {
          distributions.push({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date?.toDate() || new Date()
          });
        });
        
        zakatDistributions.value = distributions;
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
      showAddDistributionModal.value = true;
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
    };
    
    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      uploading.value = true;
      const fileRef = storageRef(storage, `zakat-evidence/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(fileRef, file);
      
      uploadTask.on('state_changed', 
        (snapshot) => {
          uploadProgress.value = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        },
        (error) => {
          console.error('Error uploading file:', error);
          uploading.value = false;
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          distributionForm.value.evidenceUrl = downloadURL;
          uploading.value = false;
        }
      );
    };
    
    const saveDistribution = async () => {
      try {
        if (uploading.value) {
          alert('Please wait for the file to finish uploading');
          return;
        }
        
        const distributionData = {
          ...distributionForm.value,
          amountRM: Number(distributionForm.value.amountRM),
          date: serverTimestamp(),
          updatedAt: serverTimestamp(),
          // Store reference to the asnaf if selected from list
          asnafId: selectedAsnafId.value || null
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
        
        // Update asnaf record with distribution reference
        if (selectedAsnafId.value) {
          // In a real implementation, you would update the asnaf record in Firestore
          // to track that they received a distribution
          /*
          const asnafRef = doc(db, 'asnafRecipients', selectedAsnafId.value);
          await updateDoc(asnafRef, {
            lastDistribution: serverTimestamp(),
            distributionHistory: arrayUnion({
              id: docRef.id, // ID of the new distribution
              date: new Date(),
              amountRM: Number(distributionForm.value.amountRM)
            })
          });
          */
          
          // For the demo, we'll just log this
          console.log(`Updated asnaf ${selectedAsnafId.value} with new distribution reference`);
        }
        
        resetDistributionForm();
        showAddDistributionModal.value = false;
      } catch (error) {
        console.error('Error saving distribution:', error);
        alert('Error saving distribution. Please try again.');
      }
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
    
    onMounted(() => {
      fetchZakatPayments();
      fetchZakatDistributions();
      fetchAsnafRecipients();
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
      handleAsnafSelection
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
  background-color: #f5f5f5;
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
</style> 