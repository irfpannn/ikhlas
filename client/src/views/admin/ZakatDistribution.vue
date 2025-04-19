<template>
    <div class="zakat-distribution-container">
      <h1 class="text-2xl font-bold mb-6">Zakat Distribution Management</h1>
      
      <!-- Date Range Filter -->
      <div class="filter-section mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 class="text-lg font-semibold mb-3">Filter Transactions</h2>
        <div class="flex flex-wrap gap-4">
          <div class="date-range flex items-center gap-2">
            <label>From:</label>
            <input 
              type="date" 
              v-model="dateRange.from" 
              class="border rounded p-2"
            />
          </div>
          <div class="date-range flex items-center gap-2">
            <label>To:</label>
            <input 
              type="date" 
              v-model="dateRange.to" 
              class="border rounded p-2"
            />
          </div>
          <button 
            @click="fetchZakatData" 
            class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Apply Filter
          </button>
        </div>
      </div>
      
      <!-- Summary Section -->
      <div class="summary-section mb-6 p-4 bg-blue-50 rounded-lg">
        <h2 class="text-lg font-semibold mb-3">Summary</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="stat-card p-3 bg-white rounded shadow">
            <p class="text-gray-600">Total Zakat Collected</p>
            <p class="text-2xl font-bold">RM {{ formatNumber(totalZakatAmount) }}</p>
          </div>
          <div class="stat-card p-3 bg-white rounded shadow">
            <p class="text-gray-600">Number of Contributors</p>
            <p class="text-2xl font-bold">{{ zakatTransactions.length }}</p>
          </div>
          <div class="stat-card p-3 bg-white rounded shadow">
            <p class="text-gray-600">Number of Recipients</p>
            <p class="text-2xl font-bold">{{ recipients.length }}</p>
          </div>
        </div>
      </div>
      
      <!-- Recipients Management -->
      <div class="recipients-section mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 class="text-lg font-semibold mb-3">Recipients Management</h2>
        
        <!-- Add Recipient Form -->
        <div class="add-recipient-form mb-4 p-3 border rounded">
          <h3 class="font-medium mb-2">Add New Recipient</h3>
          <div class="flex flex-wrap gap-3 items-end">
            <div>
              <label class="block text-sm">Name</label>
              <input v-model="newRecipient.name" type="text" class="border rounded p-2" />
            </div>
            <div>
              <label class="block text-sm">Amount Needed (RM)</label>
              <input v-model="newRecipient.amountNeeded" type="number" class="border rounded p-2" />
            </div>
            <div>
              <label class="block text-sm">Description</label>
              <input v-model="newRecipient.description" type="text" class="border rounded p-2" />
            </div>
            <button 
              @click="addRecipient" 
              class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Add Recipient
            </button>
          </div>
        </div>
        
        <!-- Recipients List -->
        <div class="recipients-list">
          <h3 class="font-medium mb-2">Current Recipients</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full bg-white">
              <thead>
                <tr class="bg-gray-200">
                  <th class="py-2 px-4 text-left">Name</th>
                  <th class="py-2 px-4 text-left">Description</th>
                  <th class="py-2 px-4 text-left">Amount Needed</th>
                  <th class="py-2 px-4 text-left">Amount Received</th>
                  <th class="py-2 px-4 text-left">Status</th>
                  <th class="py-2 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(recipient, index) in recipients" :key="index" class="border-b">
                  <td class="py-2 px-4">{{ recipient.name }}</td>
                  <td class="py-2 px-4">{{ recipient.description }}</td>
                  <td class="py-2 px-4">RM {{ formatNumber(recipient.amountNeeded) }}</td>
                  <td class="py-2 px-4">RM {{ formatNumber(recipient.amountReceived) }}</td>
                  <td class="py-2 px-4">
                    <span 
                      :class="{
                        'bg-green-100 text-green-800': recipient.amountReceived >= recipient.amountNeeded,
                        'bg-yellow-100 text-yellow-800': recipient.amountReceived > 0 && recipient.amountReceived < recipient.amountNeeded,
                        'bg-red-100 text-red-800': recipient.amountReceived === 0
                      }"
                      class="px-2 py-1 rounded text-sm"
                    >
                      {{ getRecipientStatus(recipient) }}
                    </span>
                  </td>
                  <td class="py-2 px-4">
                    <button 
                      @click="removeRecipient(index)" 
                      class="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <!-- Distribution Section -->
      <div class="distribution-section mb-6 p-4 bg-green-50 rounded-lg">
        <h2 class="text-lg font-semibold mb-3">Zakat Distribution</h2>
        <button 
          @click="distributeZakat" 
          class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mb-4"
          :disabled="!canDistribute"
        >
          Distribute Zakat
        </button>
        
        <div v-if="distributionComplete" class="distribution-results mt-4">
          <h3 class="font-medium mb-2">Distribution Results</h3>
          <div v-for="(recipient, index) in recipients" :key="`dist-${index}`" class="mb-4 p-3 bg-white rounded shadow">
            <h4 class="font-medium">{{ recipient.name }} - RM {{ formatNumber(recipient.amountReceived) }}</h4>
            <p class="text-sm text-gray-600 mb-2">{{ getRecipientStatus(recipient) }}</p>
            
            <div v-if="recipient.contributors && recipient.contributors.length > 0">
              <p class="text-sm font-medium mt-2">Contributors:</p>
              <ul class="list-disc pl-5">
                <li v-for="(contributor, cIndex) in recipient.contributors" :key="`cont-${cIndex}`" class="text-sm">
                  {{ contributor.name }} - RM {{ formatNumber(contributor.amount) }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Transactions List -->
      <div class="transactions-section mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 class="text-lg font-semibold mb-3">Zakat Transactions</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white">
            <thead>
              <tr class="bg-gray-200">
                <th class="py-2 px-4 text-left">Date</th>
                <th class="py-2 px-4 text-left">Contributor</th>
                <th class="py-2 px-4 text-left">Amount</th>
                <th class="py-2 px-4 text-left">Type</th>
                <th class="py-2 px-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(transaction, index) in zakatTransactions" :key="index" class="border-b">
                <td class="py-2 px-4">{{ formatDate(transaction.date) }}</td>
                <td class="py-2 px-4">{{ transaction.userName }}</td>
                <td class="py-2 px-4">RM {{ formatNumber(transaction.amount) }}</td>
                <td class="py-2 px-4">{{ transaction.type }}</td>
                <td class="py-2 px-4">
                  <span 
                    :class="{
                      'bg-green-100 text-green-800': transaction.allocated,
                      'bg-yellow-100 text-yellow-800': !transaction.allocated
                    }"
                    class="px-2 py-1 rounded text-sm"
                  >
                    {{ transaction.allocated ? 'Allocated' : 'Pending' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted } from 'vue';
  import axios from 'axios';
  
  export default {
    name: 'ZakatDistributionView',
    setup() {
      const zakatTransactions = ref([]);
      const recipients = ref([]);
      const dateRange = ref({
        from: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0]
      });
      const newRecipient = ref({
        name: '',
        amountNeeded: 0,
        description: '',
        amountReceived: 0,
        contributors: []
      });
      const distributionComplete = ref(false);
  
      const totalZakatAmount = computed(() => {
        return zakatTransactions.value.reduce((total, transaction) => total + transaction.amount, 0);
      });
  
      const canDistribute = computed(() => {
        return zakatTransactions.value.length > 0 && recipients.value.length > 0;
      });
  
      // Fetch zakat transactions based on date range
      const fetchZakatData = async () => {
        try {
          // In a real implementation, this would call your API
          // For now, we'll use mock data
          const response = await mockFetchZakatData();
          zakatTransactions.value = response.data;
          
          // Reset distribution status
          distributionComplete.value = false;
          
          // Reset allocation status
          zakatTransactions.value.forEach(transaction => {
            transaction.allocated = false;
          });
          
          // Reset recipients' received amounts
          recipients.value.forEach(recipient => {
            recipient.amountReceived = 0;
            recipient.contributors = [];
          });
        } catch (error) {
          console.error('Error fetching zakat data:', error);
        }
      };
  
      // Mock API call for demo purposes
      const mockFetchZakatData = () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            const mockData = {
              data: [
                {
                  id: 1,
                  date: new Date('2025-05-01'),
                  userName: 'Ahmad Bin Abdullah',
                  amount: 5000,
                  type: 'Zakat Pendapatan',
                  allocated: false
                },
                {
                  id: 2,
                  date: new Date('2025-05-03'),
                  userName: 'Siti Binti Mahmud',
                  amount: 3000,
                  type: 'Zakat Pendapatan',
                  allocated: false
                },
                {
                  id: 3,
                  date: new Date('2025-05-05'),
                  userName: 'Mohd Rizal',
                  amount: 2500,
                  type: 'Zakat Pendapatan',
                  allocated: false
                },
                {
                  id: 4,
                  date: new Date('2025-05-07'),
                  userName: 'Nurul Huda',
                  amount: 1500,
                  type: 'Zakat Pendapatan',
                  allocated: false
                },
                {
                  id: 5,
                  date: new Date('2025-05-10'),
                  userName: 'Ismail Bin Ibrahim',
                  amount: 1000,
                  type: 'Zakat Pendapatan',
                  allocated: false
                }
              ]
            };
            resolve(mockData);
          }, 500);
        });
      };
  
      // Add a new recipient
      const addRecipient = () => {
        if (!newRecipient.value.name || newRecipient.value.amountNeeded <= 0) {
          alert('Please enter a valid name and amount needed');
          return;
        }
        
        recipients.value.push({
          name: newRecipient.value.name,
          amountNeeded: parseFloat(newRecipient.value.amountNeeded),
          description: newRecipient.value.description,
          amountReceived: 0,
          contributors: []
        });
        
        // Reset form
        newRecipient.value = {
          name: '',
          amountNeeded: 0,
          description: '',
          amountReceived: 0,
          contributors: []
        };
      };
  
      // Remove a recipient
      const removeRecipient = (index) => {
        recipients.value.splice(index, 1);
      };
  
      // Get recipient status
      const getRecipientStatus = (recipient) => {
        if (recipient.amountReceived >= recipient.amountNeeded) {
          return 'Fully Funded';
        } else if (recipient.amountReceived > 0) {
          return `Partially Funded (${Math.round((recipient.amountReceived / recipient.amountNeeded) * 100)}%)`;
        } else {
          return 'Not Funded';
        }
      };
  
      // Distribute zakat to recipients
      const distributeZakat = () => {
        // Sort recipients by amount needed (highest first)
        const sortedRecipients = [...recipients.value].sort((a, b) => b.amountNeeded - a.amountNeeded);
        
        // Create a copy of transactions to work with
        const availableTransactions = [...zakatTransactions.value].filter(t => !t.allocated);
        
        // For each recipient, allocate funds from available transactions
        sortedRecipients.forEach(recipient => {
          let amountStillNeeded = recipient.amountNeeded - recipient.amountReceived;
          
          if (amountStillNeeded <= 0) return; // Skip if already fully funded
          
          for (let i = 0; i < availableTransactions.length && amountStillNeeded > 0; i++) {
            const transaction = availableTransactions[i];
            
            if (transaction.allocated) continue; // Skip if already allocated
            
            // Determine how much to allocate from this transaction
            const amountToAllocate = Math.min(transaction.amount, amountStillNeeded);
            
            // Update recipient
            recipient.amountReceived += amountToAllocate;
            recipient.contributors = recipient.contributors || [];
            recipient.contributors.push({
              name: transaction.userName,
              amount: amountToAllocate
            });
            
            // Update transaction
            transaction.allocated = true;
            amountStillNeeded -= amountToAllocate;
            
            // Update the original transaction in the main list
            const originalTransaction = zakatTransactions.value.find(t => t.id === transaction.id);
            if (originalTransaction) {
              originalTransaction.allocated = true;
            }
          }
        });
        
        distributionComplete.value = true;
      };
  
      // Format number with commas
      const formatNumber = (num) => {
        return num.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      };
  
      // Format date
      const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-MY');
      };
  
      onMounted(() => {
        fetchZakatData();
      });
  
      return {
        zakatTransactions,
        recipients,
        dateRange,
        newRecipient,
        totalZakatAmount,
        distributionComplete,
        canDistribute,
        fetchZakatData,
        addRecipient,
        removeRecipient,
        getRecipientStatus,
        distributeZakat,
        formatNumber,
        formatDate
      };
    }
  }
  </script>
  
  <style scoped>
  .zakat-distribution-container {
    padding: 1.5rem;
  }
  </style>