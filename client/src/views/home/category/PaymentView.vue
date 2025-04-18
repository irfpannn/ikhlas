<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import WalletConnect from '@/components/ui/wallet/WalletConnect.vue'
import {
  convertRMToCrypto,
  executeZakatPayment,
  getPusatUrusZakatAddress,
} from '@/services/smartContractService'
import { saveDonationTransaction } from '@/services/donationService'
import { getAuth } from 'firebase/auth'

const router = useRouter()

// Payment data
const paymentData = ref({
  amount: '250.00',
  name: '',
  email: '',
  phone: '',
  cardNumber: '',
  expiryDate: '',
  cvv: '',
  paymentMethod: 'card', // 'card', 'bank', 'ewallet', 'crypto'
  walletInfo: null,
  selectedBank: '', // for storing selected bank
})

const malaysianBanks = [
  { id: 'maybank', name: 'Maybank2u', logo: '/maybank.png' },
  { id: 'cimb', name: 'CIMB Clicks', logo: '/cimb.png' },
  { id: 'public', name: 'Public Bank', logo: '/public.png' },
  { id: 'rhb', name: 'RHB Now', logo: '/rhb.png' },
  { id: 'bsn', name: 'BSN', logo: '/bsn.png' },
  { id: 'bankislam', name: 'Bank Islam', logo: '/bankislam.png' },
  { id: 'hongleong', name: 'Hong Leong Connect', logo: '/hongleong.png' },
  { id: 'ambank', name: 'AmOnline', logo: '/ambank.png' },
  { id: 'alliance', name: 'Alliance Bank', logo: '/alliance.png' },
  { id: 'ocbc', name: 'OCBC', logo: '/ocbc.png' },
  { id: 'standardchartered', name: 'Standard Chartered', logo: '/sc.png' },
  { id: 'uob', name: 'UOB', logo: '/uob.png' },
  { id: 'affin', name: 'Affin Bank', logo: '/affin.png' },
  { id: 'muamalat', name: 'Bank Muamalat', logo: '/muamalat.png' },
  { id: 'rakyat', name: 'Bank Rakyat', logo: '/rakyat.png' },
]

// Payment processing state
const isProcessing = ref(false)
const transactionResult = ref(null)
const isMetaMaskInstalled = ref(false)

// Check if MetaMask is installed on mount
onMounted(() => {
  if (window.ethereum) {
    isMetaMaskInstalled.value = true
  }
})

// Computed crypto amount
const cryptoAmount = computed(() => {
  return convertRMToCrypto(parseFloat(paymentData.value.amount))
})

// Go back to the previous page in history
const goBack = () => {
  router.go(-1)
}

// Process payment
const processPayment = async () => {
  isProcessing.value = true

  try {
    // Get current user from auth
    const auth = getAuth()
    const user = auth.currentUser
    
    if (!user) {
      console.error('User not authenticated')
      return
    }
    
    // Prepare zakat payment data
    const zakatData = {
      senderId: user.uid,
      senderName: user.displayName || user.email || 'Anonymous',
      recipientId: 'zakat-authority',
      recipientName: 'Zakat Authority',
      amount: parseFloat(paymentData.value.amount),
      currency: 'RM',
      paymentMethod: paymentData.value.paymentMethod,
      category: 'Zakat Payment',
      notes: '',
      type: 'zakat'
    }
    
    // Save the zakat transaction
    await saveDonationTransaction(zakatData)
    
    if (paymentData.value.paymentMethod === 'crypto') {
      if (!paymentData.value.walletInfo) {
        alert('Please connect your wallet first')
        isProcessing.value = false
        return
      }

      // Execute crypto payment using MetaMask
      await processCryptoPayment()
    } else {
      // Process traditional payment methods
      await processTraditionalPayment()
    }
  } catch (error) {
    console.error('Error processing zakat payment:', error)
    isProcessing.value = false
  }
}

// Process crypto payment using MetaMask
const processCryptoPayment = async () => {
  try {
    // Prepare transaction parameters
    // Make sure we have a valid Ethereum address
    let recipientAddress = getPusatUrusZakatAddress()
    
    // Fallback to a valid address if the service doesn't provide one
    if (!recipientAddress || !recipientAddress.startsWith('0x') || recipientAddress.length !== 42) {
      recipientAddress = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F' // Example valid address
    }
    
    const amountInWei = '0x' + (Number(cryptoAmount.value) * 1e18).toString(16) // Convert ETH to Wei and then to hex
    
    // Transaction parameters for MetaMask
    const transactionParameters = {
      to: recipientAddress, // Valid Ethereum address
      from: paymentData.value.walletInfo.address,
      value: amountInWei,
      // gas: '0x5208', // Optional: 21000 gas in hex
      // gasPrice: '0x', // Optional: gas price in hex
    }
    
    console.log('Sending transaction to:', recipientAddress)
    
    // Request transaction signature and send transaction
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [transactionParameters],
    })
    
    console.log('Transaction Hash:', txHash)
    
    // Create transaction record
    const txData = {
      success: true,
      transactionHash: txHash,
      from: paymentData.value.walletInfo.address,
      to: recipientAddress,
      amount: cryptoAmount.value,
      currency: 'ETH',
      timestamp: new Date().toISOString(),
      status: 'confirmed',
      paymentMethod: 'crypto',
      name: paymentData.value.name,
      email: paymentData.value.email,
      phone: paymentData.value.phone
    }
    
    // Save transaction data
    transactionResult.value = txData
    localStorage.setItem('zakatTransaction', JSON.stringify(txData))
    
    // Add to transaction history
    const history = JSON.parse(localStorage.getItem('transactionHistory') || '[]')
    history.unshift(txData)
    localStorage.setItem('transactionHistory', JSON.stringify(history))
    
    // Redirect to transaction history page after a short delay
    setTimeout(() => {
      router.push('/transaction-history')
    }, 1500)
    
    return txData
  } catch (error) {
    console.error('Crypto payment error:', error)
    // Check if user rejected transaction
    if (error.code === 4001) {
      throw new Error('Transaction rejected by user')
    }
    throw error
  }
}

// Process traditional payment methods
const processTraditionalPayment = async () => {
  // Simulate payment processing delay
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // Create a mock transaction record
  const mockTransaction = {
    success: true,
    transactionHash: 'TX' + Math.random().toString(36).substring(2, 15),
    from: paymentData.value.name || 'User',
    to: 'Pusat Urus Zakat',
    amount: paymentData.value.amount,
    currency: 'RM',
    timestamp: new Date().toISOString(),
    status: 'confirmed',
    paymentMethod: paymentData.value.paymentMethod,
    name: paymentData.value.name,
    email: paymentData.value.email,
    phone: paymentData.value.phone
  }
  
  // Save transaction data
  localStorage.setItem('zakatTransaction', JSON.stringify(mockTransaction))
  
  // Add to transaction history
  const history = JSON.parse(localStorage.getItem('transactionHistory') || '[]')
  history.unshift(mockTransaction)
  localStorage.setItem('transactionHistory', JSON.stringify(history))
  
  // Redirect to transaction history page
  router.push('/transaction-history')
  
  return mockTransaction
}

// Set payment method
const setPaymentMethod = (method) => {
  paymentData.value.paymentMethod = method
}

// Handle wallet connection
const handleWalletConnected = (walletInfo) => {
  paymentData.value.walletInfo = walletInfo
}

// Handle wallet disconnection
const handleWalletDisconnected = () => {
  paymentData.value.walletInfo = null
}
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-100 pb-6">
    <!-- Header -->
    <div class="bg-white p-4 flex items-center shadow-sm">
      <button @click="goBack" class="mr-4">
        <span class="text-xl">←</span>
      </button>
      <h1 class="text-lg font-semibold">Bayar Zakat</h1>
    </div>

    <!-- Main content -->
    <div class="p-4">
      <!-- Payment amount card -->
      <Card class="mb-4 bg-[#75a868] text-white">
        <CardContent class="p-4">
          <div class="text-center">
            <p class="text-white/80 mb-1">Jumlah Pembayaran</p>
            <h2 class="text-2xl font-bold">RM {{ paymentData.amount }}</h2>
            <p v-if="paymentData.paymentMethod === 'crypto'" class="text-sm mt-1">
              ≈ {{ cryptoAmount }} ETH
            </p>
          </div>
        </CardContent>
      </Card>

      <!-- Payment methods tabs -->
      <Tabs
        v-model="paymentData.paymentMethod"
        default-value="card"
        class="bg-none rounded-lg mb-4 w-ful"
      >
        <TabsList class="w-full grid grid-cols-4 bg-slate-200">
          <TabsTrigger
            value="card"
            class="data-[state=active]:text-[#75a868] data-[state=active]:border-[#75a868] text-xs"
          >
            Kad Kredit/Debit
          </TabsTrigger>
          <TabsTrigger
            value="bank"
            class="data-[state=active]:text-[#75a868] data-[state=active]:border-[#75a868] text-xs"
          >
            Perbankan Online
          </TabsTrigger>
          <TabsTrigger
            value="ewallet"
            class="data-[state=active]:text-[#75a868] data-[state=active]:border-[#75a868] text-xs"
          >
            E-Wallet
          </TabsTrigger>
          <TabsTrigger
            value="crypto"
            class="data-[state=active]:text-[#75a868] data-[state=active]:border-[#75a868] text-xs"
          >
            Crypto
          </TabsTrigger>
        </TabsList>

        <!-- Payment form -->
        <Card class="mb-4">
          <CardContent class="p-4">
            <!-- Personal information (shown in all tabs) -->
            <div class="mb-6">
              <h3 class="font-medium mb-3">Maklumat Peribadi</h3>

              <div class="mb-4">
                <label class="block text-sm text-gray-600 mb-1">Nama Penuh</label>
                <Input v-model="paymentData.name" placeholder="Nama penuh anda" />
              </div>

              <div class="mb-4">
                <label class="block text-sm text-gray-600 mb-1">E-mel</label>
                <Input v-model="paymentData.email" type="email" placeholder="contoh@email.com" />
              </div>

              <div class="mb-4">
                <label class="block text-sm text-gray-600 mb-1">Nombor Telefon</label>
                <Input v-model="paymentData.phone" placeholder="01x-xxxxxxx" />
              </div>
            </div>

            <!-- Tab contents -->
            <TabsContent value="card" class="mb-6 border-none p-0">
              <h3 class="font-medium mb-3">Maklumat Kad</h3>

              <div class="mb-4">
                <label class="block text-sm text-gray-600 mb-1">Nombor Kad</label>
                <Input v-model="paymentData.cardNumber" placeholder="xxxx xxxx xxxx xxxx" />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="mb-4">
                  <label class="block text-sm text-gray-600 mb-1">Tarikh Luput</label>
                  <Input v-model="paymentData.expiryDate" placeholder="MM/YY" />
                </div>

                <div class="mb-4">
                  <label class="block text-sm text-gray-600 mb-1">CVV</label>
                  <Input v-model="paymentData.cvv" type="password" placeholder="xxx" />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="bank" class="mb-6 border-none p-0">
              <h3 class="font-medium mb-3">Pilih Bank</h3>

              <Select v-model="paymentData.selectedBank">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Pilih bank untuk pembayaran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem v-for="bank in malaysianBanks" :key="bank.id" :value="bank.id">
                      <div class="flex items-center gap-3">
                        <span>{{ bank.name }}</span>
                      </div>
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <div v-if="paymentData.selectedBank" class="mt-4 p-4 bg-gray-50 rounded-lg">
                <p class="text-sm text-gray-600">
                  Anda akan dibawa ke laman
                  {{ malaysianBanks.find((b) => b.id === paymentData.selectedBank)?.name }}
                  untuk melengkapkan pembayaran anda.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="ewallet" class="mb-6 border-none p-0">
              <h3 class="font-medium mb-3">Pilih E-Wallet</h3>

              <div class="grid grid-cols-2 gap-4">
                <div
                  class="bg-primary/20 border rounded-lg p-3 cursor-pointer hover:border-[#75a868]"
                >
                  <div class="flex items-center space-x-4">
                    <img src="/tng.png" alt="Touch 'n Go" class="h-11 mr-3" />
                    <span>Touch 'n Go</span>
                  </div>
                </div>

                <div
                  class="bg-primary/20 border rounded-lg p-3 cursor-pointer hover:border-[#75a868]"
                >
                  <div class="flex items-center space-x-4">
                    <img src="/grab.png" alt="GrabPay" class="h-11 mr-3" />
                    <span>GrabPay</span>
                  </div>
                </div>

                <div
                  class="bg-primary/20 border rounded-lg p-3 cursor-pointer hover:border-[#75a868]"
                >
                  <div class="flex items-center space-x-4">
                    <img src="/boost.png" alt="Boost" class="h-11" />
                    <span>Boost</span>
                  </div>
                </div>

                <div
                  class="bg-primary/20 border rounded-lg p-3 cursor-pointer hover:border-[#75a868]"
                >
                  <div class="flex items-center space-x-4">
                    <img src="/mae.png" alt="MAE" class="h-11" />
                    <span>MAE</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="crypto" class="mb-6 border-none p-0">
              <h3 class="font-medium mb-3">Pembayaran Cryptocurrency</h3>

              <!-- MetaMask Not Installed Warning -->
              <div v-if="!isMetaMaskInstalled" class="p-4 border border-yellow-300 bg-yellow-50 rounded-lg mb-4">
                <p class="text-yellow-800 text-sm">
                  MetaMask tidak dipasang. Sila pasang
                  <a href="https://metamask.io/download/" target="_blank" class="underline font-medium">
                    MetaMask
                  </a>
                  untuk menyambung dompet anda.
                </p>
              </div>

              <div class="mb-4">
                <p class="text-sm text-gray-600 mb-3">
                  Zakat anda akan dihantar kepada Pusat Urus Zakat melalui kontrak pintar (smart
                  contract) pada blockchain.
                </p>

                <div class="mb-4">
                  <label class="block text-sm text-gray-600 mb-1"
                    >Alamat Penerima (Pusat Urus Zakat)</label
                  >
                  <div class="flex items-center border rounded-md p-2 bg-gray-50">
                    <span class="text-xs font-mono text-gray-600 truncate">{{
                      getPusatUrusZakatAddress()
                    }}</span>
                  </div>
                </div>

                <div class="mb-4">
                  <label class="block text-sm text-gray-600 mb-1">Jumlah dalam ETH</label>
                  <div class="flex items-center border rounded-md p-2 bg-gray-50">
                    <span class="text-sm font-medium">{{ cryptoAmount }} ETH</span>
                  </div>
                </div>

                <div class="mb-4">
                  <label class="block text-sm text-gray-600 mb-2">Sambungkan Dompet Kripto</label>
                  <WalletConnect 
                    buttonText="Sambung dengan MetaMask" 
                    @wallet-connected="handleWalletConnected"
                    @wallet-disconnected="handleWalletDisconnected" 
                  />
                </div>
                
              </div>

              <!-- Wallet information when connected -->
              <div v-if="paymentData.walletInfo" class="p-4 bg-green-50 border border-green-200 rounded-lg mt-3">
                <div class="flex items-center mb-2">
                  <div class="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                  <span class="font-medium text-green-800">Dompet Disambungkan</span>
                </div>
                <div class="text-sm text-gray-600">
                  <p class="mb-1">
                    <span class="font-medium">Alamat: </span>
                    <span class="font-mono text-xs">
                      {{ paymentData.walletInfo.address.substring(0, 6) }}...{{ paymentData.walletInfo.address.substring(paymentData.walletInfo.address.length - 4) }}
                    </span>
                  </p>
                  <p class="text-xs text-blue-600 mt-2">
                    Apabila anda menekan butang "Bayar Sekarang", MetaMask akan meminta anda mengesahkan transaksi ini.
                  </p>
                </div>
              </div>
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>

      <!-- Transaction result (shown after successful crypto payment) -->
      <Card v-if="transactionResult" class="mb-4 bg-green-50 border-green-200">
        <CardContent class="p-4">
          <h3 class="font-medium text-green-800 mb-2">Transaksi Berjaya!</h3>
          <div class="text-sm text-gray-600">
            <p class="mb-1">
              <span class="font-medium">Hash Transaksi:</span>
              <span class="font-mono text-xs">{{ transactionResult.transactionHash }}</span>
            </p>
            <p class="mb-1">
              <span class="font-medium">Dari:</span>
              <span class="font-mono text-xs">{{ transactionResult.from }}</span>
            </p>
            <p class="mb-1">
              <span class="font-medium">Kepada:</span>
              <span class="font-mono text-xs">{{ transactionResult.to }}</span>
            </p>
            <p class="mb-1">
              <span class="font-medium">Jumlah:</span> {{ transactionResult.amount }}
              {{ transactionResult.currency }}
            </p>
            <p class="mb-1">
              <span class="font-medium">Status:</span>
              <span class="text-green-600 font-medium">{{ transactionResult.status }}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      <!-- Terms and conditions -->
      <div class="mb-6 text-sm text-gray-600 px-2">
        <p>
          Dengan menekan butang "Bayar Sekarang", anda bersetuju dengan
          <a href="#" class="text-[#75a868]">Terma & Syarat</a> dan
          <a href="#" class="text-[#75a868]">Dasar Privasi</a> kami.
        </p>
      </div>

      <!-- Payment button -->
      <Button
        @click="processPayment"
        :disabled="isProcessing || (paymentData.paymentMethod === 'crypto' && !paymentData.walletInfo)"
        class="w-full bg-[#75a868] hover:bg-[#75a868]/90 text-white py-3 text-lg"
      >
        <span v-if="isProcessing">Memproses...</span>
        <span v-else>Bayar Sekarang</span>
      </Button>
    </div>
  </div>
</template>

<style scoped>
/* Custom styles */
</style>
