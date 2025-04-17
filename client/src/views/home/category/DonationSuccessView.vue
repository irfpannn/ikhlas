<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useDonationStore } from '@/stores/donationStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const route = useRoute()
const router = useRouter()
const donationStore = useDonationStore()

const donationId = route.params.id
const donationAmount = route.query.amount
const donationCurrency = ref(route.query.currency || 'RM')

const { currentDonation, loading: storeLoading, error: storeError } = storeToRefs(donationStore)

onMounted(() => {
  // Fetch donation details if not already loaded
  if (!currentDonation.value || currentDonation.value.id !== donationId) {
    donationStore.fetchDonationById(donationId)
  }
})

// Use currentDonation from the store
const donation = computed(() => currentDonation.value || {}) // Renamed from campaign

const formatAmount = (amount) => {
  if (donationCurrency.value === 'RM') {
    return `RM${amount.toLocaleString()}`
  } else if (donationCurrency.value === 'BTC') {
    return `${amount} BTC`
  } else if (donationCurrency.value === 'ETH') {
    return `${amount} ETH`
  } else if (donationCurrency.value === 'USDT') {
    return `${amount} USDT`
  }
  return ''
}

const goToHome = () => {
  router.push('/')
}

const viewReceipt = () => {
  // In a real app, this would generate and download a PDF receipt
  alert('Fungsi muat turun resit akan dilaksanakan di sini')
}

const shareDonation = () => {
  // In a real app, this would open a share dialog
  alert('Fungsi kongsi akan dilaksanakan di sini')
}
</script>

<template>
  <div class="flex flex-col min-h-dvh bg-gray-100 pb-20">
    <!-- Success Animation/Icon -->
    <div class="flex-grow flex flex-col items-center justify-center text-center p-6">
      <div class="bg-green-100 rounded-full p-4 mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-12 w-12 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 class="text-2xl font-semibold mb-2">Derma Berjaya!</h1>
      <p class="text-gray-600 mb-6">
        Terima kasih atas sumbangan ikhlas anda sebanyak
        <span class="font-medium text-green-700">{{ formatAmount(donationAmount) }}</span
        >.
      </p>

      <!-- Donation Summary Card -->
      <Card
        v-if="!storeLoading && !storeError && donation.id"
        class="w-full max-w-sm text-left shadow-md mb-6"
      >
        <CardHeader>
          <CardTitle class="text-base">Ringkasan Derma</CardTitle>
        </CardHeader>
        <CardContent class="text-sm space-y-2">
          <div class="flex justify-between">
            <span class="text-gray-500">Kempen:</span>
            <span class="font-medium text-right">{{ donation.title }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Organisasi:</span>
            <span class="font-medium text-right">{{ donation.organization }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Jumlah Derma:</span>
            <span class="font-medium text-green-600">{{ formatAmount(donationAmount) }}</span>
          </div>
        </CardContent>
      </Card>
      <!-- Loading/Error state for card -->
      <div v-else-if="storeLoading" class="w-full max-w-sm mb-6">
        <Skeleton class="h-32 w-full" />
      </div>
      <div v-else-if="storeError" class="w-full max-w-sm mb-6">
        <Alert variant="destructive">
          <AlertDescription>Tidak dapat memuatkan ringkasan derma.</AlertDescription>
        </Alert>
      </div>

      <!-- Action Buttons -->
      <div class="w-full max-w-sm space-y-3">
        <Button @click="viewReceipt" variant="outline" class="w-full">Lihat Resit</Button>
        <Button @click="shareDonation" variant="outline" class="w-full">Kongsi Derma Ini</Button>
        <Button @click="goToHome" class="w-full bg-emerald-600 hover:bg-emerald-700">
          Kembali ke Halaman Utama
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom styles if needed */
</style>
