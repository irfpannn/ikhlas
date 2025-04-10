<script setup>
import { ref, onMounted } from 'vue'
import { Button } from '@/components/ui/button'

const props = defineProps({
  onConnect: Function
})

const emit = defineEmits(['walletConnected'])

const walletAddress = ref('')
const isConnecting = ref(false)
const errorMessage = ref('')
const walletBalance = ref(0)
const isWalletConnected = ref(false)

// Mock function to connect wallet
const connectWallet = async () => {
  isConnecting.value = true
  errorMessage.value = ''
  
  try {
    // Simulate wallet connection
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Generate a mock wallet address
    const mockAddress = '0x' + Array(40).fill(0).map(() => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('')
    
    walletAddress.value = mockAddress
    walletBalance.value = (Math.random() * 2).toFixed(4)
    isWalletConnected.value = true
    
    // Emit the wallet connected event with the address
    emit('walletConnected', {
      address: mockAddress,
      balance: walletBalance.value
    })
    
  } catch (error) {
    errorMessage.value = 'Failed to connect wallet: ' + error.message
  } finally {
    isConnecting.value = false
  }
}

// Format wallet address for display
const formatAddress = (address) => {
  if (!address) return ''
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}
</script>

<template>
  <div class="wallet-connect">
    <div v-if="!isWalletConnected" class="flex flex-col">
      <Button 
        @click="connectWallet" 
        :disabled="isConnecting"
        class="bg-[#75a868] hover:bg-[#75a868]/90 text-white"
      >
        <span v-if="isConnecting">Connecting...</span>
        <span v-else>Connect Wallet</span>
      </Button>
      <p v-if="errorMessage" class="text-red-500 text-sm mt-2">{{ errorMessage }}</p>
    </div>
    
    <div v-else class="flex items-center justify-between p-3 border rounded-lg">
      <div>
        <p class="text-sm font-medium">Wallet Connected</p>
        <p class="text-xs text-gray-500">{{ formatAddress(walletAddress) }}</p>
      </div>
      <div class="text-right">
        <p class="text-sm font-medium">{{ walletBalance }} ETH</p>
      </div>
    </div>
  </div>
</template> 