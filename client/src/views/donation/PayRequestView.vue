<template>
  <div class="flex flex-col min-h-screen bg-gray-100">
    <!-- Header -->
    <div class="bg-white p-4 sticky top-0 z-10 border-b">
      <h1 class="text-lg font-medium text-center">Bayar Permintaan Derma</h1>
    </div>

    <!-- Content -->
    <div class="p-4 flex-grow">
      <Card v-if="!paymentSuccess" class="mb-4">
        <CardHeader>
          <CardTitle>Permintaan Derma</CardTitle>
          <CardDescription v-if="requestNote">Nota: {{ requestNote }}</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="text-center">
            <p class="text-sm text-gray-600">Jumlah diminta:</p>
            <p class="text-3xl font-bold text-gray-900">RM{{ requestedAmount }}</p>
          </div>

          <Separator />

          <div>
            <h3 class="font-medium mb-3">Pilih Kaedah Pembayaran</h3>
            <div class="space-y-3">
              <div
                class="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer"
                @click="paymentMethod = 'fpx'"
              >
                <input type="radio" id="fpx" value="fpx" v-model="paymentMethod" class="h-4 w-4" />
                <label for="fpx" class="flex-1 cursor-pointer">
                  <div class="flex items-center justify-between">
                    <span>Perbankan Dalam Talian</span>
                    <span class="text-xs bg-gray-100 px-2 py-1 rounded">FPX</span>
                  </div>
                </label>
              </div>
              <div
                class="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer"
                @click="paymentMethod = 'card'"
              >
                <input
                  type="radio"
                  id="card"
                  value="card"
                  v-model="paymentMethod"
                  class="h-4 w-4"
                />
                <label for="card" class="flex-1 cursor-pointer">
                  <div class="flex items-center justify-between">
                    <span>Kad Kredit/Debit</span>
                    <div class="flex space-x-1">
                      <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Visa</span>
                      <span class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Master</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <Button
            @click="processPayment"
            class="w-full h-12 mt-4"
            :disabled="!paymentMethod || processing"
          >
            <span v-if="processing">Memproses...</span>
            <span v-else>Bayar RM{{ requestedAmount }}</span>
          </Button>
        </CardContent>
      </Card>

      <!-- Success Message -->
      <Card v-else class="text-center">
        <CardContent class="p-6">
          <div class="text-green-500 mb-4">
            <svg
              class="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <CardTitle class="mb-2">Pembayaran Berjaya!</CardTitle>
          <CardDescription
            >Terima kasih atas sumbangan anda sebanyak RM{{ requestedAmount }}.</CardDescription
          >
          <Button variant="outline" class="mt-6" @click="closePage">Tutup</Button>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { toast } from 'vue-sonner'

const route = useRoute()
const requestedAmount = ref('0.00')
const requestNote = ref('')
const paymentMethod = ref('fpx')
const processing = ref(false)
const paymentSuccess = ref(false)

onMounted(() => {
  const amount = route.query.amount
  const note = route.query.note
  const requestId = route.params.requestId

  console.log('Request ID:', requestId) // Log for debugging

  if (amount && !isNaN(parseFloat(amount))) {
    requestedAmount.value = parseFloat(amount).toFixed(2)
  } else {
    toast.error('Jumlah permintaan tidak sah.')
    // Handle invalid amount, maybe redirect or show error message
  }
  if (note) {
    requestNote.value = decodeURIComponent(note)
  }
})

const processPayment = () => {
  if (!paymentMethod.value) {
    toast.error('Sila pilih kaedah pembayaran.')
    return
  }

  processing.value = true
  console.log(
    `Processing payment of RM${requestedAmount.value} for request ${route.params.requestId} via ${paymentMethod.value}`,
  )

  // Simulate API call to backend to process payment
  setTimeout(() => {
    processing.value = false
    paymentSuccess.value = true
    toast.success('Pembayaran berjaya!')
    // TODO: Notify the requester via backend
  }, 1500)
}

const closePage = () => {
  // Attempt to close the tab/window, might not work depending on browser security
  window.location.href = '/'
  // Fallback or alternative action if window.close() fails
  // Maybe redirect to a generic thank you page or the app's home if appropriate
  // window.location.href = '/';
}
</script>
