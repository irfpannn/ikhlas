<!-- filepath: c:\Users\User\Desktop\ikhlas\client\src\views\ZakatEmasView.vue -->
<template>
  <div class="flex flex-col min-h-screen bg-gray-100 pb-6">
    <!-- Header -->
    <div class="bg-white p-4 flex items-center shadow-sm">
      <button @click="goBack" class="mr-4">
        <span class="text-xl">←</span>
      </button>
      <h1 class="text-lg font-semibold">Kalkulator Zakat Emas</h1>
    </div>

    <!-- Main content -->
    <div class="p-4">
      <Card class="mb-4">
        <CardHeader>
          <CardTitle class="text-center">Tambah Maklumat Emas Tahunan</CardTitle>
        </CardHeader>
        <CardContent class="p-4 space-y-4">
          <!-- Input Section for Adding Entries -->
          <div class="input-section border p-4 rounded-md space-y-3">
            <h3 class="text-center font-medium mb-3">Tambah Entri Emas</h3>
            <div>
              <Label for="yearSelect" class="block text-sm font-medium text-gray-700 mb-1"
                >Tahun:</Label
              >
              <Select v-model="selectedYear">
                <SelectTrigger id="yearSelect">
                  <SelectValue placeholder="Pilih Tahun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="year in availableYears" :key="year" :value="year.toString()">
                    {{ year }} (Harga: {{ formatCurrency(getHargaEmasForYear(year)) }}/g)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label for="beratEmasSimpanan" class="block text-sm font-medium text-gray-700 mb-1">
                Berat Emas Disimpan (gram):
              </Label>
              <div class="flex items-center">
                <Input
                  id="beratEmasSimpanan"
                  type="number"
                  v-model.number="inputBeratSimpanan"
                  placeholder="0"
                  min="0"
                  step="0.01"
                  class="flex-grow"
                />
                <span class="ml-2 text-gray-500">gram</span>
              </div>
            </div>
            <div>
              <Label for="beratEmasDipakai" class="block text-sm font-medium text-gray-700 mb-1">
                Berat Emas Dipakai (Perhiasan) (gram):
              </Label>
              <div class="flex items-center">
                <Input
                  id="beratEmasDipakai"
                  type="number"
                  v-model.number="inputBeratDipakai"
                  placeholder="0"
                  min="0"
                  step="0.01"
                  class="flex-grow"
                />
                <span class="ml-2 text-gray-500">gram</span>
              </div>
            </div>
            <p v-if="addEntryError" class="text-red-500 text-xs mt-1">{{ addEntryError }}</p>
            <Button @click="addGoldEntry" class="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Tambah Entri
            </Button>
          </div>

          <Separator class="my-4" />

          <!-- Gold Entries Table -->
          <div v-if="goldEntries.length > 0">
            <h3 class="text-center font-medium mb-3">Senarai Emas Dimiliki</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead class="text-center">Tahun</TableHead>
                  <TableHead class="text-right">Berat Simpanan (g)</TableHead>
                  <TableHead class="text-right">Berat Dipakai (g)</TableHead>
                  <TableHead class="text-right">Harga/g (RM)</TableHead>
                  <TableHead class="text-center">Tindakan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="(entry, index) in goldEntries" :key="index">
                  <TableCell class="text-center">{{ entry.year }}</TableCell>
                  <TableCell class="text-right">{{ entry.beratSimpanan.toFixed(2) }}</TableCell>
                  <TableCell class="text-right">{{ entry.beratDipakai.toFixed(2) }}</TableCell>
                  <TableCell class="text-right">{{ formatCurrency(entry.hargaPerGram) }}</TableCell>
                  <TableCell class="text-center">
                    <Button @click="removeGoldEntry(index)" variant="destructive" size="sm">
                      Padam
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <p v-else class="text-center text-gray-500 text-sm">Tiada entri emas ditambah lagi.</p>

          <Separator v-if="showResult" class="my-4" />

          <!-- Results Section -->
          <div v-if="showResult" class="result-section space-y-3 border p-4 rounded-md bg-green-50">
            <h2 class="text-center font-medium text-lg mb-4">
              Hasil Kiraan Keseluruhan Zakat Emas:
            </h2>

            <!-- Calculation Summary Table (Optional but good for transparency) -->
            <Table v-if="calculationDetails.length > 0">
              <TableCaption>Ringkasan Pengiraan Zakat Tahunan</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead class="text-center">Tahun</TableHead>
                  <TableHead class="text-right">Zakat Simpanan (RM)</TableHead>
                  <TableHead class="text-right">Zakat Dipakai (RM)</TableHead>
                  <TableHead class="text-right">Jumlah Zakat (RM)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="(detail, index) in calculationDetails" :key="index">
                  <TableCell class="text-center">{{ detail.year }}</TableCell>
                  <TableCell class="text-right">{{
                    formatCurrency(detail.zakatSimpanan)
                  }}</TableCell>
                  <TableCell class="text-right">{{
                    formatCurrency(detail.zakatDipakai)
                  }}</TableCell>
                  <TableCell class="text-right font-medium">{{
                    formatCurrency(detail.totalZakatYear)
                  }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <!-- Total Zakat -->
            <Separator class="my-3" />
            <div class="flex justify-between items-center pt-1">
              <span class="text-sm font-semibold text-gray-700"
                >Jumlah Keseluruhan Zakat Emas:</span
              >
              <span class="font-bold text-lg text-green-800">{{ formatCurrency(totalZakat) }}</span>
            </div>
            <p v-if="totalZakat <= 0" class="text-center text-sm text-gray-500 pt-2">
              Tiada zakat emas dikenakan berdasarkan maklumat yang diberi.
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
          :disabled="goldEntries.length === 0"
          class="bg-[#75a868] hover:bg-[#75a868]/90 text-white"
        >
          Kira Zakat
        </Button>
        <Button
          @click="goToPayment"
          :disabled="totalZakat <= 0"
          class="bg-[#217e0a] hover:bg-[#217e0a]/90 text-white"
        >
          Bayar Zakat
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue' // Added onMounted
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Separator from '@/components/ui/separator/Separator.vue'
import { toast } from 'vue-sonner'

const router = useRouter()

// --- Input Data for Adding Entries ---
const selectedYear = ref(null)
const inputBeratSimpanan = ref(null)
const inputBeratDipakai = ref(null)
const addEntryError = ref('')
const isLoadingData = ref(true) // Added loading state

// --- Historical Data (Fetched) ---
const historicalNisabData = ref([]) // Store the raw fetched data
const historicalGoldPrices = ref({}) // To be populated from fetched data

// --- Constants (Will be updated from fetched data) ---
const nisabSimpanan = ref(85.0) // Default, will be updated
const urufPerhiasan = ref(800.0) // Default, will be updated

// --- Computed Properties ---
const availableYears = computed(() =>
  Object.keys(historicalGoldPrices.value)
    .map(Number)
    .sort((a, b) => b - a),
)

// --- Gold Entries Table ---
const goldEntries = ref([]) // Array of { year, beratSimpanan, beratDipakai, hargaPerGram }

// --- Calculation Results ---
const calculationDetails = ref([]) // Array of { year, zakatSimpanan, zakatDipakai, totalZakatYear }
const totalZakat = ref(0)
const showResult = ref(false)

// --- Lifecycle Hook ---
onMounted(async () => {
  isLoadingData.value = true
  try {
    // Import local JSON file instead of fetching from external API
    import('@/data/emasPrice.json')
      .then((module) => {
        const data = module.default || module
        historicalNisabData.value = data // Store raw data if needed elsewhere

        // Process data to populate historicalGoldPrices
        const prices = {}
        let latestData = null // To find the latest uruf/nisab values

        data.forEach((item) => {
          const year = parseInt(item.tahun)
          const price = parseFloat(item.hargaemas)
          if (!isNaN(year) && !isNaN(price) && price > 0) {
            prices[year] = price

            // Keep track of the latest entry (assuming the first item is the latest)
            if (!latestData) {
              latestData = item
            }
          }
        })
        historicalGoldPrices.value = prices

        // Update constants based on the latest available data
        if (latestData) {
          const latestNisab = parseFloat(latestData.uruf_simpan)
          const latestUruf = parseFloat(latestData.uruf_pakai)
          if (!isNaN(latestNisab) && latestNisab > 0) {
            nisabSimpanan.value = latestNisab
          }
          if (!isNaN(latestUruf) && latestUruf > 0) {
            urufPerhiasan.value = latestUruf
          }
        }

        toast.success('Data harga emas terkini berjaya dimuat.', { duration: 2000 })
        isLoadingData.value = false
      })
      .catch((error) => {
        console.error('Failed to load local gold price data:', error)
        toast.error('Gagal memuatkan data harga emas. Menggunakan nilai lalai.', { duration: 4000 })
        isLoadingData.value = false
      })
  } catch (error) {
    console.error('Error in initialization:', error)
    toast.error('Gagal memuatkan data harga emas. Menggunakan nilai lalai.', { duration: 4000 })
    isLoadingData.value = false
  }
})

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

const getHargaEmasForYear = (year) => {
  return historicalGoldPrices.value[year] || 0 // Return 0 if year not found
}

const addGoldEntry = () => {
  addEntryError.value = ''
  const year = parseInt(selectedYear.value)
  const beratS = inputBeratSimpanan.value ?? 0
  const beratP = inputBeratDipakai.value ?? 0

  // Validation
  if (!year) {
    addEntryError.value = 'Sila pilih tahun.'
    return
  }
  if (beratS < 0 || isNaN(beratS) || beratP < 0 || isNaN(beratP)) {
    addEntryError.value = 'Sila masukkan berat emas yang sah (0 atau lebih).'
    return
  }
  if (beratS === 0 && beratP === 0) {
    addEntryError.value = 'Sila masukkan sekurang-kurangnya satu berat emas untuk tahun ini.'
    return
  }
  const harga = getHargaEmasForYear(year)
  if (harga <= 0) {
    addEntryError.value = `Harga emas untuk tahun ${year} tidak ditemui.`
    return
  }

  // Add to table
  goldEntries.value.push({
    year: year,
    beratSimpanan: beratS,
    beratDipakai: beratP,
    hargaPerGram: harga,
  })

  // Reset input fields
  selectedYear.value = null
  inputBeratSimpanan.value = null
  inputBeratDipakai.value = null
  showResult.value = false // Hide results when table changes
  totalZakat.value = 0
  calculationDetails.value = []
}

const removeGoldEntry = (index) => {
  goldEntries.value.splice(index, 1)
  showResult.value = false // Hide results when table changes
  totalZakat.value = 0
  calculationDetails.value = []
}

// Calculate Total Zakat based on the table
const calculateTotalZakat = () => {
  showResult.value = false // Reset display
  calculationDetails.value = []
  let grandTotal = 0

  if (goldEntries.value.length === 0) {
    toast.error('Tiada entri emas untuk dikira.')
    return
  }

  goldEntries.value.forEach((entry) => {
    let zakatS = 0
    let zakatP = 0
    let layakS = false
    let layakP = false

    // Calculate Zakat Emas Simpanan for the entry
    if (entry.beratSimpanan >= nisabSimpanan.value) {
      layakS = true
      zakatS = entry.beratSimpanan * entry.hargaPerGram * 0.025
    }

    // Calculate Zakat Emas Dipakai for the entry
    if (entry.beratDipakai > urufPerhiasan.value) {
      layakP = true
      zakatP = entry.beratDipakai * entry.hargaPerGram * 0.025
    }

    const totalZakatYear = zakatS + zakatP
    grandTotal += totalZakatYear

    // Store details for summary table
    calculationDetails.value.push({
      year: entry.year,
      zakatSimpanan: zakatS,
      zakatDipakai: zakatP,
      totalZakatYear: totalZakatYear,
      // Optional: add layak status if needed in summary
      // layakSimpanan: layakS,
      // layakDipakai: layakP
    })
  })

  totalZakat.value = grandTotal
  showResult.value = true

  toast('Pengiraan Keseluruhan Zakat Emas Selesai', {
    description:
      totalZakat.value > 0
        ? `Jumlah zakat: ${formatCurrency(totalZakat.value)}`
        : 'Tiada zakat emas dikenakan.',
    duration: 3000,
  })
}

// Reset form function
const resetForm = () => {
  selectedYear.value = null
  inputBeratSimpanan.value = null
  inputBeratDipakai.value = null
  goldEntries.value = [] // Clear the table
  calculationDetails.value = []
  showResult.value = false
  addEntryError.value = ''
  totalZakat.value = 0
  toast('Borang dan senarai emas telah direset.', { duration: 1500 })
}

// Go to payment function
const goToPayment = () => {
  if (totalZakat.value > 0) {
    router.push({
      name: 'payment',
      query: {
        amount: totalZakat.value.toFixed(2),
        type: 'Emas',
        currency: 'RM', // Explicitly specify currency
        description: `Zakat Emas - ${totalUnitsHaul.value} unit (${formatCurrency(totalValueHaul.value)})`,
        metadata: JSON.stringify({
          totalUnits: totalUnitsHaul.value,
          totalValue: totalValueHaul.value,
          netValue: netZakatableValue.value,
          nisabValue: currentNisabValue.value,
          calculationDetails: calculationDetails.value,
        }),
      },
    })
  } else {
    toast.error('Tiada jumlah zakat untuk dibayar.')
  }
}
</script>

<!-- No <style scoped> needed as Tailwind is used -->
