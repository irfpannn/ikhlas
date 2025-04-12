<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { BottomNavigation } from '@/components/ui/bottom-navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

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
  { id: 13, name: 'Zakat Statistics', icon: '🛡️', type: 'bill' },
  { id: 10, name: 'Asnaf Reporting', icon: '⚡', type: 'bill' },
  { id: 11, name: 'Donation', icon: '🏫', type: 'bill' },
  { id: 8, name: 'Audit Zakat', icon: '🛒', type: 'bill' },
  { id: 14, name: 'Distribution Sources', icon: '☎️', type: 'bill' },
  { id: 15, name: 'Manage Points', icon: '📦', type: 'bill' },
  { id: 16, name: 'Rewards', icon: '🎁', type: 'bill' },
  // { id: 15, name: 'Mobile', icon: '📱', type: 'bill' },
  // { id: 16, name: 'Mutual Fund', icon: '📊', type: 'bill' },
  // { id: 17, name: 'Rental', icon: '🏠', type: 'bill' },
  // { id: 18, name: 'Shipping', icon: '📦', type: 'bill' },
  // { id: 19, name: 'Travel', icon: '✈️', type: 'bill' },
  // { id: 20, name: 'Water', icon: '💧', type: 'bill' },
  // { id: 21, name: 'More', icon: '•••', type: 'bill' },
])

const goBack = () => {
  router.push('/')
}

const handleCategoryClick = (category) => {
  // Navigate based on category name
  if (category.name === 'Zakat Pendapatan') {
    router.push('/zakat-pendapatan')
  } else if (category.name === 'Asnaf Reporting') {
    router.push('/asnaf-reporting')
  } else if (category.name === 'Audit Zakat') {
    router.push('/audit-zakat')
  } else if (category.name === 'Distribution Sources') {
    router.push('/distribution-sources')
  } else if (category.name === 'Donation') {
    router.push('/donation')
  } else if (category.name === 'Rewards') {
    router.push('/rewards')
  } else {
    // For other categories, just log for now
    console.log(`Selected category: ${category.name}`)
  }
}
</script>

<template>
  <div class="flex flex-col min-h-dvh bg-gray-100 overflow-y-auto pb-20">
    <!-- Header with back button - sticky -->
    <div class="bg-[#75a868] text-white p-4 rounded-b-3xl sticky top-0 z-10">
      <div class="flex items-center mb-4">
        <Button
          variant="ghost"
          class="text-white hover:text-white hover:bg-[#217e0a]/50 mr-2 p-2"
          @click="goBack"
        >
          <span class="text-xl">←</span>
        </Button>
        <h1 class="text-lg font-semibold">More Categories</h1>
        <div class="ml-auto">
          <Button variant="ghost" class="text-white hover:text-white hover:bg-[#217e0a]/50 p-2">
            <span class="text-xl">🔔</span>
          </Button>
        </div>
      </div>

      <!-- Quick action buttons -->
      <div class="flex justify-between mt-2 mb-4">
        <div class="flex flex-col items-center">
          <Button
            variant="secondary"
            class="bg-[#217e0a] hover:bg-[#217e0a]/90 p-3 rounded-full mb-1 h-auto w-auto"
          >
            <span class="text-xl">💳</span>
          </Button>
          <span class="text-xs text-white">Send Money</span>
        </div>
        <div class="flex flex-col items-center">
          <Button
            variant="secondary"
            class="bg-[#217e0a] hover:bg-[#217e0a]/90 p-3 rounded-full mb-1 h-auto w-auto"
          >
            <span class="text-white text-xl">💰</span>
          </Button>
          <span class="text-xs text-white">Request Money</span>
        </div>
        <div class="flex flex-col items-center">
          <Button
            variant="secondary"
            class="bg-[#217e0a] hover:bg-[#217e0a]/90 p-3 rounded-full mb-1 h-auto w-auto"
          >
            <span class="text-white text-xl">📱</span>
          </Button>
          <span class="text-xs text-white">Scan & Pay</span>
        </div>
      </div>
    </div>

    <!-- Add Bill Section -->
    <div class="p-4">
      <Card class="shadow-sm pb-2">
        <CardHeader class="pb-2">
          <CardTitle class="text-base">Add Bill</CardTitle>
        </CardHeader>
        <CardContent>
          <!-- Categories Grid -->
          <div class="grid grid-cols-4 gap-4">
            <div
              v-for="category in categories.filter((c) => c.type === 'bill')"
              :key="category.id"
              class="flex flex-col items-center mb-4 cursor-pointer"
              @click="handleCategoryClick(category)"
            >
              <Button
                variant="outline"
                class="bg-white p-3 rounded-lg mb-1 w-14 h-14 flex items-center justify-center hover:bg-gray-50 border-none shadow-sm"
              >
                <span class="text-xl">{{ category.icon }}</span>
              </Button>
              <p class="text-xs text-center">{{ category.name }}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<style scoped>
/* Custom styles for the categories page */
</style>
