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

const convertRMtoBTC = (amountRM) => {
  const btcRate = 250000 // 1 BTC = 250,000 RM (update as needed)
  if (!amountRM || isNaN(amountRM)) return '0.000000'
  return (parseFloat(amountRM) / btcRate).toFixed(6)
}

// Function to convert Crypto (BTC/ETH) to RM (using example rates from previous template logic)
const convertCryptoToRM = (amountCrypto, currency) => {
  if (!amountCrypto || isNaN(amountCrypto)) return 'RM 0.00'

  // NOTE: These rates are placeholders based on previous logic and likely need updating
  const btcToRmRate = (1 / 0.000001) * 3.5 // Example rate for BTC to RM
  const ethToRmRate = 1 / 0.0001 // Example rate for ETH to RM

  let amountRM = 0
  if (currency === 'BTC') {
    amountRM = parseFloat(amountCrypto) * btcToRmRate
  } else if (currency === 'ETH') {
    amountRM = parseFloat(amountCrypto) * ethToRmRate
  } else {
    // Handle other cryptos or return default if unknown
    return 'RM ?.?' // Indicate unknown conversion
  }

  return `RM ${amountRM.toFixed(2)}`
}

// Helper to get the primary display amount (always RM)
const getDisplayRMAmount = (transaction) => {
  if (transaction.currency === 'RM') {
    return formatCurrency(transaction.amount, 'RM')
  } else if (transaction.currency === 'BTC' || transaction.currency === 'ETH') {
    // Use amountCrypto if available (assuming it holds the crypto value), otherwise fallback to amount
    const cryptoAmount = transaction.amountCrypto || transaction.amount
    return convertCryptoToRM(cryptoAmount, transaction.currency)
  }
  // Fallback for other currencies or unexpected data
  return formatCurrency(transaction.amount, transaction.currency)
}

// Helper to get the secondary display amount (always Crypto equivalent)
const getDisplayCryptoAmount = (transaction) => {
  // Use amountCrypto if available, otherwise fallback to amount
  const cryptoAmount = transaction.amountCrypto || transaction.amount

  if (transaction.currency === 'RM') {
    // Show BTC equivalent for RM transactions
    return `≈ ${convertRMtoBTC(transaction.amount)} BTC`
  } else if (transaction.currency === 'BTC' || transaction.currency === 'ETH') {
    // Show the original crypto amount
    return formatCurrency(cryptoAmount, transaction.currency)
  }
  // Fallback if currency is neither RM, BTC, nor ETH
  return '' // Or display something else like '-'
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
              :key="transaction.transactionHash || transaction.id"
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
                <!-- Always show RM amount on top -->
                <p class="font-medium text-green-600">
                  {{ getDisplayRMAmount(transaction) }}
                </p>
                <!-- Always show Crypto equivalent/amount at the bottom -->
                <p class="text-xs text-gray-500">
                  {{ getDisplayCryptoAmount(transaction) }}
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
      <DialogContent class="sm:max-w-[700px] max-h-[90vh] overflow-y-auto max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detail Transaksi</DialogTitle>
          <DialogDescription> Informasi lengkap tentang transaksi ini </DialogDescription>
        </DialogHeader>

        <!-- Loading skeleton -->
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
                {{ formatCurrency(selectedTransaction.amount, selectedTransaction.currency) }}
              </p>
              <p v-if="selectedTransaction.currency === 'RM'" class="text-sm text-gray-500 mt-1">
                ≈ {{ convertRMtoBTC(selectedTransaction.amount) }} BTC
              </p>
            </div>
          </div>

          <!-- Transaction Details -->
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-500">Kategori</span>
              <span class="font-medium">{{ selectedTransaction.category || '-' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Mata Wang</span>
              <span class="font-medium">{{ selectedTransaction.currency }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Kaedah Pembayaran</span>
              <span class="font-medium">{{ selectedTransaction.paymentMethod || '-' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Penerima</span>
              <span class="font-medium">{{ selectedTransaction.recipientName || '-' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Pengirim</span>
              <span class="font-medium">{{ selectedTransaction.senderName || '-' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Tarikh & Masa</span>
              <span class="font-medium">{{ formatShortDate(selectedTransaction.timestamp) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Status</span>
              <span class="font-medium">{{ selectedTransaction.status }}</span>
            </div>

            <div class="flex justify-between">
              <span class="text-gray-500">ID Transaksi (Ikhlas)</span>
              <span class="font-mono text-xs">{{ selectedTransaction.id }}</span>
            </div>
          </div>

          <!-- Crypto Transaction Hash Details -->
          <div
            v-if="
              selectedTransaction.transactionHash &&
              selectedTransaction.type !== 'zakat' &&
              selectedTransaction.type !== 'zakat-payment'
            "
            class="mt-4 pt-4 border-t border-gray-200 space-y-3"
          >
            <h4 class="font-medium text-gray-700 mb-2">Butiran Hash Transaksi Crypto</h4>
            <div class="flex justify-between">
              <span class="text-gray-500">ID Transaksi (Provider)</span>
              <span class="font-mono text-xs">{{
                selectedTransaction.transactionHash.id || '-'
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Provider</span>
              <span class="font-mono text-xs">{{
                selectedTransaction.transactionHash.provider || '-'
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Status (Provider)</span>
              <span class="font-mono text-xs">{{
                selectedTransaction.transactionHash.status || '-'
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Alamat Wallet (Dari)</span>
              <span class="font-mono text-xs">{{
                selectedTransaction.transactionHash.from || '-'
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Alamat Wallet (Ke)</span>
              <span class="font-mono text-xs">{{
                selectedTransaction.transactionHash.to || '-'
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Masa (Provider)</span>
              <span class="font-mono text-xs">{{
                formatShortDate(selectedTransaction.transactionHash.timestamp)
              }}</span>
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
