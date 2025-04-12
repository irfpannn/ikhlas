<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Separator from '@/components/ui/separator/Separator.vue'
import { toast } from 'vue-sonner'

const router = useRouter()

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

// Calculate zakat
const calculateZakat = () => {
  toast('Jumlah Pembayaran Berjaya Dikira', {
    description: 'Sila semak jumlah pembayaran anda',
    duration: 2000,
  })
  // Implement calculation logic here
  // This is a placeholder
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
            <p class="text-sm text-gray-600 mb-2">(Gaji/Hasil + Elaun + Lain-lain)</p>

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
                  <p class="text-xs text-red-500">*maksimum RM 9,000.00 setiap isteri</p>
                </div>
                <div class="flex items-center">
                  <Input
                    v-model="formData.bilanganTanggungan.isteri"
                    placeholder="Bilangan"
                    class="w-24 mr-2"
                    type="number"
                  />
                  <span class="w-10 text-right mr-2">RM</span>
                  <Input type="number" placeholder="Jumlah" />
                </div>
              </div>
            </div>

            <div class="flex flex-col space-y-2">
              <div class="flex flex-col space-y-1">
                <div>
                  <span class="text-sm">Bilangan Anak</span>
                  <p class="text-xs text-red-500">*maksimum RM 6,000.00 setiap anak</p>
                </div>
                <div class="flex items-center">
                  <Input
                    v-model="formData.bilanganTanggungan.anak"
                    placeholder="Bilangan"
                    class="w-24 mr-2"
                    type="number"
                  />
                  <span class="w-10 text-right mr-2">RM</span>
                  <Input type="number" placeholder="Jumlah" />
                </div>
              </div>
            </div>

            <div class="flex flex-col space-y-2">
              <div class="flex flex-col space-y-1">
                <div>
                  <span class="text-sm">Nafkah untuk ibu bapa</span>
                  <p class="text-xs">Sumbangan untuk wajib nafkah</p>
                </div>
                <div class="flex items-center">
                  <span class="text-right mr-2">RM</span>
                  <Input v-model="formData.nafkahUntukIbuBapa" type="number" placeholder="Jumlah" />
                </div>
              </div>
            </div>

            <div class="flex flex-col space-y-2">
              <div class="flex flex-col space-y-1">
                <div>
                  <span class="text-sm">KWSP</span>
                </div>
                <div class="flex items-center">
                  <p class="text-xs pr-2">%</p>
                  <Input v-model="formData.kwsp" placeholder="Peratusan" class="w-24 mr-2" />
                  <span class="w-10 text-right mr-2">RM</span>
                  <Input type="number" placeholder="Jumlah" />
                </div>
              </div>
            </div>

            <div class="flex flex-col space-y-2">
              <div class="flex flex-col space-y-1">
                <div>
                  <span class="text-sm">Lain-lain Caruman Yang Wajib</span>
                  <p class="text-xs">Caruman wajiban untuk pekerja</p>
                </div>
                <div class="flex items-center">
                  <span class="w-10 text-right mr-2">RM</span>
                  <Input v-model="formData.caruman" type="number" placeholder="Jumlah" />
                </div>
              </div>
            </div>

            <Separator class="my-4" />

            <div class="flex flex-col space-y-2">
              <div class="flex flex-col space-y-1">
                <span class="font-medium text-center">Jumlah Taksiran</span>
                <div class="flex items-center">
                  <span class="text-right mr-2">RM</span>
                  <Input v-model="formData.jumlahTaksiran" type="number" placeholder="Jumlah" />
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
