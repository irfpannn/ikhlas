<template>
  <div class="users-table-container">
    <h2>Asnaf (Eligible Recipients) Listing</h2>
    <div class="action-bar">
      <button @click="addNewAsnaf" class="add-btn">Add New Asnaf</button>
      <button @click="$emit('show-assess-eligibility-modal')" class="assess-btn">
        <i class="fas fa-robot"></i> Assess Eligibility
      </button>
      <button @click="batchValidateAllAsnaf" class="batch-validate-btn">
        <i class="fas fa-tasks"></i> Batch Validate All
      </button>
    </div>
    <div v-if="loading" class="loading">Loading data...</div>
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
              
              <!-- Add ML Eligibility Badge -->
              <div class="eligibility-badge-container">
                <div v-if="asnaf.mlEligibility" class="eligibility-badge" :class="asnaf.mlEligibility.eligible ? 'eligible' : 'ineligible'">
                  <i :class="asnaf.mlEligibility.eligible ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                  <span class="eligibility-text">{{ asnaf.mlEligibility.eligible ? 'ML Verified' : 'Not Eligible' }}</span>
                  <span class="eligibility-confidence">{{ asnaf.mlEligibility.confidence }}</span>
                </div>
                <button v-else @click="validateAsnafEligibility(asnaf)" class="validate-btn">
                  <i class="fas fa-robot"></i> Validate Eligibility
                </button>
              </div>
            </div>
          </div>
          <div v-if="asnafList.length === 0" class="no-data">No recipients in this category</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AsnafListingTab',
  props: {
    groupedAsnaf: {
      type: Object,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: [
    'add-new-asnaf', 
    'edit-asnaf', 
    'validate-asnaf-eligibility',
    'batch-validate-all-asnaf',
    'show-assess-eligibility-modal'
  ],
  setup(props, { emit }) {
    const addNewAsnaf = () => {
      emit('add-new-asnaf');
    };

    const editAsnaf = (asnaf) => {
      emit('edit-asnaf', asnaf);
    };

    const validateAsnafEligibility = (asnaf) => {
      emit('validate-asnaf-eligibility', asnaf);
    };

    const batchValidateAllAsnaf = () => {
      emit('batch-validate-all-asnaf');
    };

    return {
      addNewAsnaf,
      editAsnaf,
      validateAsnafEligibility,
      batchValidateAllAsnaf
    };
  }
};
</script> 