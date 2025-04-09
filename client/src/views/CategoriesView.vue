<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// All payment categories
const categories = ref([
  { id: 1, name: 'Zakat Pendapatan', icon: '💳', type: 'bill' },
  { id: 2, name: 'Zakat Wang Simpanan', icon: '💰', type: 'bill' },
  { id: 3, name: 'Zakat Saham', icon: '📱', type: 'bill' },
  { id: 4, name: 'Zakat Emas', icon: '📶', type: 'bill' },
  { id: 5, name: 'Zakat Pertanian', icon: '📡', type: 'bill' },
  { id: 6, name: 'Zakat Ternakan', icon: '🥛', type: 'bill' },
  { id: 7, name: 'Zakat Fitrah', icon: '🙏', type: 'bill' },
  { id: 8, name: 'Audit Zakat', icon: '🛒', type: 'bill' },
  { id: 9, name: 'Donation', icon: '🏫', type: 'bill' },
  { id: 10, name: 'Asnaf Reporting', icon: '⚡', type: 'bill' },
  { id: 11, name: 'Zakat Calculator', icon: '🔥', type: 'bill' },
  { id: 12, name: 'Zakat Reporting', icon: '🏥', type: 'bill' },
  { id: 13, name: 'Zakat Statistics', icon: '🛡️', type: 'bill' },
  { id: 14, name: 'Zakat Information', icon: '☎️', type: 'bill' },
  // { id: 15, name: 'Mobile', icon: '📱', type: 'bill' },
  // { id: 16, name: 'Mutual Fund', icon: '📊', type: 'bill' },
  // { id: 17, name: 'Rental', icon: '🏠', type: 'bill' },
  // { id: 18, name: 'Shipping', icon: '📦', type: 'bill' },
  // { id: 19, name: 'Travel', icon: '✈️', type: 'bill' },
  // { id: 20, name: 'Water', icon: '💧', type: 'bill' },
  { id: 21, name: 'More', icon: '•••', type: 'bill' }
])

const goBack = () => {
  router.push('/')
}

const handleCategoryClick = (category) => {
  // For now, just log the category. In a real app, you would navigate to the specific category page
  console.log(`Selected category: ${category.name}`)
  // router.push(`/category/${category.id}`)
}
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-100">
    <!-- Header with back button -->
    <div class="bg-[#75a868] text-white p-4 rounded-b-3xl">
      <div class="flex items-center mb-4">
        <button @click="goBack" class="mr-2">
          <span class="text-xl">←</span>
        </button>
        <h1 class="text-lg font-semibold">More Categories</h1>
        <div class="ml-auto">
          <span class="text-xl">🔔</span>
        </div>
      </div>

      <!-- Quick action buttons -->
      <div class="flex justify-between mt-2 mb-4">
        <div class="flex flex-col items-center">
          <div class="bg-[#217e0a] p-3 rounded-full mb-1">
            <span class="text-white text-xl">💳</span>
          </div>
          <span class="text-xs text-white">Send Money</span>
        </div>
        <div class="flex flex-col items-center">
          <div class="bg-[#217e0a] p-3 rounded-full mb-1">
            <span class="text-white text-xl">💰</span>
          </div>
          <span class="text-xs text-white">Request Money</span>
        </div>
        <div class="flex flex-col items-center">
          <div class="bg-[#217e0a] p-3 rounded-full mb-1">
            <span class="text-white text-xl">📱</span>
          </div>
          <span class="text-xs text-white">Scan & Pay</span>
        </div>
      </div>
    </div>

    <!-- Add Bill Section -->
    <div class="p-4">
      <h2 class="text-md font-semibold mb-3">Add Bill</h2>
      
      <!-- Categories Grid -->
      <div class="grid grid-cols-4 gap-4">
        <div 
          v-for="category in categories.filter(c => c.type === 'bill')" 
          :key="category.id" 
          class="flex flex-col items-center mb-4"
          @click="handleCategoryClick(category)"
        >
          <div class="bg-white p-3 rounded-lg mb-1 w-14 h-14 flex items-center justify-center shadow-sm">
            <span class="text-xl">{{ category.icon }}</span>
          </div>
          <p class="text-xs text-center">{{ category.name }}</p>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <div class="fixed bottom-0 left-0 right-0 bg-white p-3 flex justify-between items-center border-t">
      <button class="flex flex-col items-center text-gray-400">
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
/* Custom styles for the categories page */
</style> 