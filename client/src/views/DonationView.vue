<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { BottomNavigation } from '@/components/ui/bottom-navigation'
import { Input } from '@/components/ui/input'

const router = useRouter()

const goBack = () => {
  router.push('/categories')
}

// Sample donation campaigns
const campaigns = ref([
  {
    id: 1,
    title: 'Urgent! Help the construction mosque',
    organization: 'Adaa Bissaa',
    image: '/images/mosque-construction.jpg',
    amount: 23423,
    daysLeft: 31
  },
  {
    id: 2,
    title: 'Water Waqf for poor Orphans',
    organization: 'Yaghu yayasan',
    image: '/images/water-orphans.jpg',
    amount: 12000,
    daysLeft: 2
  },
  {
    id: 3,
    title: 'Elderly strokes work roughly paid 20 thousand',
    organization: 'Prikitiw',
    image: '/images/elderly-care.jpg',
    amount: 40200,
    daysLeft: 20
  },
  {
    id: 4,
    title: "Help people who can't continue their education",
    organization: 'Bissaaa kuy',
    image: '/images/education.jpg',
    amount: 0,
    daysLeft: null
  }
])

// Active category filter
const activeCategory = ref('Scholarship')
const categories = ref([
  { name: 'Scholarship', count: 20 },
  { name: 'Disaster', count: 8 },
  { name: 'Health', count: 4 }
])

const setActiveCategory = (category) => {
  activeCategory.value = category
}

const formatAmount = (amount) => {
  return `RM${amount.toLocaleString()}`
}

// Add this function to handle clicking on a donation card
const viewDonationDetails = (campaign) => {
  router.push({
    name: 'DonationDetails',
    params: { id: campaign.id }
  })
}
</script>

<template>
  <div class="flex flex-col min-h-dvh bg-gray-100 pb-20">
    <!-- Header with search bar -->
    <div class="bg-white p-4 sticky top-0 z-10">
      <div class="flex items-center mb-4">
        <Button
          variant="ghost"
          class="text-gray-700 hover:bg-gray-100 mr-2 p-2"
          @click="goBack"
        >
          <span class="text-xl">←</span>
        </Button>
        <div class="relative flex-1">
          <Input 
            type="text" 
            placeholder="Search campaign" 
            class="w-full bg-gray-100 pl-10 py-2 rounded-xl"
          />
          <div class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <span>🔍</span>
          </div>
        </div>
      </div>

      <!-- Category filters -->
      <div class="flex space-x-4 overflow-x-auto py-2">
        <div 
          v-for="category in categories" 
          :key="category.name"
          @click="setActiveCategory(category.name)"
          class="flex items-center space-x-1 cursor-pointer"
          :class="activeCategory === category.name ? 'text-black font-medium' : 'text-gray-500'"
        >
          <span>{{ category.name }}</span>
          <span class="text-xs bg-gray-200 px-1.5 py-0.5 rounded-full">{{ category.count }}</span>
        </div>
      </div>
    </div>

    <!-- Campaign listings -->
    <div class="p-4 space-y-4">
      <div 
        v-for="campaign in campaigns" 
        :key="campaign.id" 
        class="bg-white rounded-xl overflow-hidden shadow-sm cursor-pointer"
        @click="viewDonationDetails(campaign)"
      >
        <div class="relative h-32 bg-gray-200">
          <img 
            :src="campaign.image" 
            :alt="campaign.title"
            class="w-full h-full object-cover"
            onerror="this.src='/images/placeholder.jpg'"
          />
        </div>
        <div class="p-3">
          <h3 class="font-medium text-sm">{{ campaign.title }}</h3>
          <p class="text-xs text-gray-500 mb-2">{{ campaign.organization }}</p>
          
          <div v-if="campaign.amount > 0" class="flex justify-between items-center">
            <span class="text-green-500 font-medium">{{ formatAmount(campaign.amount) }}</span>
            <span v-if="campaign.daysLeft" class="text-xs text-gray-500">{{ campaign.daysLeft }} days left</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<style scoped>
/* Custom styles for donation page */
</style> 