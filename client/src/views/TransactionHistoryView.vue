<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const router = useRouter()
const transactions = ref([])
const isLoading = ref(true)

onMounted(() => {
  // Get transaction history from localStorage
  try {
    const history = JSON.parse(localStorage.getItem('transactionHistory') || '[]')
    transactions.value = history
  } catch (error) {
    console.error('Error parsing transaction history:', error)
    transactions.value = []
  } finally {
    isLoading.value = false
  }
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString()
}

const goBack = () => {
  router.go(-1)
}

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-100">
    <!-- Header -->
    <div class="bg-white p-4 sticky top-0 z-10 flex items-center">
      <Button variant="ghost" class="mr-2" @click="goBack">
        <span class="text-xl">←</span>
      </Button>
      <h1 class="text-lg font-semibold">Sejarah Transaksi</h1>
    </div>

    <!-- Main content -->
    <div class="p-4 flex-1">
      <!-- Loading state -->
      <div v-if="isLoading" class="text-center py-8">
        <div class="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p class="text-gray-600">Memuat sejarah transaksi...</p>
      </div>

      <!-- No transactions -->
      <Card v-else-if="transactions.length === 0" class="p-6 text-center">
        <div class="mb-4 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-700 mb-2">Tiada Sejarah Transaksi</h3>
        <p class="text-gray-600 mb-4">Anda belum membuat sebarang transaksi.</p>
        <Button @click="goHome">Kembali ke Halaman Utama</Button>
      </Card>

      <!-- Transaction list -->
      <div v-else class="space-y-4">
        <h2 class="text-gray-600 font-medium mb-2">Transaksi Terkini</h2>
        
        <div v-for="(transaction, index) in transactions" :key="index" class="bg-white border rounded-lg overflow-hidden shadow-sm">
          <div class="p-4">
            <div class="flex justify-between items-start mb-3">
              <div>
                <div class="flex items-center space-x-2">
                  <span v-if="transaction.status === 'COMPLETED' || transaction.status === 'confirmed' || transaction.status === 'PENDING' || transaction.status === 'pending'" 
                    class="px-2 py-1 text-xs rounded-full" 
                    :class="{
                      'bg-green-100 text-green-800': transaction.status === 'COMPLETED' || transaction.status === 'confirmed',
                      'bg-yellow-100 text-yellow-800': transaction.status === 'PENDING' || transaction.status === 'pending'
                    }">
                    {{ transaction.status }}
                  </span>
                  <span v-else class="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                    {{ transaction.status || 'Unknown' }}
                  </span>
                  <h3 class="font-medium text-gray-900">
                    {{ transaction.currency || 'ETH' }} {{ transaction.amount }}
                  </h3>
                </div>
                <p class="text-sm text-gray-600 mt-1">{{ formatDate(transaction.timestamp) }}</p>
              </div>
              <div class="text-right">
                <p class="text-xs font-mono text-gray-500 truncate max-w-[120px]">
                  {{ transaction.transactionId || transaction.transactionHash }}
                </p>
              </div>
            </div>
            
            <div class="border-t pt-3 mt-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Dari:</span>
                <span class="font-mono text-xs truncate max-w-[180px]">{{ transaction.from }}</span>
              </div>
              <div class="flex justify-between mt-1">
                <span class="text-gray-600">Ke:</span>
                <span class="font-mono text-xs truncate max-w-[180px]">{{ transaction.to }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom styles if needed */
</style> 