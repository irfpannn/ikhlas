<script setup>
import { Button, buttonVariants } from '@/components/ui/button'
import { BottomNavigation } from '@/components/ui/bottom-navigation'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTransactionStore } from '@/stores/donationTransactionStore'

const router = useRouter()
const transactionStore = useTransactionStore()

// Loading state
const isLoading = ref(true)

// User data
const userData = ref({
  name: 'Bima Sakti',
  phone: '081987378782',
  balance: 238874,
})

// Categories with route names (match names in router/index.js)
const categories = [
  { id: 1, name: 'Zakat Pendapatan', icon: '💼', routeName: 'zakat-pendapatan' },
  { id: 2, name: 'Zakat Wang Simpanan', icon: '🏦', routeName: 'zakat-wang-simpanan' },
  { id: 3, name: 'Zakat Saham', icon: '📊', routeName: 'zakat-saham' },
  { id: 4, name: 'Zakat Emas', icon: '💰', routeName: 'zakat-emas' },
  { id: 5, name: 'Zakat Pertanian', icon: '🌾', routeName: 'payment' },
  { id: 6, name: 'Zakat Ternakan', icon: '🐄', routeName: 'payment' },
  { id: 7, name: 'Zakat Fitrah', icon: '🍚', routeName: 'zakat-fitrah' },
  // 'View All' is handled separately
]

// Get transactions from store - limited to 4 most recent transactions
const transactions = computed(() => {
  if (!transactionStore.sortedTransactions || transactionStore.sortedTransactions.length === 0) {
    return []
  }

  // Take only the first 4 transactions to display in the homepage
  return transactionStore.sortedTransactions.slice(0, 4).map((tx) => {
    console.log('Processing transaction:', tx) // For debugging

    // Safe timestamp handling
    let date = new Date()
    let formattedDate = ''
    let formattedTime = ''

    try {
      // Check if timestamp exists
      if (tx.timestamp) {
        // Handle Firestore Timestamp object which has seconds and nanoseconds
        if (tx.timestamp._seconds !== undefined || tx.timestamp.seconds !== undefined) {
          // Get seconds from the timestamp object
          const seconds =
            tx.timestamp._seconds !== undefined ? tx.timestamp._seconds : tx.timestamp.seconds
          // Convert to milliseconds and create a Date object
          date = new Date(seconds * 1000)
        } else {
          // Regular timestamp string or Date
          date = new Date(tx.timestamp)
        }

        // Check if date is valid before formatting
        if (!isNaN(date.getTime())) {
          formattedDate = date.toLocaleDateString('ms-MY', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })

          formattedTime = date.toLocaleTimeString('ms-MY', {
            hour: '2-digit',
            minute: '2-digit',
          })
        } else {
          console.warn('Invalid timestamp in transaction:', tx.id)
          formattedDate = 'Tarikh tidak sah'
          formattedTime = ''
        }
      } else {
        console.warn('Missing timestamp in transaction:', tx.id)
        formattedDate = 'Tiada tarikh'
        formattedTime = ''
      }
    } catch (error) {
      console.error('Error formatting date:', error)
      formattedDate = 'Tarikh ralat'
      formattedTime = ''
    }

    // Determine transaction name/type
    let name = 'Zakat' // Default transaction name
    if (tx.type) {
      name = tx.type
    } else if (tx.category) {
      name = tx.category
    } else if (tx.name) {
      name = tx.name
    } else if (tx.donationType) {
      name = tx.donationType
    }

    // Determine transaction icon based on payment method or transaction type
    let icon = '💰' // default icon
    if (tx.currency === 'ETH' || tx.cryptoType) {
      icon = '💎'
    } else if (tx.paymentMethod) {
      switch (tx.paymentMethod) {
        case 'card':
          icon = '💳'
          break
        case 'bank':
          icon = '🏦'
          break
        case 'ewallet':
        case 'e-wallet':
          icon = '📱'
          break
      }
    }

    // Handle amount properly
    let amount = 0
    if (tx.amount !== undefined && tx.amount !== null) {
      amount = parseFloat(tx.amount)
    } else if (tx.amountRM !== undefined && tx.amountRM !== null) {
      amount = parseFloat(tx.amountRM)
    } else if (tx.amountCrypto !== undefined && tx.amountCrypto !== null) {
      amount = parseFloat(tx.amountCrypto)
    }

    return {
      id: tx.id || `tx-${Date.now()}`,
      name: name,
      date: formattedDate,
      time: formattedTime,
      amount: -Math.abs(amount), // Ensures amount is negative for payments
      icon: icon,
      // Preserve original data for possible future use
      original: tx,
    }
  })
})

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ms-MY', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

// Format cryptocurrency with appropriate decimal places
const formatCryptoCurrency = (tx) => {
  if (!tx || !tx.amount) return '0.000000'

  const amount = parseFloat(tx.amount)
  const currency = tx.currency || 'BTC'

  // For cryptocurrencies, show 6 decimal places
  if (currency === 'BTC' || currency === 'ETH') {
    return `${amount.toFixed(6)} ${currency}`
  }

  // Default format for other currencies
  return `${amount.toFixed(2)} ${currency}`
}

// Get donation title from transaction data
const getDonationTitle = (tx) => {
  // Use recipientName if available
  if (tx.recipientName) {
    return tx.recipientName
  }

  // Use category if available (this should catch your Crypto Donation case)
  if (tx.category) {
    return tx.category
  }

  // Use transaction type if available and convert kebab-case to Title Case
  if (tx.type) {
    return tx.type
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // If currency is a cryptocurrency, show crypto donation
  if (tx.currency === 'BTC' || tx.currency === 'ETH') {
    return `Derma Crypto (${tx.currency})`
  }

  // Default fallback to original name
  return tx.name || 'Derma'
}

// Function to navigate to history page
const goToHistory = () => {
  router.push('/history') // Or use { name: 'history' }
}

// Function to navigate to categories page
const viewAllCategories = () => {
  router.push('/categories') // Or use { name: 'categories' }
}

// Function to navigate to a specific category page
const goToCategory = (routeName) => {
  if (routeName) {
    // Directly attempt to push the route since it should exist
    router.push({ name: routeName })
    // If the "No match" error persists after this change,
    // try restarting the development server and clearing browser cache.
  } else {
    // Optional: Show a message or do nothing if route is not defined
    console.warn('Route not defined for this category.')
    // You could use toast here as well:
    // import { toast } from 'vue-sonner';
    // toast.info('Halaman untuk kategori ini belum tersedia.');
  }
}

// Function to navigate to rewards page
const goToRewards = () => {
  router.push('/rewards')
}

// Function to navigate to Top Up page
const goToTopUp = () => {
  router.push({ name: 'topup' })
}

// Function to navigate to Donation page (Hantar)
const goToDonation = () => {
  router.push({ name: 'donation' })
}

// Function to navigate to Request Donation page (Minta)
const goToRequest = () => {
  router.push({ name: 'request-donation' })
}

// Load transaction data when component mounts
onMounted(async () => {
  isLoading.value = true
  try {
    await transactionStore.fetchHistory()
  } catch (error) {
    console.error('Error fetching transactions:', error)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-100 overflow-y-auto pb-20">
    <!-- Content wrapper with padding -->
    <div class="p-4">
      <!-- Header with logo and profile -->
      <div class="flex justify-between items-center mb-4">
        <div class="flex items-center">
          <img src="/logo.png" alt="Ikhlas Logo" class="w-20 h-10" />
        </div>
        <div class="text-gray-500">
          <i class="fas fa-bell"></i>
        </div>
      </div>

      <!-- Balance Card -->
      <Card class="bg-[#75a868] text-white mb-4 shadow-sm border-none">
        <CardHeader class="pb-0">
          <div class="flex justify-between items-center">
            <div class="flex flex-col">
              <CardDescription class="text-white/80">Baki Anda</CardDescription>
              <CardTitle class="text-xl font-bold text-white"
                >RM {{ formatCurrency(userData.balance) }}</CardTitle
              >
            </div>
            <Button
              variant="outline"
              size="sm"
              class="bg-white text-[#75a868] hover:text-[#75a868] hover:bg-white/90 border-none"
              @click="goToTopUp"
            >
              Tambah Nilai
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <!-- Action buttons -->
          <div class="flex justify-between gap-3">
            <Button
              variant="secondary"
              class="bg-[#217e0a] hover:bg-[#217e0a]/90 text-white flex-1"
              @click="goToDonation"
            >
              Hantar
            </Button>
            <Button
              variant="secondary"
              class="bg-[#217e0a] hover:bg-[#217e0a]/90 text-white flex-1"
              @click="goToRequest"
            >
              Minta
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- Rewards section -->
      <Card class="mb-4 shadow-sm py-1">
        <CardContent class="p-3 flex justify-between items-center">
          <div class="flex items-center">
            <div class="bg-blue-100 p-2 rounded-full mr-3">
              <span class="text-[#75a868] text-xl">🎁</span>
            </div>
            <div>
              <p class="font-semibold">Ganjaran Mydin</p>
              <p class="text-xs text-gray-500">Disyorkan: 2</p>
            </div>
          </div>
          <Button
            variant="default"
            size="sm"
            class="bg-[#75a868] hover:bg-[#75a868]/90 text-white"
            @click="goToRewards"
          >
            Tuntut Sekarang
          </Button>
        </CardContent>
      </Card>

      <!-- Categories Grid -->
      <Card class="mb-4 shadow-sm">
        <CardHeader class="pb-2">
          <CardTitle class="text-base">Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-4 gap-3">
            <!-- Loop through defined categories -->
            <div
              v-for="category in categories"
              :key="category.id"
              class="flex flex-col items-center"
              :class="{ 'cursor-pointer': category.routeName }"
              @click="goToCategory(category.routeName)"
            >
              <div
                class="bg-gray-100 p-2 rounded-lg mb-1 w-12 h-12 flex items-center justify-center"
              >
                <span class="text-xl">{{ category.icon }}</span>
              </div>
              <p class="text-xs text-center">{{ category.name }}</p>
            </div>
            <!-- View All Button -->
            <div class="flex flex-col items-center cursor-pointer" @click="viewAllCategories">
              <div
                class="bg-gray-100 p-2 rounded-lg mb-1 w-12 h-12 flex items-center justify-center"
              >
                <span class="text-xl">📋</span>
              </div>
              <p class="text-xs text-center">Lihat Semua</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Transaction History -->
      <Card class="shadow-sm">
        <CardHeader class="pb-2 flex flex-row items-center justify-between">
          <CardTitle class="text-base">Sejarah</CardTitle>
          <Button variant="link" size="sm" class="text-[#75a868] -mr-3" @click="goToHistory"
            >Lihat Semua</Button
          >
        </CardHeader>
        <CardContent class="pt-0">
          <!-- Loading state -->
          <div v-if="isLoading" class="py-4 text-center text-gray-500">
            <p>Memuatkan sejarah transaksi...</p>
          </div>

          <!-- Transactions list when loaded -->
          <div v-else>
            <div
              v-for="transaction in transactions"
              :key="transaction.id"
              class="flex justify-between items-center py-2 border-b border-gray-100"
            >
              <div class="flex items-center">
                <div class="bg-gray-100 p-2 rounded-full mr-3">
                  <span class="text-xl">{{ transaction.icon }}</span>
                </div>
                <div>
                  <p class="font-medium">{{ getDonationTitle(transaction.original) }}</p>
                  <p class="text-xs text-gray-500">
                    {{ transaction.date }} • {{ transaction.time }}
                  </p>
                </div>
              </div>
              <div class="text-right">
                <!-- Show appropriate currency -->
                <p
                  :class="transaction.amount < 0 ? 'text-red-500' : 'text-green-500'"
                  class="text-right whitespace-nowrap"
                >
                  <template
                    v-if="
                      transaction.original &&
                      transaction.original.currency &&
                      transaction.original.currency !== 'RM'
                    "
                  >
                    {{
                      parseFloat(
                        transaction.original.amountCrypto || transaction.original.amount,
                      ).toFixed(6)
                    }}
                    {{ transaction.original.currency }}
                  </template>
                  <template v-else>
                    {{ transaction.amount < 0 ? '-' : '+' }}RM
                    {{ formatCurrency(Math.abs(transaction.amount)) }}
                  </template>
                </p>
                <!-- For zakat payments, show the direct amountRM -->
                <p
                  v-if="
                    transaction.original &&
                    (transaction.original.currency === 'BTC' ||
                      transaction.original.currency === 'ETH') &&
                    transaction.original.type === 'zakat-payment'
                  "
                  class="text-xs text-gray-500 text-right"
                >
                  ≈ RM {{ transaction.original.amountRM }}
                </p>
                <!-- For donations, calculate and show conversion -->
                <p
                  v-else-if="
                    transaction.original &&
                    (transaction.original.currency === 'BTC' ||
                      transaction.original.currency === 'ETH')
                  "
                  class="text-xs text-gray-500 text-right"
                >
                  ≈ RM
                  {{
                    transaction.original.currency === 'BTC'
                      ? (
                          (parseFloat(
                            transaction.original.amountCrypto || transaction.original.amount,
                          ) /
                            0.000001) *
                          3.5
                        ).toFixed(2)
                      : (
                          parseFloat(
                            transaction.original.amountCrypto || transaction.original.amount,
                          ) / 0.0001
                        ).toFixed(2)
                  }}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter
          v-if="!isLoading && transactions.length === 0"
          class="text-sm text-gray-500 flex justify-center"
        >
          Tiada transaksi untuk dipaparkan
        </CardFooter>
      </Card>

      <!-- Bottom Navigation -->
      <BottomNavigation />
    </div>
  </div>
</template>

<style scoped></style>
