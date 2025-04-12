<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { BottomNavigation } from '@/components/ui/bottom-navigation'

const route = useRoute()
const router = useRouter()
const campaignId = parseInt(route.params.id)
const donationAmount = parseFloat(route.query.amount || 0)
const donationCurrency = ref(route.query.currency || 'RM')
const receiptNumber = ref(`DON-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`)
const donationDate = ref(new Date().toLocaleDateString('en-MY', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
}))

// Generate random reward points based on donation amount
const rewardPoints = ref(Math.floor(Math.random() * 50) + 10) // Random points between 10-59

// Sample donation campaigns (same as in DonationView)
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

const campaign = computed(() => {
  return campaigns.value.find(c => c.id === campaignId) || {}
})

const formatAmount = (amount) => {
  if (donationCurrency.value === 'RM') {
    return `RM${amount.toLocaleString()}`
  } else if (donationCurrency.value === 'BTC') {
    return `${amount} BTC`
  } else if (donationCurrency.value === 'ETH') {
    return `${amount} ETH`
  } else if (donationCurrency.value === 'USDT') {
    return `${amount} USDT`
  }
  return ''
}

const goToHome = () => {
  router.push('/')
}

const viewReceipt = () => {
  // In a real app, this would generate and download a PDF receipt
  alert('Receipt download functionality would be implemented here')
}

const shareDonation = () => {
  // In a real app, this would open a share dialog
  alert('Share functionality would be implemented here')
}
</script>

<template>
  <div class="flex flex-col min-h-dvh bg-gray-100 pb-20">
    <!-- Success Animation -->
    <div class="bg-white py-8 px-4 text-center">
      <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span class="text-3xl text-green-500">✓</span>
      </div>
      <h1 class="text-xl font-medium mb-2">Thank You!</h1>
      <p class="text-gray-600 mb-4">Your donation has been processed successfully</p>
      <div class="text-2xl font-bold text-green-600 mb-1">{{ formatAmount(donationAmount) }}</div>
      <p class="text-sm text-gray-500">Receipt #{{ receiptNumber }}</p>
      
      <!-- Reward Points Banner -->
      <div class="mt-4 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
        <div class="text-yellow-800 font-medium">🎉 You earned {{ rewardPoints }} points!</div>
        <p class="text-xs text-yellow-700 mt-1">Points have been added to your rewards balance</p>
      </div>
    </div>

    <!-- Donation Details -->
    <div class="bg-white mt-4 p-4">
      <h3 class="font-medium mb-3">Donation Details</h3>
      
      <div class="space-y-3 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-600">Campaign</span>
          <span class="font-medium">{{ campaign.title }}</span>
        </div>
        
        <div class="flex justify-between">
          <span class="text-gray-600">Organization</span>
          <span>{{ campaign.organization }}</span>
        </div>
        
        <div class="flex justify-between">
          <span class="text-gray-600">Date & Time</span>
          <span>{{ donationDate }}</span>
        </div>
        
        <div class="flex justify-between">
          <span class="text-gray-600">Payment Method</span>
          <span>Credit Card</span>
        </div>
        
        <div class="flex justify-between">
          <span class="text-gray-600">Amount</span>
          <span class="font-medium text-green-600">{{ formatAmount(donationAmount) }}</span>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="bg-white mt-4 p-4 space-y-3">
      <Button @click="viewReceipt" variant="outline" class="w-full">
        Download Receipt
      </Button>
      
      <Button @click="shareDonation" variant="outline" class="w-full">
        Share Your Donation
      </Button>
      
      <Button @click="goToHome" class="w-full">
        Back to Home
      </Button>
    </div>

    <!-- Impact Message -->
    <div class="bg-white mt-4 p-4 text-center">
      <p class="text-sm text-gray-600">
        Your donation will make a real difference in the lives of those in need. Thank you for your generosity!
      </p>
    </div>

    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<style scoped>
/* Custom styles for donation success page */
</style> 