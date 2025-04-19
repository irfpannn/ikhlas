<template>
  <div class="asnaf-heatmap-container">
    <div class="heatmap-header">
      <h3>Asnaf Geographic Distribution</h3>
      <div class="heatmap-filters">
        <select v-model="yearFilter" class="filter-select" @change="updateHeatmap">
          <option value="2024">2024</option>
          <option value="2023">2023</option>
          <option value="2022">2022</option>
        </select>
        <select v-model="categoryFilter" class="filter-select" @change="updateHeatmap">
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
        <div class="heatmap-legend">
          <span class="legend-label">Density:</span>
          <div class="legend-gradient"></div>
          <span class="legend-low">Low</span>
          <span class="legend-high">High</span>
        </div>
      </div>
    </div>
    <div ref="mapContainer" class="heatmap-container"></div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import 'leaflet/dist/leaflet.css';

export default {
  name: 'AsnafHeatmap',
  props: {
    locations: {
      type: Array,
      required: true
    }
  },
  setup(props) {
    const mapContainer = ref(null);
    let map = null;
    let heatLayer = null;
    let leaflet = null;
    let heatPlugin = null;
    let isMapInitialized = false;
    const categoryFilter = ref('all');
    const yearFilter = ref('2024');

    // Generate dummy data with decreasing impact over years
    const generateYearBasedData = (baseLocations) => {
      const yearMultipliers = {
        '2024': 0.4,
        '2023': 0.7,
        '2022': 1.0
      };

      return baseLocations.map(location => ({
        ...location,
        weight: (location.weight || 10) * yearMultipliers[yearFilter.value]
      }));
    };

    const filteredLocations = () => {
      let filtered = props.locations;
      
      // Apply year-based weight adjustment
      filtered = generateYearBasedData(filtered);

      // Apply category filter
      if (categoryFilter.value !== 'all') {
        filtered = filtered.filter(location => 
          location.category === categoryFilter.value
        );
      }

      return filtered;
    };

    const initMap = async () => {
      try {
        // Dynamically import Leaflet to avoid SSR issues
        if (!leaflet) {
          leaflet = await import('leaflet');
        }
        
        // Wait for the DOM to be fully rendered
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check if container exists and has dimensions
        if (!mapContainer.value || 
            mapContainer.value.clientWidth === 0 || 
            mapContainer.value.clientHeight === 0) {
          console.warn('Map container has no dimensions, retrying...');
          setTimeout(initMap, 200);
          return;
        }

        // Initialize map if not already done
        if (!map) {
          map = leaflet.map(mapContainer.value).setView([3.1390, 101.7169], 11);
          
          leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map);
          
          // Force a resize after map is created to ensure proper dimensions
          setTimeout(() => {
            map.invalidateSize();
          }, 100);
        }
        
        isMapInitialized = true;
        await loadHeatmapPlugin();
        updateHeatmap();
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    const loadHeatmapPlugin = async () => {
      try {
        if (!heatPlugin) {
          // Import the heatmap plugin
          heatPlugin = await import('leaflet.heat');
        }
        return true;
      } catch (error) {
        console.error('Error loading heatmap plugin:', error);
        return false;
      }
    };

    const updateHeatmap = () => {
      try {
        if (!isMapInitialized || !map || !heatPlugin || filteredLocations().length === 0) {
          return;
        }

        // Remove existing heat layer if it exists
        if (heatLayer) {
          map.removeLayer(heatLayer);
        }

        // Format data for heatmap
        const heatData = filteredLocations().map(loc => {
          return [loc.lat, loc.lng, loc.weight || 10];
        });

        // Create and add the heat layer
        heatLayer = window.L.heatLayer(heatData, {
          radius: 25,
          blur: 15,
          maxZoom: 17,
          gradient: { 0.4: 'blue', 0.6: 'lime', 0.8: 'yellow', 1: 'red' }
        }).addTo(map);

        // Fit map to bounds of heatmap data
        if (heatData.length > 0) {
          const bounds = window.L.latLngBounds(heatData.map(point => [point[0], point[1]]));
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      } catch (error) {
        console.error('Error creating heatmap:', error);
      }
    };

    // Watch for changes in locations
    watch(() => props.locations, () => {
      if (isMapInitialized) {
        updateHeatmap();
      }
    }, { deep: true });

    onMounted(() => {
      // Initialize map with a slight delay to ensure container is rendered
      setTimeout(initMap, 300);
    });

    onBeforeUnmount(() => {
      // Clean up map instance
      if (map) {
        map.remove();
        map = null;
        heatLayer = null;
      }
    });

    return {
      mapContainer,
      categoryFilter,
      yearFilter,
      updateHeatmap
    };
  }
};
</script>

<style scoped>
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
  align-items: center;
}

.filter-select {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
  background-color: white;
  min-width: 120px;
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
  height: 100%;
  width: 100%;
  min-height: 400px;
}

/* Ensure Leaflet elements are properly sized */
:deep(.leaflet-container) {
  width: 100% !important;
  height: 100% !important;
}

/* Fix Leaflet rendering issues */
:deep(.leaflet-pane) {
  z-index: 1;
}

:deep(.leaflet-tile),
:deep(.leaflet-marker-icon),
:deep(.leaflet-marker-shadow),
:deep(.leaflet-tile-container),
:deep(.leaflet-pane > svg),
:deep(.leaflet-pane > canvas),
:deep(.leaflet-zoom-box),
:deep(.leaflet-image-layer),
:deep(.leaflet-layer) {
  position: absolute;
  left: 0;
  top: 0;
}
</style> 