<template>
    <div class="impact-monitoring">
      <header class="page-header">
        <h1>Impact Monitoring</h1>
        <div class="header-actions">
          <button @click="exportData" class="export-btn">
            <i class="fas fa-download"></i> Export Data
          </button>
        </div>
      </header>
  
      <div class="monitoring-dashboard">
        <div class="metrics-cards">
          <div class="metric-card">
            <div class="metric-icon">
              <i class="fas fa-users"></i>
            </div>
            <div class="metric-content">
              <h3>Total Asnaf</h3>
              <p class="metric-value">{{ totalAsnaf }}</p>
              <p class="metric-trend positive">
                <i class="fas fa-arrow-up"></i> {{ asnafGrowthRate }}% from last month
              </p>
            </div>
          </div>
  
          <div class="metric-card">
            <div class="metric-icon">
              <i class="fas fa-hand-holding-usd"></i>
            </div>
            <div class="metric-content">
              <h3>Total Distributed</h3>
              <p class="metric-value">RM {{ totalDistributed.toFixed(2) }}</p>
              <p class="metric-trend positive">
                <i class="fas fa-arrow-up"></i> {{ distributionGrowthRate }}% from last month
              </p>
            </div>
          </div>
  
          <div class="metric-card">
            <div class="metric-icon">
              <i class="fas fa-map-marker-alt"></i>
            </div>
            <div class="metric-content">
              <h3>Coverage Areas</h3>
              <p class="metric-value">{{ coverageAreas }}</p>
              <p class="metric-trend neutral">
                <i class="fas fa-minus"></i> No change from last month
              </p>
            </div>
          </div>
  
          <div class="metric-card">
            <div class="metric-icon">
              <i class="fas fa-chart-line"></i>
            </div>
            <div class="metric-content">
              <h3>Impact Score</h3>
              <p class="metric-value">{{ impactScore }}/100</p>
              <p class="metric-trend positive">
                <i class="fas fa-arrow-up"></i> {{ impactGrowthRate }}% from last month
              </p>
            </div>
          </div>
        </div>
  
        <div class="monitoring-tabs">
          <button 
            @click="activeTab = 'heatmap'" 
            :class="{ 'active-tab': activeTab === 'heatmap' }"
            class="tab-btn"
          >
            Asnaf Heatmap
          </button>
          <button 
            @click="activeTab = 'categories'" 
            :class="{ 'active-tab': activeTab === 'categories' }"
            class="tab-btn"
          >
            Category Distribution
          </button>
          <button 
            @click="activeTab = 'timeline'" 
            :class="{ 'active-tab': activeTab === 'timeline' }"
            class="tab-btn"
          >
            Distribution Timeline
          </button>
          <button 
            @click="activeTab = 'impact'" 
            :class="{ 'active-tab': activeTab === 'impact' }"
            class="tab-btn"
          >
            Impact Metrics
          </button>
        </div>
  
        <!-- Heatmap Tab -->
        <div v-if="activeTab === 'heatmap'" class="tab-content">
          <div class="map-controls">
            <div class="filter-group">
              <label for="categoryFilter">Filter by Category:</label>
              <select id="categoryFilter" v-model="categoryFilter">
                <option value="all">All Categories</option>
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
            <div class="filter-group">
              <label for="timeFilter">Time Period:</label>
              <select id="timeFilter" v-model="timeFilter">
                <option value="all">All Time</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>
            </div>
            <div class="filter-group">
              <label for="heatmapIntensity">Heatmap Intensity:</label>
              <input 
                type="range" 
                id="heatmapIntensity" 
                v-model="heatmapIntensity" 
                min="1" 
                max="10" 
                step="1"
              />
            </div>
          </div>
  
          <div class="map-container">
            <div id="asnafMap" ref="mapContainer"></div>
            <div class="map-legend">
              <h4>Asnaf Density</h4>
              <div class="legend-gradient"></div>
              <div class="legend-labels">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
            </div>
          </div>
  
          <div class="map-stats">
            <div class="stat-item">
              <h4>Highest Density Area</h4>
              <p>{{ highestDensityArea }}</p>
            </div>
            <div class="stat-item">
              <h4>Total Asnaf Mapped</h4>
              <p>{{ mappedAsnafCount }}</p>
            </div>
            <div class="stat-item">
              <h4>Coverage Percentage</h4>
              <p>{{ coveragePercentage }}%</p>
            </div>
          </div>
        </div>
  
        <!-- Category Distribution Tab -->
        <div v-if="activeTab === 'categories'" class="tab-content">
          <div class="chart-container">
            <canvas id="categoryChart" ref="categoryChart"></canvas>
          </div>
          <div class="category-stats">
            <div v-for="(count, category) in categoryCounts" :key="category" class="category-stat-item">
              <h4>{{ category }}</h4>
              <p class="category-count">{{ count }}</p>
              <p class="category-percentage">{{ calculateCategoryPercentage(count) }}%</p>
            </div>
          </div>
        </div>
  
        <!-- Distribution Timeline Tab -->
        <div v-if="activeTab === 'timeline'" class="tab-content">
          <div class="chart-container">
            <canvas id="timelineChart" ref="timelineChart"></canvas>
          </div>
          <div class="timeline-controls">
            <div class="filter-group">
              <label for="timelineView">View:</label>
              <select id="timelineView" v-model="timelineView">
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div class="filter-group">
              <label for="timelineMetric">Metric:</label>
              <select id="timelineMetric" v-model="timelineMetric">
                <option value="amount">Distribution Amount</option>
                <option value="count">Distribution Count</option>
                <option value="recipients">Recipient Count</option>
              </select>
            </div>
          </div>
        </div>
  
        <!-- Impact Metrics Tab -->
        <div v-if="activeTab === 'impact'" class="tab-content">
          <div class="impact-metrics">
            <div class="impact-metric-card">
              <h3>Education Support</h3>
              <div class="impact-value">
                <span class="impact-number">{{ educationSupportCount }}</span>
                <span class="impact-label">students</span>
              </div>
              <p class="impact-description">Students receiving educational support through zakat funds</p>
            </div>
            
            <div class="impact-metric-card">
              <h3>Housing Improvement</h3>
              <div class="impact-value">
                <span class="impact-number">{{ housingImprovementCount }}</span>
                <span class="impact-label">families</span>
              </div>
              <p class="impact-description">Families with improved housing conditions</p>
            </div>
            
            <div class="impact-metric-card">
              <h3>Healthcare Access</h3>
              <div class="impact-value">
                <span class="impact-number">{{ healthcareAccessCount }}</span>
                <span class="impact-label">individuals</span>
              </div>
              <p class="impact-description">Individuals with improved healthcare access</p>
            </div>
            
            <div class="impact-metric-card">
              <h3>Economic Empowerment</h3>
              <div class="impact-value">
                <span class="impact-number">{{ economicEmpowermentCount }}</span>
                <span class="impact-label">beneficiaries</span>
              </div>
              <p class="impact-description">Beneficiaries of economic empowerment programs</p>
            </div>
          </div>
          
          <div class="success-stories">
            <h3>Success Stories</h3>
            <div class="stories-container">
              <div v-for="(story, index) in successStories" :key="index" class="story-card">
                <div class="story-header">
                  <h4>{{ story.title }}</h4>
                  <span class="story-date">{{ formatDate(story.date) }}</span>
                </div>
                <p class="story-content">{{ story.content }}</p>
                <div class="story-footer">
                  <span class="story-category">{{ story.category }}</span>
                  <button @click="viewStoryDetails(story)" class="view-story-btn">Read More</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Story Details Modal -->
      <div v-if="selectedStory" class="modal">
        <div class="modal-content story-modal">
          <span class="close-btn" @click="selectedStory = null">&times;</span>
          <div class="story-modal-header">
            <h2>{{ selectedStory.title }}</h2>
            <span class="story-date">{{ formatDate(selectedStory.date) }}</span>
          </div>
          <div class="story-modal-content">
            <p v-if="selectedStory.recipient" class="story-recipient">
              <strong>Recipient:</strong> {{ selectedStory.recipient }}
            </p>
            <p v-if="selectedStory.location" class="story-location">
              <strong>Location:</strong> {{ selectedStory.location }}
            </p>
            <div class="story-full-content">
              <p>{{ selectedStory.content }}</p>
              <p v-if="selectedStory.extendedContent">{{ selectedStory.extendedContent }}</p>
            </div>
            <div v-if="selectedStory.outcomes" class="story-outcomes">
              <h4>Outcomes:</h4>
              <ul>
                <li v-for="(outcome, index) in selectedStory.outcomes" :key="index">
                  {{ outcome }}
                </li>
              </ul>
            </div>
            <div v-if="selectedStory.images && selectedStory.images.length > 0" class="story-images">
              <h4>Images:</h4>
              <div class="story-image-gallery">
                <div 
                  v-for="(image, index) in selectedStory.images" 
                  :key="index" 
                  class="story-image"
                  @click="viewImage(image)"
                >
                  <img :src="image" alt="Success story image" />
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
          <img :src="selectedImage" alt="Full size image" class="full-size-image" />
        </div>
      </div>
    </div>
</template>
  
<script>
  import { ref, onMounted, computed, watch } from 'vue';
  import { getFirestore, collection, getDocs, query, where, orderBy } from 'firebase/firestore';
  import Chart from 'chart.js/auto';
  import 'leaflet/dist/leaflet.css';
  import L from 'leaflet';
  import 'leaflet.heat';
  
  export default {
    name: 'ImpactMonitoringView',
    setup() {
      const db = getFirestore();
      const activeTab = ref('heatmap');
      const categoryFilter = ref('all');
      const timeFilter = ref('all');
      const heatmapIntensity = ref(5);
      const timelineView = ref('monthly');
      const timelineMetric = ref('amount');
      const mapContainer = ref(null);
      const categoryChart = ref(null);
      const timelineChart = ref(null);
      const selectedStory = ref(null);
      const selectedImage = ref(null);
  
      // Metrics data
      const totalAsnaf = ref(156);
      const asnafGrowthRate = ref(12);
      const totalDistributed = ref(125000);
      const distributionGrowthRate = ref(8);
      const coverageAreas = ref(15);
      const impactScore = ref(78);
      const impactGrowthRate = ref(5);
  
      // Map data
      const highestDensityArea = ref('Kampung Baru, Kuala Lumpur');
      const mappedAsnafCount = ref(142);
      const coveragePercentage = ref(91);
  
      // Category data
      const categoryCounts = ref({
        'Poor (Fakir)': 48,
        'Needy (Miskin)': 62,
        'Zakat Administrator (Amil)': 8,
        'New Muslim (Muallaf)': 12,
        'To Free Slaves (Riqab)': 2,
        'Debtor (Gharimin)': 15,
        'Allah\'s Cause (Fi Sabilillah)': 7,
        'Traveler (Ibnus Sabil)': 2
      });
  
      // Impact metrics
      const educationSupportCount = ref(42);
      const housingImprovementCount = ref(28);
      const healthcareAccessCount = ref(35);
      const economicEmpowermentCount = ref(19);
  
      // Success stories
      const successStories = ref([
        {
          id: 1,
          title: 'From Struggle to Success: Ahmad\'s Education Journey',
          date: new Date(2023, 9, 15), // Oct 15, 2023
          recipient: 'Ahmad bin Abdullah',
          location: 'Kampung Baru, Kuala Lumpur',
          category: 'Education',
          content: 'Ahmad, a bright student from a struggling family, was at risk of dropping out of school due to financial constraints. Through zakat funds, he received educational support covering school fees, books, and transportation.',
          extendedContent: 'The support continued for two years, allowing Ahmad to complete his secondary education with excellent results. He has now secured a scholarship for his tertiary education and aims to become an engineer to support his family and give back to the community.',
          outcomes: [
            'Completed secondary education with distinction',
            'Secured scholarship for university',
            'Family financial burden reduced',
            'Inspired other students in the community'
          ],
          images: [
            'https://i0.wp.com/www.eduitno.com/wp-content/uploads/2024/11/Apa-Itu-Bantuan-Asnaf.webp?resize=770%2C403&ssl=1',
            'https://i0.wp.com/www.eduitno.com/wp-content/uploads/2024/11/Apa-Itu-Bantuan-Asnaf.webp?resize=770%2C403&ssl=1'
          ]
        },
        {
          id: 2,
          title: 'A New Home for Fatimah\'s Family',
          date: new Date(2023, 11, 8), // Dec 8, 2023
          recipient: 'Fatimah binti Hassan',
          location: 'Chow Kit, Kuala Lumpur',
          category: 'Housing',
          content: 'Fatimah, a widow with three children, was living in a dilapidated house with leaking roof and unsafe conditions. Zakat funds were allocated to repair and renovate their home, ensuring a safe and comfortable living environment.',
          extendedContent: 'The renovation included fixing the roof, repairing walls, upgrading the bathroom facilities, and ensuring proper electrical wiring. The improved living conditions have positively impacted the family\'s health and well-being, with the children now having a proper space to study and sleep.',
          outcomes: [
            'Safe and comfortable housing secured',
            'Children\'s health improved',
            'Better study environment for children',
            'Reduced stress for the family'
          ],
          images: [
            'https://i0.wp.com/www.eduitno.com/wp-content/uploads/2024/11/Apa-Itu-Bantuan-Asnaf.webp?resize=770%2C403&ssl=1'
          ]
        },
        {
          id: 3,
          title: 'Medical Relief for Ibrahim',
          date: new Date(2024, 0, 22), // Jan 22, 2024
          recipient: 'Ibrahim bin Razak',
          location: 'Sentul, Kuala Lumpur',
          category: 'Healthcare',
          content: 'Ibrahim, a 58-year-old former construction worker, required urgent medical treatment for his heart condition but couldn\'t afford the costs. Zakat funds covered his medical expenses, allowing him to receive the necessary treatment.',
          extendedContent: 'After successful treatment, Ibrahim has been able to recover and now works part-time as a security guard. The medical assistance not only saved his life but also enabled him to continue supporting his family. He has expressed profound gratitude for the support received during his most difficult time.',
          outcomes: [
            'Successful medical treatment',
            'Able to return to work',
            'Family financial stability maintained',
            'Improved quality of life'
          ],
          images: [
            'https://i0.wp.com/www.eduitno.com/wp-content/uploads/2024/11/Apa-Itu-Bantuan-Asnaf.webp?resize=770%2C403&ssl=1'
          ]
        },
        {
          id: 4,
          title: 'Nurturing Entrepreneurship: Aishah\'s Small Business',
          date: new Date(2024, 1, 10), // Feb 10, 2024
          recipient: 'Aishah binti Kamal',
          location: 'Petaling Jaya, Selangor',
          category: 'Economic Empowerment',
          content: 'Aishah, a single mother with culinary skills, received zakat funds to start a small food business. The initial capital helped her purchase equipment and ingredients to begin selling traditional kuih and meals from her home.',
          extendedContent: 'Within six months, Aishah\'s business has grown steadily. She now supplies her products to three local cafes and has hired two assistants from her community. The business has not only provided financial independence for her family but also created employment opportunities for others.',
          outcomes: [
            'Successful business establishment',
            'Financial independence achieved',
            'Created jobs for two community members',
            'Expanded to supply local cafes'
          ],
          images: [
            'https://i0.wp.com/www.eduitno.com/wp-content/uploads/2024/11/Apa-Itu-Bantuan-Asnaf.webp?resize=770%2C403&ssl=1',
            'https://i0.wp.com/www.eduitno.com/wp-content/uploads/2024/11/Apa-Itu-Bantuan-Asnaf.webp?resize=770%2C403&ssl=1'
          ]
        }
      ]);
  
      // Sample asnaf location data for the heatmap
      const asnafLocations = [
        // Kuala Lumpur area
        { lat: 3.1590, lng: 101.6969, weight: 8, category: 'Poor (Fakir)' }, // Kampung Baru
        { lat: 3.1590, lng: 101.6980, weight: 7, category: 'Poor (Fakir)' }, // Kampung Baru
        { lat: 3.1580, lng: 101.6975, weight: 6, category: 'Poor (Fakir)' }, // Kampung Baru
        { lat: 3.1570, lng: 101.6965, weight: 5, category: 'Needy (Miskin)' }, // Kampung Baru
        { lat: 3.1390, lng: 101.7169, weight: 9, category: 'Needy (Miskin)' }, // Pudu
        { lat: 3.1380, lng: 101.7160, weight: 8, category: 'Needy (Miskin)' }, // Pudu
        { lat: 3.1370, lng: 101.7150, weight: 7, category: 'Debtor (Gharimin)' }, // Pudu
        { lat: 3.1360, lng: 101.7140, weight: 6, category: 'Needy (Miskin)' }, // Pudu
        { lat: 3.1090, lng: 101.6669, weight: 10, category: 'Poor (Fakir)' }, // PPR Kerinchi
        { lat: 3.1080, lng: 101.6660, weight: 9, category: 'Poor (Fakir)' }, // PPR Kerinchi
        { lat: 3.1070, lng: 101.6650, weight: 8, category: 'Needy (Miskin)' }, // PPR Kerinchi
        { lat: 3.1060, lng: 101.6640, weight: 7, category: 'Needy (Miskin)' }, // PPR Kerinchi
        { lat: 3.1690, lng: 101.7269, weight: 6, category: 'New Muslim (Muallaf)' }, // Kampung Datuk Keramat
        { lat: 3.1680, lng: 101.7260, weight: 5, category: 'New Muslim (Muallaf)' }, // Kampung Datuk Keramat
        { lat: 3.1670, lng: 101.7250, weight: 4, category: 'Debtor (Gharimin)' }, // Kampung Datuk Keramat
        
        // Selangor area
        { lat: 3.2290, lng: 101.7369, weight: 7, category: 'Poor (Fakir)' }, // Taman Melati, Gombak
        { lat: 3.2280, lng: 101.7360, weight: 6, category: 'Poor (Fakir)' }, // Taman Melati, Gombak
        { lat: 3.2270, lng: 101.7350, weight: 5, category: 'Needy (Miskin)' }, // Taman Melati, Gombak
        { lat: 3.0738, lng: 101.5183, weight: 8, category: 'Debtor (Gharimin)' }, // Klang
        { lat: 3.0728, lng: 101.5173, weight: 7, category: 'Debtor (Gharimin)' }, // Klang
        { lat: 3.0718, lng: 101.5163, weight: 6, category: 'Needy (Miskin)' }, // Klang
        { lat: 3.0708, lng: 101.5153, weight: 5, category: 'Poor (Fakir)' }, // Klang
        { lat: 3.0698, lng: 101.5143, weight: 4, category: 'Poor (Fakir)' }, // Klang
        { lat: 3.1136, lng: 101.5841, weight: 9, category: 'Allah\'s Cause (Fi Sabilillah)' }, // Shah Alam
        { lat: 3.1126, lng: 101.5831, weight: 8, category: 'Allah\'s Cause (Fi Sabilillah)' }, // Shah Alam
        { lat: 3.1116, lng: 101.5821, weight: 7, category: 'Zakat Administrator (Amil)' }, // Shah Alam
        { lat: 3.1106, lng: 101.5811, weight: 6, category: 'Zakat Administrator (Amil)' }, // Shah Alam
        
        // Add more locations as needed
      ];
  
      // Timeline data for chart
      const timelineData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Distribution Amount (RM)',
            data: [8500, 9200, 10500, 9800, 11200, 12500, 11800, 13200, 14500, 13800, 15200, 16500],
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.2)',
            tension: 0.4,
            fill: true
          }
        ]
      };
  
      // Initialize Leaflet map
      let map = null;
      let heatLayer = null;
  
      const initMap = () => {
        if (map) map.remove();
        
        // Create map centered on Malaysia
        map = L.map(mapContainer.value).setView([3.140853, 101.693207], 12); // Centered on KL
        
        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        // Filter locations based on category if needed
        let filteredLocations = asnafLocations;
        if (categoryFilter.value !== 'all') {
          filteredLocations = asnafLocations.filter(loc => loc.category === categoryFilter.value);
        }
        
        // Prepare data for heat layer
        const heatData = filteredLocations.map(loc => [
          loc.lat, 
          loc.lng, 
          loc.weight * (heatmapIntensity.value / 5) // Adjust intensity based on slider
        ]);
        
        // Add heat layer
        heatLayer = L.heatLayer(heatData, {
          radius: 25,
          blur: 15,
          maxZoom: 17,
          gradient: {
            0.4: 'blue',
            0.6: 'lime',
            0.8: 'yellow',
            1.0: 'red'
          }
        }).addTo(map);
        
        // Add markers for each location with popups
        filteredLocations.forEach(loc => {
          const marker = L.marker([loc.lat, loc.lng]).addTo(map);
          marker.bindPopup(`
            <strong>Category:</strong> ${loc.category}<br>
            <strong>Density:</strong> ${loc.weight}/10<br>
            <strong>Recipients:</strong> ${Math.floor(loc.weight * 3)} asnaf
          `);
        });
      };
  
      // Initialize category chart
      let categoryChartInstance = null;
      
      const initCategoryChart = () => {
        if (categoryChartInstance) {
          categoryChartInstance.destroy();
        }
        
        const ctx = categoryChart.value.getContext('2d');
        
        const labels = Object.keys(categoryCounts.value);
        const data = Object.values(categoryCounts.value);
        
        categoryChartInstance = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: labels,
            datasets: [{
              data: data,
              backgroundColor: [
                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
                '#9966FF', '#FF9F40', '#8BC34A', '#607D8B'
              ],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'right',
                labels: {
                  font: {
                    size: 12
                  },
                  padding: 20
                }
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.raw || 0;
                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                    const percentage = Math.round((value / total) * 100);
                    return `${label}: ${value} (${percentage}%)`;
                  }
                }
              }
            }
          }
        });
      };
  
      // Initialize timeline
      let timelineChartInstance = null;
      
      const initTimelineChart = () => {
        if (timelineChartInstance) {
          timelineChartInstance.destroy();
        }
        
        const ctx = timelineChart.value.getContext('2d');
        
        timelineChartInstance = new Chart(ctx, {
          type: 'line',
          data: timelineData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Amount (RM)'
                }
              },
              x: {
                title: {
                  display: true,
                  text: 'Month'
                }
              }
            },
            plugins: {
              legend: {
                position: 'top'
              }
            }
          }
        });
      };
      
      // Calculate category percentage
      const calculateCategoryPercentage = (count) => {
        const total = Object.values(categoryCounts.value).reduce((a, b) => a + b, 0);
        return Math.round((count / total) * 100);
      };
      
      // Format date
      const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-MY', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      };
      
      // View story details
      const viewStoryDetails = (story) => {
        selectedStory.value = story;
      };
      
      // View full-size image
      const viewImage = (imageUrl) => {
        selectedImage.value = imageUrl;
      };
      
      // Export data
      const exportData = () => {
        alert('Data export functionality will be implemented here');
        // In a real implementation, this would generate a CSV or PDF report
      };
      
      // Watch for changes in active tab
      watch(activeTab, (newTab) => {
        if (newTab === 'heatmap') {
          // Initialize map on next tick to ensure container is rendered
          setTimeout(() => {
            initMap();
          }, 100);
        } else if (newTab === 'categories') {
          // Initialize category chart
          setTimeout(() => {
            initCategoryChart();
          }, 100);
        } else if (newTab === 'timeline') {
          // Initialize timeline chart
          setTimeout(() => {
            initTimelineChart();
          }, 100);
        }
      });
      
      // Watch for changes in map filters
      watch([categoryFilter, heatmapIntensity], () => {
        if (activeTab.value === 'heatmap') {
          initMap();
        }
      });
      
      // Initialize on component mount
      onMounted(() => {
        // In a real app, fetch data from Firestore
        // For now, we're using the dummy data defined above
        
        // Initialize the first tab (heatmap)
        setTimeout(() => {
          initMap();
        }, 500);
      });
      
      return {
        activeTab,
        categoryFilter,
        timeFilter,
        heatmapIntensity,
        timelineView,
        timelineMetric,
        mapContainer,
        categoryChart,
        timelineChart,
        totalAsnaf,
        asnafGrowthRate,
        totalDistributed,
        distributionGrowthRate,
        coverageAreas,
        impactScore,
        impactGrowthRate,
        highestDensityArea,
        mappedAsnafCount,
        coveragePercentage,
        categoryCounts,
        calculateCategoryPercentage,
        educationSupportCount,
        housingImprovementCount,
        healthcareAccessCount,
        economicEmpowermentCount,
        successStories,
        selectedStory,
        selectedImage,
        formatDate,
        viewStoryDetails,
        viewImage,
        exportData
      };
    }
  };
</script>

<style scoped>
.impact-monitoring {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.export-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.monitoring-dashboard {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.metrics-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.metric-card {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.metric-icon {
  font-size: 2rem;
  color: #4CAF50;
  width: 60px;
  height: 60px;
  background-color: rgba(76, 175, 80, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.metric-content {
  flex: 1;
}

.metric-content h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: #666;
}

.metric-value {
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0 0 0.5rem 0;
  color: #333;
}

.metric-trend {
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.metric-trend.positive {
  color: #4CAF50;
}

.metric-trend.negative {
  color: #f44336;
}

.metric-trend.neutral {
  color: #9e9e9e;
}

.monitoring-tabs {
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

.tab-content {
  padding: 1.5rem 0;
}

/* Map styles */
.map-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.9rem;
  font-weight: 500;
}

.filter-group select,
.filter-group input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.map-container {
  position: relative;
  height: 500px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1.5rem;
  border: 1px solid #eee;
}

#asnafMap {
  height: 100%;
  width: 100%;
}

.map-legend {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background-color: white;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.map-legend h4 {
  margin: 0 0 5px 0;
  font-size: 0.9rem;
}

.legend-gradient {
  height: 10px;
  width: 150px;
  background: linear-gradient(to right, blue, lime, yellow, red);
  margin-bottom: 5px;
}

.legend-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
}

.map-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-item {
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  text-align: center;
}

.stat-item h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: #666;
}

.stat-item p {
  margin: 0;
  font-weight: 600;
  font-size: 1.2rem;
}

/* Category chart styles */
.chart-container {
  height: 400px;
  margin-bottom: 2rem;
}

.category-stats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.category-stat-item {
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  text-align: center;
}

.category-stat-item h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: #666;
}

.category-count {
  margin: 0;
  font-weight: 600;
  font-size: 1.5rem;
}

.category-percentage {
  margin: 0.25rem 0 0 0;
  font-size: 0.9rem;
  color: #4CAF50;
}

/* Timeline controls */
.timeline-controls {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

/* Impact metrics styles */
.impact-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.impact-metric-card {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.impact-metric-card h3 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  color: #333;
}

.impact-value {
  margin-bottom: 1rem;
}

.impact-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: #4CAF50;
}

.impact-label {
  font-size: 1rem;
  color: #666;
  margin-left: 0.5rem;
}

.impact-description {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

/* Success stories styles */
.success-stories {
  margin-top: 2rem;
}

.success-stories h3 {
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
}

.stories-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.story-card {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #4CAF50;
}

.story-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.story-header h4 {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
}

.story-date {
  font-size: 0.8rem;
  color: #666;
}

.story-content {
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  color: #555;
  line-height: 1.5;
}

.story-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.story-category {
  font-size: 0.8rem;
  background-color: #e8f5e9;
  color: #4CAF50;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.view-story-btn {
  background: none;
  border: none;
  color: #2196F3;
  cursor: pointer;
  font-size: 0.9rem;
  text-decoration: underline;
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

.story-modal-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.story-modal-header h2 {
  margin: 0 0 0.5rem 0;
}

.story-recipient,
.story-location {
  margin-bottom: 1rem;
}

.story-full-content {
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.story-outcomes {
  margin-bottom: 1.5rem;
}

.story-outcomes h4 {
  margin-bottom: 0.5rem;
}

.story-outcomes ul {
  padding-left: 1.5rem;
}

.story-outcomes li {
  margin-bottom: 0.5rem;
}

.story-images h4 {
  margin-bottom: 1rem;
}

.story-image-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.story-image {
  height: 150px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
}

.story-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Image viewer modal */
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

/* Responsive adjustments */
@media (max-width: 768px) {
  .monitoring-tabs {
    flex-wrap: wrap;
  }
  
  .tab-btn {
    flex: 1 0 calc(50% - 1rem);
    text-align: center;
  }
  
  .map-container {
    height: 400px;
  }
  
  .chart-container {
    height: 300px;
  }
  
  .stories-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .metric-card {
    flex-direction: column;
    text-align: center;
  }
  
  .tab-btn {
    flex: 1 0 100%;
  }
  
  .map-container {
    height: 300px;
  }
}
</style>