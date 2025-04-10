<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import WalletConnect from '@/components/ui/wallet/WalletConnect.vue'
import { convertRMToCrypto, executeZakatPayment, getPusatUrusZakatAddress } from '@/services/smartContractService'

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
  walletInfo: null
})

// Payment processing state
const isProcessing = ref(false)
const transactionResult = ref(null)

// Computed crypto amount
const cryptoAmount = computed(() => {
  return convertRMToCrypto(parseFloat(paymentData.value.amount));
})

// Go back to zakat pendapatan page
const goBack = () => {
  router.push('/zakat-pendapatan')
}

// Process payment
const processPayment = async () => {
  isProcessing.value = true;
  
  try {
    if (paymentData.value.paymentMethod === 'crypto') {
      if (!paymentData.value.walletInfo) {
        alert('Please connect your wallet first');
        isProcessing.value = false;
        return;
      }
      
      // Execute smart contract payment
      const result = await executeZakatPayment({
        amount: cryptoAmount.value,
        walletAddress: paymentData.value.walletInfo.address,
        recipientAddress: getPusatUrusZakatAddress(),
        currency: 'ETH'
      });
      
      transactionResult.value = result;
      
      // Save transaction data to localStorage
      localStorage.setItem('zakatTransaction', JSON.stringify(result));
      
      // Add to transaction history
      const history = JSON.parse(localStorage.getItem('transactionHistory') || '[]');
      history.unshift(result); // Add to beginning of array
      localStorage.setItem('transactionHistory', JSON.stringify(history));
      
      // Redirect to transaction history page
      router.push('/transaction-history');
      
    } else {
      // Simulate traditional payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For non-crypto payments, create a mock transaction
      const mockTransaction = {
        success: true,
        transactionHash: 'TX' + Math.random().toString(36).substring(2, 15),
        from: paymentData.value.name || 'User',
        to: 'Pusat Urus Zakat',
        amount: paymentData.value.amount,
        currency: 'RM',
        timestamp: new Date().toISOString(),
        status: 'confirmed',
        paymentMethod: paymentData.value.paymentMethod
      };
      
      // Save transaction data to localStorage
      localStorage.setItem('zakatTransaction', JSON.stringify(mockTransaction));
      
      // Add to transaction history
      const history = JSON.parse(localStorage.getItem('transactionHistory') || '[]');
      history.unshift(mockTransaction); // Add to beginning of array
      localStorage.setItem('transactionHistory', JSON.stringify(history));
      
      // Redirect to transaction history page
      router.push('/transaction-history');
    }
  } catch (error) {
    alert(`Payment failed: ${error.message}`);
  } finally {
    isProcessing.value = false;
  }
}

// Set payment method
const setPaymentMethod = (method) => {
  paymentData.value.paymentMethod = method
}

// Handle wallet connection
const handleWalletConnected = (walletInfo) => {
  paymentData.value.walletInfo = walletInfo;
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
      <div class="bg-white rounded-lg mb-4 flex border">
        <div 
          class="flex-1 text-center py-3 cursor-pointer text-xs"
          :class="paymentData.paymentMethod === 'card' ? 'border-b-2 border-[#75a868] text-[#75a868] font-medium' : 'text-gray-500'"
          @click="setPaymentMethod('card')"
        >
          Kad Kredit/Debit
        </div>
        <div 
          class="flex-1 text-center py-3 cursor-pointer text-xs"
          :class="paymentData.paymentMethod === 'bank' ? 'border-b-2 border-[#75a868] text-[#75a868] font-medium' : 'text-gray-500'"
          @click="setPaymentMethod('bank')"
        >
          Perbankan Online
        </div>
        <div 
          class="flex-1 text-center py-3 cursor-pointer text-xs"
          :class="paymentData.paymentMethod === 'ewallet' ? 'border-b-2 border-[#75a868] text-[#75a868] font-medium' : 'text-gray-500'"
          @click="setPaymentMethod('ewallet')"
        >
          E-Wallet
        </div>
        <div 
          class="flex-1 text-center py-3 cursor-pointer text-xs"
          :class="paymentData.paymentMethod === 'crypto' ? 'border-b-2 border-[#75a868] text-[#75a868] font-medium' : 'text-gray-500'"
          @click="setPaymentMethod('crypto')"
        >
          Cryptocurrency
        </div>
      </div>

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

          <!-- Credit/Debit Card information (shown only when card method is selected) -->
          <div v-if="paymentData.paymentMethod === 'card'" class="mb-6">
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
          </div>

          <!-- Online Banking options (shown only when bank method is selected) -->
          <div v-if="paymentData.paymentMethod === 'bank'" class="mb-6">
            <h3 class="font-medium mb-3">Pilih Bank</h3>
            
            <div class="grid grid-cols-2 gap-4">
              <div class="border rounded-lg p-3 cursor-pointer hover:border-[#75a868]">
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-gray-200 rounded-md mr-3"></div>
                  <span>Maybank2u</span>
                </div>
              </div>
              
              <div class="border rounded-lg p-3 cursor-pointer hover:border-[#75a868]">
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-gray-200 rounded-md mr-3"></div>
                  <span>CIMB Clicks</span>
                </div>
              </div>
              
              <div class="border rounded-lg p-3 cursor-pointer hover:border-[#75a868]">
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-gray-200 rounded-md mr-3"></div>
                  <span>Public Bank</span>
                </div>
              </div>
              
              <div class="border rounded-lg p-3 cursor-pointer hover:border-[#75a868]">
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-gray-200 rounded-md mr-3"></div>
                  <span>RHB Now</span>
                </div>
              </div>
            </div>
          </div>

          <!-- E-Wallet options (shown only when ewallet method is selected) -->
          <div v-if="paymentData.paymentMethod === 'ewallet'" class="mb-6">
            <h3 class="font-medium mb-3">Pilih E-Wallet</h3>
            
            <div class="grid grid-cols-2 gap-4">
              <div class="border rounded-lg p-3 cursor-pointer hover:border-[#75a868]">
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-gray-200 rounded-md mr-3"></div>
                  <span>Touch 'n Go</span>
                </div>
              </div>
              
              <div class="border rounded-lg p-3 cursor-pointer hover:border-[#75a868]">
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-gray-200 rounded-md mr-3"></div>
                  <span>GrabPay</span>
                </div>
              </div>
              
              <div class="border rounded-lg p-3 cursor-pointer hover:border-[#75a868]">
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-gray-200 rounded-md mr-3"></div>
                  <span>Boost</span>
                </div>
              </div>
              
              <div class="border rounded-lg p-3 cursor-pointer hover:border-[#75a868]">
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-gray-200 rounded-md mr-3"></div>
                  <span>MAE</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Cryptocurrency options (shown only when crypto method is selected) -->
          <div v-if="paymentData.paymentMethod === 'crypto'" class="mb-6">
            <h3 class="font-medium mb-3">Pembayaran Cryptocurrency</h3>
            
            <div class="mb-4">
              <p class="text-sm text-gray-600 mb-3">
                Zakat anda akan dihantar kepada Pusat Urus Zakat melalui kontrak pintar (smart contract) pada blockchain.
              </p>
              
              <div class="mb-4">
                <label class="block text-sm text-gray-600 mb-1">Alamat Penerima (Pusat Urus Zakat)</label>
                <div class="flex items-center border rounded-md p-2 bg-gray-50">
                  <span class="text-xs font-mono text-gray-600 truncate">{{ getPusatUrusZakatAddress() }}</span>
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
                <WalletConnect @wallet-connected="handleWalletConnected" />
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
            <p class="mb-1"><span class="font-medium">Hash Transaksi:</span> <span class="font-mono text-xs">{{ transactionResult.transactionHash }}</span></p>
            <p class="mb-1"><span class="font-medium">Dari:</span> <span class="font-mono text-xs">{{ transactionResult.from }}</span></p>
            <p class="mb-1"><span class="font-medium">Kepada:</span> <span class="font-mono text-xs">{{ transactionResult.to }}</span></p>
            <p class="mb-1"><span class="font-medium">Jumlah:</span> {{ transactionResult.amount }} {{ transactionResult.currency }}</p>
            <p class="mb-1"><span class="font-medium">Status:</span> <span class="text-green-600 font-medium">{{ transactionResult.status }}</span></p>
          </div>
        </CardContent>
      </Card>

      <!-- Terms and conditions -->
      <div class="mb-6 text-sm text-gray-600 px-2">
        <p>Dengan menekan butang "Bayar Sekarang", anda bersetuju dengan <a href="#" class="text-[#75a868]">Terma & Syarat</a> dan <a href="#" class="text-[#75a868]">Dasar Privasi</a> kami.</p>
      </div>

      <!-- Payment button -->
      <Button 
        @click="processPayment" 
        :disabled="isProcessing"
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