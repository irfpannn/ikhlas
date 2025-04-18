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
      <button 
        @click="activeTab = 'reports'" 
        :class="{ 'active-tab': activeTab === 'reports' }"
        class="tab-btn"
      >
        Asnaf Reports
      </button>
      <button 
        @click="activeTab = 'impact'" 
        :class="{ 'active-tab': activeTab === 'impact' }"
        class="tab-btn"
      >
        Impact Monitoring
      </button>
      <button 
        @click="activeTab = 'admin'" 
        :class="{ 'active-tab': activeTab === 'admin' }"
        class="tab-btn"
      >
        Admin Tools
      </button>
    </div>
    
    <!-- Zakat Payments Tab -->
    <payments-tab
      v-if="activeTab === 'payments'"
      :zakat-payments="zakatPayments"
      :loading="loading"
      @update-payment-status="updatePaymentStatus"
    />
    
    <!-- Zakat Distributions Tab -->
    <distributions-tab
      v-if="activeTab === 'distributions'"
      :zakat-distributions="zakatDistributions"
      :loading="loadingDistributions"
      :grouped-asnaf="groupedAsnaf"
      :available-payments="availablePayments"
      :available-zakat-funds="availableZakatFunds"
      @save-distribution="saveDistribution"
      @show-add-asnaf-modal="showAddAsnafModal = true"
      @handle-file-upload="handleFileUpload"
      @handle-asnaf-selection="handleAsnafSelection"
    />
    
    <!-- Asnaf Listing Tab -->
    <asnaf-listing-tab
      v-if="activeTab === 'asnaf'"
      :grouped-asnaf="groupedAsnaf"
      :loading="loadingAsnaf"
      @add-new-asnaf="addNewAsnaf"
      @edit-asnaf="editAsnaf"
      @validate-asnaf-eligibility="validateAsnafEligibility"
      @batch-validate-all-asnaf="batchValidateAllAsnaf"
      @show-assess-eligibility-modal="showAssessEligibilityModal = true"
    />
    
    <!-- Asnaf Reports Tab -->
    <reports-tab
      v-if="activeTab === 'reports'"
      :reports="asnafReports"
      :loading="loadingReports"
      @verify-report="verifyReport"
      @reject-report="rejectReport"
      @convert-to-asnaf="convertReportToAsnaf"
      @view-image="viewImage"
    />
    
    <!-- Impact Monitoring Tab -->
    <impact-tab
      v-if="activeTab === 'impact'"
      :impact-data="impactData"
      :asnaf-locations="asnafLocations"
      @save-impact-story="saveImpactStory"
      @handle-story-image-upload="handleStoryImageUpload"
      @remove-story-image="removeStoryImage"
      @view-image="viewImage"
    />
    
    <!-- Admin Tools Tab -->
    <admin-tools-tab
      v-if="activeTab === 'admin'"
      @import-asnaf-data="importAsnafDataToFirebase"
      @export-asnaf-data="exportAsnafDataFromFirebase"
      @import-zakat-payments="importZakatPaymentsToFirebase"
      @export-zakat-payments="exportZakatPaymentsFromFirebase"
      @import-zakat-distributions="importZakatDistributionsToFirebase"
      @export-zakat-distributions="exportZakatDistributionsFromFirebase"
      @import-asnaf-reports="importAsnafReportsToFirebase"
      @export-asnaf-reports="exportAsnafReportsFromFirebase"
      @view-model-details="viewModelDetails"
      @show-batch-assessment="showBatchAssessmentModal = true"
    />
    
    <!-- Add/Edit Asnaf Modal -->
    <div v-if="showAddAsnafModal" class="modal">
      <!-- Modal content for adding/editing asnaf -->
    </div>
    
    <!-- ML-based eligibility assessment Modal -->
    <div v-if="showAssessEligibilityModal" class="modal">
      <!-- Modal content for ML-based assessment -->
    </div>
    
    <!-- Batch Assessment Modal -->
    <div v-if="showBatchAssessmentModal" class="modal">
      <!-- Modal content for batch assessment -->
    </div>
    
    <!-- Image Viewer Modal -->
    <div v-if="selectedImage" class="modal image-viewer-modal" @click="selectedImage = null">
      <!-- Modal content for image viewer -->
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch, onBeforeUnmount } from 'vue';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, updateDoc, addDoc, deleteDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'vue-router';
// Import tab components
import PaymentsTab from '@/components/dashboard/PaymentsTab.vue';
import DistributionsTab from '@/components/dashboard/DistributionsTab.vue';
import AsnafListingTab from '@/components/dashboard/AsnafListingTab.vue';
import ReportsTab from '@/components/dashboard/ReportsTab.vue';
import ImpactTab from '@/components/dashboard/ImpactTab.vue';
import AdminToolsTab from '@/components/dashboard/AdminToolsTab.vue';

// Import JSON data
import zakatPaymentsData from '@/data/zakatPayments.json';
import zakatDistributionsData from '@/data/zakatDistributions.json';
import asnafRecipientsData from '@/data/asnafRecipients.json';
import asnafReportsData from '@/data/asnafReports.json';
import asnafLocationsData from '@/data/asnafLocations.json';
import impactStoriesData from '@/data/impactStories.json';
import impactDataJson from '@/data/impactData.json';

export default {
  name: 'AdminDashboardView',
  components: {
    PaymentsTab,
    DistributionsTab,
    AsnafListingTab,
    ReportsTab,
    ImpactTab,
    AdminToolsTab
  },
  setup() {
    const router = useRouter();
    const db = getFirestore();
    const storage = getStorage();
    const zakatPayments = ref([]);
    const zakatDistributions = ref([]);
    const asnafReports = ref([]);
    const loading = ref(true);
    const loadingDistributions = ref(true);
    const loadingAsnaf = ref(true);
    const loadingReports = ref(true);
    const activeTab = ref('payments');
    const showAddAsnafModal = ref(false);
    const showAssessEligibilityModal = ref(false);
    const showBatchAssessmentModal = ref(false);
    const selectedImage = ref(null);
    const asnafRecipients = ref([]);
    const asnafLocations = ref([]);
    const impactData = ref({});
    const availablePayments = ref([]);
    
    // Computed properties
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
    
    // Computed property for available zakat funds
    const availableZakatFunds = computed(() => {
      // Total zakat received minus total distributed
      return totalZakatRM.value - totalDistributedRM.value;
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
    
    // Initialize data
    onMounted(async () => {
      await Promise.all([
        fetchZakatPayments(),
        fetchZakatDistributions(),
        fetchAsnafRecipients(),
        fetchAsnafReports(),
        fetchAsnafLocations(),
        fetchImpactData()
      ]);
      
      fetchAvailablePayments();
    });
    
    // Data fetching methods
    const fetchZakatPayments = async () => {
      try {
        loading.value = true;
        // Load data from JSON file
        const payments = zakatPaymentsData.map(payment => ({
          ...payment,
          date: new Date(payment.date),
          amountRM: Number(payment.amountRM),
          amountCrypto: Number(payment.amountCrypto)
        }));
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
        // Load data from JSON file
        const distributions = zakatDistributionsData.map(distribution => ({
          ...distribution,
          date: new Date(distribution.date),
          amountRM: Number(distribution.amountRM)
        }));
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
        // Fallback to JSON data if Firebase fetch fails
        asnafRecipients.value = asnafRecipientsData;
      } catch (error) {
        console.error('Error fetching asnaf recipients:', error);
      } finally {
        loadingAsnaf.value = false;
      }
    };
    
    const fetchAsnafReports = async () => {
      try {
        loadingReports.value = true;
        // Fallback to JSON data if Firebase fetch fails
        asnafReports.value = asnafReportsData;
      } catch (error) {
        console.error('Error fetching asnaf reports:', error);
      } finally {
        loadingReports.value = false;
      }
    };
    
    const fetchAsnafLocations = async () => {
      try {
        asnafLocations.value = asnafLocationsData;
      } catch (error) {
        console.error('Error fetching asnaf locations:', error);
      }
    };
    
    const fetchImpactData = async () => {
      try {
        impactData.value = impactDataJson;
      } catch (error) {
        console.error('Error fetching impact data:', error);
      }
    };
    
    const fetchAvailablePayments = () => {
      // Filter the approved payments that haven't been fully used
      availablePayments.value = zakatPayments.value.filter(payment => 
        payment.status === 'Approved' && 
        (!payment.usedAmount || payment.usedAmount < payment.amountRM)
      ).map(payment => ({
        ...payment,
        // Calculate remaining amount
        remainingAmount: payment.usedAmount ? payment.amountRM - payment.usedAmount : payment.amountRM
      }));
    };
    
    // Action methods
    const handleLogout = async () => {
      try {
        const auth = getAuth();
        await signOut(auth);
        router.push('/admin/login');
      } catch (error) {
        console.error('Error signing out:', error);
      }
    };
    
    const updatePaymentStatus = async (paymentId, status) => {
      try {
        // Update local state
        const index = zakatPayments.value.findIndex(p => p.id === paymentId);
        if (index !== -1) {
          zakatPayments.value[index].status = status;
        }
        
        // Update available payments
        fetchAvailablePayments();
      } catch (error) {
        console.error('Error updating payment status:', error);
      }
    };
    
    const handleAsnafSelection = (asnafId) => {
      // This method is passed to DistributionsTab component
      console.log('Asnaf selected:', asnafId);
    };
    
    const handleFileUpload = (event, progressCallback, completionCallback) => {
      // Handle file upload logic
      // This is a simplified version that would be replaced with actual Firebase storage upload
      setTimeout(() => {
        progressCallback(100);
        completionCallback('https://example.com/uploads/sample.jpg');
      }, 1500);
    };
    
    const saveDistribution = (distributionData) => {
      try {
        if (distributionData.id) {
          // Update existing distribution
          const index = zakatDistributions.value.findIndex(d => d.id === distributionData.id);
          if (index !== -1) {
            zakatDistributions.value[index] = {
              ...zakatDistributions.value[index],
              ...distributionData
            };
          }
        } else {
          // Add new distribution
          const newId = Date.now().toString();
          zakatDistributions.value.push({
            id: newId,
            ...distributionData,
            date: new Date()
          });
        }
        
        // Update used amount for selected payments
        if (distributionData.sourcePayments) {
          distributionData.sourcePayments.forEach(paymentId => {
            const paymentIndex = zakatPayments.value.findIndex(p => p.id === paymentId);
            if (paymentIndex !== -1) {
              if (!zakatPayments.value[paymentIndex].usedAmount) {
                zakatPayments.value[paymentIndex].usedAmount = 0;
              }
              zakatPayments.value[paymentIndex].usedAmount += distributionData.amountRM / distributionData.sourcePayments.length;
            }
          });
        }
        
        // Update available payments list
        fetchAvailablePayments();
      } catch (error) {
        console.error('Error saving distribution:', error);
      }
    };
    
    const addNewAsnaf = () => {
      // This method is called from AsnafListingTab
      showAddAsnafModal.value = true;
    };
    
    const editAsnaf = (asnaf) => {
      // This method is called from AsnafListingTab
      console.log('Edit asnaf:', asnaf);
      showAddAsnafModal.value = true;
    };
    
    const validateAsnafEligibility = (asnaf) => {
      // This method is called from AsnafListingTab
      console.log('Validate asnaf eligibility:', asnaf);
    };
    
    const batchValidateAllAsnaf = () => {
      // This method is called from AsnafListingTab
      console.log('Batch validate all asnaf');
    };
    
    const verifyReport = (report, notes) => {
      // This method is called from ReportsTab
      console.log('Verify report:', report, 'Notes:', notes);
    };
    
    const rejectReport = (report, notes) => {
      // This method is called from ReportsTab
      console.log('Reject report:', report, 'Notes:', notes);
    };
    
    const convertReportToAsnaf = (report, conversionData) => {
      // This method is called from ReportsTab
      console.log('Convert report to asnaf:', report, 'Conversion data:', conversionData);
    };
    
    const viewImage = (imageUrl) => {
      // This method is called from ReportsTab and ImpactTab
      selectedImage.value = imageUrl;
    };
    
    const saveImpactStory = (storyData) => {
      // This method is called from ImpactTab
      console.log('Save impact story:', storyData);
    };
    
    const handleStoryImageUpload = (event, progressCallback, completionCallback) => {
      // Handle story image upload logic
      // This is a simplified version that would be replaced with actual Firebase storage upload
      setTimeout(() => {
        progressCallback(100);
        completionCallback(['https://example.com/uploads/story1.jpg']);
      }, 1500);
    };
    
    const removeStoryImage = (image) => {
      // This method is called from ImpactTab
      console.log('Remove story image:', image);
    };
    
    const importAsnafDataToFirebase = () => {
      // This method is called from AdminToolsTab
      console.log('Import asnaf data to Firebase');
    };
    
    const exportAsnafDataFromFirebase = () => {
      // This method is called from AdminToolsTab
      console.log('Export asnaf data from Firebase');
    };
    
    const importZakatPaymentsToFirebase = () => {
      // This method is called from AdminToolsTab
      console.log('Import zakat payments to Firebase');
    };
    
    const exportZakatPaymentsFromFirebase = () => {
      // This method is called from AdminToolsTab
      console.log('Export zakat payments from Firebase');
    };
    
    const importZakatDistributionsToFirebase = () => {
      // This method is called from AdminToolsTab
      console.log('Import zakat distributions to Firebase');
    };
    
    const exportZakatDistributionsFromFirebase = () => {
      // This method is called from AdminToolsTab
      console.log('Export zakat distributions from Firebase');
    };
    
    const importAsnafReportsToFirebase = () => {
      // This method is called from AdminToolsTab
      console.log('Import asnaf reports to Firebase');
    };
    
    const exportAsnafReportsFromFirebase = () => {
      // This method is called from AdminToolsTab
      console.log('Export asnaf reports from Firebase');
    };
    
    const viewModelDetails = () => {
      // This method is called from AdminToolsTab
      console.log('View model details');
    };
    
    return {
      zakatPayments,
      zakatDistributions,
      asnafRecipients,
      asnafReports,
      asnafLocations,
      impactData,
      loading,
      loadingDistributions,
      loadingAsnaf,
      loadingReports,
      activeTab,
      showAddAsnafModal,
      showAssessEligibilityModal,
      showBatchAssessmentModal,
      selectedImage,
      availablePayments,
      totalUsers,
      totalZakatRM,
      totalZakatCrypto,
      totalDistributedRM,
      availableZakatFunds,
      groupedAsnaf,
      handleLogout,
      updatePaymentStatus,
      handleAsnafSelection,
      handleFileUpload,
      saveDistribution,
      addNewAsnaf,
      editAsnaf,
      validateAsnafEligibility,
      batchValidateAllAsnaf,
      verifyReport,
      rejectReport,
      convertReportToAsnaf,
      viewImage,
      saveImpactStory,
      handleStoryImageUpload,
      removeStoryImage,
      importAsnafDataToFirebase,
      exportAsnafDataFromFirebase,
      importZakatPaymentsToFirebase,
      exportZakatPaymentsFromFirebase,
      importZakatDistributionsToFirebase,
      exportZakatDistributionsFromFirebase,
      importAsnafReportsToFirebase,
      exportAsnafReportsFromFirebase,
      viewModelDetails
    };
  }
};
</script>

<style scoped>
.admin-dashboard {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.dashboard-header h1 {
  margin: 0;
  color: #333;
}

.logout-btn {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background-color: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-card h3 {
  margin-top: 0;
  color: #555;
  font-size: 0.9rem;
  font-weight: 600;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: bold;
  margin: 10px 0 0;
  color: #4caf50;
}

.dashboard-tabs {
  display: flex;
  border-bottom: 1px solid #ddd;
  margin-bottom: 20px;
  overflow-x: auto;
}

.tab-btn {
  padding: 12px 20px;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 600;
  color: #777;
  position: relative;
  white-space: nowrap;
}

.tab-btn:hover {
  color: #4caf50;
}

.tab-btn.active-tab {
  color: #4caf50;
}

.tab-btn.active-tab::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: #4caf50;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 20px;
  position: relative;
}

.close-btn {
  position: absolute;
  right: 15px;
  top: 15px;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  color: #777;
}

.image-viewer-modal {
  background-color: rgba(0, 0, 0, 0.9);
}

.image-viewer-content {
  background-color: transparent;
  box-shadow: none;
  width: auto;
  max-width: 90%;
  height: auto;
  max-height: 90vh;
  padding: 0;
}

.full-size-image {
  max-width: 100%;
  max-height: 90vh;
  display: block;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .dashboard-stats {
    grid-template-columns: 1fr 1fr;
  }
  
  .dashboard-tabs {
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .dashboard-stats {
    grid-template-columns: 1fr;
  }
}
</style> 