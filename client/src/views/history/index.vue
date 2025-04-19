<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import BottomNavigation from '@/components/ui/bottom-navigation/BottomNavigation.vue'
import { useCombinedTransactionStore } from '@/stores/combinedTransactionStore'

const transactionStore = useCombinedTransactionStore()
const router = useRouter()
const isLoading = ref(true)

// Dialog state
const isDialogOpen = ref(false)
const selectedTransaction = ref(null)

// Use computed property to get transactions from store
const transactions = computed(() => transactionStore.sortedTransactions)

// Format short date
const formatShortDate = (timestamp) => {
  try {
    // Handle Firestore Timestamp objects
    if (timestamp && (timestamp._seconds !== undefined || timestamp.seconds !== undefined)) {
      const seconds = timestamp._seconds !== undefined ? timestamp._seconds : timestamp.seconds
      const date = new Date(seconds * 1000)

      return date.toLocaleString('ms-MY', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    }

    // Handle regular date strings
    const date = new Date(timestamp)
    return date.toLocaleString('ms-MY', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Tarikh tidak tersedia'
  }
}

// Format currency with symbol
const formatCurrency = (amount, currency) => {
  if (!amount) return currency === 'RM' ? 'RM 0.00' : '0.000000 ' + currency

  if (currency === 'RM') {
    return `RM ${parseFloat(amount).toFixed(2)}`
  } else {
    return `${parseFloat(amount).toFixed(6)} ${currency}`
  }
}

// Get donation title from transaction data
const getDonationTitle = (transaction) => {
  // Use recipientName if available
  if (transaction.recipientName) {
    return transaction.recipientName
  }

  // Use category if available (this should catch your Crypto Donation case)
  if (transaction.category) {
    return transaction.category
  }

  // Use transaction type if available
  if (transaction.type) {
    // Convert kebab-case to Title Case
    return transaction.type
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // If currency is a cryptocurrency, show Crypto Donation
  if (transaction.currency === 'BTC' || transaction.currency === 'ETH') {
    return `Derma Crypto (${transaction.currency})`
  }

  // Default fallback
  return 'Derma'
}

// Get transaction icon based on payment method or type
const getTransactionIcon = (transaction) => {
  // Handle crypto transactions
  if (
    transaction.currency === 'ETH' ||
    transaction.currency === 'BTC' ||
    transaction.paymentMethod === 'crypto-wallet' ||
    transaction.type?.includes('crypto')
  ) {
    return '💎'
  }

  // Handle other payment methods
  switch (transaction.paymentMethod) {
    case 'card':
      return '💳'
    case 'bank':
      return '🏦'
    case 'ewallet':
      return '📱'
    default:
      return '💰'
  }
}

// View transaction details
const viewTransactionDetails = (transaction) => {
  // Set the selected transaction and open the modal dialog
  selectedTransaction.value = transaction
  isDialogOpen.value = true
}

// Load transaction data from Firestore
onMounted(async () => {
  try {
    isLoading.value = true
    await transactionStore.fetchAllHistory()
  } catch (error) {
    console.error('Error fetching transaction history:', error)
  } finally {
    isLoading.value = false
  }
})

// Get badge variant and text based on transaction status
const getStatusBadge = (status) => {
  const normalizedStatus = status?.toLowerCase() || ''

  // Default values
  let variant = 'outline'
  let text = status || 'Pending'

  // Determine variant and translate text
  if (
    normalizedStatus.includes('completed') ||
    normalizedStatus.includes('selesai') ||
    normalizedStatus.includes('approved') ||
    normalizedStatus.includes('diluluskan')
  ) {
    variant = 'success'
    text = 'Diluluskan'
  } else if (normalizedStatus.includes('rejected') || normalizedStatus.includes('ditolak')) {
    variant = 'destructive'
    text = 'Ditolak'
  } else if (normalizedStatus.includes('pending') || normalizedStatus.includes('menunggu')) {
    variant = 'warning'
    text = 'Menunggu'
  }

  return { variant, text }
}
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-100 pb-20">
    <!-- Header -->
    <div class="bg-white p-4 flex items-center shadow-sm">
      <h1 class="text-lg font-semibold">Sejarah Transaksi</h1>
    </div>

    <!-- Main content -->
    <div class="p-4">
      <!-- Transaction list -->
      <Card class="py-2">
        <CardContent class="px-2">
          <!-- Loading skeleton -->
          <div v-if="isLoading" class="space-y-4">
            <div v-for="i in 5" :key="i" class="p-4 border-b flex justify-between items-center">
              <div class="flex items-center">
                <div class="w-12 h-12 rounded-full bg-gray-200 animate-pulse mr-3"></div>
                <div>
                  <div class="h-4 bg-gray-200 rounded animate-pulse w-32 mb-2"></div>
                  <div class="h-3 bg-gray-200 rounded animate-pulse w-20 mb-2"></div>
                  <div class="h-5 bg-gray-200 rounded animate-pulse w-16"></div>
                </div>
              </div>
              <div class="text-right">
                <div class="h-4 bg-gray-200 rounded animate-pulse w-24 mb-2"></div>
                <div class="h-3 bg-gray-200 rounded animate-pulse w-16 mb-2"></div>
                <div class="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
              </div>
            </div>
          </div>

          <!-- Actual transaction list -->
          <div v-else-if="transactions.length > 0">
            <div
              v-for="transaction in transactions"
              :key="transaction.transactionHash"
              class="p-4 border-b last:border-b-0 flex justify-between items-center cursor-pointer hover:bg-gray-50"
              @click="viewTransactionDetails(transaction)"
            >
              <div class="flex items-center">
                <div
                  class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mr-3"
                >
                  <span class="text-2xl">{{ getTransactionIcon(transaction) }}</span>
                </div>
                <div>
                  <p class="font-medium">
                    {{ getDonationTitle(transaction) }}
                  </p>
                  <p class="text-xs text-gray-500">{{ formatShortDate(transaction.timestamp) }}</p>
                  <p class="text-xs mt-1">
                    <Badge :variant="getStatusBadge(transaction.status).variant">
                      {{ getStatusBadge(transaction.status).text }}
                    </Badge>
                  </p>
                </div>
              </div>
              <div class="text-right">
                <p class="font-medium text-green-600">
                  <template v-if="transaction.currency !== 'RM'">
                    {{ parseFloat(transaction.amountCrypto || transaction.amount).toFixed(6) }}
                    {{ transaction.currency }}
                  </template>
                  <template v-else>
                    {{ formatCurrency(transaction.amount, transaction.currency) }}
                  </template>
                </p>
                <!-- For zakat payments, show the direct amountRM -->
                <p
                  v-if="
                    (transaction.currency === 'BTC' || transaction.currency === 'ETH') &&
                    transaction.type === 'zakat-payment'
                  "
                  class="text-xs text-gray-500"
                >
                  ≈ RM {{ transaction.amountRM }}
                </p>
                <!-- For donations, calculate and show conversion -->
                <p
                  v-else-if="transaction.currency === 'BTC' || transaction.currency === 'ETH'"
                  class="text-xs text-gray-500"
                >
                  ≈ RM
                  {{
                    transaction.currency === 'BTC'
                      ? (
                          (parseFloat(transaction.amountCrypto || transaction.amount) / 0.000001) *
                          3.5
                        ).toFixed(2)
                      : (
                          parseFloat(transaction.amountCrypto || transaction.amount) / 0.0001
                        ).toFixed(2)
                  }}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  class="mt-1 text-[#75a868] text-xs"
                  @click.stop="viewTransactionDetails(transaction)"
                >
                  Lihat Butiran →
                </Button>
              </div>
            </div>
          </div>
          <div v-else class="p-8 text-center text-gray-500">
            <div class="mb-4">
              <span class="text-4xl">📭</span>
            </div>
            <p class="mb-2">Tiada transaksi untuk dipaparkan</p>
            <p class="text-sm">
              Transaksi anda akan dipaparkan di sini selepas anda membuat pembayaran zakat.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Bottom Navigation -->
    <BottomNavigation />

    <!-- Transaction Details Modal -->
    <Dialog :open="isDialogOpen" @update:open="isDialogOpen = $event">
      <DialogContent class="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Transaksi</DialogTitle>
          <DialogDescription> Informasi lengkap tentang transaksi ini </DialogDescription>
        </DialogHeader>

        <!-- Loading skeleton for transaction details -->
        <div v-if="isLoading && selectedTransaction" class="py-4">
          <div class="mb-4 text-center">
            <div class="w-16 h-16 rounded-full bg-slate-400 animate-pulse mx-auto mb-2"></div>
            <div class="h-6 bg-slate-400 rounded animate-pulse w-40 mx-auto mb-2"></div>
            <div class="h-5 bg-slate-400 rounded animate-pulse w-24 mx-auto"></div>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg mb-4">
            <div class="text-center">
              <div class="h-4 bg-slate-400 rounded animate-pulse w-16 mx-auto mb-2"></div>
              <div class="h-8 bg-slate-400 rounded animate-pulse w-32 mx-auto"></div>
            </div>
          </div>

          <div class="space-y-3">
            <div v-for="i in 5" :key="i" class="flex justify-between">
              <div class="h-4 bg-slate-400 rounded animate-pulse w-24"></div>
              <div class="h-4 bg-slate-400 rounded animate-pulse w-32"></div>
            </div>
          </div>
        </div>

        <div v-else-if="selectedTransaction" class="py-4">
          <!-- Transaction type and status -->
          <div class="mb-4 text-center">
            <div
              class="w-16 h-16 rounded-full bg-gray-100 mx-auto mb-2 flex items-center justify-center"
            >
              <span class="text-3xl">{{ getTransactionIcon(selectedTransaction) }}</span>
            </div>
            <h3 class="font-medium text-lg">{{ getDonationTitle(selectedTransaction) }}</h3>
            <div class="mt-2">
              <Badge :variant="getStatusBadge(selectedTransaction.status).variant">
                {{ getStatusBadge(selectedTransaction.status).text }}
              </Badge>
            </div>
          </div>

          <!-- Transaction amount -->
          <div class="bg-gray-50 p-4 rounded-lg mb-4">
            <div class="text-center">
              <h4 class="text-sm text-gray-500 mb-1">Jumlah</h4>
              <p class="text-2xl font-semibold text-green-600">
                <template v-if="selectedTransaction.currency !== 'RM'">
                  {{
                    parseFloat(
                      selectedTransaction.amountCrypto || selectedTransaction.amount,
                    ).toFixed(6)
                  }}
                  {{ selectedTransaction.currency }}
                </template>
                <template v-else>
                  {{ formatCurrency(selectedTransaction.amount, selectedTransaction.currency) }}
                </template>
              </p>
              <!-- For zakat payments, show the direct amountRM -->
              <p
                v-if="
                  (selectedTransaction.currency === 'BTC' ||
                    selectedTransaction.currency === 'ETH') &&
                  selectedTransaction.type === 'zakat-payment'
                "
                class="text-sm text-gray-500"
              >
                ≈ RM {{ selectedTransaction.amountRM }}
              </p>
              <!-- For donations, calculate and show conversion -->
              <p
                v-else-if="
                  selectedTransaction.currency === 'BTC' || selectedTransaction.currency === 'ETH'
                "
                class="text-sm text-gray-500"
              >
                ≈ RM
                {{
                  selectedTransaction.currency === 'BTC'
                    ? (
                        (parseFloat(
                          selectedTransaction.amountCrypto || selectedTransaction.amount,
                        ) /
                          0.000001) *
                        3.5
                      ).toFixed(2)
                    : (
                        parseFloat(selectedTransaction.amountCrypto || selectedTransaction.amount) /
                        0.0001
                      ).toFixed(2)
                }}
              </p>
            </div>
          </div>

          <!-- Transaction details -->
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-500">ID Transaksi</span>
              <span class="font-medium">{{
                selectedTransaction.id || selectedTransaction.transactionId || 'Tidak tersedia'
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Tarikh</span>
              <span class="font-medium">{{ formatShortDate(selectedTransaction.timestamp) }}</span>
            </div>
            <div v-if="selectedTransaction.userName" class="flex justify-between">
              <span class="text-gray-500">Nama</span>
              <span class="font-medium">{{ selectedTransaction.userName }}</span>
            </div>
            <div v-if="selectedTransaction.userEmail" class="flex justify-between">
              <span class="text-gray-500">Email</span>
              <span class="font-medium">{{ selectedTransaction.userEmail }}</span>
            </div>
            <div v-if="selectedTransaction.paymentMethod" class="flex justify-between">
              <span class="text-gray-500">Kaedah Pembayaran</span>
              <span class="font-medium">{{ selectedTransaction.paymentMethod }}</span>
            </div>
            <div v-if="selectedTransaction.walletAddress" class="flex justify-between">
              <span class="text-gray-500">Alamat Dompet</span>
              <span class="font-medium text-xs break-all">{{
                selectedTransaction.walletAddress
              }}</span>
            </div>
            <div v-if="selectedTransaction.transactionHash" class="flex justify-between">
              <span class="text-gray-500">Hash Transaksi</span>
              <span class="font-medium text-xs break-all">{{
                selectedTransaction.transactionHash
              }}</span>
            </div>
            <div v-if="selectedTransaction.description" class="flex justify-between">
              <span class="text-gray-500">Keterangan</span>
              <span class="font-medium">{{ selectedTransaction.description }}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button @click="isDialogOpen = false">Tutup</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<style scoped>
/* Custom styles */
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
