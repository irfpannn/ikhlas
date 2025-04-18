<template>
  <div class="users-table-container">
    <h2>Asnaf Reports</h2>
    <div v-if="loading" class="loading">Loading reports...</div>
    <div v-else>
      <div class="reports-filter">
        <select v-model="reportStatusFilter" class="filter-select">
          <option value="all">All Reports</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
          <option value="converted">Converted to Asnaf</option>
        </select>
      </div>
      
      <div class="reports-grid">
        <div v-for="report in filteredReports" :key="report.id" class="report-card">
          <div class="report-header">
            <h3>{{ report.name }}</h3>
            <span :class="'status-badge ' + report.status.toLowerCase()">{{ report.status }}</span>
          </div>
          
          <div class="report-details">
            <p><strong>Reported on:</strong> {{ formatDate(report.reportDate) }}</p>
            <p><strong>Address:</strong> {{ report.address }}</p>
            <p v-if="report.phoneNumber"><strong>Phone:</strong> {{ report.phoneNumber }}</p>
            <p><strong>Description:</strong> {{ report.description }}</p>
            <p v-if="report.location"><strong>Location:</strong> {{ report.location.address }}</p>
          </div>
          
          <div class="report-images" v-if="report.images && report.images.length > 0">
            <h4>Images ({{ report.images.length }})</h4>
            <div class="image-thumbnails">
              <div v-for="(image, index) in report.images" :key="index" class="image-thumbnail" @click="viewImage(image.url)">
                <img :src="image.url" alt="Report evidence" />
              </div>
            </div>
          </div>
          
          <div class="report-actions">
            <button v-if="report.status === 'Pending'" @click="verifyReport(report)" class="action-btn approve-btn">Verify</button>
            <button v-if="report.status === 'Pending'" @click="rejectReport(report)" class="action-btn reject-btn">Reject</button>
            <button 
              v-if="report.status === 'Verified'" 
              @click="openConvertModal(report)" 
              class="action-btn convert-btn"
            >
              Convert to Asnaf
            </button>
            <button @click="viewReportDetails(report)" class="action-btn view-btn">View Details</button>
          </div>
        </div>
        
        <div v-if="filteredReports.length === 0" class="no-data">
          No reports found matching the selected filter
        </div>
      </div>
    </div>
    
    <!-- Report Details Modal -->
    <div v-if="selectedReport" class="modal report-modal">
      <div class="modal-content">
        <div class="report-modal-header">
          <h2>Report Details: {{ selectedReport.name }}</h2>
          <span class="close-btn" @click="selectedReport = null">&times;</span>
        </div>
        
        <div class="report-modal-body">
          <!-- Overview Section -->
          <div class="report-modal-section">
            <div class="report-overview">
              <div class="report-status">
                <span :class="'report-status-badge ' + selectedReport.status.toLowerCase()">
                  {{ selectedReport.status }}
                </span>
              </div>
              
              <div class="report-details-grid">
                <div class="report-detail-card">
                  <h4>Basic Information</h4>
                  <div class="report-detail-item">
                    <span class="report-detail-label">Reported on</span>
                    <span class="report-detail-value">{{ formatDate(selectedReport.reportDate) }}</span>
                  </div>
                  <div class="report-detail-item">
                    <span class="report-detail-label">Reported by</span>
                    <span class="report-detail-value">{{ selectedReport.reportedBy || 'Anonymous' }}</span>
                  </div>
                  <div class="report-detail-item" v-if="selectedReport.verifiedBy">
                    <span class="report-detail-label">Verified by</span>
                    <span class="report-detail-value">
                      {{ selectedReport.verifiedBy }} on {{ formatDate(selectedReport.verifiedDate) }}
                    </span>
                  </div>
                  <div class="report-detail-item" v-if="selectedReport.rejectedBy">
                    <span class="report-detail-label">Rejected by</span>
                    <span class="report-detail-value">
                      {{ selectedReport.rejectedBy }} on {{ formatDate(selectedReport.rejectedDate) }}
                    </span>
                  </div>
                </div>
                
                <div class="report-detail-card">
                  <h4>Contact Information</h4>
                  <div class="report-detail-item">
                    <span class="report-detail-label">Name</span>
                    <span class="report-detail-value">{{ selectedReport.name }}</span>
                  </div>
                  <div class="report-detail-item">
                    <span class="report-detail-label">Address</span>
                    <span class="report-detail-value">{{ selectedReport.address }}</span>
                  </div>
                  <div class="report-detail-item" v-if="selectedReport.phoneNumber">
                    <span class="report-detail-label">Phone Number</span>
                    <span class="report-detail-value">{{ selectedReport.phoneNumber }}</span>
                  </div>
                </div>
                
                <div class="report-detail-card">
                  <h4>Location</h4>
                  <div class="report-detail-item" v-if="selectedReport.location">
                    <span class="report-detail-label">Address</span>
                    <span class="report-detail-value">{{ selectedReport.location.address }}</span>
                  </div>
                  <div class="report-detail-item" v-if="selectedReport.location">
                    <span class="report-detail-label">Coordinates</span>
                    <span class="report-detail-value">
                      Lat: {{ selectedReport.location.latitude }}, Long: {{ selectedReport.location.longitude }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Description Section -->
          <div class="report-modal-section">
            <h3>Situation Description</h3>
            <p>{{ selectedReport.description }}</p>
            
            <div v-if="selectedReport.notes" class="report-notes mt-4">
              <h4>Additional Notes</h4>
              <p>{{ selectedReport.notes }}</p>
            </div>
          </div>
          
          <!-- Images Section -->
          <div v-if="selectedReport.images && selectedReport.images.length > 0" class="report-modal-section">
            <h3>Evidence Images ({{ selectedReport.images.length }})</h3>
            <div class="report-images-grid">
              <div 
                v-for="(image, index) in selectedReport.images" 
                :key="index" 
                class="report-image-card"
                @click="viewImage(image.url)"
              >
                <img :src="image.url" alt="Report evidence" />
              </div>
            </div>
          </div>
        </div>
        
        <!-- Action Section -->
        <div v-if="selectedReport.status === 'Pending' || selectedReport.status === 'Verified'" class="report-action-section">
          <div v-if="selectedReport.status === 'Pending'">
            <h3>Take Action</h3>
            <div class="form-group mb-4">
              <label for="reportNotes">Notes</label>
              <textarea 
                id="reportNotes" 
                v-model="reportActionNotes" 
                rows="3" 
                placeholder="Add notes about this report"
                class="w-full p-2 border rounded"
              ></textarea>
            </div>
            <div class="report-action-buttons">
              <button @click="verifyReport(selectedReport)" class="report-action-button verify">
                <span>✓</span> Verify Report
              </button>
              <button @click="rejectReport(selectedReport)" class="report-action-button reject">
                <span>✕</span> Reject Report
              </button>
            </div>
          </div>
          
          <div v-if="selectedReport.status === 'Verified'">
            <h3>Convert to Asnaf</h3>
            <p class="help-text mb-4">Convert this verified report into an asnaf recipient record</p>
            <div class="report-action-buttons">
              <button @click="openConvertModal(selectedReport)" class="report-action-button convert">
                <span>→</span> Convert to Asnaf
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Image Viewer Modal -->
    <div v-if="selectedImage" class="modal image-viewer-modal" @click="selectedImage = null">
      <div class="image-viewer-content" @click.stop>
        <span class="close-btn" @click="selectedImage = null">&times;</span>
        <img :src="selectedImage" alt="Report evidence" class="full-size-image" />
      </div>
    </div>
    
    <!-- Convert to Asnaf Modal -->
    <div v-if="showConvertModal" class="modal">
      <div class="modal-content convert-modal">
        <span class="close-btn" @click="showConvertModal = false">&times;</span>
        <h2>Convert to Asnaf</h2>
        <p class="help-text">Convert this verified report into an asnaf recipient record</p>
        
        <div class="form-group">
          <label for="asnafCategory">Asnaf Category</label>
          <select id="asnafCategory" v-model="conversionCategory" required>
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
          <label for="asnafNeeds">Needs</label>
          <textarea 
            id="asnafNeeds" 
            v-model="conversionNeeds" 
            rows="4" 
            placeholder="Describe the needs of this asnaf"
            required
          ></textarea>
        </div>
        
        <div class="form-actions">
          <button @click="showConvertModal = false" class="cancel-btn">Cancel</button>
          <button 
            @click="confirmConvertToAsnaf" 
            class="convert-btn" 
            :disabled="!conversionCategory"
          >
            Convert to Asnaf
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';

export default {
  name: 'ReportsTab',
  props: {
    reports: {
      type: Array,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: [
    'verify-report',
    'reject-report',
    'convert-to-asnaf',
    'view-image'
  ],
  setup(props, { emit }) {
    const reportStatusFilter = ref('all');
    const selectedReport = ref(null);
    const selectedImage = ref(null);
    const showConvertModal = ref(false);
    const conversionCategory = ref('');
    const conversionNeeds = ref('');
    const reportActionNotes = ref('');
    const reportToConvert = ref(null);

    const filteredReports = computed(() => {
      if (reportStatusFilter.value === 'all') {
        return props.reports;
      }
      
      // Filter by status
      return props.reports.filter(report => {
        if (reportStatusFilter.value === 'pending') return report.status === 'Pending';
        if (reportStatusFilter.value === 'verified') return report.status === 'Verified';
        if (reportStatusFilter.value === 'rejected') return report.status === 'Rejected';
        if (reportStatusFilter.value === 'converted') return report.status === 'Converted to Asnaf';
        return true;
      });
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

    const viewReportDetails = (report) => {
      selectedReport.value = report;
      reportActionNotes.value = report.notes || '';
    };

    const viewImage = (imageUrl) => {
      selectedImage.value = imageUrl;
      emit('view-image', imageUrl);
    };

    const verifyReport = (report) => {
      emit('verify-report', report, reportActionNotes.value);
      if (selectedReport.value) {
        selectedReport.value = null;
      }
    };

    const rejectReport = (report) => {
      emit('reject-report', report, reportActionNotes.value);
      if (selectedReport.value) {
        selectedReport.value = null;
      }
    };

    const openConvertModal = (report) => {
      reportToConvert.value = report;
      conversionCategory.value = '';
      conversionNeeds.value = report.description || '';
      showConvertModal.value = true;
    };

    const confirmConvertToAsnaf = () => {
      if (!conversionCategory.value) {
        alert('Please select an Asnaf category');
        return;
      }

      emit('convert-to-asnaf', reportToConvert.value, {
        category: conversionCategory.value,
        needs: conversionNeeds.value
      });
      
      showConvertModal.value = false;
      if (selectedReport.value) {
        selectedReport.value = null;
      }
    };

    // Reset filter when reports change
    watch(() => props.reports, () => {
      reportStatusFilter.value = 'all';
    });

    return {
      reportStatusFilter,
      selectedReport,
      selectedImage,
      showConvertModal,
      conversionCategory,
      conversionNeeds,
      reportActionNotes,
      filteredReports,
      formatDate,
      viewReportDetails,
      viewImage,
      verifyReport,
      rejectReport,
      openConvertModal,
      confirmConvertToAsnaf
    };
  }
};
</script> 