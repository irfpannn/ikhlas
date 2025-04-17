<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useDonationStore } from '@/stores/donationStore'
import { Button } from '@/components/ui/button'
import { BottomNavigation } from '@/components/ui/bottom-navigation'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const router = useRouter()
const donationStore = useDonationStore()

// Fetch donations on component mount
const { donations, loading, error } = storeToRefs(donationStore)

onMounted(() => {
  // Call the renamed action
  donationStore.fetchAllDonations()
})

const goBack = () => {
  // Go back or default to home
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}

// Search and Category Filtering
const searchQuery = ref('')
const activeCategory = ref('Semua')
const categories = ref(['Semua', 'Biasiswa', 'Bencana', 'Kesihatan', 'Masjid', 'Wakaf'])

const filteredDonations = computed(() => {
  let result = donations.value

  // Filter by category
  if (activeCategory.value !== 'Semua') {
    // Assuming donations have a 'category' field
    result = result.filter((d) => d.category === activeCategory.value)
  }

  // Filter by search query (simple title search)
  if (searchQuery.value) {
    const lowerQuery = searchQuery.value.toLowerCase()
    result = result.filter((d) => d.title.toLowerCase().includes(lowerQuery))
  }

  return result
})

const setActiveCategory = (category) => {
  activeCategory.value = category
}

const formatAmount = (amount) => {
  if (typeof amount !== 'number') return 'RM0'
  return `RM${amount.toLocaleString()}`
}

const getProgress = (donation) => {
  if (!donation || !donation.target || donation.target === 0) return 0
  return Math.min(100, Math.round((donation.amount / donation.target) * 100))
}

const viewDonationDetails = (donation) => {
  router.push({
    name: 'DonationDetails',
    params: { id: donation.id },
  })
}
</script>

<template>
  <div class="flex flex-col min-h-dvh bg-gray-100 pb-20">
    <!-- Header with search bar -->
    <div class="bg-white p-4 sticky top-0 z-10 border-b">
      <div class="flex items-center mb-4">
        <Button
          variant="ghost"
          class="text-gray-700 hover:bg-gray-100 mr-2 p-2 rounded-full w-9 h-9"
          @click="goBack"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
        </Button>
        <div class="relative flex-1">
          <Input
            type="text"
            v-model="searchQuery"
            placeholder="Cari derma..."
            class="w-full bg-gray-100 border-gray-200 pl-10 py-2 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
          />
          <div class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      <!-- Category filters -->
      <div class="flex space-x-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        <Button
          v-for="category in categories"
          :key="category"
          @click="setActiveCategory(category)"
          size="sm"
          :variant="activeCategory === category ? 'default' : 'outline'"
          class="whitespace-nowrap rounded-full px-4 h-8 text-xs"
          :class="
            activeCategory === category
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : 'border-gray-300 text-gray-600'
          "
        >
          {{ category }}
        </Button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div v-for="n in 4" :key="n" class="bg-white rounded-lg overflow-hidden shadow-sm">
        <Skeleton class="h-32 w-full" />
        <div class="p-3 space-y-2">
          <Skeleton class="h-4 w-3/4" />
          <Skeleton class="h-3 w-1/2" />
          <Skeleton class="h-2 w-full" />
          <div class="flex justify-between">
            <Skeleton class="h-4 w-1/4" />
            <Skeleton class="h-3 w-1/4" />
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-4">
      <Alert variant="destructive">
        <AlertTitle>Ralat</AlertTitle>
        <AlertDescription>{{ error }}</AlertDescription>
      </Alert>
      <Button @click="donationStore.fetchAllDonations" variant="outline" class="mt-4"
        >Cuba Lagi</Button
      >
    </div>

    <!-- Donation listings -->
    <div v-else-if="filteredDonations.length > 0" class="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div
        v-for="donation in filteredDonations"
        :key="donation.id"
        class="bg-white rounded-lg overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200 flex flex-col"
        @click="viewDonationDetails(donation)"
      >
        <div class="relative h-36 bg-gray-200">
          <img
            :src="donation.image || '/images/placeholder.jpg'"
            :alt="donation.title"
            class="w-full h-full object-cover"
            onerror="this.src='/images/placeholder.jpg'"
          />
        </div>
        <div class="p-4 flex flex-col flex-grow">
          <h3 class="font-semibold text-base mb-1 line-clamp-2">{{ donation.title }}</h3>
          <p class="text-xs text-gray-500 mb-3">{{ donation.organization }}</p>

          <!-- Progress Bar -->
          <div class="mb-3 mt-auto pt-2">
            <div class="flex justify-between text-xs mb-1">
              <span class="font-medium text-emerald-600">{{ formatAmount(donation.amount) }}</span>
              <span class="text-gray-500">/ {{ formatAmount(donation.target) }}</span>
            </div>
            <div class="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-green-400 to-emerald-600 rounded-full"
                :style="`width: ${getProgress(donation)}%`"
              ></div>
            </div>
            <div class="flex justify-between text-xs text-gray-500 mt-1">
              <span>{{ getProgress(donation) }}%</span>
              <span v-if="donation.daysLeft != null">{{
                donation.daysLeft >= 0 ? `${donation.daysLeft} hari lagi` : 'Tamat'
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Donations Found -->
    <div v-else class="p-4 text-center text-gray-500">
      <p>Tiada derma dijumpai.</p>
    </div>

    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<style scoped>
/* Hide scrollbar for category filters */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
</style>
