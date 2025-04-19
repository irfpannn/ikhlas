// src/stores/combinedTransactionStore.js
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useTransactionStore } from './donationTransactionStore'
import { useZakatTransactionStore } from './zakatTransactionStore'
import { auth } from '@/services/firebaseService'
import { onAuthStateChanged } from 'firebase/auth'

export const useCombinedTransactionStore = defineStore('combinedTransactions', () => {
  // Get references to the individual stores
  const donationStore = useTransactionStore()
  const zakatStore = useZakatTransactionStore()

  // State
  const isLoading = ref(false)
  const error = ref(null)

  // Combined transactions computed property
  const sortedTransactions = computed(() => {
    // Combine both donation and zakat transactions
    const combinedTransactions = [...donationStore.history, ...zakatStore.history]

    // Sort by timestamp (newest first)
    return combinedTransactions.sort((a, b) => {
      // Handle different date formats and Firestore timestamps
      const getTimestamp = (item) => {
        if (!item.timestamp) return 0

        // Handle Firestore timestamp objects
        if (item.timestamp.seconds) {
          return item.timestamp.seconds * 1000
        }

        // Handle Date objects or string timestamps
        return new Date(item.timestamp).getTime()
      }

      return getTimestamp(b) - getTimestamp(a)
    })
  })

  // Fetch both types of history
  async function fetchAllHistory() {
    isLoading.value = true
    error.value = null

    try {
      // Fetch both types of transactions in parallel
      await Promise.all([donationStore.fetchHistory(), zakatStore.fetchHistory()])
    } catch (err) {
      console.error('Error fetching combined transaction history:', err)
      error.value = 'Gagal memuatkan sejarah transaksi.'
    } finally {
      isLoading.value = false
    }
  }

  // Listen to auth state changes
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, fetch all transaction history
      fetchAllHistory()
    }
  })

  return {
    isLoading,
    error,
    sortedTransactions,
    fetchAllHistory,
    donationHistory: computed(() => donationStore.history),
    zakatHistory: computed(() => zakatStore.history),
    // Include loading states from both stores
    isDonationsLoading: computed(() => donationStore.isLoading),
    isZakatLoading: computed(() => zakatStore.isLoading),
    // Combined loading state
    isAnyLoading: computed(
      () => isLoading.value || donationStore.isLoading || zakatStore.isLoading,
    ),
  }
})
