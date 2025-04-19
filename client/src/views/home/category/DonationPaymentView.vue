<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useDonationStore } from '@/stores/donationStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import WalletConnect from '@/components/ui/wallet/WalletConnect.vue'
import { saveDonationTransaction } from '@/services/donationService'
import { getAuth } from 'firebase/auth'
import { getDoc, doc } from 'firebase/firestore'
import { db } from '@/firebase.config'
import { isLunoApiAccessible } from '@/services/lunoWalletService'
import { processCryptoPayment as processPaymentWithLuno } from '@/services/smartContractService'

const route = useRoute()
const router = useRouter()
const donationStore = useDonationStore()

const donationId = route.params.id
const donationAmount = route.query.amount
const donationCurrency = ref(route.query.currency || 'RM')

const { currentDonation, loading: storeLoading, error: storeError } = storeToRefs(donationStore)

// Local state
const paymentMethod = ref('credit-card') // Default for traditional
const walletInfo = ref(null) // For crypto wallet info
const isProcessing = ref(false)

// Check if Luno API is available
const isLunoAvailable = ref(false)
async function checkLunoApiAvailability() {
  try {
    isLunoAvailable.value = await isLunoApiAccessible()
  } catch (error) {
    console.error('Error checking Luno API availability:', error)
    isLunoAvailable.value = false
  }
}

onMounted(() => {
  // Fetch donation details if not already loaded or if needed for display
  if (!currentDonation.value || currentDonation.value.id !== donationId) {
    donationStore.fetchDonationById(donationId)
  }
  
  // Check if Luno API is available
  checkLunoApiAvailability()
})

const isCrypto = computed(() => {
  return ['BTC', 'ETH', 'USDT'].includes(donationCurrency.value)
})

// Use currentDonation from the store
const donation = computed(() => currentDonation.value || {}) // Renamed from campaign

const formatAmount = (amount) => {
  if (donationCurrency.value === 'RM') {
    return `RM${amount.toLocaleString()}`
  } else if (donationCurrency.value === 'BTC') {
    return `${amount} BTC`
  } else if (donationCurrency.value === 'ETH') {
    return `${amount} ETH`
  } else if (donationCurrency.value === 'USDT') {
    return `${amount} USDT`
  }
  return ''
}

const goBack = () => {
  // Go back to donation details
  router.push(`/donation/${donationId}`)
}

// Handle wallet connection and update wallet info
const handleWalletConnected = (info) => {
  walletInfo.value = info
}

// Handle wallet disconnection
const handleWalletDisconnected = () => {
  walletInfo.value = null
}

const processPayment = () => {
  isProcessing.value = true
  
  if (isCrypto.value && walletInfo.value) {
    // For crypto payments, should integrate with actual blockchain transaction here
    // This is a simplified example
    processCryptoPayment()
  } else {
    // For traditional payment methods
    processTraditionalPayment()
  }
}

const processCryptoPayment = async () => {
  try {
    // Use a properly formatted Ethereum address (this is just an example address)
    const recipientAddress = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'
    
    // Process crypto payment using Luno
    const result = await processPaymentWithLuno({
      amount: donationAmount,
      currency: donationCurrency.value === 'ETH' ? 'ETH' : 'XBT', // Map currencies appropriately
      recipientAddress,
      walletInfo: walletInfo.value,
      description: `Donation to ${donation.value.title}`
    })
    
    console.log('Transaction Result:', result)
    
    // Get current user from auth
    const auth = getAuth()
    const user = auth.currentUser
    
    if (user) {
      // Get user data from Firestore to ensure we have the correct name
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      const userData = userDoc.exists() ? userDoc.data() : null
      
      // Use Firestore user data if available, otherwise fall back to Auth data
      const senderName = userData?.user_fullname || user.displayName || user.email || 'Anonymous'
      
      // Prepare donation data for crypto transaction
      const donationData = {
        senderId: user.uid,
        senderName: senderName,
        recipientId: donation.value.id || donationId,
        recipientName: donation.value.title || 'Unknown Recipient',
        amount: parseFloat(donationAmount),
        currency: donationCurrency.value,
        paymentMethod: 'crypto-wallet',
        category: donation.value.category || 'Crypto Donation',
        notes: `Transaction Hash: ${result}`,
        type: 'crypto-donation',
        walletAddress: walletInfo.value.address,
        transactionHash: result
      }
      
      // Save the donation transaction
      await saveDonationTransaction(donationData)
    }
    
    // Redirect to success page
    setTimeout(() => {
      router.push(
        `/donation/${donationId}/success?amount=${donationAmount}&currency=${donationCurrency.value}&txHash=${result}`,
      )
    }, 1000)
  } catch (error) {
    console.error('Error processing crypto payment:', error)
    isProcessing.value = false
  }
}

const processTraditionalPayment = async () => {
  try {
    // Get current user from auth
    const auth = getAuth()
    const user = auth.currentUser
    
    if (!user) {
      console.error('User not authenticated')
      return
    }
    
    // Get user data from Firestore to ensure we have the correct name
    const userDoc = await getDoc(doc(db, 'users', user.uid))
    const userData = userDoc.exists() ? userDoc.data() : null
    
    // Use Firestore user data if available, otherwise fall back to Auth data
    const senderName = userData?.user_fullname || user.displayName || user.email || 'Anonymous'
    
    // Prepare donation data
    const donationData = {
      senderId: user.uid,
      senderName: senderName,
      recipientId: donation.value.id || donationId,
      recipientName: donation.value.title || 'Unknown Recipient',
      amount: parseFloat(donationAmount),
      currency: donationCurrency.value,
      paymentMethod: paymentMethod.value,
      category: donation.value.category || 'General Donation',
      notes: '',
      type: 'donation'
    }
    
    // Save the donation transaction
    await saveDonationTransaction(donationData)
    
    // Redirect to success page
    setTimeout(() => {
      router.push(
        `/donation/${donationId}/success?amount=${donationAmount}&currency=${donationCurrency.value}`
      )
    }, 1500)
  } catch (error) {
    console.error('Error processing donation:', error)
    isProcessing.value = false
  }
}

async function handlePaymentSuccess(paymentDetails) {
  try {
    // Assuming you have user data and recipient data available
    const donationData = {
      senderId: this.currentUser.uid,
      senderName: this.currentUser.displayName || 'Anonymous',
      recipientId: this.recipient.id,
      recipientName: this.recipient.name,
      amount: this.donationAmount,
      paymentMethod: paymentDetails.method,
      category: this.category,
      notes: this.notes || ''
    };
    
    // Save the donation transaction
    await saveDonationTransaction(donationData);
    
    // Show success message
    this.$toast.success('Donation completed successfully!');
    
    // Redirect to thank you page or transaction history
    this.$router.push('/donation/thank-you');
  } catch (error) {
    console.error('Error processing donation:', error);
    this.$toast.error('There was an error processing your donation.');
  }
}
</script>

<template>
  <div class="flex flex-col min-h-dvh bg-gray-100">
    <!-- Header -->
    <div class="bg-white p-4 sticky top-0 z-10">
      <div class="flex items-center">
        <Button variant="ghost" class="text-gray-700 hover:bg-gray-100 mr-2 p-2" @click="goBack">
          <span class="text-xl">←</span>
        </Button>
        <h1 class="text-lg font-medium">Butiran Pembayaran</h1>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="storeLoading && !donation.id" class="p-4 space-y-4">
      <Skeleton class="h-20 w-full" />
      <Skeleton class="h-40 w-full" />
      <Skeleton class="h-60 w-full" />
    </div>

    <!-- Error State -->
    <div v-else-if="storeError" class="p-4">
      <Alert variant="destructive">
        <AlertTitle>Ralat</AlertTitle>
        <AlertDescription>{{ storeError }}</AlertDescription>
      </Alert>
      <Button @click="donationStore.fetchDonationById(donationId)" variant="outline" class="mt-4"
        >Cuba Lagi</Button
      >
    </div>

    <!-- Content Area -->
    <div v-else>
      <!-- Donation Summary -->
      <div class="bg-white p-4 mb-4">
        <div class="flex items-start">
          <div class="w-16 h-16 bg-gray-200 rounded-md overflow-hidden mr-3">
            <img
              :src="donation.image || '/images/placeholder.jpg'"
              :alt="donation.title"
              class="w-full h-full object-cover"
              onerror="this.src='/images/placeholder.jpg'"
            />
          </div>
          <div>
            <h2 class="font-medium text-sm">{{ donation.title }}</h2>
            <p class="text-xs text-gray-500 mb-1">{{ donation.organization }}</p>
            <p class="text-green-600 font-medium">{{ formatAmount(donationAmount) }}</p>
          </div>
        </div>
      </div>

      <!-- Payment Method Selection - Traditional -->
      <div v-if="!isCrypto" class="bg-white p-4 mb-4">
        <h3 class="font-medium mb-3">Kaedah Pembayaran</h3>
        <RadioGroup v-model="paymentMethod" class="space-y-3">
          <!-- Credit Card Option -->
          <Label
            for="credit-card"
            class="flex items-center space-x-3 border rounded-lg p-3 cursor-pointer hover:bg-gray-50"
          >
            <RadioGroupItem id="credit-card" value="credit-card" />
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <span>Kad Kredit/Debit</span>
                <div class="flex space-x-1">
                  <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Visa</span>
                  <span class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Master</span>
                </div>
              </div>
            </div>
          </Label>

          <!-- FPX Option -->
          <Label
            for="fpx"
            class="flex items-center space-x-3 border rounded-lg p-3 cursor-pointer hover:bg-gray-50"
          >
            <RadioGroupItem id="fpx" value="fpx" />
            <span class="flex-1">Perbankan Internet (FPX)</span>
          </Label>

          <!-- E-wallet Option -->
          <Label
            for="e-wallet"
            class="flex items-center space-x-3 border rounded-lg p-3 cursor-pointer hover:bg-gray-50"
          >
            <RadioGroupItem id="e-wallet" value="e-wallet" />
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <span>E-Dompet</span>
                <div class="flex space-x-1">
                  <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">GrabPay</span>
                  <span class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded"
                    >Touch n Go</span
                  >
                </div>
              </div>
            </div>
          </Label>
        </RadioGroup>
      </div>

      <!-- Payment Method Selection - Crypto -->
      <div v-if="isCrypto" class="bg-white p-4 mb-4">
        <h3 class="font-medium mb-3">Sambung Dompet Kripto</h3>
        
        <!-- API not available warning -->
        <div v-if="!isLunoAvailable" class="p-4 border border-yellow-300 bg-yellow-50 rounded-lg mb-4">
          <p class="text-yellow-800 text-sm">
            Luno API tidak tersedia. Sila periksa kelayakan API atau
            <a href="https://www.luno.com/" target="_blank" class="underline font-medium">
              daftar untuk Luno
            </a>
            untuk menyambung dompet anda.
          </p>
        </div>
        
        <!-- Luno Wallet Connection -->
        <WalletConnect 
          buttonText="Sambung dengan Luno" 
          @wallet-connected="handleWalletConnected"
          @wallet-disconnected="handleWalletDisconnected"
        />
        
        <!-- Transaction Details (when wallet is connected) -->
        <div v-if="walletInfo" class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 class="font-medium mb-2 text-blue-800">Butiran Transaksi</h4>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Jumlah</span>
              <span class="font-medium">{{ formatAmount(donationAmount) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Daripada</span>
              <span class="font-mono text-xs truncate max-w-[180px]">{{ walletInfo.address }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Kepada</span>
              <span class="font-mono text-xs truncate max-w-[180px]">0x71C7656EC7ab88b098defB751B7401B5f6d8976F</span>
            </div>
          </div>
          <p class="mt-3 text-xs text-blue-600">
            Anda akan diminta untuk mengesahkan transaksi ini dalam Luno apabila anda menekan butang "Sahkan Pembayaran".
          </p>
        </div>
      </div>

      <!-- Donor Information -->
      <div class="bg-white p-4 mb-4">
        <h3 class="font-medium mb-3">Maklumat Penderma</h3>
        <div class="space-y-3">
          <div>
            <Label for="name" class="text-sm mb-1 block">Nama Penuh</Label>
            <Input id="name" placeholder="Masukkan nama penuh anda" />
          </div>
          <div>
            <Label for="email" class="text-sm mb-1 block">E-mel</Label>
            <Input id="email" type="email" placeholder="Masukkan e-mel anda" />
          </div>
          <div>
            <Label for="phone" class="text-sm mb-1 block">Nombor Telefon</Label>
            <Input id="phone" placeholder="Masukkan nombor telefon anda" />
          </div>
          <div class="flex items-start space-x-2 pt-2">
            <input type="checkbox" id="anonymous" class="mt-1" />
            <Label for="anonymous" class="text-sm">Derma tanpa nama</Label>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Button -->
    <div class="p-4 sticky bottom-0 bg-white border-t mt-auto">
      <Button
        @click="processPayment"
        class="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12"
        :disabled="isProcessing || (isCrypto && !walletInfo)"
      >
        <span v-if="isProcessing">Memproses...</span>
        <span v-else>Sahkan Pembayaran {{ formatAmount(donationAmount) }}</span>
      </Button>
    </div>
  </div>
</template>

<style scoped>
/* Custom styles if needed */
</style>
