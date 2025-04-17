<script setup>
import { ref, computed } from 'vue'
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
    if (paymentData.value.paymentMethod === 'crypto') {
      if (!paymentData.value.walletInfo) {
        alert('Please connect your wallet first')
        isProcessing.value = false
        return
      }

      // Execute smart contract payment
      const result = await executeZakatPayment({
        amount: cryptoAmount.value,
        walletAddress: paymentData.value.walletInfo.address,
        recipientAddress: getPusatUrusZakatAddress(),
        currency: 'ETH',
      })

      transactionResult.value = result

      // Save transaction data to localStorage
      localStorage.setItem('zakatTransaction', JSON.stringify(result))

      // Add to transaction history
      const history = JSON.parse(localStorage.getItem('transactionHistory') || '[]')
      history.unshift(result) // Add to beginning of array
      localStorage.setItem('transactionHistory', JSON.stringify(history))

      // Redirect to transaction history page
      router.push('/transaction-history')
    } else {
      // Simulate traditional payment processing
      await new Promise((resolve) => setTimeout(resolve, 1500))

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
        paymentMethod: paymentData.value.paymentMethod,
      }

      // Save transaction data to localStorage
      localStorage.setItem('zakatTransaction', JSON.stringify(mockTransaction))

      // Add to transaction history
      const history = JSON.parse(localStorage.getItem('transactionHistory') || '[]')
      history.unshift(mockTransaction) // Add to beginning of array
      localStorage.setItem('transactionHistory', JSON.stringify(history))

      // Redirect to transaction history page
      router.push('/transaction-history')
    }
  } catch (error) {
    alert(`Payment failed: ${error.message}`)
  } finally {
    isProcessing.value = false
  }
}

// Set payment method
const setPaymentMethod = (method) => {
  paymentData.value.paymentMethod = method
}

// Handle wallet connection
const handleWalletConnected = (walletInfo) => {
  paymentData.value.walletInfo = walletInfo
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
                    <img src="../../public/tng.png" alt="Touch 'n Go" class="h-11 mr-3" />
                    <span>Touch 'n Go</span>
                  </div>
                </div>

                <div
                  class="bg-primary/20 border rounded-lg p-3 cursor-pointer hover:border-[#75a868]"
                >
                  <div class="flex items-center space-x-4">
                    <img src="../../public/grab.png" alt="GrabPay" class="h-11 mr-3" />
                    <span>GrabPay</span>
                  </div>
                </div>

                <div
                  class="bg-primary/20 border rounded-lg p-3 cursor-pointer hover:border-[#75a868]"
                >
                  <div class="flex items-center space-x-4">
                    <img src="../../public/boost.png" alt="Boost" class="h-11" />
                    <span>Boost</span>
                  </div>
                </div>

                <div
                  class="bg-primary/20 border rounded-lg p-3 cursor-pointer hover:border-[#75a868]"
                >
                  <div class="flex items-center space-x-4">
                    <img src="../../public/mae.png" alt="MAE" class="h-11" />
                    <span>MAE</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="crypto" class="mb-6 border-none p-0">
              <h3 class="font-medium mb-3">Pembayaran Cryptocurrency</h3>

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
                  <WalletConnect @wallet-connected="handleWalletConnected" />
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
