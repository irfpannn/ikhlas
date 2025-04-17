<template>
  <div class="flex flex-col min-h-screen bg-gray-100 pb-6">
    <!-- Header -->
    <div class="bg-white p-4 flex items-center shadow-sm">
      <button @click="goBack" class="mr-4">
        <span class="text-xl">←</span>
      </button>
      <h1 class="text-lg font-semibold">Zakat Fitrah</h1>
    </div>

    <!-- Main content -->
    <div class="p-4">
      <Card class="mb-4">
        <CardHeader>
          <CardTitle class="text-center">Kiraan Zakat Fitrah</CardTitle>
        </CardHeader>
        <CardContent class="p-4 space-y-6">
          <!-- Number of People Input -->
          <div class="space-y-2">
            <Label for="numberOfPeople" class="block text-sm font-medium text-gray-700"
              >Bilangan Orang (Termasuk Diri Sendiri & Tanggungan):</Label
            >
            <Input
              id="numberOfPeople"
              type="number"
              v-model.number="numberOfPeople"
              placeholder="0"
              min="1"
              @input="calculateFitrah"
            />
            <p v-if="inputError" class="text-red-500 text-xs mt-1">{{ inputError }}</p>
          </div>

          <!-- Rate Selection -->
          <div class="space-y-2 flex flex-col">
            <Label class="block text-sm font-medium text-gray-700"
              >Pilih Kadar Fitrah (Harga Beras):</Label
            >
            <RadioGroup v-model="selectedRate" @update:model-value="calculateFitrah">
              <div class="grid grid-rows-3 gap-1">
                <div
                  v-for="rate in fitrahRates"
                  :key="rate.value"
                  class="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50"
                  :class="{ 'bg-green-100 border-green-400': selectedRate === rate.value }"
                  @click="((selectedRate = rate.value), calculateFitrah())"
                >
                  <RadioGroupItem :value="rate.value" :id="`rate-${rate.value}`" />
                  <Label :for="`rate-${rate.value}`" class="cursor-pointer">
                    {{ formatCurrency(rate.value) }}
                    <span class="text-xs text-gray-500 block">{{ rate.label }}</span>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <Separator v-if="showResult" class="my-4" />

          <!-- Results Section -->
          <div v-if="showResult" class="result-section space-y-3 border p-4 rounded-md bg-green-50">
            <h2 class="text-center font-medium text-lg mb-4">Hasil Kiraan Zakat Fitrah:</h2>

            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-700">Kadar Fitrah Dipilih (seorang):</span>
              <span class="font-medium">{{ formatCurrency(selectedRate) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-700">Bilangan Orang:</span>
              <span class="font-medium">{{ numberOfPeople }}</span>
            </div>
            <Separator class="my-3" />
            <div class="flex justify-between items-center pt-1">
              <span class="text-sm font-semibold text-gray-700">Jumlah Zakat Fitrah:</span>
              <span class="font-bold text-lg text-green-800">{{
                formatCurrency(totalFitrah)
              }}</span>
            </div>
          </div>

          <!-- Lafaz Akad -->
          <div
            v-if="showResult && totalFitrah > 0"
            class="lafaz-section mt-4 border p-4 rounded-md bg-blue-50"
          >
            <h3 class="text-center font-medium text-base mb-2">Lafaz Niat Zakat Fitrah</h3>
            <p class="text-sm text-center italic text-gray-700">
              "Inilah wang bagi menggantikan Beras Fitrah sebanyak
              <strong class="text-blue-800">{{ formatCurrency(totalFitrah) }}</strong> yang wajib
              bagi diriku/tanggunganku/bagi pihak pada tahun ini kerana Allah Ta'ala."
            </p>
          </div>
        </CardContent>
      </Card>

      <!-- Action buttons -->
      <div class="flex justify-center gap-4">
        <Button @click="resetForm" variant="outline" class="border-[#75a868] text-[#75a868]">
          Reset
        </Button>
        <!-- Kira button might be redundant as it calculates on input/selection -->
        <!-- <Button
          @click="calculateFitrah"
          :disabled="!numberOfPeople || numberOfPeople <= 0 || !selectedRate"
          class="bg-[#75a868] hover:bg-[#75a868]/90 text-white"
        >
          Kira Zakat
        </Button> -->
        <Button
          @click="goToPayment"
          :disabled="totalFitrah <= 0"
          class="bg-[#217e0a] hover:bg-[#217e0a]/90 text-white"
        >
          Bayar Zakat
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import Separator from '@/components/ui/separator/Separator.vue'
import { toast } from 'vue-sonner'

const router = useRouter()

// --- Fitrah Data ---
const numberOfPeople = ref(1) // Default to 1 person
const selectedRate = ref(7) // Default rate
const fitrahRates = ref([
  { value: 7, label: 'Beras Super Tempatan dan senilai dengannya' },
  { value: 15, label: 'Beras Super Import/Super wangi AAA dan senilai dengannya' },
  { value: 22, label: 'Beras Basmathi dan senilai dengannya' },
])
const inputError = ref('')
const showResult = ref(false)

// --- Calculation Results ---
const totalFitrah = ref(0)

// --- Functions ---

const goBack = () => {
  router.go(-1)
}

const formatCurrency = (value) => {
  if (value === null || isNaN(value)) {
    return 'RM 0.00'
  }
  return new Intl.NumberFormat('ms-MY', {
    style: 'currency',
    currency: 'MYR',
  }).format(value)
}

const calculateFitrah = () => {
  inputError.value = ''
  showResult.value = false
  totalFitrah.value = 0

  const people = Number(numberOfPeople.value)
  const rate = Number(selectedRate.value)

  if (isNaN(people) || people <= 0) {
    inputError.value = 'Sila masukkan bilangan orang yang sah (1 atau lebih).'
    return
  }

  if (isNaN(rate) || rate <= 0) {
    // Should not happen with RadioGroup, but good practice
    toast.error('Sila pilih kadar fitrah yang sah.')
    return
  }

  totalFitrah.value = people * rate
  showResult.value = true

  // Optional: Show toast on calculation
  toast('Pengiraan Zakat Fitrah Selesai', {
    description: `Jumlah: ${formatCurrency(totalFitrah.value)} untuk ${people} orang.`,
    duration: 2000,
  })
}

// Reset form function
const resetForm = () => {
  numberOfPeople.value = 1
  selectedRate.value = 7 // Reset to default rate
  inputError.value = ''
  showResult.value = false
  totalFitrah.value = 0
  toast('Borang Zakat Fitrah telah direset.', { duration: 1500 })
}

// Go to payment function
const goToPayment = () => {
  // Ensure calculation has run and is valid before proceeding
  calculateFitrah() // Recalculate to be sure
  if (totalFitrah.value > 0 && !inputError.value) {
    router.push({
      name: 'payment',
      query: { amount: totalFitrah.value.toFixed(2), type: 'Fitrah' },
    })
  } else if (inputError.value) {
    toast.error(inputError.value)
  } else {
    toast.error('Tiada jumlah zakat fitrah untuk dibayar atau data tidak sah.')
  }
}

// Initial calculation on load if needed (optional)
// import { onMounted } from 'vue'
// onMounted(() => {
//   calculateFitrah()
// })
</script>

<!-- No <style scoped> needed as Tailwind is used -->
