<template>
  <div class="users-table-container">
    <h2>Zakat Distributions</h2>
    <div class="action-bar">
      <button @click="showAddDistributionModal = true" class="add-btn">Add New Distribution</button>
    </div>
    <div v-if="loading" class="loading">Loading data...</div>
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
    
    <!-- Add Distribution Modal -->
    <div v-if="showAddDistributionModal" class="modal">
      <div class="modal-content distribution-modal">
        <span class="close-btn" @click="closeDistributionModal">&times;</span>
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
              <button type="button" @click="$emit('show-add-asnaf-modal')" class="add-recipient-btn">
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
          
          <!-- Source payments section -->
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
            <button type="button" @click="closeDistributionModal" class="cancel-btn">Cancel</button>
            <button type="submit" class="save-btn" :disabled="uploading || selectedAmount < distributionForm.amountRM">
              {{ editingDistribution ? 'Update' : 'Save' }}
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
import { ref, computed } from 'vue';

export default {
  name: 'DistributionsTab',
  props: {
    zakatDistributions: {
      type: Array,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    groupedAsnaf: {
      type: Object,
      required: true
    },
    availablePayments: {
      type: Array,
      required: true
    },
    availableZakatFunds: {
      type: Number,
      required: true
    }
  },
  emits: [
    'save-distribution',
    'show-add-asnaf-modal',
    'handle-file-upload',
    'handle-asnaf-selection'
  ],
  setup(props, { emit }) {
    const showAddDistributionModal = ref(false);
    const editingDistribution = ref(null);
    const selectedAsnafId = ref('');
    const selectedAsnafDetails = ref(null);
    const selectedPaymentIds = ref([]);
    const selectedAmount = ref(0);
    const uploadProgress = ref(0);
    const uploading = ref(false);
    const selectedDistribution = ref(null);
    const selectedDistributionSources = ref([]);
    
    const distributionForm = ref({
      recipientName: '',
      category: '',
      amountRM: 0,
      description: '',
      evidenceUrl: '',
      date: null
    });

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-MY', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const viewSourceDetails = (distribution) => {
      selectedDistribution.value = distribution;
      
      // Find the source payments based on the IDs stored in the distribution
      if (distribution.sourcePayments && distribution.sourcePayments.length > 0) {
        selectedDistributionSources.value = distribution.sourcePayments.map(sourceId => {
          const payment = props.availablePayments.find(p => p.id === sourceId);
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

    const closeDistributionModal = () => {
      showAddDistributionModal.value = false;
      resetDistributionForm();
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

    const updateSelectedAmount = () => {
      selectedAmount.value = 0;
      selectedPaymentIds.value.forEach(id => {
        const payment = props.availablePayments.find(p => p.id === id);
        if (payment) {
          selectedAmount.value += payment.remainingAmount || payment.amountRM;
        }
      });
    };

    const handleAsnafSelection = () => {
      if (selectedAsnafId.value) {
        // Find the selected asnaf from grouped asnaf
        for (const category in props.groupedAsnaf) {
          const asnaf = props.groupedAsnaf[category].find(a => a.id === selectedAsnafId.value);
          if (asnaf) {
            selectedAsnafDetails.value = asnaf;
            distributionForm.value.recipientName = asnaf.name;
            distributionForm.value.category = category.split(' ')[0]; // Get the first word of category
            break;
          }
        }
      } else {
        selectedAsnafDetails.value = null;
      }
      emit('handle-asnaf-selection', selectedAsnafId.value);
    };

    const handleFileUpload = (event) => {
      emit('handle-file-upload', event, (progress) => {
        uploadProgress.value = progress;
      }, (url) => {
        distributionForm.value.evidenceUrl = url;
        uploading.value = false;
      });
      uploading.value = true;
    };

    const saveDistribution = () => {
      if (uploading.value) {
        alert('Please wait for the file to finish uploading');
        return;
      }
      
      if (selectedAmount.value < distributionForm.value.amountRM) {
        alert('Insufficient funds selected. Please select more source payments.');
        return;
      }
      
      emit('save-distribution', {
        ...distributionForm.value,
        id: editingDistribution.value?.id,
        asnafId: selectedAsnafId.value,
        sourcePayments: selectedPaymentIds.value
      });
      
      closeDistributionModal();
    };

    return {
      showAddDistributionModal,
      editingDistribution,
      selectedAsnafId,
      selectedAsnafDetails,
      selectedPaymentIds,
      selectedAmount,
      uploadProgress,
      uploading,
      selectedDistribution,
      selectedDistributionSources,
      distributionForm,
      formatDate,
      viewSourceDetails,
      editDistribution,
      closeDistributionModal,
      updateSelectedAmount,
      handleAsnafSelection,
      handleFileUpload,
      saveDistribution
    };
  }
};
</script> 