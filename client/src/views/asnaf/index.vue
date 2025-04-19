<script setup>
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import BottomNavigation from '@/components/ui/bottom-navigation/BottomNavigation.vue'
import LocationPicker from '@/components/ui/map/LocationPicker.vue'
// Import the asnaf report store
import { useUserAsnafReportStore } from '@/stores/userAsnafReportStore'

const router = useRouter()
// Use the asnaf report store
const asnafReportStore = useUserAsnafReportStore()

// Destructure values from the store for easier access in the template
const {
  formData,
  isSubmitting,
  isSuccess,
  rewardPoints,
  errors,
  handleLocationSelect,
  handleImageUpload,
  removeImage,
} = asnafReportStore

// Submit form wrapper
const submitReport = async () => {
  const success = await asnafReportStore.submitReport()

  if (success) {
    // Reset form after 3 seconds and redirect
    setTimeout(() => {
      router.push('/')
    }, 3000)
  } else {
    alert('Maaf, terdapat ralat semasa menghantar laporan. Sila cuba lagi.')
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
          <p class="text-green-700 mb-4">
            Terima kasih atas laporan anda. Kami akan menyemak maklumat yang diberikan secepat
            mungkin.
          </p>

          <!-- Reward Points Banner -->
          <div class="mt-2 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <div class="text-yellow-800 font-medium">
              🎉 Anda mendapat {{ rewardPoints }} mata ganjaran!
            </div>
            <p class="text-xs text-yellow-700 mt-1">Mata telah ditambah ke baki ganjaran anda</p>
          </div>
        </CardContent>
      </Card>

      <div v-else>
        <p class="text-sm text-gray-600 mb-4">
          Sila isi borang di bawah untuk melaporkan keluarga asnaf yang memerlukan bantuan di
          kawasan anda.
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
                <Input
                  id="name"
                  v-model="formData.name"
                  placeholder="Masukkan nama asnaf"
                  :class="errors.name ? 'border-red-500' : ''"
                />
                <p v-if="errors.name" class="text-red-500 text-xs mt-1">{{ errors.name }}</p>
              </div>

              <!-- Address -->
              <div class="mb-4">
                <label class="block text-sm font-medium mb-1" for="address">Alamat</label>
                <Input
                  id="address"
                  v-model="formData.address"
                  type="textarea"
                  placeholder="Masukkan alamat lengkap"
                  :class="errors.address ? 'border-red-500' : ''"
                  rows="2"
                />
                <p v-if="errors.address" class="text-red-500 text-xs mt-1">{{ errors.address }}</p>
              </div>

              <!-- Phone Number -->
              <div class="mb-4">
                <label class="block text-sm font-medium mb-1" for="phoneNumber"
                  >Nombor Telefon (jika ada)</label
                >
                <Input
                  id="phoneNumber"
                  v-model="formData.phoneNumber"
                  type="tel"
                  placeholder="Contoh: 0123456789"
                />
              </div>

              <!-- Description -->
              <div class="mb-4">
                <label class="block text-sm font-medium mb-1" for="description"
                  >Penerangan Situasi</label
                >
                <Input
                  id="description"
                  v-model="formData.description"
                  type="textarea"
                  placeholder="Sila terangkan situasi asnaf ini"
                  :class="errors.description ? 'border-red-500' : ''"
                  rows="3"
                />
                <p v-if="errors.description" class="text-red-500 text-xs mt-1">
                  {{ errors.description }}
                </p>
              </div>

              <!-- Location with Map -->
              <div class="mb-4">
                <label class="block text-sm font-medium mb-1">Lokasi</label>
                <div class="border rounded-md p-2" :class="errors.location ? 'border-red-500' : ''">
                  <LocationPicker
                    v-model="formData.location"
                    @update:modelValue="handleLocationSelect"
                  />
                </div>
                <p v-if="errors.location" class="text-red-500 text-xs mt-1">
                  {{ errors.location }}
                </p>
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
