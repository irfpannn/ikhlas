<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { BottomNavigation } from '@/components/ui/bottom-navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { toast } from 'vue-sonner'

const router = useRouter()

// All payment categories with route names
const categories = ref([
  { id: 1, name: 'Zakat Pendapatan', icon: '💼', type: 'bill', routeName: 'zakat-pendapatan' }, // Match HomeView
  {
    id: 2,
    name: 'Zakat Wang Simpanan',
    icon: '🏦', // Match HomeView
    type: 'bill',
    routeName: 'zakat-wang-simpanan',
  },
  { id: 3, name: 'Zakat Saham', icon: '📊', type: 'bill', routeName: 'zakat-saham' }, // Match HomeView
  { id: 4, name: 'Zakat Emas', icon: '💰', type: 'bill', routeName: 'zakat-emas' }, // Match HomeView
  { id: 5, name: 'Zakat Pertanian', icon: '🌾', type: 'bill', routeName: null }, // Match HomeView
  { id: 6, name: 'Zakat Ternakan', icon: '🐄', type: 'bill', routeName: null }, // Match HomeView
  { id: 7, name: 'Zakat Fitrah', icon: '🍚', type: 'bill', routeName: 'zakat-fitrah' }, // Match HomeView
  { id: 13, name: 'Zakat Statistics', icon: '📈', type: 'bill', routeName: 'zakat-stats' }, // Chart Increasing
  { id: 10, name: 'Asnaf Reporting', icon: '📝', type: 'bill', routeName: 'asnaf-reporting' }, // Memo/Report
  { id: 11, name: 'Donation', icon: '🤝', type: 'bill', routeName: null }, // Handshake/Giving
  { id: 8, name: 'Audit Zakat', icon: '🔍', type: 'bill', routeName: 'audit-zakat' }, // Magnifying Glass
  {
    id: 14,
    name: 'Distribution Sources',
    icon: '🚚', // Delivery Truck/Distribution
    type: 'bill',
    routeName: 'DistributionSources',
  },
  // ... other categories ...
])

const goBack = () => {
  router.push('/')
}

const handleCategoryClick = (category) => {
  if (category.routeName) {
    // Check if the route exists before navigating
    if (router.hasRoute(category.routeName)) {
      router.push({ name: category.routeName })
    } else {
      console.error(`Route with name "${category.routeName}" not found in router configuration.`)
      toast.error(`Halaman untuk "${category.name}" tidak ditemui atau belum tersedia.`)
    }
  } else {
    // Handle categories without a defined routeName
    console.warn(`Route not defined for category: ${category.name}`)
    toast.info(`Halaman untuk "${category.name}" belum tersedia.`)
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
