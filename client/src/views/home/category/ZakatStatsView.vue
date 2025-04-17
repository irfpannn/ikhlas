<template>
  <div class="flex flex-col min-h-screen bg-gray-100 pb-20">
    <!-- Header -->
    <div class="bg-white p-4 flex items-center shadow-sm sticky top-0 z-10">
      <button @click="goBack" class="mr-4">
        <span class="text-xl">←</span>
        <!-- Keep icon size -->
      </button>
      <h1 class="text-lg font-semibold">Statistik Zakat</h1>
      <!-- text-lg is suitable -->
    </div>

    <!-- Main content -->
    <div class="p-4 space-y-4">
      <!-- Overall Summary Cards -->
      <div class="grid grid-cols-2 gap-4">
        <Card class="shadow-sm">
          <CardHeader class="pb-2">
            <CardTitle class="text-sm font-medium text-gray-600">Jumlah Kutipan Zakat</CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-m font-bold text-green-700">
              <!-- Changed from text-2xl to text-xl -->
              {{ formatCurrency(stats.totalCollectedRM) }}
            </p>
            <!-- <p class="text-xs text-gray-500">+ {{ stats.totalCollectedCrypto.toFixed(4) }} ETH</p> -->
            <!-- Use text-xs -->
          </CardContent>
        </Card>
        <Card class="shadow-sm">
          <CardHeader class="pb-2">
            <CardTitle class="text-sm font-medium text-gray-600">Jumlah Agihan Zakat</CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-m font-bold text-blue-700">
              <!-- Changed from text-2xl to text-xl -->
              {{ formatCurrency(stats.totalDistributedRM) }}
            </p>
          </CardContent>
        </Card>
        <Card class="shadow-sm">
          <CardHeader class="pb-2">
            <CardTitle class="text-sm font-medium text-gray-600"
              >Bilangan Pembayar Zakat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-m font-bold">{{ stats.totalPayers }}</p>
            <!-- Changed from text-2xl to text-xl -->
          </CardContent>
        </Card>
        <Card class="shadow-sm">
          <CardHeader class="pb-2">
            <CardTitle class="text-sm font-medium text-gray-600"
              >Bilangan Penerima Zakat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-m font-bold">{{ stats.totalRecipients }}</p>
          </CardContent>
        </Card>
        <Card class="shadow-sm">
          <CardHeader class="pb-2">
            <CardTitle class="text-sm font-medium text-gray-600"
              >Purata Bayaran / Pembayar</CardTitle
            >
          </CardHeader>
          <CardContent>
            <p class="text-m font-bold text-purple-700">
              {{ formatCurrency(stats.averagePaymentPerPayerRM) }}
            </p>
          </CardContent>
        </Card>
        <Card class="shadow-sm">
          <CardHeader class="pb-2">
            <CardTitle class="text-sm font-medium text-gray-600"
              >Purata Agihan / Penerima</CardTitle
            >
          </CardHeader>
          <CardContent>
            <p class="text-m font-bold text-orange-700">
              {{ formatCurrency(stats.averageDistributionPerRecipientRM) }}
            </p>
          </CardContent>
        </Card>
      </div>

      <!-- Collection Breakdown -->
      <Card class="shadow-sm">
        <CardHeader>
          <CardTitle class="text-base">Pecahan Kutipan Zakat Mengikut Jenis</CardTitle>
        </CardHeader>
        <CardContent class="space-y-2">
          <div
            v-for="(amount, type) in stats.collectionByType"
            :key="type"
            class="flex justify-between items-center text-sm"
          >
            <span class="text-gray-700">{{ type }}</span>
            <span class="font-medium">{{ formatCurrency(amount) }}</span>
          </div>
          <Separator class="my-2 !mt-3" />
          <div class="flex justify-between items-center text-sm font-semibold">
            <span>Jumlah</span>
            <span>{{ formatCurrency(stats.totalCollectedRM) }}</span>
          </div>
        </CardContent>
      </Card>

      <!-- Distribution Breakdown -->
      <Card class="shadow-sm">
        <CardHeader>
          <CardTitle class="text-base">Pecahan Agihan Zakat Mengikut Asnaf</CardTitle>
        </CardHeader>
        <CardContent class="space-y-2">
          <div
            v-for="(amount, category) in stats.distributionByCategory"
            :key="category"
            class="flex justify-between items-center text-sm"
          >
            <span class="text-gray-700">{{ category }}</span>
            <span class="font-medium">{{ formatCurrency(amount) }}</span>
          </div>
          <Separator class="my-2 !mt-3" />
          <div class="flex justify-between items-center text-sm font-semibold">
            <span>Jumlah</span>
            <span>{{ formatCurrency(stats.totalDistributedRM) }}</span>
          </div>
        </CardContent>
      </Card>

      <!-- Payment Method Breakdown -->
      <Card class="shadow-sm">
        <CardHeader>
          <CardTitle class="text-base">Pecahan Kaedah Pembayaran</CardTitle>
        </CardHeader>
        <CardContent class="space-y-2">
          <div
            v-for="(count, method) in stats.paymentMethodsBreakdown"
            :key="method"
            class="flex justify-between items-center text-sm"
          >
            <span class="text-gray-700">{{ method }}</span>
            <span class="font-medium">{{ count }} transaksi</span>
          </div>
          <Separator class="my-2 !mt-3" />
          <div class="flex justify-between items-center text-sm font-semibold">
            <span>Jumlah Pembayar</span>
            <span>{{ stats.totalPayers }}</span>
          </div>
        </CardContent>
      </Card>

      <!-- Placeholder for Charts -->
      <!--
      <Card>
        <CardHeader><CardTitle>Visualisasi Data</CardTitle></CardHeader>
        <CardContent>
          <p class="text-center text-gray-500">(Graf/Carta akan dipaparkan di sini)</p>
          // Chart components would go here
        </CardContent>
      </Card>
      -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue' // Import computed
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import Separator from '@/components/ui/separator/Separator.vue'

const router = useRouter()

// Mock Statistics Data
const stats = ref({
  totalCollectedRM: 1250500.75,
  totalCollectedCrypto: 15.345, // Example crypto amount
  totalDistributedRM: 985200.5,
  totalPayers: 5842,
  totalRecipients: 1235,
  collectionByType: {
    'Zakat Pendapatan': 650000.0,
    'Zakat Perniagaan': 210000.5, // Added for variety
    'Zakat Wang Simpanan': 150200.25,
    'Zakat Emas': 85300.0,
    'Zakat Saham': 75000.0,
    'Zakat Fitrah': 80000.0,
    // Add other types as needed
  },
  distributionByCategory: {
    Fakir: 250000.0,
    Miskin: 310500.5,
    Amil: 90000.0,
    Muallaf: 75000.0,
    Riqab: 15000.0, // Example
    Gharimin: 110500.0,
    'Fi Sabilillah': 89200.0,
    'Ibnus Sabil': 45000.0,
  },
  // Computed properties will handle averages
  averagePaymentPerPayerRM: computed(() =>
    stats.value.totalPayers > 0 ? stats.value.totalCollectedRM / stats.value.totalPayers : 0,
  ),
  averageDistributionPerRecipientRM: computed(() =>
    stats.value.totalRecipients > 0
      ? stats.value.totalDistributedRM / stats.value.totalRecipients
      : 0,
  ),
  paymentMethodsBreakdown: {
    'Perbankan Online': 3500,
    'Kaunter Zakat': 1200,
    'Potongan Gaji': 942,
    'Aplikasi Mudah Alih': 150,
    'Aplikasi Mudah Alih (Crypto)': 50,
  },
})

const goBack = () => {
  // Navigate back, potentially to home or categories
  router.push('/categories') // Or router.go(-1)
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

// Add chart logic here if using a chart library
</script>

<style scoped>
/* Add any additional custom styles if needed */
</style>
