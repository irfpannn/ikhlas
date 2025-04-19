<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BottomNavigation } from '@/components/ui/bottom-navigation'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'

const router = useRouter()
const searchQuery = ref('')
const isLoading = ref(true)

// Data structures similar to ZakatDistribution
const zakatTransactions = ref([])
const recipients = ref([])
const distributionComplete = ref(true) // Set to true to show distribution by default

// Original transactions data as backup
const originalTransactions = ref([
  {
    id: 'TX123456789',
    date: '2023-10-15',
    amount: 1500,
    amountFormatted: '0.05 BTC',
    status: 'Selesai',
    userName: 'Anda',
    userWallet: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
    asnafWallet: '0x9s8r7q6p5o4n3m2l1k0j9i8h7g6f5e4d3c2b1a0',
    asnafName: 'Ahmad bin Abdullah',
    asnafCategory: 'Fakir',
    evidenceImage: 'bantuan.jpg',
    description: 'Bayaran zakat bulanan untuk sokongan pendidikan',
    type: 'Zakat Pendapatan',
    allocated: true,
  },
  {
    id: 'TX987654321',
    date: '2023-11-20',
    amount: 2000,
    amountFormatted: '1.2 ETH',
    status: 'Selesai',
    userName: 'Anda',
    userWallet: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
    asnafWallet: '0x5t4s3r2q1p0o9n8m7l6k5j4i3h2g1f0e9d8c7b6a',
    asnafName: 'Fatimah binti Ismail',
    asnafCategory: 'Miskin',
    evidenceImage: 'bantuan.jpg',
    description: 'Program bantuan makanan dan tempat tinggal',
    type: 'Zakat Pendapatan',
    allocated: true,
  },
  {
    id: 'TX567891234',
    date: '2023-12-05',
    amount: 500,
    amountFormatted: '500 USDT',
    status: 'Menunggu',
    userName: 'Anda',
    userWallet: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
    asnafWallet: '0x3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1a2b',
    asnafName: 'Muhammad bin Hassan',
    asnafCategory: 'Fi-sabilillah',
    evidenceImage: 'bantuan.jpg',
    description: 'Pembiayaan projek pembangunan komuniti',
    type: 'Zakat Pendapatan',
    allocated: false,
  },
])

// Total zakat amount
const totalZakatAmount = computed(() => {
  return zakatTransactions.value.reduce((total, transaction) => total + transaction.amount, 0)
})

// Filtered transactions based on search query
const filteredTransactions = ref([])

// Format number with commas
const formatNumber = (num) => {
  return num.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Format date
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-MY')
}

// Get recipient status
const getRecipientStatus = (recipient) => {
  if (recipient.amountReceived >= recipient.amountNeeded) {
    return 'Sepenuhnya Disalurkan'
  } else if (recipient.amountReceived > 0) {
    return `Sebahagian Disalurkan (${Math.round((recipient.amountReceived / recipient.amountNeeded) * 100)}%)`
  } else {
    return 'Belum Disalurkan'
  }
}

// Setup mock asnaf recipients data
const mockFetchAsnafRecipients = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockData = [
        {
          id: 1,
          name: 'Program Bantuan Fakir',
          description: 'Sokongan untuk individu yang sangat miskin',
          amountNeeded: 5000,
          amountReceived: 1500,
          contributors: [{ name: 'Anda', amount: 1500 }],
        },
        {
          id: 2,
          name: 'Sokongan Keluarga Miskin',
          description: 'Bantuan untuk keluarga berpendapatan rendah',
          amountNeeded: 3500,
          amountReceived: 2000,
          contributors: [{ name: 'Anda', amount: 2000 }],
        },
        {
          id: 3,
          name: 'Operasi Amil',
          description: 'Sokongan untuk pengutip zakat',
          amountNeeded: 1000,
          amountReceived: 500,
          contributors: [{ name: 'Anda', amount: 500 }],
        },
        {
          id: 4,
          name: 'Pusat Pendidikan Muallaf',
          description: 'Pendidikan untuk penganut baru',
          amountNeeded: 2500,
          amountReceived: 0,
          contributors: [],
        },
        {
          id: 5,
          name: 'Pemulihan Riqab',
          description: 'Kebebasan daripada bentuk perhambaan moden',
          amountNeeded: 3000,
          amountReceived: 0,
          contributors: [],
        },
        {
          id: 6,
          name: 'Bantuan Hutang Gharimin',
          description: 'Bantuan untuk mereka yang berhutang',
          amountNeeded: 4000,
          amountReceived: 0,
          contributors: [],
        },
        {
          id: 7,
          name: 'Projek Komuniti Fi Sabilillah',
          description: 'Projek pembangunan komuniti',
          amountNeeded: 6000,
          amountReceived: 0,
          contributors: [],
        },
        {
          id: 8,
          name: 'Bantuan Musafir Ibnu Sabil',
          description: 'Sokongan untuk musafir yang terputus perjalanan',
          amountNeeded: 1500,
          amountReceived: 0,
          contributors: [],
        },
      ]
      resolve(mockData)
    }, 500)
  })
}

onMounted(async () => {
  isLoading.value = true
  // Populate zakat transactions
  zakatTransactions.value = [...originalTransactions.value]
  // Populate filtered transactions initially
  filteredTransactions.value = [...zakatTransactions.value]

  // Get recipients data
  recipients.value = await mockFetchAsnafRecipients()

  isLoading.value = false
})

const goBack = () => {
  router.push('/categories')
}

const handleSearch = () => {
  isLoading.value = true

  // Simulate API call with timeout
  setTimeout(() => {
    if (searchQuery.value.trim() === '') {
      filteredTransactions.value = [...zakatTransactions.value]
    } else {
      const query = searchQuery.value.toLowerCase()
      filteredTransactions.value = zakatTransactions.value.filter(
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

// Calculate percentage for progress bar
const calculatePercentage = (received, needed) => {
  if (!needed) return 0
  const percentage = (received / needed) * 100
  return Math.min(percentage, 100) // Cap at 100%
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
          <CardTitle class="text-base">Cari Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="flex space-x-2">
            <Input
              v-model="searchQuery"
              placeholder="Cari mengikut ID, nama, atau kategori..."
              class="flex-grow"
              @keyup.enter="handleSearch"
            />
            <Button @click="handleSearch" :disabled="isLoading">
              {{ isLoading ? 'Mencari...' : 'Cari' }}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Summary Section -->
    <div class="px-4 mb-6">
      <Card class="shadow-sm bg-blue-50">
        <CardHeader class="pb-2">
          <CardTitle class="text-base">Ringkasan Zakat Anda</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div class="stat-card p-3 bg-white rounded shadow">
              <p class="text-gray-600 text-sm">Jumlah Zakat Anda</p>
              <p class="text-xl font-bold">RM {{ formatNumber(totalZakatAmount) }}</p>
            </div>
            <div class="stat-card p-3 bg-white rounded shadow">
              <p class="text-gray-600 text-sm">Status</p>
              <p class="text-xl font-bold text-green-600">Telah Diagihkan</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Zakat Distribution Section -->
    <div class="px-4 mb-6">
      <h2 class="text-lg font-medium mb-3">Pengagihan Zakat Anda</h2>

      <div v-if="isLoading" class="space-y-4 mb-6">
        <div v-for="i in 3" :key="`loading-${i}`" class="bg-white rounded-lg shadow-sm p-4">
          <div class="h-4 bg-gray-200 rounded w-3/4 mb-3 animate-pulse"></div>
          <div class="h-3 bg-gray-200 rounded w-full mb-4 animate-pulse"></div>
          <div class="h-5 bg-gray-200 rounded w-2/3 mb-2 animate-pulse"></div>
          <div class="h-2 bg-gray-200 rounded w-full animate-pulse"></div>
        </div>
      </div>

      <div v-else-if="recipients.length > 0" class="space-y-4 mb-6">
        <Card
          v-for="recipient in recipients.filter((r) => r.amountReceived > 0)"
          :key="recipient.id"
          class="shadow-sm overflow-hidden"
        >
          <CardHeader class="pb-2">
            <CardTitle class="text-base">{{ recipient.name }}</CardTitle>
            <p class="text-sm text-gray-600">{{ recipient.description }}</p>
          </CardHeader>

          <CardContent>
            <div class="space-y-3">
              <div>
                <div class="flex justify-between mb-1 text-sm">
                  <span
                    >Sumbangan Anda:
                    <span class="font-medium"
                      >RM
                      {{
                        formatNumber(
                          recipient.contributors.find((c) => c.name === 'Anda')?.amount || 0,
                        )
                      }}</span
                    ></span
                  >
                  <span>{{ getRecipientStatus(recipient) }}</span>
                </div>

                <!-- Progress bar -->
                <div class="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                  <div
                    class="bg-green-600 h-2.5 rounded-full"
                    :style="`width: ${calculatePercentage(recipient.amountReceived, recipient.amountNeeded)}%`"
                  ></div>
                </div>
                <div class="flex justify-between text-xs text-gray-500">
                  <span>RM {{ formatNumber(recipient.amountReceived) }}</span>
                  <span>RM {{ formatNumber(recipient.amountNeeded) }}</span>
                </div>
              </div>

              <div v-if="recipient.contributors && recipient.contributors.length > 0">
                <p class="text-sm font-medium mb-1">Penyumbang:</p>
                <div class="bg-gray-50 p-2 rounded-md">
                  <div
                    v-for="(contributor, cIndex) in recipient.contributors"
                    :key="`cont-${cIndex}`"
                    class="text-sm flex justify-between mb-1 last:mb-0"
                  >
                    <span>{{ contributor.name }}</span>
                    <span>RM {{ formatNumber(contributor.amount) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div v-else class="text-center py-6 bg-white rounded-lg shadow-sm">
        <p class="text-gray-500">Tiada maklumat pengagihan zakat tersedia</p>
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

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
