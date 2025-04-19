import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { getAllTransactions, getTransactionsBySender, addTransaction } from '@/services/transactionService'
import { auth } from '@/services/firebaseService'
import { onAuthStateChanged } from 'firebase/auth'

export const useTransactionStore = defineStore('transactions', () => {
  // State
  const transactions = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // Actions
  async function fetchAllTransactions() {
    isLoading.value = true
    error.value = null
    try {
      transactions.value = await getAllTransactions()
    } catch (err) {
      console.error('Failed to fetch transactions:', err)
      error.value = 'Failed to load transactions'
      transactions.value = []
    } finally {
      isLoading.value = false
    }
  }

  async function fetchUserTransactions() {
    isLoading.value = true
    error.value = null
    try {
      const currentUser = auth.currentUser
      if (!currentUser) {
        console.warn('No authenticated user found')
        transactions.value = []
        return
      }

      transactions.value = await getTransactionsBySender(currentUser.uid)
    } catch (err) {
      console.error('Failed to fetch user transactions:', err)
      error.value = 'Failed to load user transactions'
      transactions.value = []
    } finally {
      isLoading.value = false
    }
  }

  async function recordTransaction(transactionData) {
    isLoading.value = true
    error.value = null
    try {
      const transactionId = await addTransaction(transactionData)
      // Refresh transactions after adding new one
      await fetchAllTransactions()
      return transactionId
    } catch (err) {
      console.error('Failed to record transaction:', err)
      error.value = 'Failed to record transaction'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Listen to auth state changes
  onAuthStateChanged(auth, (user) => {
    if (user) {
      fetchUserTransactions()
    } else {
      transactions.value = []
    }
  })

  // Getters
  const sortedTransactions = computed(() => {
    return [...transactions.value].sort((a, b) => {
      return new Date(b.timestamp) - new Date(a.timestamp)
    })
  })

  const totalTransactions = computed(() => transactions.value.length)

  return {
    transactions,
    isLoading,
    error,
    fetchAllTransactions,
    fetchUserTransactions,
    recordTransaction,
    sortedTransactions,
    totalTransactions
  }
}) 