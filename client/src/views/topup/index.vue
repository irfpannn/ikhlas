<template>
  <div class="flex flex-col min-h-screen bg-gray-100 pb-20">
    <!-- Header -->
    <div class="bg-white p-4 sticky top-0 z-10 border-b">
      <div class="flex items-center">
        <Button variant="ghost" class="text-gray-700 hover:bg-gray-100 mr-2 p-2" @click="goBack">
          <span class="text-xl">←</span>
        </Button>
        <h1 class="text-lg font-medium">Tambah Nilai</h1>
      </div>
    </div>

    <!-- Content -->
    <div class="p-4 flex-grow">
      <Card class="mb-4">
        <CardHeader>
          <CardTitle>Pilih Jumlah Tambah Nilai</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid grid-cols-3 gap-3">
            <Button
              v-for="amount in presetAmounts"
              :key="amount"
              @click="selectAmount(amount)"
              :variant="selectedAmount === amount ? 'default' : 'outline'"
              class="h-12"
            >
              RM{{ amount }}
            </Button>
          </div>
          <div>
            <Label for="customAmount">Atau masukkan jumlah lain</Label>
            <Input
              id="customAmount"
              type="number"
              v-model="customAmountInput"
              placeholder="RM"
              class="mt-1"
              @input="selectCustomAmount"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pilih Kaedah Pembayaran</CardTitle>
        </CardHeader>
        <CardContent class="space-y-3">
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
            <input type="radio" id="card" value="card" v-model="paymentMethod" class="h-4 w-4" />
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
        </CardContent>
      </Card>
    </div>

    <!-- Footer Button -->
    <div class="p-4 bg-white sticky bottom-0 border-t">
      <Button
        @click="processTopUp"
        class="w-full h-12"
        :disabled="!selectedAmount || !paymentMethod || processing"
      >
        <span v-if="processing">Memproses...</span>
        <span v-else>Tambah Nilai RM{{ selectedAmount }}</span>
      </Button>
    </div>

    <BottomNavigation />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BottomNavigation } from '@/components/ui/bottom-navigation'
import { toast } from 'vue-sonner'

const router = useRouter()
const selectedAmount = ref(null)
const customAmountInput = ref('')
const paymentMethod = ref('fpx')
const processing = ref(false)

const presetAmounts = [10, 20, 50, 100, 200, 500]

const goBack = () => {
  router.go(-1)
}

const selectAmount = (amount) => {
  selectedAmount.value = amount
  customAmountInput.value = ''
}

const selectCustomAmount = () => {
  const amount = parseFloat(customAmountInput.value)
  if (!isNaN(amount) && amount > 0) {
    selectedAmount.value = amount
  } else {
    selectedAmount.value = null
  }
}

const processTopUp = () => {
  if (!selectedAmount.value || !paymentMethod.value) {
    toast.error('Sila pilih jumlah dan kaedah pembayaran.')
    return
  }

  processing.value = true
  console.log(`Processing top-up of RM${selectedAmount.value} via ${paymentMethod.value}`)

  // Simulate API call
  setTimeout(() => {
    processing.value = false
    toast.success(`Tambah nilai RM${selectedAmount.value} berjaya!`)
    // TODO: Update user balance in store/backend
    router.push('/') // Redirect to home after successful top-up
  }, 1500)
}
</script>
