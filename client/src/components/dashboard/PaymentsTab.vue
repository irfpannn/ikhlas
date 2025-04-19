<template>
  <!-- Wrap the entire relevant section in the Dialog component -->
  <Dialog v-model:open="isDialogOpen">
    <div class="space-y-4 w-full">
      <div v-if="loading" class="text-center py-10 text-muted-foreground">Loading data...</div>
      <div v-else class="border rounded-lg overflow-hidden bg-gray-50 p-3">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Date</TableHead>
              <TableHead class="text-right">Amount (RM)</TableHead>
              <TableHead class="text-right">Amount (Crypto)</TableHead>
              <TableHead>Wallet Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <template v-if="zakatPayments.length > 0">
              <TableRow v-for="payment in zakatPayments" :key="payment.id">
                <TableCell class="font-medium">{{ payment.userName || 'N/A' }}</TableCell>
                <TableCell>{{ formatDate(payment.date) }}</TableCell>
                <TableCell class="text-right"
                  >RM {{ payment.amountRM?.toFixed(2) || '0.00' }}</TableCell
                >
                <TableCell class="text-right"
                  >{{ payment.amountCrypto?.toFixed(8) || '0.00000000' }}
                  {{ payment.cryptoType || 'BTC' }}</TableCell
                >
                <TableCell class="font-mono text-xs">
                  <span v-if="payment.walletAddress">
                    {{ payment.walletAddress.substring(0, 10) }}...{{
                      payment.walletAddress.substring(payment.walletAddress.length - 6)
                    }}
                  </span>
                  <span v-else>N/A</span>
                </TableCell>
                <TableCell>
                  <Badge
                    :variant="getStatusVariant(payment.status)"
                    :class="
                      cn(
                        'capitalize',
                        getStatusVariant(payment.status) === 'success' &&
                          'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
                        getStatusVariant(payment.status) === 'warning' &&
                          'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700',
                      )
                    "
                  >
                    {{ payment.status || 'Unknown' }}
                  </Badge>
                </TableCell>
                <TableCell class="text-right">
                  <!-- DialogTrigger remains here, now within Dialog context -->
                  <DialogTrigger as-child>
                    <Button variant="outline" size="sm" @click="viewDetails(payment)">View</Button>
                  </DialogTrigger>
                </TableCell>
              </TableRow>
            </template>
            <TableRow v-else>
              <TableCell colspan="7" class="h-24 text-center text-muted-foreground">
                No zakat payments found.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <!-- Payment Details Modal Content - Still outside the loop, but now inside Dialog context -->
      <DialogContent v-if="selectedPayment" class="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
          <DialogDescription> Review the details of the zakat payment. </DialogDescription>
        </DialogHeader>
        <div class="grid gap-4 py-4">
          <div class="grid grid-cols-4 items-center gap-4">
            <Label class="text-right col-span-1">User:</Label>
            <span class="col-span-3 font-medium">{{ selectedPayment.userName || 'N/A' }}</span>
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label class="text-right col-span-1">Email:</Label>
            <span class="col-span-3">{{ selectedPayment.userEmail || 'N/A' }}</span>
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label class="text-right col-span-1">Date:</Label>
            <span class="col-span-3">{{ formatDate(selectedPayment.date) }}</span>
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label class="text-right col-span-1">Amount (RM):</Label>
            <span class="col-span-3">RM {{ selectedPayment.amountRM?.toFixed(2) || '0.00' }}</span>
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label class="text-right col-span-1">Amount (Crypto):</Label>
            <span class="col-span-3"
              >{{ selectedPayment.amountCrypto?.toFixed(8) || '0.00000000' }}
              {{ selectedPayment.cryptoType || '' }}</span
            >
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label class="text-right col-span-1">Wallet Address:</Label>
            <span class="col-span-3 font-mono text-xs break-all">{{
              selectedPayment.walletAddress || 'N/A'
            }}</span>
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label class="text-right col-span-1">Transaction ID:</Label>
            <span class="col-span-3 font-mono text-xs break-all">{{
              selectedPayment.transactionId || 'N/A'
            }}</span>
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label class="text-right col-span-1">Status:</Label>
            <div class="col-span-3">
              <Badge
                :variant="getStatusVariant(selectedPayment.status)"
                :class="
                  cn(
                    'capitalize',
                    getStatusVariant(selectedPayment.status) === 'success' &&
                      'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
                    getStatusVariant(selectedPayment.status) === 'warning' &&
                      'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700',
                  )
                "
              >
                {{ selectedPayment.status || 'Unknown' }}
              </Badge>
            </div>
          </div>
        </div>
        <DialogFooter>
          <div class="flex justify-end gap-2">
            <Button variant="outline" @click="isDialogOpen = false">Close</Button>
            <template v-if="selectedPayment.status === 'Pending'">
              <Button
                variant="destructive"
                @click="updatePaymentStatus(selectedPayment.id, 'Rejected')"
              >
                Reject
              </Button>
              <Button
                @click="updatePaymentStatus(selectedPayment.id, 'Approved')"
                class="bg-green-600 hover:bg-green-700 text-white"
              >
                Approve
              </Button>
            </template>
          </div>
        </DialogFooter>
      </DialogContent>
    </div>
  </Dialog>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useTransactionStore } from '@/stores/transactionStore'

const props = defineProps({
  zakatPayments: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update-payment-status'])

const selectedPayment = ref(null)
const isDialogOpen = ref(false)
const exchangeRate = ref(null) // Exchange rate for RM to BTC

// Fetch the current exchange rate on component mount
const fetchBTCExchangeRate = async () => {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=myr',
    )
    const data = await response.json()

    if (data && data.bitcoin && data.bitcoin.myr) {
      // Calculate BTC/MYR rate (1 BTC = X MYR, so 1 MYR = 1/X BTC)
      exchangeRate.value = 1 / data.bitcoin.myr
      console.log(`Exchange rate fetched: 1 MYR = ${exchangeRate.value} BTC`)
    } else {
      console.error('Invalid exchange rate data format:', data)
      // Fallback exchange rate if API fails
      exchangeRate.value = 0.0000053 // Example fallback rate (1 MYR ≈ 0.0000053 BTC)
    }
  } catch (error) {
    console.error('Error fetching BTC exchange rate:', error)
    // Fallback exchange rate if API fails
    exchangeRate.value = 0.0000053 // Example fallback rate
  }
}

// Convert RM to BTC based on current exchange rate
const convertRMtoBTC = (amountRM) => {
  if (!amountRM || !exchangeRate.value) return 0
  return amountRM * exchangeRate.value
}

// Format date function
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  // Check if dateString is a Firestore Timestamp object
  const date = dateString.toDate ? dateString.toDate() : new Date(dateString)
  if (isNaN(date.getTime())) return 'Invalid Date' // Add check for invalid date
  return date.toLocaleDateString('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const viewDetails = (payment) => {
  selectedPayment.value = payment
  isDialogOpen.value = true
}

const transactionStore = useTransactionStore()

// Fetch transactions when component is mounted
onMounted(async () => {
  await transactionStore.fetchAllTransactions()
  await fetchBTCExchangeRate() // Fetch the exchange rate when component mounts
})

// Map transaction data to match the component's expected format
const zakatPayments = computed(() => {
  return (transactionStore.transactions || [])
    .filter((tx) => tx.type === 'zakat')
    .map((tx) => {
      const rmAmount = tx.currency === 'RM' ? tx.amount : 0
      // If cryptocurrency is already BTC, use that amount, otherwise convert RM to BTC
      const btcAmount = tx.currency === 'BTC' ? tx.amount : convertRMtoBTC(rmAmount)

      return {
        id: tx.id,
        userName: tx.senderName,
        date: tx.timestamp,
        amountRM: rmAmount,
        amountCrypto: btcAmount,
        cryptoType: 'BTC', // Always display BTC as crypto type
        walletAddress: tx.transactionHash,
        status: tx.status,
        userEmail: tx.senderEmail || 'N/A',
        transactionId: tx.transactionHash,
      }
    })
})

// Update loading state based on store
const loading = computed(() => transactionStore.isLoading)

// Update payment status
const updatePaymentStatus = async (paymentId, status) => {
  try {
    const payment = transactionStore.transactions.find((tx) => tx.id === paymentId)
    if (payment) {
      await transactionStore.recordTransaction({
        ...payment,
        status: status,
      })
      emit('update-payment-status', paymentId, status)
      isDialogOpen.value = false
    }
  } catch (error) {
    console.error('Error updating payment status:', error)
  }
}

const getStatusVariant = (status) => {
  switch (status?.toLowerCase()) {
    case 'approved':
      return 'success' // Custom variant
    case 'rejected':
      return 'destructive'
    case 'pending':
      return 'warning' // Custom variant
    default:
      return 'secondary'
  }
}

// Handle dialog open state changes
watch(isDialogOpen, (newValue) => {
  if (!newValue) {
    selectedPayment.value = null // Clear selection when dialog closes
  }
})
</script>
