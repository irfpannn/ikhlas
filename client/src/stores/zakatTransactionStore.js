// src/stores/zakatTransactionStore.js
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  getZakatPaymentHistory,
  addZakatPayment,
  getLatestZakatPayment,
} from '@/services/zakatTransactionService'
import { auth } from '@/services/firebaseService'
import { onAuthStateChanged } from 'firebase/auth'

export const useZakatTransactionStore = defineStore('zakatTransactions', () => {
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
      if (!auth.currentUser) {
        console.warn('Attempted to fetch zakat payment history without authentication')
        history.value = []
        return
      }

      history.value = await getZakatPaymentHistory()
    } catch (err) {
      console.error('Failed to fetch zakat payment history:', err)
      error.value = 'Gagal memuatkan sejarah pembayaran zakat.' // Failed to load zakat payment history
      history.value = [] // Reset history on error
    } finally {
      isLoading.value = false
    }
  }

  async function recordZakatPayment(paymentData) {
    isLoading.value = true // Indicate loading while adding
    error.value = null
    try {
      const newPayment = await addZakatPayment(paymentData)
      // Prepend to the local state for immediate UI update
      history.value.unshift(newPayment)
      return newPayment // Return the added payment
    } catch (err) {
      console.error('Failed to record zakat payment:', err)
      error.value = 'Gagal merekodkan pembayaran zakat.' // Failed to record zakat payment
      throw err // Re-throw to allow components to handle it
    } finally {
      isLoading.value = false
    }
  }

  // Get latest zakat payment
  async function fetchLatestZakatPayment() {
    isLoading.value = true
    error.value = null
    try {
      return await getLatestZakatPayment()
    } catch (err) {
      console.error('Failed to fetch latest zakat payment:', err)
      error.value = 'Gagal memuatkan pembayaran zakat terkini.' // Failed to load latest zakat payment
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Listen to auth state changes and reload history when needed
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, fetch zakat payment history
      fetchHistory()
    } else {
      // User is signed out, clear local history
      history.value = []
    }
  })

  // Getters (computed properties based on state)
  const totalZakatPayments = computed(() => history.value.length)
  const sortedZakatPayments = computed(() => {
    return [...history.value].sort((a, b) => {
      // Convert timestamps to dates for comparison
      const dateA = a.timestamp ? new Date(a.timestamp) : new Date(0)
      const dateB = b.timestamp ? new Date(b.timestamp) : new Date(0)
      return dateB - dateA // Sort in descending order (newest first)
    })
  })

  return {
    history,
    isLoading,
    error,
    fetchHistory,
    recordZakatPayment,
    fetchLatestZakatPayment,
    totalZakatPayments,
    sortedZakatPayments,
  }
})
