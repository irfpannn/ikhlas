<!-- filepath: c:\Users\User\Desktop\ikhlas\client\src\views\ZakatWangSimpananView.vue -->
<template>
  <div class="flex flex-col min-h-screen bg-gray-100 pb-6">
    <!-- Header -->
    <div class="bg-white p-4 flex items-center shadow-sm">
      <button @click="goBack" class="mr-4">
        <span class="text-xl">←</span>
      </button>
      <h1 class="text-lg font-semibold">Kalkulator Zakat Wang Simpanan</h1>
    </div>

    <!-- Main content -->
    <div class="p-4">
      <Card class="mb-4">
        <CardHeader>
          <CardTitle class="text-center">Masukkan Maklumat Simpanan</CardTitle>
        </CardHeader>
        <CardContent class="p-4 space-y-4">
          <div class="input-section">
            <label for="simpanan" class="block text-sm font-medium text-gray-700 mb-1">
              Baki Akhir Simpanan Setahun (RM):
            </label>
            <div class="flex items-center">
              <span class="text-right mr-2 text-gray-500">RM</span>
              <Input
                id="simpanan"
                type="number"
                v-model.number="simpanan"
                placeholder="Contoh: 25000"
                min="0"
                step="0.01"
              />
            </div>
            <p v-if="errorMessage" class="text-red-500 text-xs mt-1">{{ errorMessage }}</p>
          </div>

          <Separator v-if="showResult" class="my-4" />

          <div v-if="showResult" class="result-section space-y-2">
            <h2 class="text-center font-medium text-lg mb-3">Hasil Kiraan:</h2>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Jumlah Baki Simpanan Setahun:</span>
              <span class="font-medium">{{ formatCurrency(simpananInput) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Nisab Semasa:</span>
              <span class="font-medium">{{ formatCurrency(nisab) }}</span>
            </div>
            <Separator class="my-2" />
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Layak Dikenakan Zakat?</span>
              <span :class="['font-semibold', layakZakat ? 'text-green-700' : 'text-red-600']">
                {{ layakZakat ? 'Ya' : 'Tidak' }}
              </span>
            </div>
            <div v-if="layakZakat" class="flex justify-between items-center pt-1">
              <span class="text-sm font-semibold text-gray-700">Jumlah Zakat Simpanan:</span>
              <span class="font-bold text-lg text-green-800">{{
                formatCurrency(jumlahZakat)
              }}</span>
            </div>
            <p v-else class="text-center text-sm text-gray-500 pt-2">
              Tiada zakat dikenakan kerana tidak cukup nisab.
            </p>
          </div>
        </CardContent>
      </Card>

      <!-- Action buttons -->
      <div class="flex justify-center gap-4">
        <Button @click="resetForm" variant="outline" class="border-[#75a868] text-[#75a868]">
          Reset
        </Button>
        <Button @click="kiraZakatSimpanan" class="bg-[#75a868] hover:bg-[#75a868]/90 text-white">
          Kira Zakat
        </Button>
        <Button @click="bayarZakatSimpanan" class="bg-[#217e0a] hover:bg-[#217e0a]/90 text-white">
          Bayar Zakat
        </Button>
        <!-- Optional: Add Pay button if needed -->
        <!-- <Button @click="goToPayment" class="bg-[#217e0a] hover:bg-[#217e0a]/90 text-white">
          Bayar Zakat
        </Button> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Separator from '@/components/ui/separator/Separator.vue'
import { toast } from 'vue-sonner' // Optional: if you want notifications

const router = useRouter()

const simpanan = ref(null)
const nisab = ref(23000.0) // Example Nisab value, update as needed
const layakZakat = ref(false)
const jumlahZakat = ref(0)
const showResult = ref(false)
const simpananInput = ref(0) // To store the value used in calculation
const errorMessage = ref('')

// Go back function
const goBack = () => {
  router.go('-1') // Adjust route as needed
}

// Format currency function (ensure this is correctly implemented)
const formatCurrency = (value) => {
  if (value === null || isNaN(value)) {
    // Return a default or placeholder value for invalid numbers
    return 'RM 0.00'
  }
  return new Intl.NumberFormat('ms-MY', {
    style: 'currency',
    currency: 'MYR',
  }).format(value)
}

const kiraZakatSimpanan = () => {
  errorMessage.value = '' // Clear previous error
  // Ensure results are hidden initially if re-calculating
  showResult.value = false

  // Validate input
  const currentSimpanan = simpanan.value // Use a local variable for checks
  if (currentSimpanan === null || currentSimpanan < 0 || isNaN(currentSimpanan)) {
    errorMessage.value = 'Sila masukkan jumlah simpanan yang sah.'
    // Do not proceed to show results if input is invalid
    return
  }

  // Store the valid input value for display in results
  simpananInput.value = currentSimpanan

  // Perform calculations
  layakZakat.value = simpananInput.value >= nisab.value

  if (layakZakat.value) {
    jumlahZakat.value = simpananInput.value * 0.025
  } else {
    jumlahZakat.value = 0
  }

  // Only show results section if input was valid and calculation is done
  showResult.value = true

  // Optional: Add toast notification
  toast('Pengiraan Zakat Simpanan Selesai', {
    description: layakZakat.value
      ? `Jumlah zakat: ${formatCurrency(jumlahZakat.value)}`
      : 'Tidak layak dikenakan zakat.',
    duration: 3000,
  })
}

// Reset form function
const resetForm = () => {
  simpanan.value = null
  showResult.value = false
  errorMessage.value = ''
  layakZakat.value = false
  jumlahZakat.value = 0
  simpananInput.value = 0
  toast('Borang telah direset.', { duration: 1500 })
}

const bayarZakatSimpanan = () => {
  if (layakZakat.value && jumlahZakat.value > 0) {
    // Logic to navigate to payment, passing the amount and type
    router.push({ 
      name: 'payment', 
      query: { 
        amount: jumlahZakat.value.toFixed(2), 
        type: 'Wang Simpanan',
        currency: 'RM'  // Explicitly specify currency
      } 
    })
  } else {
    toast.error('Tiada jumlah zakat untuk dibayar.')
  }
}

// Optional: Go to payment function if needed
// const goToPayment = () => {
//   // Logic to navigate to payment, potentially passing the amount
//   if (layakZakat.value && jumlahZakat.value > 0) {
//      router.push({ name: 'Payment', query: { amount: jumlahZakat.value } }); // Example route
//   } else {
//      toast.error('Tiada jumlah zakat untuk dibayar.');
//   }
// }
</script>

<!-- Remove the <style scoped> block as styles are now handled by Tailwind -->
