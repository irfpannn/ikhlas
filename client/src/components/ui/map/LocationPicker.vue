<template>
  <div>
    <div class="relative">
      <div ref="mapContainer" class="map-container h-48 rounded-md"></div>
      <!-- Locate me button -->
      <button
        type="button"
        @click="useCurrentLocation"
        class="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-md z-10 hover:bg-gray-100 focus:outline-none"
        title="Gunakan lokasi saya"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="text-blue-600"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      </button>
    </div>
    <div class="flex justify-between items-center mt-1">
      <p v-if="selectedLocation" class="text-xs text-gray-600">
        {{ selectedLocation.address || 'Lokasi dipilih' }} ({{
          selectedLocation.latitude.toFixed(4)
        }}, {{ selectedLocation.longitude.toFixed(4) }})
      </p>
      <p v-else class="text-xs text-gray-500">Klik pada peta untuk pilih lokasi</p>
      <div v-if="isLocating" class="text-xs text-blue-600">Mencari lokasi...</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Define props
const props = defineProps({
  modelValue: {
    type: Object,
    default: null,
  },
  center: {
    type: Object,
    default: () => ({ lat: 3.139, lng: 101.6869 }), // Default to KL
  },
})

// Define emits
const emit = defineEmits(['update:modelValue'])

// Internal state
const mapContainer = ref(null)
const map = ref(null)
const marker = ref(null)
const isLocating = ref(false)
const currentLocationMarker = ref(null)

// Computed props
const selectedLocation = computed(() => props.modelValue)

// Initialize map
onMounted(() => {
  // Create map
  map.value = L.map(mapContainer.value).setView([props.center.lat, props.center.lng], 13)

  // Add tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map.value)

  // Set up click handler
  map.value.on('click', handleMapClick)

  // If already has a location, show marker
  if (props.modelValue) {
    marker.value = L.marker([props.modelValue.latitude, props.modelValue.longitude]).addTo(
      map.value,
    )
  }

  // Get current location immediately when component mounts
  useCurrentLocation()
})

// Cleanup on component unmount
onUnmounted(() => {
  if (map.value) {
    map.value.remove()
  }
})

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newLocation) => {
    if (!map.value) return

    if (newLocation) {
      if (marker.value) {
        marker.value.setLatLng([newLocation.latitude, newLocation.longitude])
      } else {
        marker.value = L.marker([newLocation.latitude, newLocation.longitude]).addTo(map.value)
      }
      map.value.setView([newLocation.latitude, newLocation.longitude], 15)
    } else if (marker.value) {
      marker.value.remove()
      marker.value = null
    }
  },
  { deep: true },
)

// Use current location
const useCurrentLocation = async () => {
  if (!navigator.geolocation) {
    console.log('Geolocation is not supported by this browser')
    return
  }

  isLocating.value = true

  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      })
    })

    const { latitude, longitude } = position.coords

    // Move the map to the current location
    map.value.setView([latitude, longitude], 15)

    // If we don't have a selection marker yet, create one at current location
    if (!marker.value) {
      marker.value = L.marker([latitude, longitude]).addTo(map.value)

      // Also update the selected location
      try {
        const address = await reverseGeocode(latitude, longitude)
        emit('update:modelValue', {
          latitude,
          longitude,
          address,
        })
      } catch (error) {
        console.error('Error geocoding current location:', error)
        emit('update:modelValue', {
          latitude,
          longitude,
          address: 'Lokasi semasa anda',
        })
      }
    }

    // Show a blue circle for current location accuracy
    if (currentLocationMarker.value) {
      map.value.removeLayer(currentLocationMarker.value)
    }

    currentLocationMarker.value = L.circle([latitude, longitude], {
      radius: position.coords.accuracy,
      color: '#2563eb',
      fillColor: '#3b82f6',
      fillOpacity: 0.15,
      weight: 1,
    }).addTo(map.value)
  } catch (error) {
    console.error('Error getting current location:', error)
    alert('Tidak dapat mengesan lokasi anda. Sila pastikan anda telah memberi kebenaran lokasi.')
  } finally {
    isLocating.value = false
  }
}

// Reverse geocode coordinates to address
const reverseGeocode = async (lat, lng) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
    { headers: { 'Accept-Language': 'ms' } },
  )
  const data = await response.json()
  return data.display_name || 'Lokasi tidak dikenali'
}

// Handle map click to set location
const handleMapClick = async (e) => {
  const { lat, lng } = e.latlng

  // If we already have a marker, move it
  if (marker.value) {
    marker.value.setLatLng([lat, lng])
  } else {
    marker.value = L.marker([lat, lng]).addTo(map.value)
  }

  try {
    const address = await reverseGeocode(lat, lng)

    // Update the model value
    emit('update:modelValue', {
      latitude: lat,
      longitude: lng,
      address: address,
    })
  } catch (error) {
    console.error('Error geocoding location:', error)

    // Still update with coordinates even if geocoding fails
    emit('update:modelValue', {
      latitude: lat,
      longitude: lng,
      address: 'Lokasi dipilih',
    })
  }
}
</script>

<style scoped>
.map-container {
  z-index: 1;
}
</style>
