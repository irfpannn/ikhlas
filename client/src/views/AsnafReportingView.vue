<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import BottomNavigation from '@/components/ui/bottom-navigation/BottomNavigation.vue'

const router = useRouter()
const isSubmitting = ref(false)
const isSuccess = ref(false)

// Form data
const formData = ref({
  name: '',
  address: '',
  phoneNumber: '',
  description: '',
  location: null,
  images: []
})

// Validation errors
const errors = ref({})

// Handle location selection
const handleLocationSelect = () => {
  // In a real implementation, this would open a map interface
  // For now, we'll just set a mock location
  formData.value.location = {
    latitude: 3.1390,
    longitude: 101.6869,
    address: 'Kuala Lumpur, Malaysia'
  }
}

// Handle image upload
const handleImageUpload = (event) => {
  const files = event.target.files
  if (!files.length) return
  
  // Preview images (in a real app, you would upload these to a server)
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const reader = new FileReader()
    
    reader.onload = (e) => {
      formData.value.images.push({
        id: Date.now() + i,
        url: e.target.result,
        file: file
      })
    }
    
    reader.readAsDataURL(file)
  }
}

// Remove image
const removeImage = (imageId) => {
  formData.value.images = formData.value.images.filter(img => img.id !== imageId)
}

// Validate form
const validateForm = () => {
  errors.value = {}
  
  if (!formData.value.name.trim()) {
    errors.value.name = 'Nama diperlukan'
  }
  
  if (!formData.value.address.trim()) {
    errors.value.address = 'Alamat diperlukan'
  }
  
  if (!formData.value.description.trim()) {
    errors.value.description = 'Penerangan diperlukan'
  }
  
  if (!formData.value.location) {
    errors.value.location = 'Lokasi diperlukan'
  }
  
  return Object.keys(errors.value).length === 0
}

// Submit form
const submitReport = async () => {
  if (!validateForm()) return
  
  isSubmitting.value = true
  
  try {
    // In a real implementation, you would send the data to your backend
    // For now, we'll just simulate a successful submission
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Show success message
    isSuccess.value = true
    
    // Reset form after 3 seconds and redirect
    setTimeout(() => {
      router.push('/')
    }, 3000)
  } catch (error) {
    console.error('Error submitting report:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-100 pb-20">
    <!-- Header -->
    <div class="bg-white p-4 flex items-center shadow-sm">
      <button class="mr-2" @click="router.go(-1)">
        <span class="text-xl">←</span>
      </button>
      <h1 class="text-lg font-semibold">Laporan Asnaf</h1>
    </div>

    <!-- Main content -->
    <div class="p-4">
      <Card v-if="isSuccess" class="mb-4 bg-green-50 border-green-200">
        <CardContent class="p-6 text-center">
          <div class="text-4xl mb-4">✅</div>
          <h2 class="text-lg font-semibold text-green-800 mb-2">Laporan Berjaya Dihantar</h2>
          <p class="text-green-700">Terima kasih atas laporan anda. Kami akan menyemak maklumat yang diberikan secepat mungkin.</p>
        </CardContent>
      </Card>

      <div v-else>
        <p class="text-sm text-gray-600 mb-4">
          Sila isi borang di bawah untuk melaporkan keluarga asnaf yang memerlukan bantuan di kawasan anda.
        </p>

        <Card class="mb-4">
          <CardHeader>
            <CardTitle class="text-base">Maklumat Asnaf</CardTitle>
          </CardHeader>
          <CardContent>
            <form @submit.prevent="submitReport">
              <!-- Name -->
              <div class="mb-4">
                <label class="block text-sm font-medium mb-1" for="name">Nama Asnaf</label>
                <input
                  id="name"
                  v-model="formData.name"
                  type="text"
                  class="w-full p-2 border rounded-md"
                  placeholder="Masukkan nama asnaf"
                />
                <p v-if="errors.name" class="text-red-500 text-xs mt-1">{{ errors.name }}</p>
              </div>

              <!-- Address -->
              <div class="mb-4">
                <label class="block text-sm font-medium mb-1" for="address">Alamat</label>
                <textarea
                  id="address"
                  v-model="formData.address"
                  class="w-full p-2 border rounded-md"
                  rows="2"
                  placeholder="Masukkan alamat lengkap"
                ></textarea>
                <p v-if="errors.address" class="text-red-500 text-xs mt-1">{{ errors.address }}</p>
              </div>

              <!-- Phone Number -->
              <div class="mb-4">
                <label class="block text-sm font-medium mb-1" for="phoneNumber">Nombor Telefon (jika ada)</label>
                <input
                  id="phoneNumber"
                  v-model="formData.phoneNumber"
                  type="tel"
                  class="w-full p-2 border rounded-md"
                  placeholder="Contoh: 0123456789"
                />
              </div>

              <!-- Description -->
              <div class="mb-4">
                <label class="block text-sm font-medium mb-1" for="description">Penerangan Situasi</label>
                <textarea
                  id="description"
                  v-model="formData.description"
                  class="w-full p-2 border rounded-md"
                  rows="3"
                  placeholder="Sila terangkan situasi asnaf ini"
                ></textarea>
                <p v-if="errors.description" class="text-red-500 text-xs mt-1">{{ errors.description }}</p>
              </div>

              <!-- Location -->
              <div class="mb-4">
                <label class="block text-sm font-medium mb-1">Lokasi</label>
                <div 
                  class="border rounded-md p-3 bg-gray-50 cursor-pointer flex items-center"
                  @click="handleLocationSelect"
                >
                  <div v-if="formData.location" class="flex-1">
                    <p class="font-medium">{{ formData.location.address }}</p>
                    <p class="text-xs text-gray-500">
                      Lat: {{ formData.location.latitude }}, Long: {{ formData.location.longitude }}
                    </p>
                  </div>
                  <div v-else class="flex-1 text-gray-500">
                    Klik untuk pilih lokasi di peta
                  </div>
                  <span class="text-xl">📍</span>
                </div>
                <p v-if="errors.location" class="text-red-500 text-xs mt-1">{{ errors.location }}</p>
              </div>

              <!-- Image Upload -->
              <div class="mb-4">
                <label class="block text-sm font-medium mb-1">Gambar (Bukti)</label>
                <div class="border border-dashed rounded-md p-4 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    class="hidden"
                    id="image-upload"
                    @change="handleImageUpload"
                  />
                  <label for="image-upload" class="cursor-pointer">
                    <div class="text-2xl mb-2">📷</div>
                    <p class="text-sm text-gray-600">Klik untuk muat naik gambar</p>
                    <p class="text-xs text-gray-500">Anda boleh muat naik beberapa gambar</p>
                  </label>
                </div>

                <!-- Image Previews -->
                <div v-if="formData.images.length > 0" class="mt-3 grid grid-cols-3 gap-2">
                  <div 
                    v-for="image in formData.images" 
                    :key="image.id" 
                    class="relative rounded-md overflow-hidden h-24"
                  >
                    <img :src="image.url" class="w-full h-full object-cover" />
                    <button 
                      type="button"
                      @click="removeImage(image.id)" 
                      class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button 
              @click="submitReport" 
              class="w-full bg-[#75a868] hover:bg-[#75a868]/90"
              :disabled="isSubmitting"
            >
              <span v-if="isSubmitting">Menghantar...</span>
              <span v-else>Hantar Laporan</span>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<style scoped>
/* Custom styles */
</style> 