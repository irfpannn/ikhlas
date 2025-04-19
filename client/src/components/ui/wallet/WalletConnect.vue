<script setup>
import { ref, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import * as lunoService from '@/services/lunoWalletService'

const props = defineProps({
  buttonText: {
    type: String,
    default: 'Connect Wallet'
  }
})

const emit = defineEmits(['wallet-connected', 'wallet-disconnected'])

const isWalletAvailable = ref(false)
const isConnected = ref(false)
const walletAccount = ref(null)
const walletBalance = ref(null)
const isConnecting = ref(false)
const connectionError = ref(null)

onMounted(async () => {
  checkIfWalletIsAvailable()
})

async function checkIfWalletIsAvailable() {
  try {
    isWalletAvailable.value = await lunoService.isLunoApiAccessible()
  } catch (error) {
    console.error('Error checking Luno API availability:', error)
    isWalletAvailable.value = false
  }
}

async function connectWallet() {
  if (!isWalletAvailable.value) {
    connectionError.value = 'Luno API is not available'
    return
  }

  connectionError.value = null
  isConnecting.value = true

  try {
    // Get account information from Luno
    const accountInfo = await lunoService.getAccountInfo()
    const balances = await lunoService.getBalances()
    
    // Use the first account for simplicity
    // In a real app, you might want to select which account to use
    if (accountInfo && accountInfo.accounts && accountInfo.accounts.length > 0) {
      const account = accountInfo.accounts[0]
      walletAccount.value = account
      walletBalance.value = balances
      isConnected.value = true
      
      // Create wallet info object to emit
      const walletInfo = {
        id: account.id,
        name: account.name,
        currency: account.currency,
        balance: balances.find(b => b.asset === account.currency)?.balance || '0',
        provider: 'Luno',
        address: account.name // Using name as placeholder, in real app get actual address
      }
      
      emit('wallet-connected', walletInfo)
    } else {
      connectionError.value = 'No Luno accounts found'
    }
  } catch (error) {
    console.error('Error connecting to Luno wallet:', error)
    connectionError.value = 'Error connecting to Luno wallet'
  } finally {
    isConnecting.value = false
  }
}

async function disconnectWallet() {
  isConnected.value = false
  walletAccount.value = null
  walletBalance.value = null
  emit('wallet-disconnected')
}

function formatAddress(address) {
  if (!address) return ''
  return `${address}`
}

function getMainBalance() {
  if (!walletBalance.value || walletBalance.value.length === 0) return null
  
  // Find the main balance (e.g., BTC or the account's primary currency)
  const mainCurrency = walletAccount.value?.currency || 'XBT'
  return walletBalance.value.find(b => b.asset === mainCurrency)
}

function formatBalance(balance) {
  if (!balance) return '0'
  return `${parseFloat(balance.balance).toFixed(8)} ${balance.asset}`
}
</script>

<template>
  <div class="wallet-connect">
    <!-- Not available warning -->
    <div v-if="!isWalletAvailable" class="p-4 border border-yellow-300 bg-yellow-50 rounded-lg mb-4">
      <p class="text-yellow-800 text-sm">
        Luno API is not available. Please check your API credentials or
        <a href="https://www.luno.com/" target="_blank" class="underline font-medium">
          sign up for Luno
        </a>
        to connect your wallet.
      </p>
    </div>

    <!-- Connection error -->
    <div v-if="connectionError" class="p-4 border border-red-300 bg-red-50 rounded-lg mb-4">
      <p class="text-red-800 text-sm">{{ connectionError }}</p>
    </div>

    <!-- Connected wallet info -->
    <div v-if="isConnected && walletAccount" class="border rounded-lg p-4 mb-4 bg-green-50">
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-center mb-1">
            <div class="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
            <span class="text-sm font-medium">Connected to Luno</span>
          </div>
          <p class="text-xs text-gray-600">{{ walletAccount.name }}</p>
          <p v-if="getMainBalance()" class="text-xs font-medium text-gray-700 mt-1">
            Balance: {{ formatBalance(getMainBalance()) }}
          </p>
        </div>
        <Button size="sm" variant="outline" @click="disconnectWallet">
          Disconnect
        </Button>
      </div>
    </div>

    <!-- Connect button -->
    <Button 
      v-if="!isConnected" 
      @click="connectWallet" 
      :disabled="isConnecting || !isWalletAvailable"
      class="w-full"
    >
      <template v-if="isConnecting">
        <span class="animate-pulse">Connecting...</span>
      </template>
      <template v-else>
        <img 
          src="https://www.luno.com/static/images/favicon.ico" 
          alt="Luno" 
          class="w-5 h-5 mr-2" 
        />
        {{ props.buttonText }}
      </template>
    </Button>
  </div>
</template> 