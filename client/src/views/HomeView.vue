<script setup>
import Button from '@/volt/Button.vue'
import { ref } from 'vue'

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
      icon: '☕' 
    }
  ]
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
  { id: 8, name: 'View All', icon: '📋' }
]

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ms-MY', { 
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-100 p-4">
    <!-- Header with logo and profile -->
    <div class="flex justify-between items-center mb-4">
      <div class="flex items-center">
        <div class="bg-blue-500 text-white rounded-full p-1 mr-2">
          <span class="text-xs">O</span>
        </div>
        <span class="font-semibold">Ikhlas</span>
      </div>
      <div class="text-gray-500">
        <i class="fas fa-bell"></i>
      </div>
    </div>

    <!-- Balance Card -->
    <div class="bg-blue-500 rounded-xl p-4 text-white mb-4">
      <div class="flex justify-between items-center mb-2">
        <div>
          <p class="text-xs opacity-80">Your Balance</p>
          <p class="text-xl font-bold">RM {{ formatCurrency(userData.balance) }}</p>
        </div>
        <button class="bg-white text-blue-500 text-xs px-3 py-1 rounded-full">Top Up</button>
      </div>
      
      <!-- Action buttons -->
      <div class="flex justify-between mt-4">
        <button class="bg-blue-400 flex-1 mr-2 py-2 rounded-lg text-center">
          <span>Send</span>
        </button>
        <button class="bg-blue-400 flex-1 ml-2 py-2 rounded-lg text-center">
          <span>Request</span>
        </button>
      </div>
    </div>

    <!-- Rewards section -->
    <div class="bg-white rounded-xl p-3 mb-4 flex justify-between items-center">
      <div class="flex items-center">
        <div class="bg-blue-100 p-2 rounded-full mr-3">
          <span class="text-blue-500 text-xl">🎁</span>
        </div>
        <div>
          <p class="font-semibold">Alipay+ Rewards</p>
          <p class="text-xs text-gray-500">Recommend: 2</p>
        </div>
      </div>
      <button class="bg-blue-500 text-white text-xs px-3 py-1 rounded-full">Claim Now</button>
    </div>

    <!-- Categories Grid -->
    <div class="bg-white rounded-xl p-4 mb-4">
      <div class="grid grid-cols-4 gap-3">
        <div v-for="category in categories" :key="category.id" class="flex flex-col items-center">
          <div class="bg-gray-100 p-2 rounded-lg mb-1 w-12 h-12 flex items-center justify-center">
            <span class="text-xl">{{ category.icon }}</span>
          </div>
          <p class="text-xs text-center">{{ category.name }}</p>
        </div>
      </div>
    </div>

    <!-- Transaction History -->
    <div class="bg-white rounded-xl p-4">
      <div class="flex justify-between items-center mb-3">
        <h3 class="font-semibold">History</h3>
        <button class="text-blue-500 text-xs">View All</button>
      </div>
      
      <div v-for="transaction in userData.transactions" :key="transaction.id" class="flex justify-between items-center py-2 border-b border-gray-100">
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
          {{ transaction.amount < 0 ? '-' : '+' }}RM {{ formatCurrency(Math.abs(transaction.amount)) }}
        </p>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <div class="fixed bottom-0 left-0 right-0 bg-white p-3 flex justify-between items-center border-t">
      <button class="flex flex-col items-center text-blue-500">
        <span class="text-xl">🏠</span>
        <span class="text-xs">Home</span>
      </button>
      <button class="flex flex-col items-center text-gray-400">
        <span class="text-xl">📊</span>
        <span class="text-xs">History</span>
      </button>
      <div class="relative">
        <button class="bg-blue-500 text-white rounded-full p-4 -mt-8">
          <span class="text-xl">💰</span>
        </button>
      </div>
      <button class="flex flex-col items-center text-gray-400">
        <span class="text-xl">🎁</span>
        <span class="text-xs">Pocket</span>
      </button>
      <button class="flex flex-col items-center text-gray-400">
        <span class="text-xl">👤</span>
        <span class="text-xs">Me</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Add any additional custom styles here */
</style>
