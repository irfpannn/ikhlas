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
        <button @click="addNewAsnaf" class="add-btn">Add New Asnaf</button>
        <button @click="showAssessEligibilityModal = true" class="assess-btn">
          <i class="fas fa-robot"></i> Assess Eligibility
        </button>
        <button @click="batchValidateAllAsnaf" class="batch-validate-btn">
          <i class="fas fa-tasks"></i> Batch Validate All
        </button>
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
    
    <!-- Asnaf Reports Tab -->
    <div v-if="activeTab === 'reports'" class="users-table-container">
      <h2>Asnaf Reports</h2>
      <div v-if="loadingReports" class="loading">Loading reports...</div>
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
      <div class="modal-content asnaf-form-modal">
        <span class="close-btn" @click="showAddAsnafModal = false">&times;</span>
        <h2>{{ editingAsnaf ? 'Edit Asnaf Recipient' : 'Add New Asnaf Recipient' }}</h2>
        
        <form @submit.prevent="saveAsnaf" class="asnaf-form">
          <!-- Form tabs for better organization -->
          <div class="form-tabs">
            <button 
              type="button"
              @click="activeFormTab = 'personal'" 
              :class="{ 'active-tab': activeFormTab === 'personal' }"
              class="form-tab-btn"
            >
              Personal Info
            </button>
            <button 
              type="button"
              @click="activeFormTab = 'address'" 
              :class="{ 'active-tab': activeFormTab === 'address' }"
              class="form-tab-btn"
            >
              Address
            </button>
            <button 
              type="button"
              @click="activeFormTab = 'financial'" 
              :class="{ 'active-tab': activeFormTab === 'financial' }"
              class="form-tab-btn"
            >
              Financial
            </button>
            <button 
              type="button"
              @click="activeFormTab = 'eligibility'" 
              :class="{ 'active-tab': activeFormTab === 'eligibility' }"
              class="form-tab-btn"
            >
              Eligibility
            </button>
            <button 
              type="button"
              @click="activeFormTab = 'documents'" 
              :class="{ 'active-tab': activeFormTab === 'documents' }"
              class="form-tab-btn"
            >
              Documents
            </button>
          </div>
          
          <!-- Personal Information Tab -->
          <div v-if="activeFormTab === 'personal'" class="form-tab-content">
            <h3>Personal Information</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label for="asnafName">Full Name</label>
                <input 
                  type="text" 
                  id="asnafName" 
                  v-model="asnafForm.name" 
                  required
                />
              </div>
              
              <div class="form-group">
                <label for="asnafIC">IC Number / MyKad</label>
                <input 
                  type="text" 
                  id="asnafIC" 
                  v-model="asnafForm.ic_number" 
                  placeholder="e.g. 880101-01-1234"
                  required
                />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="asnafContact">Phone Number</label>
                <input 
                  type="text" 
                  id="asnafContact" 
                  v-model="asnafForm.contact" 
                  placeholder="e.g. 012-3456789"
                  required
                />
              </div>
              
              <div class="form-group">
                <label for="asnafEmail">Email Address (Optional)</label>
                <input 
                  type="email" 
                  id="asnafEmail" 
                  v-model="asnafForm.email" 
                  placeholder="e.g. name@example.com"
                />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="asnafDOB">Date of Birth</label>
                <input 
                  type="date" 
                  id="asnafDOB" 
                  v-model="asnafForm.date_of_birth" 
                  required
                />
              </div>
              
              <div class="form-group">
                <label for="asnafGender">Gender</label>
                <select id="asnafGender" v-model="asnafForm.gender" required>
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="asnafRace">Race</label>
                <select id="asnafRace" v-model="asnafForm.race" required>
                  <option value="">Select race</option>
                  <option value="Malay">Malay</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Indian">Indian</option>
                  <option value="Indigenous">Indigenous</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="asnafCitizenship">Citizenship</label>
                <select id="asnafCitizenship" v-model="asnafForm.citizenship" required>
                  <option value="">Select citizenship</option>
                  <option value="Malaysian">Malaysian</option>
                  <option value="Non-Malaysian">Non-Malaysian</option>
                </select>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="asnafMarital">Marital Status</label>
                <select id="asnafMarital" v-model="asnafForm.marital_status" required>
                  <option value="">Select marital status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="asnafDependents">Number of Dependents</label>
                <input 
                  type="number" 
                  id="asnafDependents" 
                  v-model="asnafForm.family_members" 
                  min="0" 
                  required
                />
              </div>
            </div>
            
            <div class="form-group">
              <label for="asnafCategory">Asnaf Category</label>
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
          </div>
          
          <!-- Address Information Tab -->
          <div v-if="activeFormTab === 'address'" class="form-tab-content">
            <h3>Address Information</h3>
            
            <div class="form-group">
              <label for="asnafAddress">Home Address</label>
              <textarea 
                id="asnafAddress" 
                v-model="asnafForm.address" 
                rows="3"
                required
              ></textarea>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="asnafPostcode">Postcode</label>
                <input 
                  type="text" 
                  id="asnafPostcode" 
                  v-model="asnafForm.postcode" 
                  required
                />
              </div>
              
              <div class="form-group">
                <label for="asnafDistrict">District</label>
                <input 
                  type="text" 
                  id="asnafDistrict" 
                  v-model="asnafForm.district" 
                  required
                />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="asnafState">State</label>
                <select id="asnafState" v-model="asnafForm.state" required>
                  <option value="">Select state</option>
                  <option value="Johor">Johor</option>
                  <option value="Kedah">Kedah</option>
                  <option value="Kelantan">Kelantan</option>
                  <option value="Melaka">Melaka</option>
                  <option value="Negeri Sembilan">Negeri Sembilan</option>
                  <option value="Pahang">Pahang</option>
                  <option value="Perak">Perak</option>
                  <option value="Perlis">Perlis</option>
                  <option value="Pulau Pinang">Pulau Pinang</option>
                  <option value="Sabah">Sabah</option>
                  <option value="Sarawak">Sarawak</option>
                  <option value="Selangor">Selangor</option>
                  <option value="Terengganu">Terengganu</option>
                  <option value="Wilayah Persekutuan">Wilayah Persekutuan</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="asnafHousingStatus">Housing Status</label>
                <select id="asnafHousingStatus" v-model="asnafForm.housing_status" required>
                  <option value="">Select housing status</option>
                  <option value="Owned">Owned</option>
                  <option value="Rented">Rented</option>
                  <option value="Family">Staying with Family</option>
                  <option value="PPR">PPR</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            
            <div class="form-group">
              <label>Has Stable Housing</label>
              <div class="radio-group">
                <label class="radio-label">
                  <input type="radio" v-model="asnafForm.has_stable_housing" :value="1" name="housing">
                  Yes
                </label>
                <label class="radio-label">
                  <input type="radio" v-model="asnafForm.has_stable_housing" :value="0" name="housing">
                  No
                </label>
              </div>
            </div>
          </div>
          
          <!-- Financial Information Tab -->
          <div v-if="activeFormTab === 'financial'" class="form-tab-content">
            <h3>Employment & Financial Information</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label for="asnafEmploymentStatus">Employment Status</label>
                <select id="asnafEmploymentStatus" v-model="asnafForm.employment_status" required>
                  <option value="">Select employment status</option>
                  <option value="Employed">Employed</option>
                  <option value="Self-Employed">Self-Employed</option>
                  <option value="Unemployed">Unemployed</option>
                  <option value="OKU">OKU (Disabled)</option>
                  <option value="Retired">Retired</option>
                  <option value="Student">Student</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="asnafOccupation">Occupation</label>
                <input 
                  type="text" 
                  id="asnafOccupation" 
                  v-model="asnafForm.occupation" 
                  :disabled="asnafForm.employment_status === 'Unemployed' || asnafForm.employment_status === 'Student'"
                />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="asnafEmployer">Employer's Name</label>
                <input 
                  type="text" 
                  id="asnafEmployer" 
                  v-model="asnafForm.employer" 
                  :disabled="asnafForm.employment_status === 'Unemployed' || asnafForm.employment_status === 'Self-Employed' || asnafForm.employment_status === 'Student'"
                />
              </div>
              
              <div class="form-group">
                <label for="asnafMonthlyIncome">Monthly Income (RM)</label>
                <input 
                  type="number" 
                  id="asnafMonthlyIncome" 
                  v-model="asnafForm.monthly_income" 
                  min="0" 
                  step="0.01"
                  required
                />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="asnafOtherIncome">Other Income (RM)</label>
                <input 
                  type="number" 
                  id="asnafOtherIncome" 
                  v-model="asnafForm.other_income" 
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div class="form-group">
                <label for="asnafHouseholdIncome">Total Household Income (RM)</label>
                <input 
                  type="number" 
                  id="asnafHouseholdIncome" 
                  v-model="asnafForm.household_income" 
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="asnafMonthlyExpenses">Monthly Expenses (RM)</label>
                <input 
                  type="number" 
                  id="asnafMonthlyExpenses" 
                  v-model="asnafForm.monthly_expenses" 
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div class="form-group">
                <label for="asnafDebts">Debts/Loans (RM)</label>
                <input 
                  type="number" 
                  id="asnafDebts" 
                  v-model="asnafForm.debts" 
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>
          
          <!-- Eligibility Assessment Tab -->
          <div v-if="activeFormTab === 'eligibility'" class="form-tab-content">
            <h3>Eligibility Assessment Data</h3>
            <p class="help-text">This information is used by our AI system to assess eligibility for zakat assistance.</p>
            
            <div class="form-row">
              <div class="form-group">
                <label>Access to Clean Water</label>
                <div class="radio-group">
                  <label class="radio-label">
                    <input type="radio" v-model="asnafForm.access_to_clean_water" :value="1" name="water">
                    Yes
                  </label>
                  <label class="radio-label">
                    <input type="radio" v-model="asnafForm.access_to_clean_water" :value="0" name="water">
                    No
                  </label>
                </div>
              </div>
              
              <div class="form-group">
                <label>Access to Electricity</label>
                <div class="radio-group">
                  <label class="radio-label">
                    <input type="radio" v-model="asnafForm.access_to_electricity" :value="1" name="electricity">
                    Yes
                  </label>
                  <label class="radio-label">
                    <input type="radio" v-model="asnafForm.access_to_electricity" :value="0" name="electricity">
                    No
                  </label>
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label>Has Significant Health Issues</label>
              <div class="radio-group">
                <label class="radio-label">
                  <input type="radio" v-model="asnafForm.has_significant_health_issues" :value="1" name="health">
                  Yes
                </label>
                <label class="radio-label">
                  <input type="radio" v-model="asnafForm.has_significant_health_issues" :value="0" name="health">
                  No
                </label>
              </div>
            </div>
            
            <div class="form-group">
              <label for="asnafNeeds">Specific Needs</label>
              <textarea 
                id="asnafNeeds" 
                v-model="asnafForm.needs" 
                rows="3"
                placeholder="Describe the specific needs of this asnaf recipient"
                required
              ></textarea>
            </div>
            
            <div class="form-group">
              <label for="asnafStatus">Application Status</label>
              <select id="asnafStatus" v-model="asnafForm.status" required>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="asnafNotes">Additional Notes</label>
              <textarea 
                id="asnafNotes" 
                v-model="asnafForm.notes" 
                rows="3"
                placeholder="Any additional information about this asnaf recipient"
              ></textarea>
            </div>
          </div>
          
          <!-- Documents Tab -->
          <div v-if="activeFormTab === 'documents'" class="form-tab-content">
            <h3>Supporting Documents</h3>
            <p class="help-text">Upload supporting documents to verify the asnaf's eligibility.</p>
            
            <div class="document-upload-section">
              <div class="document-upload-item">
                <label>IC Copy</label>
                <input 
                  type="file" 
                  @change="handleDocumentUpload($event, 'ic')" 
                  accept="image/*,application/pdf"
                />
                <div v-if="asnafForm.documents?.ic" class="document-preview">
                  <a :href="asnafForm.documents.ic" target="_blank">View Document</a>
                  <button type="button" @click="removeDocument('ic')" class="remove-document-btn">&times;</button>
                </div>
              </div>
              
              <div class="document-upload-item">
                <label>Salary Slip / Income Proof</label>
                <input 
                  type="file" 
                  @change="handleDocumentUpload($event, 'income')" 
                  accept="image/*,application/pdf"
                />
                <div v-if="asnafForm.documents?.income" class="document-preview">
                  <a :href="asnafForm.documents.income" target="_blank">View Document</a>
                  <button type="button" @click="removeDocument('income')" class="remove-document-btn">&times;</button>
                </div>
              </div>
              
              <div class="document-upload-item">
                <label>Utility Bill</label>
                <input 
                  type="file" 
                  @change="handleDocumentUpload($event, 'utility')" 
                  accept="image/*,application/pdf"
                />
                <div v-if="asnafForm.documents?.utility" class="document-preview">
                  <a :href="asnafForm.documents.utility" target="_blank">View Document</a>
                  <button type="button" @click="removeDocument('utility')" class="remove-document-btn">&times;</button>
                </div>
              </div>
              
              <div class="document-upload-item">
                <label>Medical Report (if applicable)</label>
                <input 
                  type="file" 
                  @change="handleDocumentUpload($event, 'medical')" 
                  accept="image/*,application/pdf"
                />
                <div v-if="asnafForm.documents?.medical" class="document-preview">
                  <a :href="asnafForm.documents.medical" target="_blank">View Document</a>
                  <button type="button" @click="removeDocument('medical')" class="remove-document-btn">&times;</button>
                </div>
              </div>
              
              <div class="document-upload-item">
                <label>Other Supporting Documents</label>
                <input 
                  type="file" 
                  @change="handleDocumentUpload($event, 'other')" 
                  accept="image/*,application/pdf"
                />
                <div v-if="asnafForm.documents?.other" class="document-preview">
                  <a :href="asnafForm.documents.other" target="_blank">View Document</a>
                  <button type="button" @click="removeDocument('other')" class="remove-document-btn">&times;</button>
                </div>
              </div>
            </div>
            
            <div class="form-group declaration-section">
              <label class="checkbox-label">
                <input type="checkbox" v-model="asnafForm.declaration" required>
                I hereby declare that all the information provided is true and accurate.
              </label>
            </div>
          </div>
          
          <div class="form-navigation">
            <button 
              type="button" 
              v-if="activeFormTab !== 'personal'"
              @click="navigateForm('prev')" 
              class="nav-btn prev-btn"
            >
              Previous
            </button>
            
            <button 
              type="button" 
              v-if="activeFormTab !== 'documents'"
              @click="navigateForm('next')" 
              class="nav-btn next-btn"
            >
              Next
            </button>
            
            <button 
              type="submit" 
              v-if="activeFormTab === 'documents'"
              class="save-btn" 
              :disabled="savingAsnaf"
            >
              <span v-if="savingAsnaf">Saving...</span>
              <span v-else>{{ editingAsnaf ? 'Update' : 'Save' }}</span>
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
    
    <!-- Replace the existing Report Details Modal with this improved version -->
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
    
    <!-- Update the Convert to Asnaf functionality to use a dedicated modal -->
    <!-- Add this new modal for Convert to Asnaf -->
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
    
    <!-- Impact Monitoring Tab -->
    <div v-if="activeTab === 'impact'" class="users-table-container">
      <h2>Impact Monitoring</h2>
      <div class="impact-dashboard">
        <div class="impact-filters">
          <div class="filter-group">
            <label for="timeRange">Time Range:</label>
            <select id="timeRange" v-model="impactTimeRange" class="filter-select">
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
          <div class="filter-group">
            <label for="categoryFilter">Category:</label>
            <select id="categoryFilter" v-model="impactCategoryFilter" class="filter-select">
              <option value="all">All Categories</option>
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
        </div>
        
        <div class="impact-metrics">
          <div class="impact-metric-card">
            <h3>Total Beneficiaries</h3>
            <p class="metric-value">{{ filteredImpactData.totalBeneficiaries }}</p>
            <p class="metric-change" :class="{'positive': beneficiaryChange > 0, 'negative': beneficiaryChange < 0}">
              {{ beneficiaryChange > 0 ? '+' : '' }}{{ beneficiaryChange }}% from previous period
            </p>
          </div>
          <div class="impact-metric-card">
            <h3>Total Distributed</h3>
            <p class="metric-value">RM {{ filteredImpactData.totalDistributed.toFixed(2) }}</p>
            <p class="metric-change" :class="{'positive': distributionChange > 0, 'negative': distributionChange < 0}">
              {{ distributionChange > 0 ? '+' : '' }}{{ distributionChange }}% from previous period
            </p>
          </div>
          <div class="impact-metric-card">
            <h3>Average Per Beneficiary</h3>
            <p class="metric-value">RM {{ filteredImpactData.averagePerBeneficiary.toFixed(2) }}</p>
          </div>
          <div class="impact-metric-card">
            <h3>Unique Donors</h3>
            <p class="metric-value">{{ filteredImpactData.uniqueDonors }}</p>
          </div>
        </div>
        
        <div class="impact-charts">
          <div class="impact-chart-container">
            <h3>Distribution by Category</h3>
            <div class="chart-placeholder">
              <div class="category-distribution">
                <div v-for="(value, category) in filteredImpactData.categoryDistribution" :key="category" class="category-bar">
                  <div class="category-label">{{ category }}</div>
                  <div class="bar-container">
                    <div class="bar" :style="{ width: (value / filteredImpactData.totalDistributed * 100) + '%' }"></div>
                    <span class="bar-value">RM {{ value.toFixed(2) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="impact-chart-container">
            <h3>Monthly Distribution Trend</h3>
            <div class="chart-placeholder">
              <div class="monthly-trend">
                <div v-for="(month, index) in filteredImpactData.monthlyTrend" :key="index" class="month-column">
                  <div class="month-bar" :style="{ height: (month.amount / maxMonthlyAmount * 100) + '%' }"></div>
                  <div class="month-label">{{ month.label }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Replace the existing AsnafHeatmap component in the Impact Monitoring tab -->
        <div class="impact-map">
          <h3>Asnaf Recipients Heatmap</h3>
          <div class="heatmap-container">
            <AsnafHeatmap 
              v-if="activeTab === 'impact' && asnafLocations.length > 0" 
              :locations="asnafLocations"
              :key="'heatmap-' + asnafLocations.length"
            />
          </div>
        </div>
        
        <div class="impact-stories">
          <h3>Impact Stories</h3>
          <div class="impact-story-grid">
            <div v-for="(story, index) in filteredImpactData.impactStories" :key="index" class="impact-story-card">
              <div class="story-header">
                <h4>{{ story.title }}</h4>
                <span class="story-date">{{ formatDate(story.date) }}</span>
              </div>
              <p class="story-description">{{ story.description }}</p>
              <div class="story-metrics">
                <div class="story-metric">
                  <span class="metric-label">Beneficiaries:</span>
                  <span class="metric-value">{{ story.beneficiaries }}</span>
                </div>
                <div class="story-metric">
                  <span class="metric-label">Amount:</span>
                  <span class="metric-value">RM {{ story.amount.toFixed(2) }}</span>
                </div>
              </div>
              <div class="story-actions">
                <button @click="editImpactStory(story)" class="action-btn edit-btn">Edit</button>
                <button @click="viewImpactStoryDetails(story)" class="action-btn view-btn">View Details</button>
              </div>
            </div>
            <div class="add-story-card" @click="showAddStoryModal = true">
              <div class="add-story-content">
                <span class="add-icon">+</span>
                <p>Add New Impact Story</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="impact-outcomes">
          <h3>Outcome Metrics</h3>
          <div class="outcome-metrics-grid">
            <div class="outcome-metric-card">
              <h4>Education Support</h4>
              <div class="outcome-value">{{ filteredImpactData.outcomes.education.count }}</div>
              <p class="outcome-description">Students supported with education expenses</p>
            </div>
            <div class="outcome-metric-card">
              <h4>Housing Improvement</h4>
              <div class="outcome-value">{{ filteredImpactData.outcomes.housing.count }}</div>
              <p class="outcome-description">Families with improved housing conditions</p>
            </div>
            <div class="outcome-metric-card">
              <h4>Medical Assistance</h4>
              <div class="outcome-value">{{ filteredImpactData.outcomes.medical.count }}</div>
              <p class="outcome-description">Individuals received medical treatment support</p>
            </div>
            <div class="outcome-metric-card">
              <h4>Business Support</h4>
              <div class="outcome-value">{{ filteredImpactData.outcomes.business.count }}</div>
              <p class="outcome-description">Small businesses or entrepreneurs supported</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Add Impact Story Modal -->
    <div v-if="showAddStoryModal" class="modal">
      <div class="modal-content">
        <span class="close-btn" @click="showAddStoryModal = false">&times;</span>
        <h2>{{ editingStory ? 'Edit Impact Story' : 'Add New Impact Story' }}</h2>
        <form @submit.prevent="saveImpactStory" class="impact-story-form">
          <div class="form-group">
            <label for="storyTitle">Title</label>
            <input 
              type="text" 
              id="storyTitle" 
              v-model="storyForm.title" 
              required
            />
          </div>
          
          <div class="form-group">
            <label for="storyDescription">Description</label>
            <textarea 
              id="storyDescription" 
              v-model="storyForm.description" 
              rows="4"
              required
            ></textarea>
          </div>
          
          <div class="form-group">
            <label for="storyCategory">Category</label>
            <select id="storyCategory" v-model="storyForm.category" required>
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
          
          <div class="form-group">
            <label for="storyBeneficiaries">Number of Beneficiaries</label>
            <input 
              type="number" 
              id="storyBeneficiaries" 
              v-model="storyForm.beneficiaries" 
              min="1"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="storyAmount">Amount Distributed (RM)</label>
            <input 
              type="number" 
              id="storyAmount" 
              v-model="storyForm.amount" 
              step="0.01" 
              min="0" 
              required
            />
          </div>
          
          <div class="form-group">
            <label for="storyOutcomes">Outcomes</label>
            <div class="outcome-checkboxes">
              <label class="outcome-checkbox">
                <input type="checkbox" v-model="storyForm.outcomes.education">
                Education Support
              </label>
              <label class="outcome-checkbox">
                <input type="checkbox" v-model="storyForm.outcomes.housing">
                Housing Improvement
              </label>
              <label class="outcome-checkbox">
                <input type="checkbox" v-model="storyForm.outcomes.medical">
                Medical Assistance
              </label>
              <label class="outcome-checkbox">
                <input type="checkbox" v-model="storyForm.outcomes.business">
                Business Support
              </label>
            </div>
          </div>
          
          <div class="form-group">
            <label for="storyImages">Images</label>
            <input 
              type="file" 
              id="storyImages" 
              @change="handleStoryImageUpload" 
              accept="image/*"
              multiple
            />
            <div v-if="storyUploadProgress > 0 && storyUploadProgress < 100" class="progress-bar">
              <div class="progress" :style="{ width: storyUploadProgress + '%' }"></div>
              <span>{{ storyUploadProgress }}%</span>
            </div>
            <div v-if="storyForm.images && storyForm.images.length > 0" class="story-images-preview">
              <div v-for="(image, index) in storyForm.images" :key="index" class="story-image-preview">
                <img :src="image.url" alt="Story image" />
                <button type="button" @click="removeStoryImage(index)" class="remove-image-btn">&times;</button>
              </div>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" @click="showAddStoryModal = false" class="cancel-btn">Cancel</button>
            <button type="submit" class="save-btn" :disabled="storyUploading">
              {{ editingStory ? 'Update' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Impact Story Details Modal -->
    <div v-if="selectedStory" class="modal story-details-modal">
      <div class="modal-content story-details-content">
        <span class="close-btn" @click="selectedStory = null">&times;</span>
        <div class="story-details-header">
          <h2>{{ selectedStory.title }}</h2>
          <span class="story-date">{{ formatDate(selectedStory.date) }}</span>
        </div>
        
        <div class="story-details-body">
          <div class="story-details-section">
            <h3>Description</h3>
            <p>{{ selectedStory.description }}</p>
          </div>
          
          <div class="story-details-metrics">
            <div class="story-detail-metric">
              <span class="detail-metric-label">Category</span>
              <span class="detail-metric-value">{{ selectedStory.category }}</span>
            </div>
            <div class="story-detail-metric">
              <span class="detail-metric-label">Beneficiaries</span>
              <span class="detail-metric-value">{{ selectedStory.beneficiaries }}</span>
            </div>
            <div class="story-detail-metric">
              <span class="detail-metric-label">Amount</span>
              <span class="detail-metric-value">RM {{ selectedStory.amount.toFixed(2) }}</span>
            </div>
          </div>
          
          <div class="story-details-section">
            <h3>Outcomes</h3>
            <div class="story-outcomes">
              <div v-if="selectedStory.outcomes.education" class="story-outcome">
                <span class="outcome-icon">📚</span>
                <span class="outcome-text">Education Support</span>
              </div>
              <div v-if="selectedStory.outcomes.housing" class="story-outcome">
                <span class="outcome-icon">🏠</span>
                <span class="outcome-text">Housing Improvement</span>
              </div>
              <div v-if="selectedStory.outcomes.medical" class="story-outcome">
                <span class="outcome-icon">🏥</span>
                <span class="outcome-text">Medical Assistance</span>
              </div>
              <div v-if="selectedStory.outcomes.business" class="story-outcome">
                <span class="outcome-icon">💼</span>
                <span class="outcome-text">Business Support</span>
              </div>
            </div>
          </div>
          
          <div v-if="selectedStory.images && selectedStory.images.length > 0" class="story-details-section">
            <h3>Images</h3>
            <div class="story-details-images">
              <div v-for="(image, index) in selectedStory.images" :key="index" class="story-detail-image" @click="viewImage(image.url)">
                <img :src="image.url" alt="Impact story image" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Add this new modal for ML-based eligibility assessment -->
    <div v-if="showAssessEligibilityModal" class="modal">
      <div class="modal-content eligibility-modal">
        <span class="close-btn" @click="showAssessEligibilityModal = false">&times;</span>
        <h2>Assess Eligibility with AI</h2>
        <p class="help-text">Use our machine learning model to assess if a potential recipient qualifies for assistance.</p>
        
        <form @submit.prevent="assessEligibility" class="eligibility-form">
          <div class="form-group">
            <label for="monthlyIncome">Monthly Income (RM)</label>
            <input 
              type="number" 
              id="monthlyIncome" 
              v-model="eligibilityForm.monthly_income" 
              min="0" 
              required
            />
          </div>
          
          <div class="form-group">
            <label for="familyMembers">Number of Family Members</label>
            <input 
              type="number" 
              id="familyMembers" 
              v-model="eligibilityForm.family_members" 
              min="1" 
              required
            />
          </div>
          
          <div class="form-group">
            <label>Has Stable Housing</label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" v-model="eligibilityForm.has_stable_housing" :value="1" name="housing">
                Yes
              </label>
              <label class="radio-label">
                <input type="radio" v-model="eligibilityForm.has_stable_housing" :value="0" name="housing">
                No
              </label>
            </div>
          </div>
          
          <div class="form-group">
            <label>Access to Clean Water</label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" v-model="eligibilityForm.access_to_clean_water" :value="1" name="water">
                Yes
              </label>
              <label class="radio-label">
                <input type="radio" v-model="eligibilityForm.access_to_clean_water" :value="0" name="water">
                No
              </label>
            </div>
          </div>
          
          <div class="form-group">
            <label>Access to Electricity</label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" v-model="eligibilityForm.access_to_electricity" :value="1" name="electricity">
                Yes
              </label>
              <label class="radio-label">
                <input type="radio" v-model="eligibilityForm.access_to_electricity" :value="0" name="electricity">
                No
              </label>
            </div>
          </div>
          
          <div class="form-group">
            <label>Has Significant Health Issues</label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" v-model="eligibilityForm.has_significant_health_issues" :value="1" name="health">
                Yes
              </label>
              <label class="radio-label">
                <input type="radio" v-model="eligibilityForm.has_significant_health_issues" :value="0" name="health">
                No
              </label>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" @click="showAssessEligibilityModal = false" class="cancel-btn">Cancel</button>
            <button type="submit" class="assess-btn" :disabled="assessingEligibility">
              <span v-if="assessingEligibility">Assessing...</span>
              <span v-else>Assess Eligibility</span>
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Add this new modal for eligibility results -->
    <div v-if="eligibilityResult" class="modal">
      <div class="modal-content eligibility-result-modal">
        <span class="close-btn" @click="eligibilityResult = null">&times;</span>
        <h2>Eligibility Assessment Result</h2>
        
        <div class="eligibility-result">
          <div class="result-header" :class="eligibilityResult.prediction === 'Deserves Help' ? 'eligible' : 'ineligible'">
            <div class="result-icon">
              <i :class="eligibilityResult.prediction === 'Deserves Help' ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
            </div>
            <div class="result-status">
              <h3>{{ eligibilityResult.prediction }}</h3>
              <p class="result-probability">
                Confidence: {{ eligibilityResult.probability_deserves_help }}
              </p>
            </div>
          </div>
          
          <div class="result-details">
            <h4>Assessment Details</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Monthly Income:</span>
                <span class="detail-value">RM {{ eligibilityResult.input_data.monthly_income }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Family Members:</span>
                <span class="detail-value">{{ eligibilityResult.input_data.family_members }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Stable Housing:</span>
                <span class="detail-value">{{ eligibilityResult.input_data.has_stable_housing ? 'Yes' : 'No' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Clean Water:</span>
                <span class="detail-value">{{ eligibilityResult.input_data.access_to_clean_water ? 'Yes' : 'No' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Electricity:</span>
                <span class="detail-value">{{ eligibilityResult.input_data.access_to_electricity ? 'Yes' : 'No' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Health Issues:</span>
                <span class="detail-value">{{ eligibilityResult.input_data.has_significant_health_issues ? 'Yes' : 'No' }}</span>
              </div>
            </div>
          </div>
          
          <div v-if="eligibilityResult.prediction === 'Deserves Help'" class="result-actions">
            <button @click="createAsnafFromEligibility" class="create-asnaf-btn">
              Create Asnaf Record
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Add this new tab content -->
    <div v-if="activeTab === 'admin'" class="users-table-container">
      <h2>Admin Tools</h2>
      
      <div class="admin-tools-section">
        <h3>Data Management</h3>
        <p class="help-text">Use these tools to manage data in Firebase.</p>
        
        <div class="admin-tools-grid">
          <div class="admin-tool-card">
            <h4>Asnaf Recipients</h4>
            <p>Import or export asnaf recipient data.</p>
            <div class="tool-actions">
              <button @click="importAsnafDataToFirebase" class="tool-btn import-btn">
                Import from JSON
              </button>
              <button @click="exportAsnafDataFromFirebase" class="tool-btn export-btn">
                Export to JSON
              </button>
            </div>
          </div>
          
          <div class="admin-tool-card">
            <h4>Zakat Payments</h4>
            <p>Import or export zakat payment data.</p>
            <div class="tool-actions">
              <button @click="importZakatPaymentsToFirebase" class="tool-btn import-btn">
                Import from JSON
              </button>
              <button @click="exportZakatPaymentsFromFirebase" class="tool-btn export-btn">
                Export to JSON
              </button>
            </div>
          </div>
          
          <div class="admin-tool-card">
            <h4>Zakat Distributions</h4>
            <p>Import or export zakat distribution data.</p>
            <div class="tool-actions">
              <button @click="importZakatDistributionsToFirebase" class="tool-btn import-btn">
                Import from JSON
              </button>
              <button @click="exportZakatDistributionsFromFirebase" class="tool-btn export-btn">
                Export to JSON
              </button>
            </div>
          </div>
          
          <div class="admin-tool-card">
            <h4>Asnaf Reports</h4>
            <p>Import or export asnaf report data.</p>
            <div class="tool-actions">
              <button @click="importAsnafReportsToFirebase" class="tool-btn import-btn">
                Import from JSON
              </button>
              <button @click="exportAsnafReportsFromFirebase" class="tool-btn export-btn">
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
              <button @click="showBatchAssessmentModal = true" class="tool-btn assess-btn">
                Batch Assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Add this modal for collecting missing ML fields -->
    <div v-if="showMissingFieldsModal" class="modal">
      <div class="modal-content missing-fields-modal">
        <span class="close-btn" @click="showMissingFieldsModal = false">&times;</span>
        <h2>Complete Eligibility Data</h2>
        <p class="help-text">Please provide the missing information needed to assess eligibility for {{ asnafToUpdate?.name }}</p>
        
        <form @submit.prevent="saveMissingFieldsAndValidate" class="missing-fields-form">
          <div class="form-group">
            <label for="missingMonthlyIncome">Monthly Income (RM)</label>
            <input 
              type="number" 
              id="missingMonthlyIncome" 
              v-model="missingFieldsForm.monthly_income" 
              min="0" 
              required
            />
          </div>
          
          <div class="form-group">
            <label for="missingFamilyMembers">Number of Family Members</label>
            <input 
              type="number" 
              id="missingFamilyMembers" 
              v-model="missingFieldsForm.family_members" 
              min="1" 
              required
            />
          </div>
          
          <div class="form-group">
            <label>Has Stable Housing</label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" v-model="missingFieldsForm.has_stable_housing" :value="1" name="missingHousing">
                Yes
              </label>
              <label class="radio-label">
                <input type="radio" v-model="missingFieldsForm.has_stable_housing" :value="0" name="missingHousing">
                No
              </label>
            </div>
          </div>
          
          <div class="form-group">
            <label>Access to Clean Water</label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" v-model="missingFieldsForm.access_to_clean_water" :value="1" name="missingWater">
                Yes
              </label>
              <label class="radio-label">
                <input type="radio" v-model="missingFieldsForm.access_to_clean_water" :value="0" name="missingWater">
                No
              </label>
            </div>
          </div>
          
          <div class="form-group">
            <label>Access to Electricity</label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" v-model="missingFieldsForm.access_to_electricity" :value="1" name="missingElectricity">
                Yes
              </label>
              <label class="radio-label">
                <input type="radio" v-model="missingFieldsForm.access_to_electricity" :value="0" name="missingElectricity">
                No
              </label>
            </div>
          </div>
          
          <div class="form-group">
            <label>Has Significant Health Issues</label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" v-model="missingFieldsForm.has_significant_health_issues" :value="1" name="missingHealth">
                Yes
              </label>
              <label class="radio-label">
                <input type="radio" v-model="missingFieldsForm.has_significant_health_issues" :value="0" name="missingHealth">
                No
              </label>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" @click="showMissingFieldsModal = false" class="cancel-btn">Cancel</button>
            <button type="submit" class="save-btn">Save & Validate</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch, onBeforeUnmount } from 'vue';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, updateDoc, addDoc, deleteDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'vue-router';
import 'leaflet/dist/leaflet.css';
import AsnafHeatmap from '@/components/AsnafHeatmap.vue';

// Import JSON data
import zakatPaymentsData from '@/data/zakatPayments.json';
import zakatDistributionsData from '@/data/zakatDistributions.json';
import asnafRecipientsData from '@/data/asnafRecipients.json';
import asnafReportsData from '@/data/asnafReports.json';
import asnafLocationsData from '@/data/asnafLocations.json';
import impactStoriesData from '@/data/impactStories.json';
import impactDataJson from '@/data/impactData.json';

console.log('Zakat payments data:', zakatPaymentsData);

export default {
  name: 'AdminDashboardView',
  components: {
    AsnafHeatmap
  },
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
      ic_number: '',
      contact: '',
      email: '',
      date_of_birth: '',
      gender: '',
      race: '',
      citizenship: '',
      marital_status: '',
      family_members: 1,
      category: '',
      
      // Address Info
      address: '',
      postcode: '',
      district: '',
      state: '',
      housing_status: '',
      has_stable_housing: 1,
      
      // Financial Info
      employment_status: '',
      occupation: '',
      employer: '',
      monthly_income: 0,
      other_income: 0,
      household_income: 0,
      monthly_expenses: 0,
      debts: 0,
      
      // Eligibility Info
      access_to_clean_water: 1,
      access_to_electricity: 1,
      has_significant_health_issues: 0,
      needs: '',
      status: 'Active',
      notes: '',
      
      // Documents
      documents: {},
      declaration: false,
      
      // System fields
      createdAt: null,
      updatedAt: null
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
        
        // Load data from JSON file
        const payments = zakatPaymentsData.map(payment => ({
          ...payment,
          date: new Date(payment.date),
          amountRM: Number(payment.amountRM),
          amountCrypto: Number(payment.amountCrypto)
        }));
        
        zakatPayments.value = payments;
        
        // In a production environment, you would fetch from Firestore instead:
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
        
        // Load data from JSON file
        const distributions = zakatDistributionsData.map(distribution => ({
          ...distribution,
          date: new Date(distribution.date),
          amountRM: Number(distribution.amountRM)
        }));
        
        zakatDistributions.value = distributions;
        
        // In a production environment, you would fetch from Firestore instead:
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
        
        // Fetch from Firebase
        const querySnapshot = await getDocs(collection(db, 'asnafRecipients'));
        const recipients = [];
        
        querySnapshot.forEach((doc) => {
          recipients.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate()
          });
        });
        
        asnafRecipients.value = recipients;
        
      } catch (error) {
        console.error('Error fetching asnaf recipients:', error);
        
        // Fallback to JSON data if Firebase fetch fails
        asnafRecipients.value = asnafRecipientsData;
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
        // In a production environment, you would update Firestore:
        /*
        const paymentRef = doc(db, 'zakatPayments', paymentId);
        await updateDoc(paymentRef, {
          status: status
        });
        */
        
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
          date: new Date(),
          updatedAt: new Date(),
          // Store reference to the asnaf if selected from list
          asnafId: selectedAsnafId.value || null,
          // Store the source payment IDs
          sourcePayments: selectedPaymentIds.value
        };
        
        if (editingDistribution.value) {
          // Update existing distribution
          // In a production environment, you would update Firestore:
          /*
          const distributionRef = doc(db, 'zakatDistributions', editingDistribution.value.id);
          await updateDoc(distributionRef, distributionData);
          */
          
          // Update local state
          const index = zakatDistributions.value.findIndex(d => d.id === editingDistribution.value.id);
          if (index !== -1) {
            zakatDistributions.value[index] = {
              ...zakatDistributions.value[index],
              ...distributionData
            };
          }
        } else {
          // Add new distribution
          // In a production environment, you would add to Firestore:
          /*
          const docRef = await addDoc(collection(db, 'zakatDistributions'), distributionData);
          */
          
          // Add to local state
          const newId = Date.now().toString();
          zakatDistributions.value.push({
            id: newId,
            ...distributionData
          });
        }
        
        // Update the used amount for each source payment
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
      
      // Copy all properties from the asnaf object to the form
      asnafForm.value = { 
        name: asnaf.name,
        ic_number: asnaf.ic_number,
        contact: asnaf.contact,
        email: asnaf.email,
        date_of_birth: asnaf.date_of_birth,
        gender: asnaf.gender,
        race: asnaf.race,
        citizenship: asnaf.citizenship,
        marital_status: asnaf.marital_status,
        family_members: asnaf.family_members,
        category: asnaf.category,
        
        // Address Info
        address: asnaf.address,
        postcode: asnaf.postcode,
        district: asnaf.district,
        state: asnaf.state,
        housing_status: asnaf.housing_status,
        has_stable_housing: asnaf.has_stable_housing,
        
        // Financial Info
        employment_status: asnaf.employment_status,
        occupation: asnaf.occupation,
        employer: asnaf.employer,
        monthly_income: asnaf.monthly_income,
        other_income: asnaf.other_income,
        household_income: asnaf.household_income,
        monthly_expenses: asnaf.monthly_expenses,
        debts: asnaf.debts,
        
        // Eligibility Info
        access_to_clean_water: asnaf.access_to_clean_water,
        access_to_electricity: asnaf.access_to_electricity,
        has_significant_health_issues: asnaf.has_significant_health_issues,
        needs: asnaf.needs,
        status: asnaf.status,
        notes: asnaf.notes,
        
        // Documents
        documents: asnaf.documents,
        declaration: asnaf.declaration,
        
        // System fields
        createdAt: asnaf.createdAt,
        updatedAt: asnaf.updatedAt
      };
      
      showAddAsnafModal.value = true;
    };
    
    const resetAsnafForm = () => {
      asnafForm.value = {
        name: '',
        ic_number: '',
        contact: '',
        email: '',
        date_of_birth: '',
        gender: '',
        race: '',
        citizenship: '',
        marital_status: '',
        family_members: 1,
        category: '',
        
        // Address Info
        address: '',
        postcode: '',
        district: '',
        state: '',
        housing_status: '',
        has_stable_housing: 1,
        
        // Financial Info
        employment_status: '',
        occupation: '',
        employer: '',
        monthly_income: 0,
        other_income: 0,
        household_income: 0,
        monthly_expenses: 0,
        debts: 0,
        
        // Eligibility Info
        access_to_clean_water: 1,
        access_to_electricity: 1,
        has_significant_health_issues: 0,
        needs: '',
        status: 'Active',
        notes: '',
        
        // Documents
        documents: {},
        declaration: false,
        
        // System fields
        createdAt: null,
        updatedAt: null
      };
      editingAsnaf.value = null;
    };
    
    const saveAsnaf = async () => {
      try {
        savingAsnaf.value = true;
        
        // Prepare data for saving
        const asnafData = {
          ...asnafForm.value,
          // Convert string values to numbers for ML fields
          monthly_income: Number(asnafForm.value.monthly_income),
          family_members: Number(asnafForm.value.family_members),
          has_stable_housing: Number(asnafForm.value.has_stable_housing),
          access_to_clean_water: Number(asnafForm.value.access_to_clean_water),
          access_to_electricity: Number(asnafForm.value.access_to_electricity),
          has_significant_health_issues: Number(asnafForm.value.has_significant_health_issues),
          other_income: Number(asnafForm.value.other_income),
          household_income: Number(asnafForm.value.household_income),
          monthly_expenses: Number(asnafForm.value.monthly_expenses),
          debts: Number(asnafForm.value.debts),
          updatedAt: serverTimestamp()
        };
        
        // Remove the declaration field as it's only for form validation
        delete asnafData.declaration;
        
        if (editingAsnaf.value) {
          // Update existing asnaf in Firebase
          const asnafRef = doc(db, 'asnafRecipients', editingAsnaf.value.id);
          await updateDoc(asnafRef, asnafData);
          
          // Update local state
          const index = asnafRecipients.value.findIndex(a => a.id === editingAsnaf.value.id);
          if (index !== -1) {
            asnafRecipients.value[index] = {
              ...asnafRecipients.value[index],
              ...asnafData,
              updatedAt: new Date() // For local display
            };
          }
          
          alert('Asnaf recipient updated successfully');
        } else {
          // Add createdAt timestamp for new records
          asnafData.createdAt = serverTimestamp();
          
          // Add new asnaf to Firebase
          const docRef = await addDoc(collection(db, 'asnafRecipients'), asnafData);
          
          // Add to local state with generated ID
          asnafRecipients.value.push({
            id: docRef.id,
            ...asnafData,
            createdAt: new Date(), // For local display
            updatedAt: new Date() // For local display
          });
          
          alert('New asnaf recipient added successfully');
        }
        
        resetAsnafForm();
        showAddAsnafModal.value = false;
      } catch (error) {
        console.error('Error saving asnaf:', error);
        alert('Error saving asnaf recipient. Please try again.');
      } finally {
        savingAsnaf.value = false;
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
    
    // Add these new refs for the asnaf reports feature
    const asnafReports = ref([]);
    const loadingReports = ref(true);
    const reportStatusFilter = ref('all');
    const selectedReport = ref(null);
    const reportActionNotes = ref('');
    const selectedImage = ref(null);
    const conversionCategory = ref('');
    const conversionNeeds = ref('');
    
    // Add this computed property for filtered reports
    const filteredReports = computed(() => {
      if (reportStatusFilter.value === 'all') {
        return asnafReports.value;
      } else {
        return asnafReports.value.filter(report => 
          report.status.toLowerCase() === reportStatusFilter.value
        );
      }
    });
    
    // Add this function to fetch asnaf reports
    const fetchAsnafReports = async () => {
      try {
        loadingReports.value = true;
        
        // Load data from JSON file
        const reports = asnafReportsData.map(report => ({
          ...report,
          reportDate: new Date(report.reportDate),
          verifiedDate: report.verifiedDate ? new Date(report.verifiedDate) : undefined,
          rejectedDate: report.rejectedDate ? new Date(report.rejectedDate) : undefined,
          convertedDate: report.convertedDate ? new Date(report.convertedDate) : undefined
        }));
        
        asnafReports.value = reports;
        
        // In a production environment, you would fetch from Firestore instead:
        /*
        const querySnapshot = await getDocs(collection(db, 'asnafReports'));
        const reports = [];
        
        querySnapshot.forEach((doc) => {
          reports.push({
            id: doc.id,
            ...doc.data(),
            reportDate: doc.data().reportDate?.toDate() || new Date(),
            verifiedDate: doc.data().verifiedDate?.toDate(),
            rejectedDate: doc.data().rejectedDate?.toDate(),
            convertedDate: doc.data().convertedDate?.toDate()
          });
        });
        
        asnafReports.value = reports;
        */
        
      } catch (error) {
        console.error('Error fetching asnaf reports:', error);
      } finally {
        loadingReports.value = false;
      }
    };
    
    // Function to view report details
    const viewReportDetails = (report) => {
      selectedReport.value = report;
      reportActionNotes.value = report.notes || '';
      
      // If the report is verified and ready for conversion, set default values
      if (report.status === 'Verified') {
        conversionCategory.value = 'Needy (Miskin)'; // Default category
        conversionNeeds.value = report.description; // Use description as default needs
      }
    };
    
    // Function to view full-size image
    const viewImage = (imageUrl) => {
      selectedImage.value = imageUrl;
    };
    
    // Function to verify a report
    const verifyReport = async (report) => {
      try {
        // In a production environment, you would update Firestore:
        /*
        const reportRef = doc(db, 'asnafReports', report.id);
        await updateDoc(reportRef, {
          status: 'Verified',
          verifiedBy: 'Admin (Current User)', // Use actual admin name
          verifiedDate: serverTimestamp(),
          notes: reportActionNotes.value
        });
        */
        
        const reportIndex = asnafReports.value.findIndex(r => r.id === report.id);
        if (reportIndex !== -1) {
          // Update the report status
          asnafReports.value[reportIndex] = {
            ...asnafReports.value[reportIndex],
            status: 'Verified',
            verifiedBy: 'Admin (Current User)', // In a real app, use the current admin's name
            verifiedDate: new Date(),
            notes: reportActionNotes.value
          };
          
          // If we're in the modal, close it
          if (selectedReport.value && selectedReport.value.id === report.id) {
            selectedReport.value = null;
          }
          
          alert('Report has been verified successfully');
        }
      } catch (error) {
        console.error('Error verifying report:', error);
        alert('Error verifying report. Please try again.');
      }
    };
    
    // Function to reject a report
    const rejectReport = async (report) => {
      try {
        // In a production environment, you would update Firestore:
        /*
        const reportRef = doc(db, 'asnafReports', report.id);
        await updateDoc(reportRef, {
          status: 'Rejected',
          rejectedBy: 'Admin (Current User)', // Use actual admin name
          rejectedDate: serverTimestamp(),
          notes: reportActionNotes.value
        });
        */
        
        const reportIndex = asnafReports.value.findIndex(r => r.id === report.id);
        if (reportIndex !== -1) {
          // Update the report status
          asnafReports.value[reportIndex] = {
            ...asnafReports.value[reportIndex],
            status: 'Rejected',
            rejectedBy: 'Admin (Current User)', // In a real app, use the current admin's name
            rejectedDate: new Date(),
            notes: reportActionNotes.value
          };
          
          // If we're in the modal, close it
          if (selectedReport.value && selectedReport.value.id === report.id) {
            selectedReport.value = null;
          }
          
          alert('Report has been rejected');
        }
      } catch (error) {
        console.error('Error rejecting report:', error);
        alert('Error rejecting report. Please try again.');
      }
    };
    
    // Add these new refs to your setup function
    const showConvertModal = ref(false);
    const reportToConvert = ref(null);
    
    // Update the convertToAsnaf function to show the modal first
    const openConvertModal = (report) => {
      reportToConvert.value = report;
      conversionCategory.value = 'Needy (Miskin)'; // Default category
      conversionNeeds.value = report.description; // Use description as default needs
      showConvertModal.value = true;
    };
    
    // Add a new function to handle the actual conversion
    const confirmConvertToAsnaf = async () => {
      try {
        if (!conversionCategory.value) {
          alert('Please select an asnaf category');
          return;
        }
        
        const report = reportToConvert.value;
        
        // In a production environment, you would create a new asnaf record in Firestore:
        /*
        // 1. Create new asnaf record
        const asnafData = {
          name: report.name,
          category: conversionCategory.value,
          contact: report.phoneNumber || 'Not provided',
          location: report.location?.address || report.address,
          needs: conversionNeeds.value,
          status: 'Active',
          notes: `Created from report ID: ${report.id}. ${reportActionNotes.value}`.trim(),
          createdFrom: report.id,
          createdAt: serverTimestamp()
        };
        
        const asnafRef = await addDoc(collection(db, 'asnafRecipients'), asnafData);
        
        // 2. Update the report status
        const reportRef = doc(db, 'asnafReports', report.id);
        await updateDoc(reportRef, {
          status: 'Converted',
          convertedBy: 'Admin (Current User)', // Use actual admin name
          convertedDate: serverTimestamp(),
          asnafId: asnafRef.id,
          notes: `${report.notes || ''} Converted to asnaf record ID: ${asnafRef.id}`.trim()
        });
        */
        
        // 1. Create new asnaf record
        const newAsnaf = {
          id: Date.now().toString(), // Generate a dummy ID
          name: report.name,
          category: conversionCategory.value,
          contact: report.phoneNumber || 'Not provided',
          location: report.location?.address || report.address,
          needs: conversionNeeds.value,
          status: 'Active',
          notes: `Created from report ID: ${report.id}. ${reportActionNotes.value}`.trim(),
          createdFrom: report.id,
          createdAt: new Date()
        };
        
        // Add to asnaf recipients
        asnafRecipients.value.push(newAsnaf);
        
        // 2. Update the report status
        const reportIndex = asnafReports.value.findIndex(r => r.id === report.id);
        if (reportIndex !== -1) {
          asnafReports.value[reportIndex] = {
            ...asnafReports.value[reportIndex],
            status: 'Converted',
            convertedBy: 'Admin (Current User)', // In a real app, use the current admin's name
            convertedDate: new Date(),
            asnafId: newAsnaf.id,
            notes: `${asnafReports.value[reportIndex].notes} Converted to asnaf record ID: ${newAsnaf.id}`.trim()
          };
        }
        
        // Close the modal
        showConvertModal.value = false;
        reportToConvert.value = null;
        
        // Reset conversion form
        conversionCategory.value = '';
        conversionNeeds.value = '';
        
        alert('Report has been successfully converted to an asnaf record');
        
      } catch (error) {
        console.error('Error converting report to asnaf:', error);
        alert('Error converting report to asnaf. Please try again.');
      }
    };
    
    // Impact Monitoring Tab
    const impactTimeRange = ref('month');
    const impactCategoryFilter = ref('all');
    const showAddStoryModal = ref(false);
    const editingStory = ref(null);
    const selectedStory = ref(null);
    const storyUploadProgress = ref(0);
    const storyUploading = ref(false);
    
    const storyForm = ref({
      title: '',
      description: '',
      category: '',
      beneficiaries: 1,
      amount: 0,
      outcomes: {
        education: false,
        housing: false,
        medical: false,
        business: false
      },
      images: []
    });
    
    const impactData = ref({
      totalBeneficiaries: 0,
      totalDistributed: 0,
      averagePerBeneficiary: 0,
      uniqueDonors: 0,
      categoryDistribution: {},
      monthlyTrend: [],
      impactStories: [],
      outcomes: {
        education: { count: 0 },
        housing: { count: 0 },
        medical: { count: 0 },
        business: { count: 0 }
      }
    });
    
    // Computed property for filtered impact data
    const filteredImpactData = computed(() => {
      // In a real implementation, you would filter the data based on timeRange and categoryFilter
      // For now, we'll return the full data
      return impactData.value;
    });
    
    // Computed property for maximum monthly amount (for chart scaling)
    const maxMonthlyAmount = computed(() => {
      if (!filteredImpactData.value.monthlyTrend || filteredImpactData.value.monthlyTrend.length === 0) {
        return 0;
      }
      return Math.max(...filteredImpactData.value.monthlyTrend.map(month => month.amount));
    });
    
    // Computed properties for change percentages
    const beneficiaryChange = computed(() => {
      // In a real implementation, you would calculate this based on previous period data
      return 12; // Dummy value: 12% increase
    });
    
    const distributionChange = computed(() => {
      // In a real implementation, you would calculate this based on previous period data
      return 8; // Dummy value: 8% increase
    });
    
    // Function to fetch impact data
    const fetchImpactData = async () => {
      try {
        // Load data from JSON files
        impactData.value = {
          ...impactDataJson,
          impactStories: impactStoriesData.map(story => ({
            ...story,
            date: new Date(story.date),
            amount: Number(story.amount),
            beneficiaries: Number(story.beneficiaries)
          }))
        };
      } catch (error) {
        console.error('Error fetching impact data:', error);
      }
    };
    
    // Function to fetch asnaf locations
    const fetchAsnafLocations = async () => {
      try {
        // Load data from JSON file
        asnafLocations.value = asnafLocationsData;
      } catch (error) {
        console.error('Error fetching asnaf locations:', error);
      }
    };
    
    // Function to edit an impact story
    const editImpactStory = (story) => {
      editingStory.value = story;
      storyForm.value = {
        title: story.title,
        description: story.description,
        category: story.category,
        beneficiaries: story.beneficiaries,
        amount: story.amount,
        outcomes: { ...story.outcomes },
        images: story.images || []
      };
      showAddStoryModal.value = true;
    };
    
    // Function to view impact story details
    const viewImpactStoryDetails = (story) => {
      selectedStory.value = story;
    };
    
    // Function to handle story image upload
    const handleStoryImageUpload = async (event) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;
      
      try {
        storyUploading.value = true;
        storyUploadProgress.value = 0;
        
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          
          // Create a storage reference
          const fileRef = storageRef(storage, `impact-stories/${Date.now()}_${file.name}`);
          
          // Upload the file with progress tracking
          const uploadTask = uploadBytesResumable(fileRef, file);
          
          // Wait for upload to complete
          await new Promise((resolve, reject) => {
            uploadTask.on('state_changed', 
              (snapshot) => {
                // Track progress
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                storyUploadProgress.value = Math.round(progress);
              },
              (error) => {
                // Handle errors
                console.error('Upload error:', error);
                reject(error);
              },
              async () => {
                // Upload completed successfully
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                storyForm.value.images.push({
                  id: Date.now() + i,
                  url: downloadURL
                });
                resolve();
              }
            );
          });
        }
      } catch (error) {
        console.error('File upload error:', error);
        alert('Error uploading file. Please try again.');
      } finally {
        storyUploading.value = false;
      }
    };
    
    // Function to remove a story image
    const removeStoryImage = (index) => {
      storyForm.value.images.splice(index, 1);
    };
    
    // Function to save an impact story
    const saveImpactStory = async () => {
      try {
        if (storyUploading.value) {
          alert('Please wait for the file to finish uploading');
          return;
        }
        
        const storyData = {
          ...storyForm.value,
          beneficiaries: Number(storyForm.value.beneficiaries),
          amount: Number(storyForm.value.amount),
          date: new Date()
        };
        
        if (editingStory.value) {
          // Update existing story
          const storyIndex = impactData.value.impactStories.findIndex(s => s.id === editingStory.value.id);
          if (storyIndex !== -1) {
            impactData.value.impactStories[storyIndex] = {
              ...impactData.value.impactStories[storyIndex],
              ...storyData
            };
          }
          
          // In a real implementation, you would update in Firestore:
          /*
          const storyRef = doc(db, 'impactStories', editingStory.value.id);
          await updateDoc(storyRef, storyData);
          */
          
          alert('Impact story updated successfully');
        } else {
          // Add new story
          const newStory = {
            id: Date.now().toString(),
            ...storyData
          };
          
          impactData.value.impactStories.unshift(newStory);
          
          // In a real implementation, you would add to Firestore:
          /*
          await addDoc(collection(db, 'impactStories'), storyData);
          */
          
          alert('Impact story added successfully');
        }
        
        // Update outcome counts
        updateOutcomeCounts();
        
        // Reset form and close modal
        resetStoryForm();
        showAddStoryModal.value = false;
        editingStory.value = null;
        
      } catch (error) {
        console.error('Error saving impact story:', error);
        alert('Error saving impact story. Please try again.');
      }
    };
    
    // Function to update outcome counts
    const updateOutcomeCounts = () => {
      const outcomes = {
        education: { count: 0 },
        housing: { count: 0 },
        medical: { count: 0 },
        business: { count: 0 }
      };
      
      impactData.value.impactStories.forEach(story => {
        if (story.outcomes.education) outcomes.education.count += story.beneficiaries;
        if (story.outcomes.housing) outcomes.housing.count += story.beneficiaries;
        if (story.outcomes.medical) outcomes.medical.count += story.beneficiaries;
        if (story.outcomes.business) outcomes.business.count += story.beneficiaries;
      });
      
      impactData.value.outcomes = outcomes;
    };
    
    // Function to reset story form
    const resetStoryForm = () => {
      storyForm.value = {
        title: '',
        description: '',
        category: '',
        beneficiaries: 1,
        amount: 0,
        outcomes: {
          education: false,
          housing: false,
          medical: false,
          business: false
        },
        images: []
      };
    };
    
    // Initialize asnaf locations
    const asnafLocations = ref([]);
    
    // Add these computed properties
    const totalAsnafRecipients = computed(() => {
      return asnafRecipients.value.length;
    });
    
    const averageZakatPerRecipient = computed(() => {
      if (totalAsnafRecipients.value === 0) return 0;
      return totalDistributedRM.value / totalAsnafRecipients.value;
    });
    
    onMounted(() => {
      fetchZakatPayments();
      fetchZakatDistributions();
      fetchAsnafRecipients();
      fetchAsnafReports();
      fetchImpactData();
      fetchAsnafLocations();
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
    
    // Add these new refs to your setup function
    const showAssessEligibilityModal = ref(false);
    const eligibilityForm = ref({
      monthly_income: 0,
      family_members: 1,
      has_stable_housing: 1,
      access_to_clean_water: 1,
      access_to_electricity: 1,
      has_significant_health_issues: 0
    });
    const assessingEligibility = ref(false);
    const eligibilityResult = ref(null);
    
    // Add this function to assess eligibility
    const assessEligibility = async () => {
      try {
        assessingEligibility.value = true;
        
        // In a production environment, you would call your API:
        /*
        const response = await fetch('/api/assess-eligibility', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eligibilityForm.value),
        });
        
        if (!response.ok) {
          throw new Error('Failed to assess eligibility');
        }
        
        const data = await response.json();
        eligibilityResult.value = data.result;
        */
        
        // For demo purposes, simulate API call with a timeout
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simulate ML model prediction based on the input data
        const deserves_help = simulateMLPrediction(eligibilityForm.value);
        
        eligibilityResult.value = {
          prediction: deserves_help ? "Deserves Help" : "Does Not Currently Qualify",
          probability_deserves_help: deserves_help ? "85%" : "32%",
          input_data: { ...eligibilityForm.value }
        };
        
        // Close the assessment modal and show the result modal
        showAssessEligibilityModal.value = false;
        
      } catch (error) {
        console.error('Error assessing eligibility:', error);
        alert('Error assessing eligibility. Please try again.');
      } finally {
        assessingEligibility.value = false;
      }
    };
    
    // Simple function to simulate ML prediction for demo purposes
    const simulateMLPrediction = (data) => {
      // This is a simplified version of the logic in the ML model
      // In reality, the model would be much more complex
      
      // Very low income AND lack of basic necessities
      if (data.monthly_income < 500 && 
          (!data.has_stable_housing || !data.access_to_clean_water || !data.access_to_electricity)) {
        return true;
      }
      
      // Low income AND multiple hardships (large family AND unstable housing)
      if (data.monthly_income < 700 && data.family_members > 5 && !data.has_stable_housing) {
        return true;
      }
      
      // Significant health issues impacting very low-income families
      if (data.has_significant_health_issues && data.monthly_income < 800) {
        return true;
      }
      
      // Lack of BOTH essential utilities, regardless of income
      if (!data.access_to_clean_water && !data.access_to_electricity) {
        return true;
      }
      
      // Low income AND large family AND lack of clean water
      if (data.monthly_income < 900 && data.family_members > 4 && !data.access_to_clean_water) {
        return true;
      }
      
      // Moderately low income AND lack of electricity
      if (data.monthly_income < 600 && !data.access_to_electricity) {
        return true;
      }
      
      return false;
    };
    
    // Function to create an asnaf record from eligibility result
    const createAsnafFromEligibility = () => {
      // Determine the appropriate category based on the assessment
      let category = 'Needy (Miskin)'; // Default category
      
      // If very low income, categorize as Poor (Fakir)
      if (eligibilityResult.value.input_data.monthly_income < 500 && 
          eligibilityResult.value.input_data.family_members > 3) {
        category = 'Poor (Fakir)';
      }
      
      // Populate the asnaf form with data from the eligibility assessment
      asnafForm.value = {
        name: '', // This will need to be filled in by the admin
        category: category,
        contact: '', // This will need to be filled in by the admin
        location: '', // This will need to be filled in by the admin
        needs: generateNeedsDescription(eligibilityResult.value.input_data),
        status: 'Active',
        notes: `Created from eligibility assessment on ${new Date().toLocaleDateString()}`
      };
      
      // Close the eligibility result modal and open the add asnaf modal
      eligibilityResult.value = null;
      showAddAsnafModal.value = true;
    };
    
    // Function to generate a needs description based on the assessment data
    const generateNeedsDescription = (data) => {
      const needs = [];
      
      if (!data.has_stable_housing) {
        needs.push('Housing assistance');
      }
      
      if (!data.access_to_clean_water) {
        needs.push('Clean water access');
      }
      
      if (!data.access_to_electricity) {
        needs.push('Electricity access');
      }
      
      if (data.has_significant_health_issues) {
        needs.push('Medical assistance');
      }
      
      if (data.family_members > 4) {
        needs.push('Family support for large household');
      }
      
      if (data.monthly_income < 600) {
        needs.push('Financial assistance for basic necessities');
      }
      
      return needs.join(', ');
    };
    
    // Add this function to import JSON data to Firebase
    const importAsnafDataToFirebase = async () => {
      try {
        if (!confirm('This will import all asnaf data from JSON to Firebase. Continue?')) {
          return;
        }
        
        const importCount = {
          success: 0,
          error: 0
        };
        
        // Get a batch reference for efficient writes
        const batch = writeBatch(db);
        
        // Process each asnaf record
        for (const asnaf of asnafRecipientsData) {
          try {
            // Create a new document reference with auto-generated ID
            const asnafRef = doc(collection(db, 'asnafRecipients'));
            
            // Prepare data with timestamps
            const asnafData = {
              ...asnaf,
              // Add default ML model fields if not present
              monthly_income: asnaf.monthly_income || 0,
              family_members: asnaf.family_members || 1,
              has_stable_housing: asnaf.has_stable_housing !== undefined ? asnaf.has_stable_housing : 1,
              access_to_clean_water: asnaf.access_to_clean_water !== undefined ? asnaf.access_to_clean_water : 1,
              access_to_electricity: asnaf.access_to_electricity !== undefined ? asnaf.access_to_electricity : 1,
              has_significant_health_issues: asnaf.has_significant_health_issues !== undefined ? asnaf.has_significant_health_issues : 0,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            };
            
            // Delete the id field as Firestore will generate its own
            delete asnafData.id;
            
            // Add to batch
            batch.set(asnafRef, asnafData);
            importCount.success++;
          } catch (error) {
            console.error('Error preparing asnaf record:', error);
            importCount.error++;
          }
        }
        
        // Commit the batch
        await batch.commit();
        
        alert(`Import completed: ${importCount.success} records imported successfully, ${importCount.error} errors.`);
        
        // Refresh the data
        await fetchAsnafRecipients();
        
      } catch (error) {
        console.error('Error importing asnaf data:', error);
        alert('Error importing asnaf data. See console for details.');
      }
    };
    
    // Add similar functions for other data types
    const importZakatPaymentsToFirebase = async () => {
      try {
        if (!confirm('This will import all zakat payment data from JSON to Firebase. Continue?')) {
          return;
        }
        
        const importCount = {
          success: 0,
          error: 0
        };
        
        // Get a batch reference for efficient writes
        const batch = writeBatch(db);
        let batchCount = 0;
        
        // Process each payment record
        for (const payment of zakatPaymentsData) {
          try {
            // Create a new document reference with auto-generated ID
            const paymentRef = doc(collection(db, 'zakatPayments'));
            
            // Prepare data with timestamps and proper types
            const paymentData = {
              ...payment,
              amountRM: Number(payment.amountRM),
              amountCrypto: Number(payment.amountCrypto),
              date: new Date(payment.date),
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            };
            
            // Delete the id field as Firestore will generate its own
            delete paymentData.id;
            
            // Add to batch
            batch.set(paymentRef, paymentData);
            importCount.success++;
            batchCount++;
            
            // Firestore batches are limited to 500 operations
            if (batchCount >= 450) {
              await batch.commit();
              batchCount = 0;
            }
          } catch (error) {
            console.error('Error preparing payment record:', error);
            importCount.error++;
          }
        }
        
        // Commit any remaining operations
        if (batchCount > 0) {
          await batch.commit();
        }
        
        alert(`Import completed: ${importCount.success} payment records imported successfully, ${importCount.error} errors.`);
        
        // Refresh the data
        await fetchZakatPayments();
        
      } catch (error) {
        console.error('Error importing payment data:', error);
        alert('Error importing payment data. See console for details.');
      }
    };
    
    // Add export functions
    const exportAsnafDataFromFirebase = async () => {
      try {
        // Get all asnaf data from Firebase
        const querySnapshot = await getDocs(collection(db, 'asnafRecipients'));
        const asnafData = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Convert timestamps to strings for JSON export
          const exportData = {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate().toISOString(),
            updatedAt: data.updatedAt?.toDate().toISOString()
          };
          asnafData.push(exportData);
        });
        
        // Create a JSON blob and download it
        const jsonData = JSON.stringify(asnafData, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `asnaf_recipients_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
      } catch (error) {
        console.error('Error exporting asnaf data:', error);
        alert('Error exporting asnaf data. See console for details.');
      }
    };
    
    // Add similar export functions for other data types
    const exportZakatPaymentsFromFirebase = async () => {
      // Similar implementation as exportAsnafDataFromFirebase
    };
    
    const exportZakatDistributionsFromFirebase = async () => {
      // Similar implementation as exportAsnafDataFromFirebase
    };
    
    const exportAsnafReportsFromFirebase = async () => {
      // Similar implementation as exportAsnafDataFromFirebase
    };
    
    // Add a function to view model details
    const viewModelDetails = () => {
      alert('This feature is not yet implemented. It would show detailed model performance metrics and feature importance.');
    };
    
    // Add a ref for the batch assessment modal
    const showBatchAssessmentModal = ref(false);
    
    // Add this ref for tracking save status
    const savingAsnaf = ref(false);
    
    // Add this function to validate an asnaf's eligibility using the ML model
    const validateAsnafEligibility = async (asnaf) => {
      try {
        // Check if the asnaf record has the required ML fields
        if (!hasRequiredMlFields(asnaf)) {
          // If missing fields, show a modal to collect the missing data
          showMissingFieldsModal(asnaf);
          return;
        }
        
        // Prepare the data for the ML model
        const mlData = {
          monthly_income: Number(asnaf.monthly_income),
          family_members: Number(asnaf.family_members),
          has_stable_housing: Number(asnaf.has_stable_housing),
          access_to_clean_water: Number(asnaf.access_to_clean_water),
          access_to_electricity: Number(asnaf.access_to_electricity),
          has_significant_health_issues: Number(asnaf.has_significant_health_issues)
        };
        
        // In a production environment, you would call your API:
        /*
        const response = await fetch('/api/assess-eligibility', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mlData),
        });
        
        if (!response.ok) {
          throw new Error('Failed to assess eligibility');
        }
        
        const data = await response.json();
        const result = data.result;
        */
        
        // For demo purposes, simulate API call with a timeout
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Simulate ML model prediction based on the input data
        const deserves_help = simulateMLPrediction(mlData);
        
        // Create the eligibility result
        const eligibilityResult = {
          eligible: deserves_help,
          confidence: deserves_help ? "85%" : "32%",
          timestamp: new Date()
        };
        
        // Update the asnaf record with the eligibility result
        await updateAsnafEligibility(asnaf.id, eligibilityResult);
        
        // Update the local state
        const index = asnafRecipients.value.findIndex(a => a.id === asnaf.id);
        if (index !== -1) {
          asnafRecipients.value[index] = {
            ...asnafRecipients.value[index],
            mlEligibility: eligibilityResult
          };
        }
        
      } catch (error) {
        console.error('Error validating asnaf eligibility:', error);
        alert('Error validating eligibility. Please try again.');
      }
    };
    
    // Function to check if an asnaf record has all required ML fields
    const hasRequiredMlFields = (asnaf) => {
      const requiredFields = [
        'monthly_income',
        'family_members',
        'has_stable_housing',
        'access_to_clean_water',
        'access_to_electricity',
        'has_significant_health_issues'
      ];
      
      return requiredFields.every(field => 
        asnaf[field] !== undefined && asnaf[field] !== null
      );
    };
    
    // Function to update an asnaf's eligibility in Firebase
    const updateAsnafEligibility = async (asnafId, eligibilityResult) => {
      try {
        const asnafRef = doc(db, 'asnafRecipients', asnafId);
        await updateDoc(asnafRef, {
          mlEligibility: eligibilityResult,
          updatedAt: serverTimestamp()
        });
        return true;
      } catch (error) {
        console.error('Error updating asnaf eligibility:', error);
        return false;
      }
    };
    
    // Add a ref for the missing fields modal
    const showMissingFieldsModal = ref(false);
    const asnafToUpdate = ref(null);
    const missingFieldsForm = ref({
      monthly_income: 0,
      family_members: 1,
      has_stable_housing: 1,
      access_to_clean_water: 1,
      access_to_electricity: 1,
      has_significant_health_issues: 0
    });
    
    // Function to show the missing fields modal
    // const showMissingFieldsModal = (asnaf) => {
    //   asnafToUpdate.value = asnaf;
      
    //   // Initialize the form with existYeeing values or defaults
    //   missingFieldsForm.value = {
    //     monthly_income: asnaf.monthly_income || 0,
    //     family_members: asnaf.family_members || 1,
    //     has_stable_housing: asnaf.has_stable_housing !== undefined ? asnaf.has_stable_housing : 1,
    //     access_to_clean_water: asnaf.access_to_clean_water !== undefined ? asnaf.access_to_clean_water : 1,
    //     access_to_electricity: asnaf.access_to_electricity !== undefined ? asnaf.access_to_electricity : 1,
    //     has_significant_health_issues: asnaf.has_significant_health_issues !== undefined ? asnaf.has_significant_health_issues : 0
    //   };
      
    //   showMissingFieldsModal.value = true;
    // };
    
    // Function to save missing fields and then validate eligibility
    const saveMissingFieldsAndValidate = async () => {
      try {
        if (!asnafToUpdate.value) return;
        
        // Update the asnaf record with the missing fields
        const asnafRef = doc(db, 'asnafRecipients', asnafToUpdate.value.id);
        await updateDoc(asnafRef, {
          monthly_income: Number(missingFieldsForm.value.monthly_income),
          family_members: Number(missingFieldsForm.value.family_members),
          has_stable_housing: Number(missingFieldsForm.value.has_stable_housing),
          access_to_clean_water: Number(missingFieldsForm.value.access_to_clean_water),
          access_to_electricity: Number(missingFieldsForm.value.access_to_electricity),
          has_significant_health_issues: Number(missingFieldsForm.value.has_significant_health_issues),
          updatedAt: serverTimestamp()
        });
        
        // Update local state
        const index = asnafRecipients.value.findIndex(a => a.id === asnafToUpdate.value.id);
        if (index !== -1) {
          asnafRecipients.value[index] = {
            ...asnafRecipients.value[index],
            monthly_income: Number(missingFieldsForm.value.monthly_income),
            family_members: Number(missingFieldsForm.value.family_members),
            has_stable_housing: Number(missingFieldsForm.value.has_stable_housing),
            access_to_clean_water: Number(missingFieldsForm.value.access_to_clean_water),
            access_to_electricity: Number(missingFieldsForm.value.access_to_electricity),
            has_significant_health_issues: Number(missingFieldsForm.value.has_significant_health_issues)
          };
        }
        
        // Close the modal
        showMissingFieldsModal.value = false;
        
        // Now validate the eligibility
        await validateAsnafEligibility(asnafRecipients.value[index]);
        
      } catch (error) {
        console.error('Error saving missing fields:', error);
        alert('Error saving missing fields. Please try again.');
      }
    };
    
    // Add a function to batch validate all asnaf records
    const batchValidateAllAsnaf = async () => {
      try {
        if (!confirm('This will validate eligibility for all asnaf records. Continue?')) {
          return;
        }
        
        const validationCount = {
          success: 0,
          error: 0,
          skipped: 0
        };
        
        // Process each asnaf record
        for (const asnaf of asnafRecipients.value) {
          try {
            // Skip if missing required fields
            if (!hasRequiredMlFields(asnaf)) {
              validationCount.skipped++;
              continue;
            }
            
            // Prepare the data for the ML model
            const mlData = {
              monthly_income: Number(asnaf.monthly_income),
              family_members: Number(asnaf.family_members),
              has_stable_housing: Number(asnaf.has_stable_housing),
              access_to_clean_water: Number(asnaf.access_to_clean_water),
              access_to_electricity: Number(asnaf.access_to_electricity),
              has_significant_health_issues: Number(asnaf.has_significant_health_issues)
            };
            
            // Simulate ML model prediction
            const deserves_help = simulateMLPrediction(mlData);
            
            // Create the eligibility result
            const eligibilityResult = {
              eligible: deserves_help,
              confidence: deserves_help ? "85%" : "32%",
              timestamp: new Date()
            };
            
            // Update the asnaf record with the eligibility result
            await updateAsnafEligibility(asnaf.id, eligibilityResult);
            
            // Update the local state
            const index = asnafRecipients.value.findIndex(a => a.id === asnaf.id);
            if (index !== -1) {
              asnafRecipients.value[index] = {
                ...asnafRecipients.value[index],
                mlEligibility: eligibilityResult
              };
            }
            
            validationCount.success++;
          } catch (error) {
            console.error(`Error validating asnaf ${asnaf.id}:`, error);
            validationCount.error++;
          }
          
          // Add a small delay to avoid overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        alert(`Validation completed: ${validationCount.success} successful, ${validationCount.error} errors, ${validationCount.skipped} skipped due to missing data.`);
        
      } catch (error) {
        console.error('Error in batch validation:', error);
        alert('Error in batch validation. Please try again.');
      }
    };
    
    // Add these new refs to your setup function
    const activeFormTab = ref('personal');
    const documentUploading = ref(false);
    
    // Function to navigate between form tabs
    const navigateForm = (direction) => {
      const tabs = ['personal', 'address', 'financial', 'eligibility', 'documents'];
      const currentIndex = tabs.indexOf(activeFormTab.value);
      
      if (direction === 'next' && currentIndex < tabs.length - 1) {
        activeFormTab.value = tabs[currentIndex + 1];
      } else if (direction === 'prev' && currentIndex > 0) {
        activeFormTab.value = tabs[currentIndex - 1];
      }
    };
    
    // Function to handle document uploads
    const handleDocumentUpload = async (event, docType) => {
      const file = event.target.files[0];
      if (!file) return;
      
      try {
        documentUploading.value = true;
        
        // Create a storage reference
        const fileRef = storageRef(storage, `asnaf-documents/${docType}/${Date.now()}_${file.name}`);
        
        // Upload the file
        const uploadTask = uploadBytesResumable(fileRef, file);
        
        // Monitor upload progress
        uploadTask.on('state_changed', 
          (snapshot) => {
            // Track progress if needed
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload progress: ${progress}%`);
          },
          (error) => {
            // Handle errors
            console.error('Upload error:', error);
            alert('Error uploading document. Please try again.');
            documentUploading.value = false;
          },
          async () => {
            // Upload completed successfully
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            // Update the asnafForm with the document URL
            if (!asnafForm.value.documents) {
              asnafForm.value.documents = {};
            }
            asnafForm.value.documents[docType] = downloadURL;
            
            documentUploading.value = false;
          }
        );
      } catch (error) {
        console.error('Error handling document upload:', error);
        alert('Error uploading document. Please try again.');
        documentUploading.value = false;
      }
    };
    
    // Function to remove a document
    const removeDocument = (docType) => {
      if (asnafForm.value.documents && asnafForm.value.documents[docType]) {
        // Create a copy of the documents object
        const updatedDocs = { ...asnafForm.value.documents };
        // Delete the specified document
        delete updatedDocs[docType];
        // Update the form
        asnafForm.value.documents = updatedDocs;
      }
    };
    
    const addNewAsnaf = () => {
      // Make sure editingAsnaf is null to show "Add New Asnaf Recipient" title
      editingAsnaf.value = null;
      // Reset the form to clear any previous data
      resetAsnafForm();
      // Show the modal
      showAddAsnafModal.value = true;
    };
    
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
      asnafReports,
      loadingReports,
      reportStatusFilter,
      filteredReports,
      selectedReport,
      reportActionNotes,
      selectedImage,
      conversionCategory,
      conversionNeeds,
      viewReportDetails,
      viewImage,
      verifyReport,
      rejectReport,
      showConvertModal,
      reportToConvert,
      openConvertModal,
      confirmConvertToAsnaf,
      impactTimeRange,
      impactCategoryFilter,
      impactData,
      filteredImpactData,
      maxMonthlyAmount,
      beneficiaryChange,
      distributionChange,
      showAddStoryModal,
      editingStory,
      selectedStory,
      storyForm,
      storyUploadProgress,
      storyUploading,
      editImpactStory,
      viewImpactStoryDetails,
      handleStoryImageUpload,
      removeStoryImage,
      saveImpactStory,
      asnafLocations,
      totalAsnafRecipients,
      averageZakatPerRecipient,
      showAssessEligibilityModal,
      eligibilityForm,
      assessingEligibility,
      eligibilityResult,
      assessEligibility,
      createAsnafFromEligibility,
      importAsnafDataToFirebase,
      importZakatPaymentsToFirebase,
      exportAsnafDataFromFirebase,
      exportZakatPaymentsFromFirebase,
      exportZakatDistributionsFromFirebase,
      exportAsnafReportsFromFirebase,
      viewModelDetails,
      showBatchAssessmentModal,
      savingAsnaf,
      validateAsnafEligibility,
      hasRequiredMlFields,
      updateAsnafEligibility,
      showMissingFieldsModal,
      saveMissingFieldsAndValidate,
      batchValidateAllAsnaf,
      activeFormTab,
      documentUploading,
      navigateForm,
      handleDocumentUpload,
      removeDocument,
      addNewAsnaf,
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
  padding: 20px;
  box-sizing: border-box;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
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

/* Add these styles to the existing <style> section */

/* Asnaf Reports Styles */
.reports-filter {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.filter-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.report-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.report-header {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f5f5f5;
  border-bottom: 1px solid #eee;
}

.report-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.report-details {
  padding: 1rem;
  flex-grow: 1;
}

.report-details p {
  margin: 0.5rem 0;
  font-size: 0.9rem;
}

.report-images {
  padding: 0 1rem 1rem;
}

.report-images h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: #666;
}

.image-thumbnails {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.image-thumbnail {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
}

.image-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.report-actions {
  padding: 1rem;
  display: flex;
  gap: 0.5rem;
  border-top: 1px solid #eee;
}

.convert-btn {
  background-color: #673AB7;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.convert-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.status-badge.converted {
  background-color: #673AB7;
  color: white;
}

.status-badge.verified {
  background-color: #2196F3;
  color: white;
}

/* Report Modal Styles */
.report-modal {
  padding: 2rem;
}

.report-modal .modal-content {
  width: 90%;
  height: 90%;
  max-width: 1200px;
  max-height: 90vh;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.report-modal-header {
  background-color: #f8f9fa;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

.report-modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.report-modal-header .close-btn {
  position: static;
  font-size: 1.75rem;
  color: #666;
}

.report-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.report-modal-section {
  padding: 1.5rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
}

.report-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-weight: 500;
  font-size: 0.9rem;
}

.report-status-badge.pending::before,
.report-status-badge.verified::before,
.report-status-badge.rejected::before,
.report-status-badge.converted::before {
  content: "";
  display: inline-block;
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
}

.report-status-badge.pending {
  background-color: #fff8e1;
  color: #f57c00;
}

.report-status-badge.pending::before {
  background-color: #f57c00;
}

.report-status-badge.verified {
  background-color: #e3f2fd;
  color: #1976d2;
}

.report-status-badge.verified::before {
  background-color: #1976d2;
}

.report-status-badge.rejected {
  background-color: #ffebee;
  color: #d32f2f;
}

.report-status-badge.rejected::before {
  background-color: #d32f2f;
}

.report-status-badge.converted {
  background-color: #f3e5f5;
  color: #7b1fa2;
}

.report-status-badge.converted::before {
  background-color: #7b1fa2;
}

.report-details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.report-detail-card {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1.25rem;
}

.report-detail-card h4 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1rem;
  color: #555;
}

.report-detail-item {
  margin-bottom: 0.75rem;
}

.report-detail-item:last-child {
  margin-bottom: 0;
}

.report-detail-label {
  font-weight: 500;
  color: #666;
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.85rem;
}

.report-detail-value {
  color: #333;
}

.report-images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.report-image-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  cursor: pointer;
  height: 200px;
  transition: transform 0.2s ease;
}

.report-image-card:hover {
  transform: scale(1.03);
}

.report-image-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.report-action-section {
  background-color: #f8f9fa;
  padding: 1.5rem 2rem;
  border-top: 1px solid #e9ecef;
  margin-top: auto;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}

.report-action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.report-action-button {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.report-action-button.verify {
  background-color: #4caf50;
  color: white;
}

.report-action-button.reject {
  background-color: #f44336;
  color: white;
}

.report-action-button.convert {
  background-color: #673ab7;
  color: white;
}

.report-action-button.view {
  background-color: #2196f3;
  color: white;
}

/* Image Viewer Modal */
.image-viewer-modal {
  background-color: rgba(0, 0, 0, 0.9);
  padding: 0;
}

.image-viewer-content {
  background: none;
  max-width: 95%;
  max-height: 95%;
  box-shadow: none;
  padding: 0;
}

.full-size-image {
  max-width: 100%;
  max-height: 95vh;
  object-fit: contain;
  border-radius: 4px;
}

.image-viewer-content .close-btn {
  position: absolute;
  top: -2.5rem;
  right: 0;
  color: white;
  font-size: 2rem;
  background: none;
  border: none;
  cursor: pointer;
}

/* Convert to Asnaf Modal */
.convert-modal {
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
}

.convert-modal .close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 1.5rem;
  cursor: pointer;
}

.convert-modal .form-group {
  margin-bottom: 1.5rem;
}

.convert-modal .form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.convert-modal .form-group select,
.convert-modal .form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.convert-modal .form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.convert-modal .cancel-btn {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.convert-modal .convert-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.convert-modal .convert-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

/* Add these styles for the Impact Monitoring tab */
.impact-dashboard {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.impact-filters {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-bottom: 1rem;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.impact-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.impact-metric-card {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.impact-metric-card h3 {
  margin-top: 0;
  color: #555;
  font-size: 1rem;
}

.metric-value {
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0.5rem 0;
  color: #4CAF50;
}

.metric-change {
  font-size: 0.9rem;
  margin: 0;
}

.metric-change.positive {
  color: #4CAF50;
}

.metric-change.negative {
  color: #f44336;
}

.impact-charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 1.5rem;
}

.impact-chart-container {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.impact-chart-container h3 {
  margin-top: 0;
  color: #555;
  font-size: 1rem;
  margin-bottom: 1rem;
}

.chart-placeholder {
  height: 300px;
  width: 100%;
}

.category-distribution {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
}

.category-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.category-label {
  width: 150px;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bar-container {
  flex: 1;
  height: 20px;
  background-color: #f5f5f5;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.bar {
  height: 100%;
  background-color: #4CAF50;
  border-radius: 10px;
}

.bar-value {
  position: absolute;
  right: 8px;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  font-weight: 500;
  color: #333;
}

.monthly-trend {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 100%;
  padding-top: 20px;
}

.month-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
}

.month-bar {
  width: 30px;
  background-color: #4CAF50;
  border-radius: 4px 4px 0 0;
  margin-bottom: 8px;
}

.month-label {
  font-size: 0.8rem;
  color: #666;
}

.impact-stories {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.impact-stories h3 {
  margin-top: 0;
  color: #555;
  font-size: 1rem;
  margin-bottom: 1rem;
}

.impact-story-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.impact-story-card {
  background-color: #f9f9f9;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.story-header {
  padding: 1rem;
  background-color: #f5f5f5;
  border-bottom: 1px solid #eee;
}

.story-header h4 {
  margin: 0;
  font-size: 1.1rem;
}

.story-date {
  font-size: 0.8rem;
  color: #666;
  display: block;
  margin-top: 0.25rem;
}

.story-description {
  padding: 1rem;
  flex-grow: 1;
  font-size: 0.9rem;
  color: #333;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.story-metrics {
  padding: 0 1rem 1rem;
  justify-content: space-between;
}

.story-metric {
  font-size: 0.85rem;
}

.metric-label {
  color: #666;
}

.story-actions {
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  border-top: 1px solid #eee;
}

.add-story-card {
  background-color: #f5f5f5;
  border: 2px dashed #ddd;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  min-height: 200px;
  transition: all 0.2s ease;
}

.add-story-card:hover {
  background-color: #e9e9e9;
  border-color: #ccc;
}

.add-story-content {
  text-align: center;
  color: #666;
}

.add-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 0.5rem;
}

.impact-outcomes {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.impact-outcomes h3 {
  margin-top: 0;
  color: #555;
  font-size: 1rem;
  margin-bottom: 1rem;
}

.outcome-metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.outcome-metric-card {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.outcome-metric-card h4 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #555;
  font-size: 1rem;
}

.outcome-value {
  font-size: 2rem;
  font-weight: bold;
  color: #4CAF50;
  margin-bottom: 0.5rem;
}

.outcome-description {
  font-size: 0.85rem;
  color: #666;
  margin: 0;
}

.outcome-checkboxes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.5rem;
}

.outcome-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
}

.story-images-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.story-image-preview {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.story-image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image-btn {
  position: absolute;
  top: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  width: 20px;
  height: 20px;
  border-radius: 0 0 0 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.8rem;
}

.story-details-modal .modal-content {
  max-width: 800px;
}

.story-details-header {
  margin-bottom: 1.5rem;
}

.story-details-header h2 {
  margin-bottom: 0.25rem;
}

.story-details-body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.story-details-section {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 1.5rem;
}

.story-details-section h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: #555;
}

.story-details-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 1.5rem;
}

.story-detail-metric {
  display: flex;
  flex-direction: column;
}

.detail-metric-label {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.detail-metric-value {
  font-size: 1.1rem;
  font-weight: 500;
}

.story-outcomes {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.story-outcome {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #e8f5e9;
  padding: 0.5rem 1rem;
  border-radius: 20px;
}

.outcome-icon {
  font-size: 1.2rem;
}

.outcome-text {
  font-size: 0.9rem;
}

.story-details-images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.story-detail-image {
  height: 150px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
}

.story-detail-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s ease;
}

.story-detail-image:hover img {
  transform: scale(1.05);
}

/* Add the new Asnaf Heatmap section */
.asnaf-heatmap-container {
  margin-top: 2rem;
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.heatmap-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.heatmap-filters {
  display: flex;
  gap: 1rem;
}

.legend-label {
  font-weight: 500;
}

.legend-gradient {
  width: 100px;
  height: 10px;
  border-radius: 5px;
  background: linear-gradient(to right, blue, lime, red);
}

.legend-low, .legend-high {
  font-size: 0.75rem;
  color: #666;
}

.heatmap-container {
  height: 500px;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #eee;
  position: relative;
  z-index: 1;
}

.heatmap-container canvas {
  width: 100%;
  height: 100%;
}

/* Add these styles to ensure Leaflet displays correctly */
.leaflet-container {
  width: 100% !important;
  height: 100% !important;
  z-index: 1;
}

/* Add these styles to fix Leaflet rendering issues */
.leaflet-pane {
  z-index: 1;
}

.leaflet-tile,
.leaflet-marker-icon,
.leaflet-marker-shadow,
.leaflet-tile-container,
.leaflet-pane > svg,
.leaflet-pane > canvas,
.leaflet-zoom-box,
.leaflet-image-layer,
.leaflet-layer {
  position: absolute;
  left: 0;
  top: 0;
}

/* Add these styles for the Impact Monitoring tab */
.impact-monitoring {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.impact-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.impact-stat {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.impact-stat h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1rem;
  color: #555;
}

.impact-stat p {
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0;
  color: #4CAF50;
}

.impact-charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.chart-container {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chart-container h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1rem;
  color: #555;
}

.chart-wrapper {
  height: 300px;
  width: 100%;
}

.impact-map {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.impact-map h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1rem;
  color: #555;
}

/* Add these styles to your existing <style> section */

.assess-btn {
  background-color: #673AB7;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.assess-btn i {
  font-size: 0.9rem;
}

.eligibility-modal {
  max-width: 600px;
}

.help-text {
  color: #666;
  margin-bottom: 1.5rem;
}

.radio-group {
  display: flex;
  gap: 1.5rem;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.eligibility-result-modal {
  max-width: 600px;
}

.eligibility-result {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  border-radius: 8px;
}

.result-header.eligible {
  background-color: #e8f5e9;
}

.result-header.ineligible {
  background-color: #ffebee;
}

.result-icon {
  font-size: 3rem;
}

.result-icon i {
  color: #4CAF50;
}

.result-header.ineligible .result-icon i {
  color: #f44336;
}

.result-status h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.result-probability {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}

.result-details {
  background-color: #f5f5f5;
  padding: 1.5rem;
  border-radius: 8px;
}

.result-details h4 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: #555;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.85rem;
  color: #666;
}

.detail-value {
  font-weight: 500;
}

.result-actions {
  display: flex;
  justify-content: flex-end;
}

.create-asnaf-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

/* Add these styles to your existing <style> section */

.form-section {
  margin-top: 1.5rem;
  border-top: 1px solid #eee;
  padding-top: 1.5rem;
}

.form-section h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1rem;
  color: #555;
}

.admin-tools-section {
  margin-bottom: 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 1.5rem;
}

.admin-tools-section h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
  color: #333;
}

.admin-tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.admin-tool-card {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.admin-tool-card h4 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
  color: #333;
}

.admin-tool-card p {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #666;
  font-size: 0.9rem;
}

.tool-actions {
  display: flex;
  gap: 0.75rem;
}

.tool-btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  border: none;
  font-weight: 500;
}

.import-btn {
  background-color: #2196F3;
  color: white;
}

.export-btn {
  background-color: #4CAF50;
  color: white;
}

.view-btn {
  background-color: #673AB7;
  color: white;
}

.model-metrics {
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.metric {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.metric:last-child {
  margin-bottom: 0;
}

.metric-label {
  font-weight: 500;
  color: #555;
}

.metric-value {
  font-weight: 600;
  color: #4CAF50;
}

.eligibility-badge-container {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
}

.eligibility-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
}

.eligibility-badge.eligible {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.eligibility-badge.ineligible {
  background-color: #ffebee;
  color: #c62828;
}

.eligibility-badge i {
  font-size: 1.2rem;
}

.eligibility-text {
  font-weight: 500;
}

.eligibility-confidence {
  font-size: 0.8rem;
  opacity: 0.8;
  margin-left: 0.25rem;
}

.validate-btn {
  background-color: #673AB7;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.batch-validate-btn {
  background-color: #FF9800;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.missing-fields-modal {
  max-width: 600px;
}

.asnaf-form-modal .modal-content {
  max-width: 800px;
}

.asnaf-form .form-tabs {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  border-bottom: 1px solid #ddd;
}

.asnaf-form .form-tab-btn {
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
}

.asnaf-form .form-tab-btn.active-tab {
  border-bottom: 3px solid #4CAF50;
  color: #4CAF50;
  font-weight: 600;
}

.asnaf-form .form-tab-content {
  padding: 1rem;
}

.asnaf-form .form-group {
  margin-bottom: 1rem;
}

.asnaf-form .form-group label {
  font-weight: 500;
}

.asnaf-form .form-group input,
.asnaf-form .form-group select,
.asnaf-form .form-group textarea {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.asnaf-form .form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.asnaf-form .cancel-btn {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.asnaf-form .save-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.asnaf-form .save-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.asnaf-form .form-navigation {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}

.asnaf-form .nav-btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.asnaf-form .prev-btn {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
}

.asnaf-form .next-btn {
  background-color: #4CAF50;
  color: white;
}

.asnaf-form .form-group.declaration-section {
  margin-top: 1rem;
}

.asnaf-form .checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.asnaf-form .checkbox-label input[type="checkbox"] {
  margin-right: 0.5rem;
}

.asnaf-form .document-upload-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.asnaf-form .document-upload-item {
  display: flex;
  flex-direction: column;
}

.asnaf-form .document-upload-item label {
  font-weight: 500;
}

.asnaf-form .document-upload-item input[type="file"] {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.asnaf-form .document-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
}

.asnaf-form .document-preview a {
  color: #2196F3;
  text-decoration: underline;
}

.asnaf-form .remove-document-btn {
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  font-size: 0.8rem;
}
</style> 