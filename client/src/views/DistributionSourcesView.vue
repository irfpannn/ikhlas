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
        <h1 class="text-lg font-semibold">Zakat Distribution Sources</h1>
        <div class="ml-auto">
          <Button variant="ghost" class="text-white hover:text-white hover:bg-[#217e0a]/50 p-2">
            <span class="text-xl">🔍</span>
          </Button>
        </div>
      </div>
    </div>

    <!-- Search Section -->
    <div class="p-4">
      <Card class="shadow-sm mb-4">
        <CardHeader class="pb-2">
          <CardTitle class="text-base">Search Distributions</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="flex flex-col space-y-2">
            <Input 
              v-model="searchQuery" 
              placeholder="Search by recipient name or description..." 
              class="flex-grow"
              @keyup.enter="handleSearch"
            />
            <select 
              v-model="selectedCategory" 
              class="w-full p-2 border border-gray-300 rounded-md"
              @change="handleSearch"
            >
              <option value="">All Categories</option>
              <option value="Poor">Poor (Fakir)</option>
              <option value="Needy">Needy (Miskin)</option>
              <option value="Zakat Administrator">Zakat Administrator (Amil)</option>
              <option value="New Muslim">New Muslim (Muallaf)</option>
              <option value="Slave">To Free Slaves (Riqab)</option>
              <option value="Debtor">Debtor (Gharimin)</option>
              <option value="Allah's Cause">Allah's Cause (Fi Sabilillah)</option>
              <option value="Traveler">Traveler (Ibnus Sabil)</option>
            </select>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Distributions List -->
    <div class="px-4">
      <h2 class="text-lg font-medium mb-3">Distribution History</h2>
      
      <div v-if="loading" class="text-center py-8">
        <div class="inline-block w-12 h-12 border-4 border-gray-200 border-t-[#75a868] rounded-full animate-spin"></div>
        <p class="mt-4 text-gray-500">Loading distribution data...</p>
      </div>
      
      <div v-else-if="filteredDistributions.length === 0" class="text-center py-8">
        <p class="text-gray-500">No distributions found</p>
        <p v-if="searchQuery || selectedCategory" class="text-sm text-gray-400 mt-2">
          Try adjusting your search filters
        </p>
      </div>
      
      <div v-else class="space-y-4 mb-6">
        <Card v-for="distribution in filteredDistributions" :key="distribution.id" class="shadow-sm overflow-hidden">
          <CardHeader class="pb-2 bg-gray-50">
            <div class="flex justify-between items-center">
              <CardTitle class="text-base">{{ distribution.recipientName }}</CardTitle>
              <span class="text-sm font-medium px-2 py-1 rounded-full" 
                :class="{
                  'bg-green-100 text-green-800': distribution.category === 'Poor' || distribution.category === 'Needy',
                  'bg-blue-100 text-blue-800': distribution.category === 'Zakat Administrator',
                  'bg-purple-100 text-purple-800': distribution.category === 'New Muslim',
                  'bg-yellow-100 text-yellow-800': distribution.category === 'Debtor',
                  'bg-indigo-100 text-indigo-800': distribution.category === 'Allah\'s Cause',
                  'bg-orange-100 text-orange-800': distribution.category === 'Traveler',
                  'bg-gray-100 text-gray-800': !['Poor', 'Needy', 'Zakat Administrator', 'New Muslim', 'Debtor', 'Allah\'s Cause', 'Traveler'].includes(distribution.category)
                }">
                {{ distribution.category }}
              </span>
            </div>
            <p class="text-sm text-gray-500">{{ formatDate(distribution.date) }} • RM {{ distribution.amountRM.toFixed(2) }}</p>
          </CardHeader>
          
          <CardContent class="pt-4">
            <div class="space-y-4">
              <div>
                <h3 class="text-sm font-medium text-gray-700">Description</h3>
                <p class="text-sm text-gray-600 mt-1">{{ distribution.description }}</p>
              </div>
              
              <div v-if="distribution.evidenceUrl" class="mt-2">
                <h3 class="text-sm font-medium text-gray-700">Evidence</h3>
                <a :href="distribution.evidenceUrl" target="_blank" 
                   class="mt-1 inline-flex items-center text-sm text-blue-600 hover:text-blue-800">
                  <span class="mr-1">📄</span> View Documentation
                </a>
              </div>
              
              <div>
                <h3 class="text-sm font-medium text-gray-700 mb-2">Source Contributions ({{ distribution.sourceDetails.length }})</h3>
                <div class="space-y-2">
                  <div v-for="(source, sIndex) in distribution.sourceDetails" :key="sIndex" 
                       class="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div class="flex justify-between items-center mb-1">
                      <span class="font-medium text-sm">{{ source.userName }}</span>
                      <span class="text-green-600 font-medium text-sm">RM {{ source.amountRM.toFixed(2) }}</span>
                    </div>
                    <div class="text-xs text-gray-500">{{ formatDate(source.date) }}</div>
                    <div class="mt-1">
                      <span class="text-xs text-gray-600">Wallet: </span>
                      <span class="text-xs font-mono bg-gray-100 px-1 py-0.5 rounded">
                        {{ truncateAddress(source.walletAddress) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-if="isUserContributor(distribution)" class="bg-green-50 border border-green-200 rounded-lg p-3">
                <div class="flex items-center text-green-700">
                  <span class="mr-2">❤️</span>
                  <span class="text-sm font-medium">You contributed to this distribution</span>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter class="bg-gray-50 flex justify-between">
            <Button variant="outline" size="sm" class="text-xs">Share</Button>
            <Button variant="outline" size="sm" class="text-xs">View Details</Button>
          </CardFooter>
        </Card>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BottomNavigation } from '@/components/ui/bottom-navigation'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const router = useRouter()
const db = getFirestore()
const auth = getAuth()

const loading = ref(true)
const searchQuery = ref('')
const selectedCategory = ref('')
const distributions = ref([])

// Fetch distributions with their source payments
const fetchDistributions = async () => {
  try {
    loading.value = true
    
    // In a real app, this would fetch from Firestore
    // For now, we'll use dummy data similar to the admin dashboard
    const dummyDistributions = [
      {
        id: '1',
        recipientName: 'Zamir bin Abdullah',
        category: 'Poor',
        amountRM: 3700.00,
        description: 'Monthly assistance for basic necessities',
        evidenceUrl: 'https://example.com/evidence1.pdf',
        date: new Date(2023, 10, 20, 10, 0), // Nov 20, 2023, 10:00 AM
        sourcePayments: ['1', '2'], // IDs of source payments
        sourceDetails: [
          {
            id: '1',
            userId: 'user1',
            userName: 'Ahmad bin Abdullah',
            date: new Date(2023, 10, 15, 9, 30),
            amountRM: 2500.00,
            walletAddress: '0x1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0'
          },
          {
            id: '2',
            userId: 'user2',
            userName: 'Fatimah binti Hassan',
            date: new Date(2023, 10, 18, 14, 45),
            amountRM: 1200.00,
            walletAddress: '0x2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1'
          }
        ]
      },
      {
        id: '2',
        recipientName: 'Fatimah binti Hassan',
        category: 'Poor',
        amountRM: 800.00,
        description: 'Education support for children',
        evidenceUrl: 'https://example.com/evidence2.pdf',
        date: new Date(2023, 11, 5, 14, 30), // Dec 5, 2023, 2:30 PM
        sourcePayments: ['3'], // IDs of source payments
        sourceDetails: [
          {
            id: '3',
            userId: 'user3',
            userName: 'Muhammad bin Ibrahim',
            date: new Date(2023, 11, 5, 11, 20),
            amountRM: 800.00,
            walletAddress: '0x3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2'
          }
        ]
      },
      {
        id: '3',
        recipientName: 'Muhammad bin Ibrahim',
        category: 'Needy',
        amountRM: 1200.00,
        description: 'Medical treatment assistance',
        evidenceUrl: 'https://example.com/evidence3.pdf',
        date: new Date(2023, 11, 15, 11, 45), // Dec 15, 2023, 11:45 AM
        sourcePayments: ['4'], // IDs of source payments
        sourceDetails: [
          {
            id: '4',
            userId: 'user4',
            userName: 'Nurul binti Aziz',
            date: new Date(2023, 11, 12, 16, 10),
            amountRM: 1200.00,
            walletAddress: '0x4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3'
          }
        ]
      },
      {
        id: '4',
        recipientName: 'Nurul Iman Foundation',
        category: 'Zakat Administrator',
        amountRM: 2000.00,
        description: 'Operational costs for zakat distribution',
        evidenceUrl: 'https://example.com/evidence4.pdf',
        date: new Date(2023, 11, 28, 9, 15), // Dec 28, 2023, 9:15 AM
        sourcePayments: ['5'], // IDs of source payments
        sourceDetails: [
          {
            id: '5',
            userId: 'user5',
            userName: 'Ismail bin Yusof',
            date: new Date(2023, 11, 20, 10, 5),
            amountRM: 2000.00,
            walletAddress: '0x5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4'
          }
        ]
      },
      {
        id: '5',
        recipientName: 'Ali bin Razak',
        category: 'New Muslim',
        amountRM: 1500.00,
        description: 'Support for Islamic education and community integration',
        evidenceUrl: 'https://example.com/evidence5.pdf',
        date: new Date(2024, 0, 10, 13, 0), // Jan 10, 2024, 1:00 PM
        sourcePayments: ['6'], // IDs of source payments
        sourceDetails: [
          {
            id: '6',
            userId: 'user6',
            userName: 'Zainab binti Omar',
            date: new Date(2024, 0, 5, 8, 15),
            amountRM: 1500.00,
            walletAddress: '0x6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5'
          }
        ]
      },
      {
        id: '6',
        recipientName: 'Refugee Support Center',
        category: 'Allah\'s Cause',
        amountRM: 3000.00,
        description: 'Funding for refugee education program',
        evidenceUrl: 'https://example.com/evidence6.pdf',
        date: new Date(2024, 0, 22, 15, 30), // Jan 22, 2024, 3:30 PM
        sourcePayments: ['7'], // IDs of source payments
        sourceDetails: [
          {
            id: '7',
            userId: 'user7',
            userName: 'Hakim bin Razak',
            date: new Date(2024, 0, 15, 9, 50),
            amountRM: 1500.00,
            walletAddress: '0x7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6'
          },
          {
            id: '1',
            userId: 'user1',
            userName: 'Ahmad bin Abdullah',
            date: new Date(2023, 10, 15, 9, 30),
            amountRM: 1500.00,
            walletAddress: '0x1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0'
          }
        ]
      },
      {
        id: '7',
        recipientName: 'Zainab binti Omar',
        category: 'Debtor',
        amountRM: 2500.00,
        description: 'Assistance with medical debt',
        evidenceUrl: 'https://example.com/evidence7.pdf',
        date: new Date(2024, 1, 5, 10, 45), // Feb 5, 2024, 10:45 AM
        sourcePayments: ['8'], // IDs of source payments
        sourceDetails: [
          {
            id: '8',
            userId: 'user8',
            userName: 'Aishah binti Kamal',
            date: new Date(2024, 0, 22, 15, 40),
            amountRM: 2500.00,
            walletAddress: '0x8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7'
          }
        ]
      }
    ]
    
    distributions.value = dummyDistributions
    
    // In a real implementation, you would fetch from Firestore
    // and join with the payment data to get source details
    
  } catch (error) {
    console.error('Error fetching distributions:', error)
  } finally {
    loading.value = false
  }
}

// Filter distributions based on search query and category
const handleSearch = () => {
  loading.value = true
  
  // Simulate API call with timeout
  setTimeout(() => {
    loading.value = false
  }, 500)
}

// Computed property for filtered distributions
const filteredDistributions = computed(() => {
  if (!searchQuery.value && !selectedCategory.value) {
    return distributions.value
  }
  
  return distributions.value.filter(dist => {
    const matchesSearch = !searchQuery.value || 
      dist.recipientName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      dist.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesCategory = !selectedCategory.value || 
      dist.category === selectedCategory.value
    
    return matchesSearch && matchesCategory
  })
})

// Format date for display
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Check if current user contributed to a distribution
const isUserContributor = (distribution) => {
  const currentUser = auth.currentUser
  if (!currentUser) return false
  
  return distribution.sourceDetails.some(source => 
    source.userId === currentUser.uid
  )
}

const truncateAddress = (address) => {
  if (!address) return ''
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

const goBack = () => {
  router.push('/categories')
}

onMounted(() => {
  fetchDistributions()
})
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.overflow-x-auto {
  overflow-x: auto;
  scrollbar-width: none; /* Firefox */
}

.overflow-x-auto::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Edge */
}
</style> 