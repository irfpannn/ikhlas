<template>
  <div class="users-table-container">
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
      
      <div class="impact-map">
        <h3>Asnaf Recipients Heatmap</h3>
        <div class="heatmap-container">
          <AsnafHeatmap 
            v-if="asnafLocations.length > 0" 
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
          <div class="add-story-card" @click="showAddStoryModal()">
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
    
    <!-- Add Impact Story Modal -->
    <div v-if="storyModalVisible" class="modal">
      <div class="modal-content">
        <span class="close-btn" @click="storyModalVisible = false">&times;</span>
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
            <button type="button" @click="storyModalVisible = false" class="cancel-btn">Cancel</button>
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
    
    <!-- Image Viewer Modal -->
    <div v-if="selectedImage" class="modal image-viewer-modal" @click="selectedImage = null">
      <div class="image-viewer-content" @click.stop>
        <span class="close-btn" @click="selectedImage = null">&times;</span>
        <img :src="selectedImage" alt="Story image" class="full-size-image" />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import AsnafHeatmap from '@/components/AsnafHeatmap.vue';

export default {
  name: 'ImpactTab',
  components: {
    AsnafHeatmap
  },
  props: {
    impactData: {
      type: Object,
      required: true
    },
    asnafLocations: {
      type: Array,
      required: true
    }
  },
  emits: [
    'save-impact-story',
    'handle-story-image-upload',
    'remove-story-image',
    'view-image'
  ],
  setup(props, { emit }) {
    const impactTimeRange = ref('month');
    const impactCategoryFilter = ref('all');
    const storyModalVisible = ref(false);
    const editingStory = ref(null);
    const selectedStory = ref(null);
    const selectedImage = ref(null);
    const storyUploading = ref(false);
    const storyUploadProgress = ref(0);
    
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
    
    const filteredImpactData = computed(() => {
      // Filter by time range and category
      let data = { ...props.impactData };
      
      // Apply category filter if not 'all'
      if (impactCategoryFilter.value !== 'all') {
        // Filter category distribution
        const filteredCategoryDistribution = {};
        if (data.categoryDistribution[impactCategoryFilter.value]) {
          filteredCategoryDistribution[impactCategoryFilter.value] = 
            data.categoryDistribution[impactCategoryFilter.value];
        }
        
        // Filter impact stories
        const filteredImpactStories = data.impactStories.filter(
          story => story.category === impactCategoryFilter.value
        );
        
        return {
          ...data,
          categoryDistribution: filteredCategoryDistribution,
          impactStories: filteredImpactStories
        };
      }
      
      return data;
    });
    
    const beneficiaryChange = computed(() => {
      // Placeholder for change calculation - would be based on previous period data
      return +5.2;
    });
    
    const distributionChange = computed(() => {
      // Placeholder for change calculation - would be based on previous period data
      return +8.7;
    });
    
    const maxMonthlyAmount = computed(() => {
      if (!filteredImpactData.value.monthlyTrend || filteredImpactData.value.monthlyTrend.length === 0) {
        return 0;
      }
      return Math.max(...filteredImpactData.value.monthlyTrend.map(month => month.amount));
    });
    
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-MY', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };
    
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
      storyUploadProgress.value = 0;
      editingStory.value = null;
    };
    
    const showAddStoryModal = (story = null) => {
      if (story) {
        editingStory.value = story;
        storyForm.value = { ...story };
      } else {
        resetStoryForm();
      }
      storyModalVisible.value = true;
    };
    
    const editImpactStory = (story) => {
      showAddStoryModal(story);
    };
    
    const viewImpactStoryDetails = (story) => {
      selectedStory.value = story;
    };
    
    const handleStoryImageUpload = (event) => {
      storyUploading.value = true;
      emit('handle-story-image-upload', event, (progress) => {
        storyUploadProgress.value = progress;
      }, (urls) => {
        if (!storyForm.value.images) {
          storyForm.value.images = [];
        }
        
        // Add new images
        urls.forEach(url => {
          storyForm.value.images.push({ url });
        });
        storyUploading.value = false;
      });
    };
    
    const removeStoryImage = (index) => {
      emit('remove-story-image', storyForm.value.images[index]);
      storyForm.value.images.splice(index, 1);
    };
    
    const viewImage = (imageUrl) => {
      selectedImage.value = imageUrl;
      emit('view-image', imageUrl);
    };
    
    const saveImpactStory = () => {
      if (storyUploading.value) {
        alert('Please wait for image uploads to complete');
        return;
      }
      
      const storyData = {
        ...storyForm.value,
        id: editingStory.value?.id,
        date: editingStory.value?.date || new Date()
      };
      
      emit('save-impact-story', storyData);
      storyModalVisible.value = false;
      resetStoryForm();
    };
    
    return {
      impactTimeRange,
      impactCategoryFilter,
      storyModalVisible,
      editingStory,
      selectedStory,
      selectedImage,
      storyUploading,
      storyUploadProgress,
      storyForm,
      filteredImpactData,
      beneficiaryChange,
      distributionChange,
      maxMonthlyAmount,
      showAddStoryModal,
      editImpactStory,
      viewImpactStoryDetails,
      handleStoryImageUpload,
      removeStoryImage,
      viewImage,
      saveImpactStory,
      formatDate
    };
  }
};
</script> 