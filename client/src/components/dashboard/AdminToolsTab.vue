<template>
  <div class="users-table-container">
    <h2>Admin Tools</h2>
    
    <div class="admin-tools-section">
      <h3>Data Management</h3>
      <p class="help-text">Use these tools to manage data in Firebase.</p>
      
      <div class="admin-tools-grid">
        <div class="admin-tool-card">
          <h4>Asnaf Recipients</h4>
          <p>Import or export asnaf recipient data.</p>
          <div class="tool-actions">
            <button @click="importAsnafData" class="tool-btn import-btn">
              Import from JSON
            </button>
            <button @click="exportAsnafData" class="tool-btn export-btn">
              Export to JSON
            </button>
          </div>
        </div>
        
        <div class="admin-tool-card">
          <h4>Zakat Payments</h4>
          <p>Import or export zakat payment data.</p>
          <div class="tool-actions">
            <button @click="importZakatPayments" class="tool-btn import-btn">
              Import from JSON
            </button>
            <button @click="exportZakatPayments" class="tool-btn export-btn">
              Export to JSON
            </button>
          </div>
        </div>
        
        <div class="admin-tool-card">
          <h4>Zakat Distributions</h4>
          <p>Import or export zakat distribution data.</p>
          <div class="tool-actions">
            <button @click="importZakatDistributions" class="tool-btn import-btn">
              Import from JSON
            </button>
            <button @click="exportZakatDistributions" class="tool-btn export-btn">
              Export to JSON
            </button>
          </div>
        </div>
        
        <div class="admin-tool-card">
          <h4>Asnaf Reports</h4>
          <p>Import or export asnaf report data.</p>
          <div class="tool-actions">
            <button @click="importAsnafReports" class="tool-btn import-btn">
              Import from JSON
            </button>
            <button @click="exportAsnafReports" class="tool-btn export-btn">
              Export to JSON
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="admin-tools-section">
      <h3>ML Model Management</h3>
      <p class="help-text">Tools for managing the eligibility assessment model.</p>
      
      <div class="admin-tools-grid">
        <div class="admin-tool-card">
          <h4>Model Performance</h4>
          <p>View current model performance metrics.</p>
          <div class="model-metrics">
            <div class="metric">
              <span class="metric-label">Accuracy:</span>
              <span class="metric-value">87.5%</span>
            </div>
            <div class="metric">
              <span class="metric-label">Precision:</span>
              <span class="metric-value">83.2%</span>
            </div>
            <div class="metric">
              <span class="metric-label">Recall:</span>
              <span class="metric-value">91.4%</span>
            </div>
          </div>
          <div class="tool-actions">
            <button @click="viewModelDetails" class="tool-btn view-btn">
              View Details
            </button>
          </div>
        </div>
        
        <div class="admin-tool-card">
          <h4>Batch Assessment</h4>
          <p>Assess eligibility for multiple records at once.</p>
          <div class="tool-actions">
            <button @click="showBatchAssessment" class="tool-btn assess-btn">
              Batch Assessment
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminToolsTab',
  emits: [
    'import-asnaf-data',
    'export-asnaf-data',
    'import-zakat-payments',
    'export-zakat-payments',
    'import-zakat-distributions',
    'export-zakat-distributions',
    'import-asnaf-reports',
    'export-asnaf-reports',
    'view-model-details',
    'show-batch-assessment'
  ],
  setup(props, { emit }) {
    const importAsnafData = () => {
      emit('import-asnaf-data');
    };

    const exportAsnafData = () => {
      emit('export-asnaf-data');
    };

    const importZakatPayments = () => {
      emit('import-zakat-payments');
    };

    const exportZakatPayments = () => {
      emit('export-zakat-payments');
    };

    const importZakatDistributions = () => {
      emit('import-zakat-distributions');
    };

    const exportZakatDistributions = () => {
      emit('export-zakat-distributions');
    };

    const importAsnafReports = () => {
      emit('import-asnaf-reports');
    };

    const exportAsnafReports = () => {
      emit('export-asnaf-reports');
    };

    const viewModelDetails = () => {
      emit('view-model-details');
    };

    const showBatchAssessment = () => {
      emit('show-batch-assessment');
    };

    return {
      importAsnafData,
      exportAsnafData,
      importZakatPayments,
      exportZakatPayments,
      importZakatDistributions,
      exportZakatDistributions,
      importAsnafReports,
      exportAsnafReports,
      viewModelDetails,
      showBatchAssessment
    };
  }
};
</script> 