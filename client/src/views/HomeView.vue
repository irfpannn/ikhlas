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
      name: 'Kopi Pelabor',
      date: '27 Nov 2023',
      time: '10:33',
      amount: -10,
      icon: '☕',
    },
  ],
})

// Categories
const categories = [
  { id: 1, name: 'Zakat Pendapatan', icon: '📱' },
  { id: 2, name: 'Zakat Wang Simpanan', icon: '🎯' },
  { id: 3, name: 'Zakat Saham', icon: '💸' },
  { id: 4, name: 'Zakat Emas', icon: '💰' },
  { id: 5, name: 'Zakat Pertanian', icon: '🎁' },
  { id: 6, name: 'Zakat Ternakan', icon: '💳' },
  { id: 7, name: 'Zakat Fitrah', icon: '⚡' },
  { id: 8, name: 'View All', icon: '📋' },
]

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ms-MY', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

// Function to navigate to categories page
const viewAllCategories = () => {
  router.push('/categories')
}

// Function to navigate to zakat pendapatan page
const goToZakatPendapatan = () => {
  router.push('/zakat-pendapatan')
}
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-100 overflow-y-auto pb-20">
    <!-- Content wrapper with padding -->
    <div class="p-4">
      <!-- Header with logo and profile -->
      <div class="flex justify-between items-center mb-4">
        <div class="flex items-center">
          <div class="bg-[#75a868] text-white rounded-full p-1 mr-2">
            <span class="text-xs">O</span>
          </div>
          <span class="font-semibold">Ikhlas</span>
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
              <CardDescription class="text-white/80">Your Balance</CardDescription>
              <CardTitle class="text-xl font-bold text-white"
                >RM {{ formatCurrency(userData.balance) }}</CardTitle
              >
            </div>
            <Button
              variant="outline"
              size="sm"
              class="bg-white text-[#75a868] hover:text-[#75a868] hover:bg-white/90 border-none"
            >
              Top Up
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
              Send
            </Button>
            <Button
              variant="secondary"
              class="bg-[#217e0a] hover:bg-[#217e0a]/90 text-white flex-1"
            >
              Request
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
              <p class="font-semibold">Alipay+ Rewards</p>
              <p class="text-xs text-gray-500">Recommend: 2</p>
            </div>
          </div>
          <Button variant="default" size="sm" class="bg-[#75a868] hover:bg-[#75a868]/90 text-white">
            Claim Now
          </Button>
        </CardContent>
      </Card>

      <!-- Categories Grid -->
      <Card class="mb-4 shadow-sm">
        <CardHeader class="pb-2">
          <CardTitle class="text-base">Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-4 gap-3">
            <div
              v-for="category in categories.slice(0, 7)"
              :key="category.id"
              class="flex flex-col items-center"
              :class="{ 'cursor-pointer': category.name === 'Zakat Pendapatan' }"
              @click="category.name === 'Zakat Pendapatan' ? goToZakatPendapatan() : null"
            >
              <div
                class="bg-gray-100 p-2 rounded-lg mb-1 w-12 h-12 flex items-center justify-center"
              >
                <span class="text-xl">{{ category.icon }}</span>
              </div>
              <p class="text-xs text-center">{{ category.name }}</p>
            </div>
            <div class="flex flex-col items-center cursor-pointer" @click="viewAllCategories">
              <div
                class="bg-gray-100 p-2 rounded-lg mb-1 w-12 h-12 flex items-center justify-center"
              >
                <span class="text-xl">📋</span>
              </div>
              <p class="text-xs text-center">View All</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Transaction History -->
      <Card class="shadow-sm">
        <CardHeader class="pb-2 flex flex-row items-center justify-between">
          <CardTitle class="text-base">History</CardTitle>
          <Button variant="link" size="sm" class="text-[#75a868] -mr-3">View All</Button>
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
          No transactions to display
        </CardFooter>
      </Card>

      <!-- Bottom Navigation -->
      <BottomNavigation />
    </div>
  </div>
</template>

<style scoped>
/* Add any additional custom styles here */
</style>
