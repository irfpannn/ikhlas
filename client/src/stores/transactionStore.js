import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getTransactionHistory, addTransaction } from '@/services/transactionService'

export const useTransactionStore = defineStore('transactions', () => {
  // State
  const history = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // Actions
  async function fetchHistory() {
    isLoading.value = true
    error.value = null
    try {
      history.value = await getTransactionHistory()
    } catch (err) {
      console.error('Failed to fetch transaction history:', err)
      error.value = 'Gagal memuatkan sejarah transaksi.' // "Failed to load transaction history."
      history.value = [] // Reset history on error
    } finally {
      isLoading.value = false
    }
  }

  async function recordTransaction(transactionData) {
    isLoading.value = true // Indicate loading while adding
    error.value = null
    try {
      // Add timestamp if not present
      if (!transactionData.timestamp) {
        transactionData.timestamp = new Date().toISOString()
      }
      const newTransaction = await addTransaction(transactionData)
      // Prepend to the local state for immediate UI update
      history.value.unshift(newTransaction)
      return newTransaction // Return the added transaction
    } catch (err) {
      console.error('Failed to record transaction:', err)
      error.value = 'Gagal merekodkan transaksi.' // "Failed to record transaction."
      throw err // Re-throw to allow components to handle it (e.g., show alerts)
    } finally {
      isLoading.value = false
    }
  }

  // Getters (optional, computed properties based on state)
  // const totalTransactions = computed(() => history.value.length);

  return {
    history,
    isLoading,
    error,
    fetchHistory,
    recordTransaction,
    // totalTransactions
  }
})
