<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BottomNavigation } from '@/components/ui/bottom-navigation'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'

const router = useRouter()
const searchQuery = ref('')
const isLoading = ref(false)
const transactions = ref([
  {
    id: 'TX123456789',
    date: '2023-10-15',
    amount: '0.05 BTC',
    status: 'Completed',
    userWallet: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
    asnafWallet: '0x9s8r7q6p5o4n3m2l1k0j9i8h7g6f5e4d3c2b1a0',
    asnafName: 'Ahmad bin Abdullah',
    asnafCategory: 'Fakir',
    evidenceImage: 'bantuan.jpg',
    description: 'Monthly zakat payment for education support',
  },
  {
    id: 'TX987654321',
    date: '2023-11-20',
    amount: '1.2 ETH',
    status: 'Completed',
    userWallet: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
    asnafWallet: '0x5t4s3r2q1p0o9n8m7l6k5j4i3h2g1f0e9d8c7b6a',
    asnafName: 'Fatimah binti Ismail',
    asnafCategory: 'Miskin',
    evidenceImage: 'bantuan.jpg',
    description: 'Food and shelter assistance program',
  },
  {
    id: 'TX567891234',
    date: '2023-12-05',
    amount: '500 USDT',
    status: 'Pending',
    userWallet: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
    asnafWallet: '0x3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1a2b',
    asnafName: 'Muhammad bin Hassan',
    asnafCategory: 'Fi-sabilillah',
    evidenceImage: 'bantuan.jpg',
    description: 'Community development project funding',
  },
])
const filteredTransactions = ref([])

onMounted(() => {
  filteredTransactions.value = [...transactions.value]
})

const goBack = () => {
  router.push('/categories')
}

const handleSearch = () => {
  isLoading.value = true

  // Simulate API call with timeout
  setTimeout(() => {
    if (searchQuery.value.trim() === '') {
      filteredTransactions.value = [...transactions.value]
    } else {
      const query = searchQuery.value.toLowerCase()
      filteredTransactions.value = transactions.value.filter(
        (tx) =>
          tx.id.toLowerCase().includes(query) ||
          tx.asnafName.toLowerCase().includes(query) ||
          tx.asnafCategory.toLowerCase().includes(query) ||
          tx.description.toLowerCase().includes(query),
      )
    }
    isLoading.value = false
  }, 500)
}

const truncateAddress = (address) => {
  if (!address) return ''
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
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
        <h1 class="text-lg font-semibold">Audit Zakat</h1>
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
          <CardTitle class="text-base">Search Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="flex space-x-2">
            <Input
              v-model="searchQuery"
              placeholder="Search by ID, name, or category..."
              class="flex-grow"
              @keyup.enter="handleSearch"
            />
            <Button @click="handleSearch" :disabled="isLoading">
              {{ isLoading ? 'Searching...' : 'Search' }}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Transactions List -->
    <div class="px-4">
      <h2 class="text-lg font-medium mb-3">Transaction History</h2>

      <div v-if="filteredTransactions.length === 0" class="text-center py-8">
        <p class="text-gray-500">No transactions found</p>
      </div>

      <div v-else class="space-y-4">
        <Card v-for="tx in filteredTransactions" :key="tx.id" class="shadow-sm overflow-hidden">
          <CardHeader class="pb-2">
            <div class="flex justify-between items-center">
              <CardTitle class="text-base">{{ tx.id }}</CardTitle>
              <span
                class="text-sm font-medium"
                :class="{
                  'text-green-600': tx.status === 'Completed',
                  'text-yellow-600': tx.status === 'Pending',
                }"
                >{{ tx.status }}</span
              >
            </div>
            <p class="text-sm text-gray-500">{{ tx.date }} • {{ tx.amount }}</p>
          </CardHeader>

          <CardContent class="pt-4">
            <div class="space-y-3">
              <div>
                <h3 class="text-sm font-medium text-gray-700">Your Wallet</h3>
                <p class="text-xs bg-gray-100 p-2 rounded-md overflow-x-auto whitespace-nowrap">
                  {{ tx.userWallet }}
                </p>
                <p class="text-xs text-gray-500 mt-1">
                  <span class="font-medium">Copy:</span> {{ truncateAddress(tx.userWallet) }}
                </p>
              </div>

              <div>
                <h3 class="text-sm font-medium text-gray-700">Asnaf Wallet</h3>
                <p class="text-xs bg-gray-100 p-2 rounded-md overflow-x-auto whitespace-nowrap">
                  {{ tx.asnafWallet }}
                </p>
                <p class="text-xs text-gray-500 mt-1">
                  <span class="font-medium">Copy:</span> {{ truncateAddress(tx.asnafWallet) }}
                </p>
              </div>

              <div>
                <h3 class="text-sm font-medium text-gray-700">Asnaf Details</h3>
                <p class="text-sm">
                  {{ tx.asnafName }} <span class="text-gray-500">({{ tx.asnafCategory }})</span>
                </p>
                <p class="text-sm text-gray-600">{{ tx.description }}</p>
              </div>

              <div>
                <h3 class="text-sm font-medium text-gray-700">Evidence</h3>
                <div class="mt-2 border rounded-lg overflow-hidden">
                  <img :src="tx.evidenceImage" alt="Transaction evidence" class="w-full h-auto" />
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter class="flex gap-8 items-center justify-center">
            <Button variant="outline" size="sm">Verify</Button>
            <Button variant="outline" size="sm">Report Issue</Button>
          </CardFooter>
        </Card>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<style scoped>
.overflow-x-auto {
  overflow-x: auto;
  scrollbar-width: none; /* Firefox */
}

.overflow-x-auto::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Edge */
}
</style>
