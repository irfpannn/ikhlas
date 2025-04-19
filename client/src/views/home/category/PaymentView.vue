<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import WalletConnect from '@/components/ui/wallet/WalletConnect.vue'
import {
  convertRMToCrypto,
  executeZakatPayment,
  getPusatUrusZakatAddress,
  processCryptoPayment as processPaymentWithLuno
} from '@/services/smartContractService'
import { saveDonationTransaction } from '@/services/donationService'
import { getAuth } from 'firebase/auth'
import { isLunoApiAccessible } from '@/services/lunoWalletService'
import { getDoc, doc } from 'firebase/firestore'
import { db } from '@/firebase.config'

const route = useRoute()
const router = useRouter()

// Get zakat amount and type from route query parameters
const zakatAmount = computed(() => {
  return route.query.amount ? parseFloat(route.query.amount) : 250.00
})
const zakatType = computed(() => route.query.type || 'Zakat')
const zakatCurrency = computed(() => route.query.currency || 'RM')

// Payment data
const paymentData = ref({
  amount: zakatAmount.value.toString(),
  name: '',
  email: '',
  phone: '',
  walletInfo: null,
  paymentMethod: 'crypto', // Only crypto is supported now
  zakatType: zakatType.value,
  currency: zakatCurrency.value
})

// Watch for changes in route query parameters
watch([zakatAmount, zakatType, zakatCurrency], ([newAmount, newType, newCurrency]) => {
  paymentData.value.amount = newAmount.toString()
  paymentData.value.zakatType = newType
  paymentData.value.currency = newCurrency
})

// Payment processing state
const isProcessing = ref(false)
const transactionResult = ref(null)
const isLunoAvailable = ref(false)

// Check if Luno API is available on mount
onMounted(async () => {
  try {
    isLunoAvailable.value = await isLunoApiAccessible()
  } catch (error) {
    console.error('Error checking Luno API availability:', error)
    isLunoAvailable.value = false
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
    
    // Get user data from Firestore to ensure we have the correct name
    const userDoc = await getDoc(doc(db, 'users', user.uid))
    const userData = userDoc.exists() ? userDoc.data() : null
    
    // Use Firestore user data if available, otherwise fall back to Auth data
    const senderName = userData?.user_fullname || user.displayName || user.email || 'Anonymous'
    
    // Prepare zakat payment data
    const zakatData = {
      senderId: user.uid,
      senderName: senderName,
      recipientId: 'zakat-authority',
      recipientName: 'Zakat Authority',
      amount: parseFloat(paymentData.value.amount),
      currency: paymentData.value.currency || 'RM',
      paymentMethod: paymentData.value.paymentMethod,
      category: `${paymentData.value.zakatType} Payment`,
      notes: '',
      type: 'zakat',
      zakatType: paymentData.value.zakatType,
      timestamp: new Date().toISOString(),
      status: 'pending'
    }
    
    if (!paymentData.value.walletInfo) {
      alert('Please connect your wallet first')
      isProcessing.value = false
      return
    }

    // Execute crypto payment using Luno
    const paymentResult = await handleCryptoPayment()
    
    // Update transaction status and add transaction hash
    zakatData.status = 'completed'
    zakatData.transactionHash = paymentResult.transactionId
    
    // Save the zakat transaction to Firebase
    await saveDonationTransaction(zakatData)
    
    // Redirect to success page
    setTimeout(() => {
      router.push({
        path: '/payment/success',
        query: {
          txId: paymentResult.transactionId,
          amount: paymentData.value.amount,
          currency: paymentData.value.currency || 'RM',
          type: paymentData.value.zakatType
        }
      })
    }, 1500)
  } catch (error) {
    console.error('Error processing zakat payment:', error)
    isProcessing.value = false
    alert('Payment failed: ' + error.message)
  }
}

// Process crypto payment using Luno
const handleCryptoPayment = async () => {
  try {
    // Get recipient address
    let recipientAddress = getPusatUrusZakatAddress()
    
    // Ensure it's a valid address
    if (!recipientAddress || !recipientAddress.startsWith('0x') || recipientAddress.length !== 42) {
      recipientAddress = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F' // Example valid address
    }
    
    // Use the processCryptoPayment function from the smartContractService
    const paymentResult = await processPaymentWithLuno({
      amount: cryptoAmount.value,
      currency: 'ETH', // Using ETH for this example
      recipientAddress: recipientAddress,
      walletInfo: paymentData.value.walletInfo,
      description: `Zakat Payment - ${paymentData.value.zakatType}`
    })
    
    console.log('Payment result:', paymentResult)
    
    // Create transaction record
    const txData = {
      success: true,
      transactionId: paymentResult.transactionId,
      from: paymentData.value.walletInfo.id,
      to: recipientAddress,
      amount: cryptoAmount.value,
      currency: 'ETH',
      timestamp: new Date().toISOString(),
      status: paymentResult.status || 'pending',
      paymentMethod: 'crypto',
      name: paymentData.value.name,
      email: paymentData.value.email,
      phone: paymentData.value.phone,
      provider: 'Luno'
    }
    
    // Save transaction data
    transactionResult.value = txData
    localStorage.setItem('zakatTransaction', JSON.stringify(txData))
    
    // Add to transaction history
    const history = JSON.parse(localStorage.getItem('transactionHistory') || '[]')
    history.unshift(txData)
    localStorage.setItem('transactionHistory', JSON.stringify(history))
    
    // Redirect to the success page
    setTimeout(() => {
      router.push({
        path: '/payment/success',
        query: {
          txId: paymentResult.transactionId,
          amount: paymentData.value.amount,
          currency: 'RM',
          type: paymentData.value.zakatType
        }
      })
    }, 1500)

    return paymentResult
  } catch (error) {
    console.error('Error processing payment:', error)
    isProcessing.value = false
    alert('Payment failed: ' + error.message)
  }
}

// Handle wallet connection
const handleWalletConnected = (info) => {
  paymentData.value.walletInfo = info
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
      <h1 class="text-lg font-semibold">Bayar Zakat {{ paymentData.zakatType }}</h1>
    </div>

    <!-- Main content -->
    <div class="p-4">
      <!-- Payment amount card -->
      <Card class="mb-4 bg-[#75a868] text-white">
        <CardContent class="p-4">
          <div class="text-center">
            <p class="text-white/80 mb-1">Jumlah Pembayaran</p>
            <h2 class="text-2xl font-bold">RM {{ paymentData.amount }}</h2>
            <p class="text-sm mt-1">
              ≈ {{ cryptoAmount }} ETH
            </p>
          </div>
        </CardContent>
      </Card>

      <!-- Payment form -->
      <Card class="mb-4">
        <CardContent class="p-4">
          <!-- Personal information -->
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

          <!-- Crypto payment section -->
          <div class="mb-6">
            <h3 class="font-medium mb-3">Pembayaran Cryptocurrency</h3>

            <!-- Luno API Not Available Warning -->
            <div v-if="!isLunoAvailable" class="p-4 border border-yellow-300 bg-yellow-50 rounded-lg mb-4">
              <p class="text-yellow-800 text-sm">
                Luno API tidak tersedia. Sila periksa kelayakan API atau
                <a href="https://www.luno.com/" target="_blank" class="underline font-medium">
                  daftar untuk Luno
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
                  buttonText="Sambung dengan Luno" 
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
                  Apabila anda menekan butang "Bayar Sekarang", transaksi akan diproses melalui wallet Luno anda.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Transaction result (shown after successful crypto payment) -->
      <Card v-if="transactionResult" class="mb-4 bg-green-50 border-green-200">
        <CardContent class="p-4">
          <h3 class="font-medium text-green-800 mb-2">Transaksi Berjaya!</h3>
          <div class="text-sm text-gray-600">
            <p class="mb-1">
              <span class="font-medium">Hash Transaksi:</span>
              <span class="font-mono text-xs">{{ transactionResult.transactionId }}</span>
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
        :disabled="isProcessing || !paymentData.walletInfo"
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
