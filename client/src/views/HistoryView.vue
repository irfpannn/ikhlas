<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'
import BottomNavigation from '@/components/ui/bottom-navigation/BottomNavigation.vue'

const router = useRouter()
const transactions = ref([])

// Format short date
const formatShortDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('ms-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
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
    case 'card': return '💳'
    case 'bank': return '🏦'
    case 'ewallet': return '📱'
    default: return '💰'
  }
}

// View transaction details
const viewTransactionDetails = (transaction) => {
  // Save the selected transaction to localStorage
  localStorage.setItem('selectedTransaction', JSON.stringify(transaction))
  // Navigate to transaction details page
  router.push('/transaction-history')
}

// Load transaction data
onMounted(() => {
  // Get all transactions from history
  const transactionHistory = localStorage.getItem('transactionHistory')
  if (transactionHistory) {
    transactions.value = JSON.parse(transactionHistory)
  } else {
    // Check if there's a single transaction
    const savedTransaction = localStorage.getItem('zakatTransaction')
    if (savedTransaction) {
      const transaction = JSON.parse(savedTransaction)
      transactions.value = [transaction]
      
      // Initialize transaction history
      localStorage.setItem('transactionHistory', JSON.stringify(transactions.value))
    }
  }
})
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
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-base">Semua Transaksi</CardTitle>
        </CardHeader>
        <CardContent class="p-0">
          <div v-if="transactions.length > 0">
            <div 
              v-for="transaction in transactions" 
              :key="transaction.transactionHash"
              class="p-4 border-b last:border-b-0 flex justify-between items-center cursor-pointer hover:bg-gray-50"
              @click="viewTransactionDetails(transaction)"
            >
              <div class="flex items-center">
                <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                  <span class="text-2xl">{{ getTransactionIcon(transaction) }}</span>
                </div>
                <div>
                  <p class="font-medium">Zakat {{ transaction.currency === 'ETH' ? 'Crypto' : 'Pendapatan' }}</p>
                  <p class="text-xs text-gray-500">{{ formatShortDate(transaction.timestamp) }}</p>
                  <p class="text-xs text-gray-500 mt-1">
                    <span class="inline-block px-2 py-0.5 bg-green-50 text-green-600 rounded">{{ transaction.status }}</span>
                  </p>
                </div>
              </div>
              <div class="text-right">
                <p class="font-medium text-green-600">{{ formatCurrency(transaction.amount, transaction.currency) }}</p>
                <p v-if="transaction.currency === 'ETH'" class="text-xs text-gray-500">
                  ≈ RM {{ (parseFloat(transaction.amount) / 0.0001).toFixed(2) }}
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
            <p class="text-sm">Transaksi anda akan dipaparkan di sini selepas anda membuat pembayaran zakat.</p>
          </div>
        </CardContent>
      </Card>
    </div>
    
    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<style scoped>
/* Custom styles */
</style> 