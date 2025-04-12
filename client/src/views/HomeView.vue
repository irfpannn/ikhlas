<script setup>
import { Button, buttonVariants } from '@/components/ui/button'
import { BottomNavigation } from '@/components/ui/bottom-navigation'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// User data
const userData = ref({
  name: 'Bima Sakti',
  phone: '081987378782',
  balance: 238874,
  transactions: [
    {
      id: 1,
      name: 'Zakat Pendapatan',
      date: '15 Jun 2023',
      time: '14:25',
      amount: -150,
      icon: '📱',
    },
    {
      id: 2,
      name: 'Zakat Fitrah',
      date: '20 Apr 2023',
      time: '09:15',
      amount: -25,
      icon: '⚡',
    },
    {
      id: 3,
      name: 'Tambah Nilai',
      date: '10 Apr 2023',
      time: '16:42',
      amount: 500,
      icon: '💰',
    },
    {
      id: 4,
      name: 'Zakat Emas',
      date: '05 Mar 2023',
      time: '11:30',
      amount: -75,
      icon: '💰',
    },
  ],
})

// Categories with route names (match names in router/index.js)
const categories = [
  { id: 1, name: 'Zakat Pendapatan', icon: '💼', routeName: 'zakat-pendapatan' },
  { id: 2, name: 'Zakat Wang Simpanan', icon: '🏦', routeName: 'zakat-wang-simpanan' },
  { id: 3, name: 'Zakat Saham', icon: '📊', routeName: 'zakat-saham' },
  { id: 4, name: 'Zakat Emas', icon: '💰', routeName: 'zakat-emas' },
  { id: 5, name: 'Zakat Pertanian', icon: '🌾', routeName: 'payment' },
  { id: 6, name: 'Zakat Ternakan', icon: '🐄', routeName: 'payment' },
  { id: 7, name: 'Zakat Fitrah', icon: '🍚', routeName: 'zakat-fitrah' },
  // 'View All' is handled separately
]

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ms-MY', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
// Function to navigate to history page
const goToHistory = () => {
  router.push('/history') // Or use { name: 'history' }
}

// Function to navigate to categories page
const viewAllCategories = () => {
  router.push('/categories') // Or use { name: 'categories' }
}

// Function to navigate to a specific category page
const goToCategory = (routeName) => {
  if (routeName) {
    // Directly attempt to push the route since it should exist
    router.push({ name: routeName })
    // If the "No match" error persists after this change,
    // try restarting the development server and clearing browser cache.
  } else {
    // Optional: Show a message or do nothing if route is not defined
    console.warn('Route not defined for this category.')
    // You could use toast here as well:
    // import { toast } from 'vue-sonner';
    // toast.info('Halaman untuk kategori ini belum tersedia.');
  }
}

// Function to navigate to rewards page
const goToRewards = () => {
  router.push('/rewards')
}
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-100 overflow-y-auto pb-20">
    <!-- Content wrapper with padding -->
    <div class="p-4">
      <!-- Header with logo and profile -->
      <div class="flex justify-between items-center mb-4">
        <div class="flex items-center">
          <img src="/logo.png" alt="Ikhlas Logo" class="w-20 h-10" />

        </div>
        <div class="text-gray-500">
          <i class="fas fa-bell"></i>
        </div>
      </div>

      <!-- Balance Card -->
      <Card class="bg-[#75a868] text-white mb-4 shadow-sm border-none">
        <CardHeader class="pb-0">
          <div class="flex justify-between items-center">
            <div class="flex flex-col">
              <CardDescription class="text-white/80">Baki Anda</CardDescription>
              <CardTitle class="text-xl font-bold text-white"
                >RM {{ formatCurrency(userData.balance) }}</CardTitle
              >
            </div>
            <Button
              variant="outline"
              size="sm"
              class="bg-white text-[#75a868] hover:text-[#75a868] hover:bg-white/90 border-none"
            >
              Tambah Nilai
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <!-- Action buttons -->
          <div class="flex justify-between gap-3">
            <Button
              variant="secondary"
              class="bg-[#217e0a] hover:bg-[#217e0a]/90 text-white flex-1"
            >
              Hantar
            </Button>
            <Button
              variant="secondary"
              class="bg-[#217e0a] hover:bg-[#217e0a]/90 text-white flex-1"
            >
              Minta
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- Rewards section -->
      <Card class="mb-4 shadow-sm py-1">
        <CardContent class="p-3 flex justify-between items-center">
          <div class="flex items-center">
            <div class="bg-blue-100 p-2 rounded-full mr-3">
              <span class="text-[#75a868] text-xl">🎁</span>
            </div>
            <div>
              <p class="font-semibold">Ganjaran Mydin</p>
              <p class="text-xs text-gray-500">Disyorkan: 2</p>
            </div>
          </div>
          <Button
            variant="default"
            size="sm"
            class="bg-[#75a868] hover:bg-[#75a868]/90 text-white"
            @click="goToRewards"
          >
            Tuntut Sekarang
          </Button>
        </CardContent>
      </Card>

      <!-- Categories Grid -->
      <Card class="mb-4 shadow-sm">
        <CardHeader class="pb-2">
          <CardTitle class="text-base">Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-4 gap-3">
            <!-- Loop through defined categories -->
            <div
              v-for="category in categories"
              :key="category.id"
              class="flex flex-col items-center"
              :class="{ 'cursor-pointer': category.routeName }"
              @click="goToCategory(category.routeName)"
            >
              <div
                class="bg-gray-100 p-2 rounded-lg mb-1 w-12 h-12 flex items-center justify-center"
              >
                <span class="text-xl">{{ category.icon }}</span>
              </div>
              <p class="text-xs text-center">{{ category.name }}</p>
            </div>
            <!-- View All Button -->
            <div class="flex flex-col items-center cursor-pointer" @click="viewAllCategories">
              <div
                class="bg-gray-100 p-2 rounded-lg mb-1 w-12 h-12 flex items-center justify-center"
              >
                <span class="text-xl">📋</span>
              </div>
              <p class="text-xs text-center">Lihat Semua</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Transaction History -->
      <Card class="shadow-sm">
        <CardHeader class="pb-2 flex flex-row items-center justify-between">
          <CardTitle class="text-base">Sejarah</CardTitle>
          <Button variant="link" size="sm" class="text-[#75a868] -mr-3" @click="goToHistory"
            >Lihat Semua</Button
          >
        </CardHeader>
        <CardContent class="pt-0">
          <div
            v-for="transaction in userData.transactions"
            :key="transaction.id"
            class="flex justify-between items-center py-2 border-b border-gray-100"
          >
            <div class="flex items-center">
              <div class="bg-gray-100 p-2 rounded-full mr-3">
                <span class="text-xl">{{ transaction.icon }}</span>
              </div>
              <div>
                <p class="font-medium">{{ transaction.name }}</p>
                <p class="text-xs text-gray-500">{{ transaction.date }} • {{ transaction.time }}</p>
              </div>
            </div>
            <p :class="transaction.amount < 0 ? 'text-red-500' : 'text-green-500'">
              {{ transaction.amount < 0 ? '-' : '+' }}RM
              {{ formatCurrency(Math.abs(transaction.amount)) }}
            </p>
          </div>
        </CardContent>
        <CardFooter
          v-if="userData.transactions.length === 0"
          class="text-sm text-gray-500 flex justify-center"
        >
          Tiada transaksi untuk dipaparkan
        </CardFooter>
      </Card>

      <!-- Bottom Navigation -->
      <BottomNavigation />
    </div>
  </div>
</template>

<style scoped></style>
