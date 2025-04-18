<script setup>
import { ref, onMounted } from 'vue'
import { Button } from '@/components/ui/button'

const props = defineProps({
  buttonText: {
    type: String,
    default: 'Connect Wallet'
  }
})

const emit = defineEmits(['wallet-connected', 'wallet-disconnected'])

const isWalletInstalled = ref(false)
const isConnected = ref(false)
const walletAccount = ref(null)
const isConnecting = ref(false)
const connectionError = ref(null)

onMounted(() => {
  checkIfWalletIsInstalled()
  checkIfAlreadyConnected()
  // Listen for account changes
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', handleAccountsChanged)
    window.ethereum.on('chainChanged', () => window.location.reload())
  }
})

function checkIfWalletIsInstalled() {
  if (window.ethereum) {
    isWalletInstalled.value = true
  }
}

async function checkIfAlreadyConnected() {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' })
      if (accounts.length > 0) {
        handleAccountsChanged(accounts)
      }
    } catch (error) {
      console.error('Error checking existing connection:', error)
    }
  }
}

async function connectWallet() {
  if (!window.ethereum) {
    connectionError.value = 'MetaMask is not installed'
    return
  }

  connectionError.value = null
  isConnecting.value = true

  try {
    // This will trigger the MetaMask popup
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    handleAccountsChanged(accounts)
  } catch (error) {
    console.error('Error connecting wallet:', error)
    if (error.code === 4001) {
      // User rejected the request
      connectionError.value = 'Connection rejected by user'
    } else {
      connectionError.value = 'Error connecting to MetaMask'
    }
  } finally {
    isConnecting.value = false
  }
}

function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    // User disconnected
    isConnected.value = false
    walletAccount.value = null
    emit('wallet-disconnected')
  } else {
    // User connected or switched accounts
    isConnected.value = true
    walletAccount.value = accounts[0]
    
    // Create wallet info object to emit
    const walletInfo = {
      address: accounts[0],
      provider: 'MetaMask',
      chainId: window.ethereum.chainId || null
    }
    
    emit('wallet-connected', walletInfo)
  }
}

async function disconnectWallet() {
  // Note: MetaMask doesn't support programmatic disconnection
  // We just reset our local state
  isConnected.value = false
  walletAccount.value = null
  emit('wallet-disconnected')
}

function formatAddress(address) {
  if (!address) return ''
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}
</script>

<template>
  <div class="wallet-connect">
    <!-- Not installed warning -->
    <div v-if="!isWalletInstalled" class="p-4 border border-yellow-300 bg-yellow-50 rounded-lg mb-4">
      <p class="text-yellow-800 text-sm">
        MetaMask is not installed. Please install
        <a href="https://metamask.io/download/" target="_blank" class="underline font-medium">
          MetaMask
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
            <span class="text-sm font-medium">Connected to MetaMask</span>
          </div>
          <p class="text-xs font-mono text-gray-600">{{ formatAddress(walletAccount) }}</p>
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
      :disabled="isConnecting || !isWalletInstalled"
      class="w-full"
    >
      <template v-if="isConnecting">
        <span class="animate-pulse">Connecting...</span>
      </template>
      <template v-else>
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" 
          alt="MetaMask" 
          class="w-5 h-5 mr-2" 
        />
        {{ props.buttonText }}
      </template>
    </Button>
  </div>
</template> 