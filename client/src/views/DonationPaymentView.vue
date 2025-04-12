<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const route = useRoute()
const router = useRouter()
const campaignId = parseInt(route.params.id)
const donationAmount = parseFloat(route.query.amount || 0)
const donationCurrency = ref(route.query.currency || 'RM')
const paymentMethod = ref('credit-card')
const isAnonymous = ref(false)
const isProcessing = ref(false)
const walletConnected = ref(false)
const selectedWallet = ref('')

// Sample donation campaigns (same as in DonationView)
const campaigns = ref([
  {
    id: 1,
    title: 'Urgent! Help the construction mosque',
    organization: 'Adaa Bissaa',
    image: '/images/mosque-construction.jpg',
    amount: 23423,
    daysLeft: 31
  },
  {
    id: 2,
    title: 'Water Waqf for poor Orphans',
    organization: 'Yaghu yayasan',
    image: '/images/water-orphans.jpg',
    amount: 12000,
    daysLeft: 2
  },
  {
    id: 3,
    title: 'Elderly strokes work roughly paid 20 thousand',
    organization: 'Prikitiw',
    image: '/images/elderly-care.jpg',
    amount: 40200,
    daysLeft: 20
  },
  {
    id: 4,
    title: "Help people who can't continue their education",
    organization: 'Bissaaa kuy',
    image: '/images/education.jpg',
    amount: 0,
    daysLeft: null
  }
])

const isCrypto = computed(() => {
  return ['BTC', 'ETH', 'USDT'].includes(donationCurrency.value)
})

const campaign = computed(() => {
  return campaigns.value.find(c => c.id === campaignId) || {}
})

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
  router.push(`/donation/${campaignId}`)
}

const connectWallet = (wallet) => {
  selectedWallet.value = wallet
  isProcessing.value = true
  
  // Simulate wallet connection
  setTimeout(() => {
    walletConnected.value = true
    isProcessing.value = false
  }, 1500)
}

const processPayment = () => {
  isProcessing.value = true
  
  // Simulate payment processing
  setTimeout(() => {
    router.push(`/donation/${campaignId}/success?amount=${donationAmount}&currency=${donationCurrency.value}`)
  }, 1500)
}
</script>

<template>
  <div class="flex flex-col min-h-dvh bg-gray-100">
    <!-- Header -->
    <div class="bg-white p-4 sticky top-0 z-10">
      <div class="flex items-center">
        <Button
          variant="ghost"
          class="text-gray-700 hover:bg-gray-100 mr-2 p-2"
          @click="goBack"
        >
          <span class="text-xl">←</span>
        </Button>
        <h1 class="text-lg font-medium">Payment Details</h1>
      </div>
    </div>

    <!-- Campaign Summary -->
    <div class="bg-white p-4 mb-4">
      <div class="flex items-start">
        <div class="w-16 h-16 bg-gray-200 rounded-md overflow-hidden mr-3">
          <img 
            :src="campaign.image" 
            :alt="campaign.title"
            class="w-full h-full object-cover"
            onerror="this.src='/images/placeholder.jpg'"
          />
        </div>
        <div>
          <h2 class="font-medium text-sm">{{ campaign.title }}</h2>
          <p class="text-xs text-gray-500 mb-1">{{ campaign.organization }}</p>
          <p class="text-green-600 font-medium">{{ formatAmount(donationAmount) }}</p>
        </div>
      </div>
    </div>

    <!-- Payment Method Selection - Traditional -->
    <div v-if="!isCrypto" class="bg-white p-4 mb-4">
      <h3 class="font-medium mb-3">Payment Method</h3>
      
      <div class="space-y-3">
        <div class="flex items-center space-x-2 border rounded-lg p-3">
          <input 
            type="radio" 
            id="credit-card" 
            value="credit-card" 
            v-model="paymentMethod"
            class="h-4 w-4"
          />
          <label for="credit-card" class="flex-1 cursor-pointer">
            <div class="flex items-center justify-between">
              <span>Credit/Debit Card</span>
              <div class="flex space-x-1">
                <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Visa</span>
                <span class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Master</span>
              </div>
            </div>
          </label>
        </div>
        
        <div class="flex items-center space-x-2 border rounded-lg p-3">
          <input 
            type="radio" 
            id="online-banking" 
            value="online-banking" 
            v-model="paymentMethod"
            class="h-4 w-4"
          />
          <label for="online-banking" class="flex-1 cursor-pointer">
            <div class="flex items-center justify-between">
              <span>Online Banking</span>
              <span class="text-xs bg-gray-100 px-2 py-1 rounded">FPX</span>
            </div>
          </label>
        </div>
        
        <div class="flex items-center space-x-2 border rounded-lg p-3">
          <input 
            type="radio" 
            id="e-wallet" 
            value="e-wallet" 
            v-model="paymentMethod"
            class="h-4 w-4"
          />
          <label for="e-wallet" class="flex-1 cursor-pointer">
            <div class="flex items-center justify-between">
              <span>E-Wallet</span>
              <div class="flex space-x-1">
                <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">GrabPay</span>
                <span class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Touch n Go</span>
              </div>
            </div>
          </label>
        </div>
      </div>
    </div>

    <!-- Crypto Payment Method -->
    <div v-if="isCrypto" class="bg-white p-4 mb-4">
      <h3 class="font-medium mb-3">Connect Your Wallet</h3>
      
      <div v-if="!walletConnected" class="space-y-3">
        <!-- MetaMask -->
        <Button 
          @click="connectWallet('metamask')" 
          variant="outline" 
          class="w-full flex items-center justify-between p-3 h-auto"
          :disabled="isProcessing"
        >
          <div class="flex items-center">
            <div class="w-8 h-8 mr-3 flex-shrink-0">
              <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" class="w-full h-full" />
            </div>
            <span>MetaMask</span>
          </div>
          <span class="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">Popular</span>
        </Button>
        
        <!-- Coinbase Wallet -->
        <Button 
          @click="connectWallet('coinbase')" 
          variant="outline" 
          class="w-full flex items-center justify-between p-3 h-auto"
          :disabled="isProcessing"
        >
          <div class="flex items-center">
            <div class="w-8 h-8 mr-3 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-white font-bold">CB</span>
            </div>
            <span>Coinbase Wallet</span>
          </div>
        </Button>
        
        <!-- Trust Wallet -->
        <Button 
          @click="connectWallet('trust')" 
          variant="outline" 
          class="w-full flex items-center justify-between p-3 h-auto"
          :disabled="isProcessing"
        >
          <div class="flex items-center">
            <div class="w-8 h-8 mr-3 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-white font-bold">TW</span>
            </div>
            <span>Trust Wallet</span>
          </div>
        </Button>
        
        <!-- WalletConnect -->
        <Button 
          @click="connectWallet('walletconnect')" 
          variant="outline" 
          class="w-full flex items-center justify-between p-3 h-auto"
          :disabled="isProcessing"
        >
          <div class="flex items-center">
            <div class="w-8 h-8 mr-3 bg-blue-700 rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-white font-bold">WC</span>
            </div>
            <span>WalletConnect</span>
          </div>
        </Button>
      </div>
      
      <!-- Connected Wallet Info -->
      <div v-else class="border rounded-lg p-4">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center">
            <div class="w-8 h-8 mr-3 bg-green-100 rounded-full flex items-center justify-center">
              <span class="text-green-600">✓</span>
            </div>
            <span class="font-medium">Wallet Connected</span>
          </div>
          <Button variant="ghost" size="sm" @click="walletConnected = false">
            Disconnect
          </Button>
        </div>
        
        <div class="bg-gray-100 p-3 rounded-lg">
          <div class="flex justify-between mb-2">
            <span class="text-sm text-gray-600">Wallet</span>
            <span class="font-medium">{{ selectedWallet === 'metamask' ? 'MetaMask' : selectedWallet === 'coinbase' ? 'Coinbase Wallet' : selectedWallet === 'trust' ? 'Trust Wallet' : 'WalletConnect' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-gray-600">Address</span>
            <span class="font-medium text-xs">0x71C...F3E2</span>
          </div>
        </div>
        
        <div class="mt-3 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
          You'll be asked to confirm this transaction in your wallet
        </div>
      </div>
    </div>

    <!-- Donor Information -->
    <div class="bg-white p-4 mb-4">
      <h3 class="font-medium mb-3">Donor Information</h3>
      
      <div class="space-y-3">
        <div>
          <label for="name" class="text-sm mb-1 block">Full Name</label>
          <Input id="name" placeholder="Enter your full name" />
        </div>
        
        <div>
          <label for="email" class="text-sm mb-1 block">Email</label>
          <Input id="email" type="email" placeholder="Enter your email" />
        </div>
        
        <div>
          <label for="phone" class="text-sm mb-1 block">Phone Number</label>
          <Input id="phone" placeholder="Enter your phone number" />
        </div>
        
        <div class="flex items-center space-x-2">
          <input 
            type="checkbox" 
            id="anonymous" 
            v-model="isAnonymous"
            class="h-4 w-4"
          />
          <label for="anonymous" class="text-sm">Make my donation anonymous</label>
        </div>
      </div>
    </div>

    <!-- Payment Button -->
    <div class="p-4 bg-white sticky bottom-0 border-t">
      <Button 
        @click="processPayment"
        class="w-full h-12"
        :disabled="isProcessing || (isCrypto && !walletConnected)"
      >
        <span v-if="isProcessing">Processing...</span>
        <span v-else-if="isCrypto && !walletConnected">Connect Wallet to Continue</span>
        <span v-else>Pay {{ formatAmount(donationAmount) }}</span>
      </Button>
      <p class="text-xs text-center text-gray-500 mt-2">
        By donating, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  </div>
</template>

<style scoped>
/* Custom styles for donation payment page */
</style> 