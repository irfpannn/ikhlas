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
                  {{ payment.cryptoType || '' }}</TableCell
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
})

// Map transaction data to match the component's expected format
const zakatPayments = computed(() => {
  return (transactionStore.transactions || [])
    .filter(tx => tx.type === 'zakat')
    .map(tx => ({
      id: tx.id,
      userName: tx.senderName,
      date: tx.timestamp,
      amountRM: tx.currency === 'RM' ? tx.amount : 0,
      amountCrypto: tx.currency !== 'RM' ? tx.amount : 0,
      cryptoType: tx.currency !== 'RM' ? tx.currency : '',
      walletAddress: tx.transactionHash,
      status: tx.status,
      userEmail: tx.senderEmail || 'N/A',
      transactionId: tx.transactionHash
    }))
})

// Update loading state based on store
const loading = computed(() => transactionStore.isLoading)

// Update payment status
const updatePaymentStatus = async (paymentId, status) => {
  try {
    const payment = transactionStore.transactions.find(tx => tx.id === paymentId)
    if (payment) {
      await transactionStore.recordTransaction({
        ...payment,
        status: status
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
