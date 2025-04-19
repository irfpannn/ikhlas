import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  getTransactionHistory,
  addTransaction,
  getLatestTransaction,
} from '@/services/donationTransactionService'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

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
      // Check if user is authenticated
      const auth = getAuth()
      if (!auth.currentUser) {
        console.warn('Attempted to fetch transaction history without authentication')
        history.value = []
        return
      }

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

  // Get latest transaction
  async function fetchLatestTransaction() {
    isLoading.value = true
    error.value = null
    try {
      return await getLatestTransaction()
    } catch (err) {
      console.error('Failed to fetch latest transaction:', err)
      error.value = 'Gagal memuatkan transaksi terkini.' // "Failed to load latest transaction."
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Listen to auth state changes and reload history when needed
  const auth = getAuth()
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, fetch transaction history
      fetchHistory()
    } else {
      // User is signed out, clear local history
      history.value = []
    }
  })

  // Getters (computed properties based on state)
  const totalTransactions = computed(() => history.value.length)
  const sortedTransactions = computed(() => {
    return [...history.value].sort((a, b) => {
      return new Date(b.timestamp) - new Date(a.timestamp)
    })
  })

  return {
    history,
    isLoading,
    error,
    fetchHistory,
    recordTransaction,
    fetchLatestTransaction,
    totalTransactions,
    sortedTransactions,
  }
})
