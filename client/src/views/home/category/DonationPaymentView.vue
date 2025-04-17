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

const route = useRoute()
const router = useRouter()
const donationStore = useDonationStore()

const donationId = route.params.id
const donationAmount = route.query.amount
const donationCurrency = ref(route.query.currency || 'RM')

const { currentDonation, loading: storeLoading, error: storeError } = storeToRefs(donationStore)

// Local state
const paymentMethod = ref('credit-card') // Default for traditional
const selectedWallet = ref(null) // For crypto
const walletConnected = ref(false)
const isProcessing = ref(false)

onMounted(() => {
  // Fetch donation details if not already loaded or if needed for display
  if (!currentDonation.value || currentDonation.value.id !== donationId) {
    donationStore.fetchDonationById(donationId)
  }
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

const connectWallet = (wallet) => {
  // Simulate wallet connection
  selectedWallet.value = wallet
  isProcessing.value = true
  setTimeout(() => {
    walletConnected.value = true
    isProcessing.value = false
  }, 1500)
}

const processPayment = () => {
  isProcessing.value = true
  // Simulate payment processing
  setTimeout(() => {
    router.push(
      // Ensure the route name/path is correct for success view
      `/donation/${donationId}/success?amount=${donationAmount}&currency=${donationCurrency.value}`,
    )
  }, 1500)
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
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                  alt="MetaMask"
                  class="w-full h-full"
                />
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
              <div
                class="w-8 h-8 mr-3 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0"
              >
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
              <div
                class="w-8 h-8 mr-3 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0"
              >
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
              <div
                class="w-8 h-8 mr-3 bg-blue-700 rounded-full flex items-center justify-center flex-shrink-0"
              >
                <span class="text-white font-bold">WC</span>
              </div>
              <span>WalletConnect</span>
            </div>
          </Button>
        </div>
        <div v-else class="border rounded-lg p-4">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center">
              <div class="w-8 h-8 mr-3 bg-green-100 rounded-full flex items-center justify-center">
                <span class="text-green-600">✓</span>
              </div>
              <span class="font-medium">Dompet Disambungkan</span>
            </div>
            <Button variant="ghost" size="sm" @click="walletConnected = false">
              Putuskan Sambungan
            </Button>
          </div>

          <div class="bg-gray-100 p-3 rounded-lg">
            <div class="flex justify-between mb-2">
              <span class="text-sm text-gray-600">Dompet</span>
              <span class="font-medium">{{
                selectedWallet === 'metamask'
                  ? 'MetaMask'
                  : selectedWallet === 'coinbase'
                    ? 'Coinbase Wallet'
                    : selectedWallet === 'trust'
                      ? 'Trust Wallet'
                      : 'WalletConnect'
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Alamat</span>
              <span class="font-medium text-xs">0x71C...F3E2</span>
            </div>
          </div>

          <div class="mt-3 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
            Anda akan diminta untuk mengesahkan transaksi ini dalam dompet anda
          </div>
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
        :disabled="isProcessing || (isCrypto && !walletConnected)"
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
