<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Separator from '@/components/ui/separator/Separator.vue'
import { toast } from 'vue-sonner'

const router = useRouter()

// Nisab threshold constant (updated based on the latest value)
const NISAB_THRESHOLD = 21070 // RM 21,070 (current nisab for Pulau Pinang)

// Form data
const formData = ref({
  pendapatanSendiri: '',
  bilanganTanggungan: {
    isteri: '',
    anak: '',
  },
  bilanganAnak: '',
  nafkahUntukIbuBapa: '',
  kwsp: '',
  caruman: '',
  jumlahTaksiran: '',
  pendapatanLayak: '',
  zakatTahunan: '',
  zakatBulanan: '',
})

// Go back to the previous page in history
const goBack = () => {
  router.go(-1)
}

// Calculate zakat according to Zakat Pulau Pinang guidelines
const calculateZakat = () => {
  try {
    // Constants
    const SELF_DEDUCTION = 9000 // Diri sendiri (RM 9,000)
    const DEDUCTION_PER_WIFE = 3000 // RM 3,000 per wife
    const DEDUCTION_PER_CHILD = 1000 // RM 1,000 per child
    const ZAKAT_RATE = 0.025 // 2.5%
    const MONTHS_IN_YEAR = 12

    // 1. Calculate annual income - directly use the entered amount as yearly income
    const yearlyIncome = parseFloat(formData.value.pendapatanSendiri) || 0

    // 2. Calculate all allowable deductions (Tolakan Had Kifayah)
    // Fixed deduction for self
    const deductionDiriSendiri = SELF_DEDUCTION

    // Dependent deductions
    const numWives = parseInt(formData.value.bilanganTanggungan.isteri) || 0
    const deductionIsteri = numWives * DEDUCTION_PER_WIFE

    const numChildren = parseInt(formData.value.bilanganTanggungan.anak) || 0
    const deductionAnak = numChildren * DEDUCTION_PER_CHILD

    // Monthly parent support converted to annual
    const monthlyParentSupport = parseFloat(formData.value.nafkahUntukIbuBapa) || 0
    const yearlyParentSupport = monthlyParentSupport * MONTHS_IN_YEAR

    // KWSP calculation (Note: This is fixed to match the formula in the example)
    // The example shows RM 3,300 for 11% of RM 30,000, which is 11% of 30,000
    const kwspPercentage = parseFloat(formData.value.kwsp) || 0
    // Calculate KWSP directly as a percentage of yearly income
    const yearlyKwsp = (yearlyIncome * kwspPercentage) / 100

    // Other contributions (like Tabung Haji) - monthly to annual
    const monthlyContributions = parseFloat(formData.value.caruman) || 0
    const yearlyContributions = monthlyContributions * MONTHS_IN_YEAR

    // Calculate total deductions
    const totalDeductions =
      deductionDiriSendiri +
      deductionIsteri +
      deductionAnak +
      yearlyParentSupport +
      yearlyKwsp +
      yearlyContributions

    // 3. Calculate eligible zakat income (Pendapatan Layak Zakat)
    const pendapatanLayak = Math.max(0, yearlyIncome - totalDeductions)

    // 4. Apply zakat rate regardless of nisab threshold for calculation display
    // But still check nisab for the notification message
    const zakatTahunan = pendapatanLayak * ZAKAT_RATE
    const zakatBulanan = zakatTahunan / MONTHS_IN_YEAR

    // Check if above nisab for notification purposes
    const isAboveNisab = pendapatanLayak >= NISAB_THRESHOLD

    // Update form display values
    formData.value.jumlahTaksiran = totalDeductions.toFixed(2)
    formData.value.pendapatanLayak = pendapatanLayak.toFixed(2)
    formData.value.zakatTahunan = zakatTahunan.toFixed(2)
    formData.value.zakatBulanan = zakatBulanan.toFixed(2)

    // Show appropriate notification based on nisab threshold
    if (isAboveNisab) {
      toast('Anda wajib mengeluarkan zakat pendapatan', {
        description: `Pendapatan layak zakat melebihi kadar nisab: RM${NISAB_THRESHOLD.toLocaleString()}`,
        duration: 3000,
      })
    } else {
      toast('Pendapatan anda tidak mencapai nisab, tetapi boleh dibayar secara sukarela', {
        description: `Kadar nisab semasa: RM${NISAB_THRESHOLD.toLocaleString()}`,
        duration: 3000,
      })
    }
  } catch (error) {
    console.error('Calculation error:', error)
    toast('Ralat dalam pengiraan', {
      description: 'Sila periksa semua nilai yang dimasukkan',
      duration: 3000,
    })
  }
}

// Reset form
const resetForm = () => {
  // Reset form logic
  formData.value = {
    pendapatanSendiri: '',
    bilanganTanggungan: {
      isteri: '',
      anak: '',
    },
    bilanganAnak: '',
    nafkahUntukIbuBapa: '',
    kwsp: '',
    caruman: '',
    jumlahTaksiran: '',
    pendapatanLayak: '',
    zakatTahunan: '',
    zakatBulanan: '',
  }
}

// Go to payment page
const goToPayment = () => {
  router.push('/payment')
}
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-100 pb-6">
    <!-- Header -->
    <div class="bg-white p-4 flex items-center shadow-sm">
      <button @click="goBack" class="mr-4">
        <span class="text-xl">←</span>
      </button>
      <h1 class="text-lg font-semibold">Zakat Pendapatan</h1>
    </div>

    <!-- Main content -->
    <div class="p-4">
      <!-- Form -->
      <Card class="mb-4">
        <CardContent class="p-4">
          <!-- Section 1 -->
          <div class="mb-6 flex flex-col items-center">
            <h2 class="text-center items-center mb-1 font-medium">
              i) Pendapatan dari sumber zakat setahun
            </h2>
            <p class="text-sm text-gray-600 mb-2">(Gaji Pokok + Elaun + Lebih Masa)</p>

            <div class="flex items-center mb-2 w-full">
              <span class="text-right mr-2">RM</span>
              <Input v-model="formData.pendapatanSendiri" type="number" placeholder="Jumlah" />
            </div>
          </div>

          <Separator class="mb-4" />
          <!-- Section 2 -->
          <div class="mb-0 flex flex-col space-y-4">
            <h2 class="text-center mb-4 font-medium">
              ii) Tolak perbelanjaan yang dibenarkan (setahun) - keperluan asas
            </h2>

            <div class="flex flex-col space-y-2">
              <div class="flex flex-col space-y-1">
                <span class="text-sm">Diri sendiri</span>
                <div class="flex items-center">
                  <span class="text-right mr-2">RM</span>
                  <Input value="9000.00" disabled />
                </div>
              </div>
            </div>

            <div class="flex flex-col space-y-2">
              <div class="flex flex-col space-y-1">
                <div>
                  <span class="text-sm">Bilangan Isteri</span>
                  <p class="text-xs text-red-500">*Tolakan RM 3,000.00 setiap isteri</p>
                </div>
                <div class="flex items-center">
                  <Input
                    v-model="formData.bilanganTanggungan.isteri"
                    placeholder="Bilangan"
                    class="w-24 mr-2"
                    type="number"
                  />
                  <span class="w-10 text-right mr-2">RM</span>
                  <Input :value="(formData.bilanganTanggungan.isteri || 0) * 3000" disabled />
                </div>
              </div>
            </div>

            <div class="flex flex-col space-y-2">
              <div class="flex flex-col space-y-1">
                <div>
                  <span class="text-sm">Bilangan Anak</span>
                  <p class="text-xs text-red-500">*Tolakan RM 1,000.00 setiap anak</p>
                </div>
                <div class="flex items-center">
                  <Input
                    v-model="formData.bilanganTanggungan.anak"
                    placeholder="Bilangan"
                    class="w-24 mr-2"
                    type="number"
                  />
                  <span class="w-10 text-right mr-2">RM</span>
                  <Input :value="(formData.bilanganTanggungan.anak || 0) * 1000" disabled />
                </div>
              </div>
            </div>

            <div class="flex flex-col space-y-2">
              <div class="flex flex-col space-y-1">
                <div>
                  <span class="text-sm">Nafkah untuk ibu bapa</span>
                  <p class="text-xs">Sumbangan untuk sebulan</p>
                </div>
                <div class="flex items-center">
                  <span class="text-right mr-2">RM</span>
                  <Input
                    v-model="formData.nafkahUntukIbuBapa"
                    type="number"
                    placeholder="Jumlah sebulan"
                    class="mr-2"
                  />
                  <span class="text-right mr-2">RM</span>
                  <Input :value="((formData.nafkahUntukIbuBapa || 0) * 12).toFixed(2)" disabled />
                </div>
              </div>
            </div>

            <div class="flex flex-col space-y-2">
              <div class="flex flex-col space-y-1">
                <div>
                  <span class="text-sm">KWSP</span>
                </div>
                <div class="flex items-center">
                  <Input
                    v-model="formData.kwsp"
                    placeholder="Peratusan"
                    class="w-24 mr-2"
                    type="number"
                  />
                  <p class="text-xs pr-2">%</p>
                  <span class="w-10 text-right mr-2">RM</span>
                  <Input
                    :value="
                      (((formData.pendapatanSendiri || 0) * (formData.kwsp || 0)) / 100).toFixed(2)
                    "
                    placeholder="Tahunan"
                    disabled
                  />
                </div>
              </div>
            </div>

            <div class="flex flex-col space-y-2">
              <div class="flex flex-col space-y-1">
                <div>
                  <span class="text-sm">Caruman Tabung Haji</span>
                  <p class="text-xs">Jumlah caruman untuk sebulan</p>
                </div>
                <div class="flex items-center">
                  <span class="w-10 text-right mr-2">RM</span>
                  <Input
                    v-model="formData.caruman"
                    type="number"
                    placeholder="Jumlah sebulan"
                    class="mr-2"
                  />
                  <span class="text-right mr-2">RM</span>
                  <Input :value="((formData.caruman || 0) * 12).toFixed(2)" disabled />
                </div>
              </div>
            </div>

            <Separator class="my-4" />

            <div class="flex flex-col space-y-2">
              <div class="flex flex-col space-y-1">
                <span class="font-medium text-center">Jumlah Taksiran</span>
                <div class="flex items-center">
                  <span class="text-right mr-2">RM</span>
                  <Input
                    v-model="formData.jumlahTaksiran"
                    type="number"
                    placeholder="Jumlah"
                    disabled
                  />
                </div>
              </div>
            </div>

            <Separator class="my-4" />

            <!-- Section 3 -->
            <div class="mb-0">
              <h2 class="text-center mb-4 font-medium">iii) Pendapatan Layak Dizakat (i-ii)</h2>
              <div class="flex justify-center mb-2">
                <div class="flex items-center w-full">
                  <span class="text-right mr-2">RM</span>
                  <Input
                    v-model="formData.pendapatanLayak"
                    type="number"
                    placeholder="Jumlah"
                    class="w-64"
                    disabled
                  />
                </div>
              </div>
            </div>

            <Separator class="my-4" />

            <!-- Section 4 -->
            <div class="mb-0">
              <h2 class="text-center mb-4 font-medium">
                iv) Zakat Yang Wajib Dibayar Setahun (2.5%)
              </h2>
              <div class="flex justify-center mb-2">
                <div class="flex items-center w-full">
                  <span class="text-right mr-2">RM</span>
                  <Input
                    v-model="formData.zakatTahunan"
                    type="number"
                    placeholder="Jumlah"
                    class="w-64"
                    disabled
                  />
                </div>
              </div>
            </div>

            <Separator class="my-4" />

            <!-- Section 5 -->
            <div class="mb-0">
              <h2 class="text-center mb-4 font-medium">v) Zakat Yang Wajib Dibayar Sebulan</h2>
              <div class="flex justify-center mb-2">
                <div class="flex items-center w-full">
                  <span class="text-right mr-2">RM</span>
                  <Input
                    v-model="formData.zakatBulanan"
                    type="number"
                    placeholder="Jumlah"
                    class="w-64"
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Action buttons -->
      <div class="flex justify-center gap-4">
        <Button @click="resetForm" variant="outline" class="border-[#75a868] text-[#75a868]">
          Reset
        </Button>
        <Button @click="calculateZakat" class="bg-[#75a868] hover:bg-[#75a868]/90 text-white">
          Kira Zakat
        </Button>
        <Button @click="goToPayment" class="bg-[#217e0a] hover:bg-[#217e0a]/90 text-white">
          Bayar Zakat
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom styles */
</style>
