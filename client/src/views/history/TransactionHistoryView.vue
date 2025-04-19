<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { useTransactionStore } from '@/stores/donationTransactionStore'

const router = useRouter()
const transactionStore = useTransactionStore()

// Transaction data state
const transactions = ref([])
const selectedTransaction = ref(null)
const isLoading = ref(true)

// Go back to home
const goBack = () => {
  router.push('/')
}

// Format date
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('ms-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Format short date (for list view)
const formatShortDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('ms-MY', {
    day: 'numeric',
    month: 'short',
  })
}

// Copy to clipboard
const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
  alert('Copied to clipboard')
}

// Load transaction data from Firestore via store
onMounted(async () => {
  isLoading.value = true

  // Load transactions from Firestore
  await transactionStore.fetchHistory()
  transactions.value = transactionStore.history

  // Check if there's a selected transaction from router state
  const routerState = router.currentRoute.value.params

  if (routerState.transactionId) {
    // Find the transaction with matching ID
    selectedTransaction.value = transactions.value.find((t) => t.id === routerState.transactionId)
  } else if (transactions.value.length > 0) {
    // If no selected transaction, use the first one (most recent)
    selectedTransaction.value = transactions.value[0]
  } else {
    // If no transactions at all, redirect to home
    router.push('/')
  }

  isLoading.value = false
})

// View transaction details
const viewTransactionDetails = (transaction) => {
  selectedTransaction.value = transaction
}

// View on blockchain explorer
const viewOnExplorer = () => {
  if (selectedTransaction.value && selectedTransaction.value.transactionHash) {
    // In a real app, this would link to Etherscan or another blockchain explorer
    window.open(`https://etherscan.io/tx/${selectedTransaction.value.transactionHash}`, '_blank')
  }
}

// Format currency with symbol
const formatCurrency = (amount, currency) => {
  if (currency === 'RM') {
    return `RM ${parseFloat(amount).toFixed(2)}`
  } else {
    return `${parseFloat(amount).toFixed(6)} ${currency}`
  }
}

// Get transaction icon based on payment method
const getTransactionIcon = (transaction) => {
  if (transaction.currency === 'ETH') return '💎'

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
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-100 pb-20">
    <!-- Header -->
    <div class="bg-white p-4 flex items-center shadow-sm">
      <button @click="goBack" class="mr-4">
        <span class="text-xl">←</span>
      </button>
      <h1 class="text-lg font-semibold">Sejarah Transaksi</h1>
    </div>

    <!-- Main content -->
    <div class="p-4">
      <!-- Transaction list -->
      <Card class="mb-4">
        <CardHeader class="pb-2">
          <CardTitle class="text-base">Transaksi Terkini</CardTitle>
        </CardHeader>
        <CardContent class="p-0">
          <div v-if="isLoading" class="p-4 text-center text-gray-500">Memuatkan data...</div>
          <div v-else-if="transactions.length > 0">
            <div
              v-for="transaction in transactions"
              :key="transaction.id"
              class="p-4 border-b last:border-b-0 flex justify-between items-center cursor-pointer"
              :class="{
                'bg-gray-50': selectedTransaction && selectedTransaction.id === transaction.id,
              }"
              @click="viewTransactionDetails(transaction)"
            >
              <div class="flex items-center">
                <div
                  class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3"
                >
                  <span class="text-xl">{{ getTransactionIcon(transaction) }}</span>
                </div>
                <div>
                  <p class="font-medium">
                    Zakat {{ transaction.currency === 'ETH' ? 'Crypto' : 'Pendapatan' }}
                  </p>
                  <p class="text-xs text-gray-500">{{ formatShortDate(transaction.timestamp) }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="font-medium text-green-600">
                  {{ formatCurrency(transaction.amount, transaction.currency) }}
                </p>
                <p class="text-xs text-gray-500">{{ transaction.status }}</p>
              </div>
            </div>
          </div>
          <div v-else class="p-4 text-center text-gray-500">Tiada transaksi untuk dipaparkan</div>
        </CardContent>
      </Card>

      <!-- Transaction details (if a transaction is selected) -->
      <div v-if="isLoading" class="flex justify-center p-8">
        <div class="text-center">
          <p class="text-gray-500">Memuatkan butiran transaksi...</p>
        </div>
      </div>
      <div v-else-if="selectedTransaction">
        <!-- Transaction status card -->
        <Card class="mb-4 bg-green-50 border-green-200">
          <CardContent class="p-4 text-center">
            <div
              class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3"
            >
              <span class="text-green-500 text-2xl">✓</span>
            </div>
            <h2 class="text-xl font-bold text-green-800 mb-1">Transaksi Berjaya</h2>
            <p class="text-sm text-gray-600">{{ formatDate(selectedTransaction.timestamp) }}</p>
          </CardContent>
        </Card>

        <!-- Transaction amount -->
        <Card class="mb-4">
          <CardContent class="p-4">
            <div class="text-center mb-4">
              <p class="text-gray-500 text-sm mb-1">Jumlah Pembayaran</p>
              <h3 class="text-2xl font-bold">
                {{ formatCurrency(selectedTransaction.amount, selectedTransaction.currency) }}
              </h3>
              <p v-if="selectedTransaction.currency === 'ETH'" class="text-sm text-gray-500">
                ≈ RM {{ (parseFloat(selectedTransaction.amount) / 0.0001).toFixed(2) }}
              </p>
            </div>

            <div class="border-t pt-4">
              <div class="flex justify-between items-center mb-3">
                <span class="text-sm text-gray-500">Status</span>
                <span class="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                  {{ selectedTransaction.status }}
                </span>
              </div>

              <div class="flex justify-between items-center mb-3">
                <span class="text-sm text-gray-500">Jenis Pembayaran</span>
                <span class="text-sm">
                  {{
                    selectedTransaction.currency === 'ETH'
                      ? 'Cryptocurrency (ETH)'
                      : 'Ringgit Malaysia (RM)'
                  }}
                </span>
              </div>

              <div class="flex justify-between items-center mb-3">
                <span class="text-sm text-gray-500">Tarikh & Masa</span>
                <span class="text-sm">{{ formatDate(selectedTransaction.timestamp) }}</span>
              </div>

              <div class="flex justify-between items-center mb-3">
                <span class="text-sm text-gray-500">ID Transaksi</span>
                <span class="font-mono text-xs">{{ selectedTransaction.id }}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Transaction details (only for crypto transactions) -->
        <Card v-if="selectedTransaction.currency === 'ETH'" class="mb-4">
          <CardHeader class="pb-2">
            <CardTitle class="text-base">Butiran Transaksi Blockchain</CardTitle>
          </CardHeader>
          <CardContent class="p-4">
            <div class="mb-4">
              <label class="block text-sm text-gray-500 mb-1">Hash Transaksi</label>
              <div class="flex items-center">
                <div class="flex-1 bg-gray-50 p-2 rounded-md border overflow-hidden">
                  <p class="text-xs font-mono truncate">
                    {{ selectedTransaction.transactionHash || selectedTransaction.id }}
                  </p>
                </div>
                <button
                  @click="
                    copyToClipboard(selectedTransaction.transactionHash || selectedTransaction.id)
                  "
                  class="ml-2 text-[#75a868] p-2"
                >
                  <span>📋</span>
                </button>
              </div>
            </div>

            <div class="mb-4">
              <label class="block text-sm text-gray-500 mb-1">Dari (Dompet Anda)</label>
              <div class="flex items-center">
                <div class="flex-1 bg-gray-50 p-2 rounded-md border overflow-hidden">
                  <p class="text-xs font-mono truncate">
                    {{ selectedTransaction.from || selectedTransaction.senderId }}
                  </p>
                </div>
                <button
                  @click="copyToClipboard(selectedTransaction.from || selectedTransaction.senderId)"
                  class="ml-2 text-[#75a868] p-2"
                >
                  <span>📋</span>
                </button>
              </div>
            </div>

            <div class="mb-4">
              <label class="block text-sm text-gray-500 mb-1">Kepada (Pusat Urus Zakat)</label>
              <div class="flex items-center">
                <div class="flex-1 bg-gray-50 p-2 rounded-md border overflow-hidden">
                  <p class="text-xs font-mono truncate">
                    {{ selectedTransaction.to || '0xZakatCollectionCenter' }}
                  </p>
                </div>
                <button
                  @click="copyToClipboard(selectedTransaction.to || '0xZakatCollectionCenter')"
                  class="ml-2 text-[#75a868] p-2"
                >
                  <span>📋</span>
                </button>
              </div>
            </div>

            <div class="mb-4">
              <label class="block text-sm text-gray-500 mb-1">Yuran Transaksi</label>
              <div class="bg-gray-50 p-2 rounded-md border">
                <p class="text-sm">
                  {{
                    selectedTransaction.fee || '0.000' + (Math.floor(Math.random() * 9000) + 1000)
                  }}
                  ETH
                </p>
              </div>
            </div>

            <div class="mb-4">
              <label class="block text-sm text-gray-500 mb-1">Blok</label>
              <div class="bg-gray-50 p-2 rounded-md border">
                <p class="text-sm">
                  {{
                    selectedTransaction.blockNumber ||
                    16000000 + Math.floor(Math.random() * 1000000)
                  }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Action buttons (only for crypto transactions) -->
        <div v-if="selectedTransaction.currency === 'ETH'" class="flex flex-col gap-3 mb-4">
          <Button @click="viewOnExplorer" class="bg-[#75a868] hover:bg-[#75a868]/90 text-white">
            Lihat di Etherscan
          </Button>
        </div>
      </div>
      <div v-else class="flex justify-center p-8">
        <div class="text-center">
          <p class="text-gray-500">Tiada transaksi dipilih</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom styles */
</style>
