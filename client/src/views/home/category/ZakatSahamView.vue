<template>
  <div class="flex flex-col min-h-screen bg-gray-100 pb-6">
    <!-- Header -->
    <div class="bg-white p-4 flex items-center shadow-sm">
      <button @click="goBack" class="mr-4">
        <span class="text-xl">←</span>
      </button>
      <h1 class="text-lg font-semibold">Kalkulator Zakat Saham</h1>
    </div>

    <!-- Main content -->
    <div class="p-4">
      <Card class="mb-4">
        <CardHeader>
          <CardTitle class="text-center">Tambah Maklumat Saham</CardTitle>
        </CardHeader>
        <CardContent class="p-4 space-y-4">
          <!-- Input Section for Adding Entries -->
          <div class="input-section border p-4 rounded-md space-y-3">
            <h3 class="text-center font-medium mb-3">Tambah Entri Saham</h3>
            <div>
              <Label for="namaSaham" class="block text-sm font-medium text-gray-700 mb-1"
                >Nama Saham/Syarikat:</Label
              >
              <Input
                id="namaSaham"
                type="text"
                v-model="inputNamaSaham"
                placeholder="Cth: Maybank"
              />
            </div>
            <div>
              <Label for="unitSaham" class="block text-sm font-medium text-gray-700 mb-1">
                Bilangan Unit Dimiliki:
              </Label>
              <Input
                id="unitSaham"
                type="number"
                v-model.number="inputUnitSaham"
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <Label for="hargaSaham" class="block text-sm font-medium text-gray-700 mb-1">
                Harga Semasa Seunit (RM):
              </Label>
              <Input
                id="hargaSaham"
                type="number"
                v-model.number="inputHargaSaham"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            <div class="flex items-center space-x-2">
              <!-- Bind to a dedicated handler function -->
              <Checkbox
                id="cukupHaul"
                :checked="inputCukupHaul"
                @update:model-value="handleCheckboxUpdate"
              />
              <label
                for="cukupHaul"
                class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Saham telah dimiliki selama setahun (cukup haul)?
              </label>
            </div>
            <p v-if="addEntryError" class="text-red-500 text-xs mt-1">{{ addEntryError }}</p>
            <Button @click="addShareEntry" class="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Tambah Entri
            </Button>
          </div>

          <Separator class="my-4" />

          <!-- Share Entries Table -->
          <div v-if="shareEntries.length > 0">
            <h3 class="text-center font-medium mb-3">Senarai Saham Dimiliki</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Saham</TableHead>
                  <TableHead class="text-right">Unit</TableHead>
                  <TableHead class="text-right">Harga/Unit (RM)</TableHead>
                  <TableHead class="text-right">Nilai (RM)</TableHead>
                  <TableHead class="text-center">Cukup Haul?</TableHead>
                  <TableHead class="text-center">Tindakan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="(entry, index) in shareEntries" :key="index">
                  <TableCell>{{ entry.nama }}</TableCell>
                  <TableCell class="text-right">{{ entry.unit }}</TableCell>
                  <TableCell class="text-right">{{ formatCurrency(entry.harga) }}</TableCell>
                  <TableCell class="text-right">{{ formatCurrency(entry.nilai) }}</TableCell>
                  <TableCell class="text-center">{{ entry.cukupHaul ? 'Ya' : 'Tidak' }}</TableCell>
                  <TableCell class="text-center">
                    <Button @click="removeShareEntry(index)" variant="destructive" size="sm">
                      Padam
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <p v-else class="text-center text-gray-500 text-sm">Tiada entri saham ditambah lagi.</p>

          <Separator class="my-4" />

          <!-- Liabilities Input -->
          <div class="liabilities-section space-y-2">
            <Label for="liabilities" class="block text-sm font-medium text-gray-700 mb-1">
              Liabiliti / Hutang Berkaitan Saham Boleh Ditolak (RM):
              <span class="text-xs text-gray-500">(Jika ada)</span>
            </Label>
            <Input
              id="liabilities"
              type="number"
              v-model.number="deductibleLiabilities"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
            <p class="text-xs text-gray-500">
              Contoh: Hutang pembiayaan untuk membeli saham yang dizakatkan.
            </p>
          </div>

          <Separator v-if="showResult" class="my-4" />

          <!-- Results Section -->
          <div v-if="showResult" class="result-section space-y-3 border p-4 rounded-md bg-green-50">
            <h2 class="text-center font-medium text-lg mb-4">Hasil Kiraan Zakat Saham:</h2>

            <Table>
              <TableCaption class="mb-2">Ringkasan Pengiraan Zakat Saham</TableCaption>
              <TableBody>
                <TableRow>
                  <TableCell class="font-medium">Jumlah Unit Saham Cukup Haul</TableCell>
                  <TableCell class="text-right">{{ totalUnitsHaul }} unit</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell class="font-medium">Jumlah Nilai Pasaran Saham Cukup Haul</TableCell>
                  <TableCell class="text-right">{{ formatCurrency(totalValueHaul) }}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell class="font-medium">(-) Liabiliti / Hutang Boleh Ditolak</TableCell>
                  <TableCell class="text-right">{{
                    formatCurrency(deductibleLiabilities || 0)
                  }}</TableCell>
                </TableRow>
                <TableRow class="bg-gray-100">
                  <TableCell class="font-semibold">(=) Nilai Bersih Layak Zakat</TableCell>
                  <TableCell class="text-right font-semibold">{{
                    formatCurrency(netZakatableValue)
                  }}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell class="font-medium"
                    >Nilai Nisab Semasa ({{ nisabWeight }}g Emas)</TableCell
                  >
                  <TableCell class="text-right">{{ formatCurrency(currentNisabValue) }}</TableCell>
                </TableRow>
                <TableRow class="bg-green-100">
                  <TableCell class="font-bold text-green-800"
                    >Jumlah Zakat Saham Tahunan (2.5%)</TableCell
                  >
                  <TableCell class="text-right font-bold text-lg text-green-800">{{
                    formatCurrency(totalZakat)
                  }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <p v-if="!isEligible" class="text-center text-sm text-red-600 pt-2 font-medium">
              Nilai bersih saham yang layak dizakat tidak mencapai paras Nisab. Tiada zakat
              dikenakan.
            </p>
            <p v-else-if="totalZakat <= 0" class="text-center text-sm text-gray-500 pt-2">
              Tiada zakat saham dikenakan berdasarkan maklumat yang diberi.
            </p>
          </div>
        </CardContent>
      </Card>

      <!-- Action buttons -->
      <div class="flex justify-center gap-4">
        <Button @click="resetForm" variant="outline" class="border-[#75a868] text-[#75a868]">
          Reset
        </Button>
        <Button
          @click="calculateTotalZakat"
          :disabled="shareEntries.length === 0 || isLoadingData"
          class="bg-[#75a868] hover:bg-[#75a868]/90 text-white"
        >
          <span v-if="isLoadingData">Memuatkan...</span>
          <span v-else>Kira Zakat</span>
        </Button>
        <Button
          @click="goToPayment"
          :disabled="totalZakat <= 0 || !isEligible"
          class="bg-[#217e0a] hover:bg-[#217e0a]/90 text-white"
        >
          Bayar Zakat
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption, // Import TableCaption
} from '@/components/ui/table'
import Separator from '@/components/ui/separator/Separator.vue'
import { toast } from 'vue-sonner'

const router = useRouter()

// --- Input Data for Adding Entries ---
const inputNamaSaham = ref('')
const inputUnitSaham = ref(null)
const inputHargaSaham = ref(null)
const inputCukupHaul = ref(false)
const addEntryError = ref('')
const isLoadingData = ref(true) // Loading state for Nisab
const deductibleLiabilities = ref(null) // New input for liabilities

// --- Nisab Data ---
const nisabWeight = ref(85.0) // Standard weight in grams
const currentGoldPrice = ref(0) // To be fetched
const currentNisabValue = computed(() => currentGoldPrice.value * nisabWeight.value)

// --- Share Entries Table ---
const shareEntries = ref([]) // Array of { nama, unit, harga, nilai, cukupHaul }

// --- Calculation Results ---
const totalUnitsHaul = ref(0) // New: Total units meeting haul
const totalValueHaul = ref(0) // Total value of shares that meet haul
const netZakatableValue = ref(0) // New: Value after liabilities
const totalZakat = ref(0)
const isEligible = ref(false) // Flag if net value meets nisab
const showResult = ref(false)

// --- Lifecycle Hook ---
onMounted(async () => {
  isLoadingData.value = true
  try {
    // Using the same proxy approach as ZakatEmasView for consistency
    // WARNING: Using a public CORS proxy. NOT recommended for production.
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/'
    const targetUrl = 'https://www.zakat2u.com.my/nisab-list' // Assuming this has the latest gold price
    const response = await fetch(proxyUrl + targetUrl)

    if (!response.ok) {
      throw new Error(`Fetch error! status: ${response.status}`)
    }
    const data = await response.json()

    // Find the latest gold price from the data (assuming first entry is latest)
    if (data && data.length > 0) {
      const latestData = data[0]
      const price = parseFloat(latestData.hargaemas)
      if (!isNaN(price) && price > 0) {
        currentGoldPrice.value = price
        toast.success(`Harga emas terkini (RM ${formatCurrency(price)}/g) berjaya dimuat.`, {
          duration: 2500,
        })
      } else {
        throw new Error('Invalid gold price data received.')
      }
    } else {
      throw new Error('No gold price data received.')
    }
  } catch (error) {
    console.error('Failed to fetch gold price for Nisab calculation:', error)
    toast.error('Gagal memuatkan harga emas untuk Nisab. Kiraan mungkin tidak tepat.', {
      duration: 4000,
    })
    // Set a default or handle the error appropriately, maybe disable calculation
    currentGoldPrice.value = 300 // Example fallback - adjust as needed
    toast.warning(
      `Menggunakan anggaran harga emas RM ${formatCurrency(currentGoldPrice.value)}/g.`,
      { duration: 3000 },
    )
  } finally {
    isLoadingData.value = false
  }
})

// --- Functions ---

const goBack = () => {
  router.go(-1)
}

const formatCurrency = (value) => {
  if (value === null || isNaN(value)) {
    return 'RM 0.00' // Or handle as needed, e.g., return '-'
  }
  return new Intl.NumberFormat('ms-MY', {
    style: 'currency',
    currency: 'MYR',
  }).format(value)
}

const addShareEntry = () => {
  addEntryError.value = ''
  const nama = inputNamaSaham.value.trim()
  const unit = inputUnitSaham.value
  const harga = inputHargaSaham.value
  // Read the current value of the ref directly
  const cukupHaul = inputCukupHaul.value

  // --- Debugging Line ---
  console.log(
    'Value of inputCukupHaul before adding entry:',
    inputCukupHaul.value, // Log the ref's value
    typeof inputCukupHaul.value,
  )
  // --- End Debugging Line ---

  // Validation
  if (!nama) {
    addEntryError.value = 'Sila masukkan nama saham.'
    return
  }
  if (unit === null || isNaN(unit) || unit <= 0) {
    addEntryError.value = 'Sila masukkan bilangan unit yang sah (> 0).'
    return
  }
  if (harga === null || isNaN(harga) || harga <= 0) {
    addEntryError.value = 'Sila masukkan harga seunit yang sah (> 0).'
    return
  }

  // Add to table
  shareEntries.value.push({
    nama: nama,
    unit: unit,
    harga: harga,
    nilai: unit * harga,
    cukupHaul: cukupHaul, // Use the value read from the ref
  })

  // Reset input fields
  inputNamaSaham.value = ''
  inputUnitSaham.value = null
  inputHargaSaham.value = null
  inputCukupHaul.value = false // Reset the ref value
  showResult.value = false // Hide results when table changes
  totalZakat.value = 0
  isEligible.value = false
  // Don't reset liabilities here, only on full reset or calculation
}

const removeShareEntry = (index) => {
  shareEntries.value.splice(index, 1)
  showResult.value = false // Hide results when table changes
  totalZakat.value = 0
  isEligible.value = false
  // Don't reset liabilities here
}

// Calculate Total Zakat based on the table
const calculateTotalZakat = () => {
  if (isLoadingData.value) {
    toast.info('Sila tunggu data Nisab dimuatkan dahulu.')
    return
  }
  if (currentNisabValue.value <= 0) {
    toast.error('Tidak dapat mengira zakat kerana nilai Nisab tidak sah. Semak harga emas.')
    return
  }

  showResult.value = false // Reset display
  let currentTotalValueHaul = 0
  let currentTotalUnitsHaul = 0
  const liabilities = Number(deductibleLiabilities.value) || 0 // Ensure it's a number, default 0

  if (shareEntries.value.length === 0) {
    toast.error('Tiada entri saham untuk dikira.')
    return
  }

  shareEntries.value.forEach((entry) => {
    if (entry.cukupHaul) {
      currentTotalValueHaul += entry.nilai
      currentTotalUnitsHaul += entry.unit
    }
  })

  totalValueHaul.value = currentTotalValueHaul
  totalUnitsHaul.value = currentTotalUnitsHaul // Store total units

  // Calculate net value after deducting liabilities
  netZakatableValue.value = Math.max(0, totalValueHaul.value - liabilities) // Ensure not negative

  // Check eligibility based on net value
  isEligible.value = netZakatableValue.value >= currentNisabValue.value

  if (isEligible.value) {
    totalZakat.value = netZakatableValue.value * 0.025
  } else {
    totalZakat.value = 0
  }

  showResult.value = true

  toast('Pengiraan Zakat Saham Selesai', {
    description: isEligible.value
      ? `Jumlah zakat: ${formatCurrency(totalZakat.value)}`
      : 'Nilai bersih saham tidak mencapai Nisab.',
    duration: 3000,
  })
}

// Reset form function
const resetForm = () => {
  inputNamaSaham.value = ''
  inputUnitSaham.value = null
  inputHargaSaham.value = null
  inputCukupHaul.value = false
  deductibleLiabilities.value = null // Reset liabilities
  shareEntries.value = [] // Clear the table
  showResult.value = false
  addEntryError.value = ''
  totalZakat.value = 0
  isEligible.value = false
  totalUnitsHaul.value = 0 // Reset units
  totalValueHaul.value = 0
  netZakatableValue.value = 0 // Reset net value
  toast('Borang dan senarai saham telah direset.', { duration: 1500 })
}

// Go to payment function
const goToPayment = () => {
  if (isEligible.value && totalZakat.value > 0) {
    router.push({ 
      name: 'payment', 
      query: { 
        amount: totalZakat.value.toFixed(2), 
        type: 'Saham',
        currency: 'RM',  // Explicitly specify currency
        description: `Zakat Saham - ${totalUnitsHaul.value} unit (${formatCurrency(totalValueHaul.value)})`,
        metadata: JSON.stringify({
          totalUnits: totalUnitsHaul.value,
          totalValue: totalValueHaul.value,
          netValue: netZakatableValue.value,
          nisabValue: currentNisabValue.value,
          calculationDetails: calculationDetails.value,
          shareEntries: shareEntries.value
        })
      } 
    })
  } else {
    toast.error('Tiada jumlah zakat untuk dibayar atau nilai tidak layak dizakat.')
  }
}

// --- New Handler Function for Checkbox ---
const handleCheckboxUpdate = (payload) => {
  console.log('Checkbox @update:checked payload:', payload, typeof payload)
  // Assuming the payload is the new boolean state
  if (typeof payload === 'boolean') {
    inputCukupHaul.value = payload
  } else {
    // Fallback or error handling if payload is unexpected
    console.warn('Unexpected payload type from Checkbox:', typeof payload)
    // Attempt to coerce or default
    inputCukupHaul.value = !!payload // Coerce to boolean (might be risky)
  }
  console.log('inputCukupHaul.value after update:', inputCukupHaul.value)
}
// --- End New Handler Function ---
</script>

<!-- No <style scoped> needed as Tailwind is used -->
