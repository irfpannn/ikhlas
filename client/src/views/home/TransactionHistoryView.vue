<template>
  <div class="transaction-history p-4">
    <h1 class="text-2xl font-bold mb-6">Transaction History</h1>
    
    <div class="mb-4">
      <div class="flex space-x-2">
        <button 
          @click="activeFilter = 'all'" 
          :class="[
            'px-3 py-1 rounded-md',
            activeFilter === 'all' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          ]"
        >
          All
        </button>
        <button 
          @click="activeFilter = 'donation'" 
          :class="[
            'px-3 py-1 rounded-md',
            activeFilter === 'donation' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          ]"
        >
          Donations
        </button>
        <button 
          @click="activeFilter = 'zakat'" 
          :class="[
            'px-3 py-1 rounded-md',
            activeFilter === 'zakat' 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          ]"
        >
          Zakat
        </button>
        <button 
          @click="activeFilter = 'crypto'" 
          :class="[
            'px-3 py-1 rounded-md',
            activeFilter === 'crypto' 
              ? 'bg-yellow-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          ]"
        >
          Crypto
        </button>
      </div>
    </div>
    
    <div v-if="loading" class="flex justify-center my-8">
      <div class="spinner"></div>
    </div>
    
    <div v-else-if="filteredTransactions.length === 0" class="text-center my-8">
      <p>No transactions found.</p>
    </div>
    
    <div v-else class="space-y-4">
      <div v-for="transaction in filteredTransactions" :key="transaction.id" 
           class="bg-white p-4 rounded-lg shadow-md">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="font-semibold">
              {{ transaction.recipientName }}
              <span v-if="transaction.type === 'zakat'" class="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                Zakat
              </span>
              <span v-else-if="transaction.currency !== 'RM'" class="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                Crypto
              </span>
            </h3>
            <p class="text-sm text-gray-600">{{ formatDate(transaction.timestamp) }}</p>
            <p class="mt-1">Category: {{ transaction.category }}</p>
            <p v-if="transaction.notes" class="mt-1 text-sm italic">
              "{{ transaction.notes }}"
            </p>
            <p v-if="transaction.transactionHash" class="mt-1 text-xs text-gray-500">
              TX: {{ truncateHash(transaction.transactionHash) }}
            </p>
          </div>
          <div class="text-right">
            <p class="font-bold" :class="transaction.type === 'zakat' ? 'text-purple-600' : 'text-green-600'">
              {{ transaction.currency }} {{ transaction.amount.toFixed(2) }}
            </p>
            <p class="text-xs text-gray-500">{{ transaction.paymentMethod }}</p>
            <span class="inline-block px-2 py-1 mt-1 text-xs rounded-full bg-green-100 text-green-800">
              {{ transaction.status }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getUserDonationTransactions } from '@/services/donationService';
import { getAuth } from 'firebase/auth';
import { ref, computed, onMounted, watch } from 'vue';
import { getFirestore, collection, query, where, orderBy, getDocs } from 'firebase/firestore';

export default {
  name: 'TransactionHistoryView',
  
  setup() {
    const transactions = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const activeFilter = ref('all');
    
    const filteredTransactions = computed(() => {
      if (activeFilter.value === 'all') {
        return transactions.value;
      } else if (activeFilter.value === 'donation') {
        return transactions.value.filter(tx => tx.type === 'donation');
      } else if (activeFilter.value === 'zakat') {
        return transactions.value.filter(tx => tx.type === 'zakat');
      } else if (activeFilter.value === 'crypto') {
        return transactions.value.filter(tx => 
          tx.currency !== 'RM' || tx.type === 'crypto-donation'
        );
      }
      return transactions.value;
    });
    
    const fetchTransactions = async () => {
      try {
        loading.value = true;
        const auth = getAuth();
        if (auth.currentUser) {
          const userId = auth.currentUser.uid;
          const db = getFirestore();
          const transactionsRef = collection(db, "transactions");
          
          // Create a query to get transactions where the user is the sender
          const senderQuery = query(
            transactionsRef,
            where("senderId", "==", userId),
            orderBy("timestamp", "desc")
          );
          
          // Execute the query
          const senderSnapshot = await getDocs(senderQuery);
          
          // Also get transactions where the user is the recipient
          const recipientQuery = query(
            transactionsRef,
            where("recipientId", "==", userId),
            orderBy("timestamp", "desc")
          );
          
          const recipientSnapshot = await getDocs(recipientQuery);
          
          // Combine and process the results
          const transactions = [];
          
          senderSnapshot.forEach((doc) => {
            transactions.push({
              id: doc.id,
              ...doc.data(),
              direction: "outgoing"
            });
          });
          
          recipientSnapshot.forEach((doc) => {
            transactions.push({
              id: doc.id,
              ...doc.data(),
              direction: "incoming"
            });
          });
          
          // Sort by timestamp (newest first)
          transactions.sort((a, b) => 
            b.timestamp.toDate() - a.timestamp.toDate()
          );
          
          transactions.value = transactions;
          console.log("Fetched transactions:", transactions.value);
        }
      } catch (err) {
        console.error('Error fetching transactions:', err);
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    };
    
    const formatDate = (date) => {
      return new Intl.DateTimeFormat('en-MY', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    };
    
    const truncateHash = (hash) => {
      if (!hash) return '';
      return hash.substring(0, 6) + '...' + hash.substring(hash.length - 4);
    };
    
    onMounted(() => {
      fetchTransactions();
    });
    
    watch(() => {
      '$store.state.user': {
        handler(newUser) {
          if (newUser && newUser.uid) {
            fetchTransactions();
          } else {
            transactions.value = [];
          }
        },
        immediate: true
      }
    });
    
    return {
      transactions,
      loading,
      error,
      activeFilter,
      filteredTransactions,
      formatDate,
      truncateHash
    };
  }
}
</script>

<style scoped>
.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #4f46e5;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 