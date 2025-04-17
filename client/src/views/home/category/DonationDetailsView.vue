<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useDonationStore } from '@/stores/donationStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const route = useRoute()
const router = useRouter()
const donationStore = useDonationStore()

const donationId = route.params.id // Parameter name likely remains 'id'
const { currentDonation, loading, error } = storeToRefs(donationStore) // Renamed from currentCampaign

// Donation state
const donationAmount = ref(10) // Default amount
const donationCurrency = ref('RM') // Default currency
const activeCurrency = ref('RM') // For tabs
const customAmount = ref(false)

onMounted(() => {
  donationStore.fetchDonationById(donationId) // Use renamed action
})

// Use currentDonation from the store
const donation = computed(() => currentDonation.value || {}) // Renamed from campaign

const progressPercentage = computed(() => {
  if (!donation.value.target) return 0
  return Math.min(100, Math.round((donation.value.amount / donation.value.target) * 100))
})

const formatAmount = (amount) => {
  if (typeof amount !== 'number') return 'RM0'
  return `RM${amount.toLocaleString()}`
}

const formatDonationAmount = () => {
  if (donationCurrency.value === 'RM') {
    return `RM${donationAmount.value.toLocaleString()}`
  } else if (donationCurrency.value === 'BTC') {
    return `${donationAmount.value} BTC`
  } else if (donationCurrency.value === 'ETH') {
    return `${donationAmount.value} ETH`
  } else if (donationCurrency.value === 'USDT') {
    return `${donationAmount.value} USDT`
  }
  return ''
}

const goBack = () => {
  router.push({ name: 'donation' }) // Assuming 'donation' is the route name for DonationView
}

const setAmount = (amount, currency) => {
  donationAmount.value = amount
  donationCurrency.value = currency
  customAmount.value = false
}

const setCustomAmount = (currency) => {
  customAmount.value = true
  donationCurrency.value = currency
  donationAmount.value = ''
}

const proceedToDonate = () => {
  if (donationAmount.value > 0) {
    router.push(
      `/donation/${donationId}/payment?amount=${donationAmount.value}&currency=${donationCurrency.value}`,
    )
  }
}
</script>

<template>
  <div class="flex flex-col min-h-dvh bg-gray-100 pb-20">
    <!-- Header -->
    <div class="bg-white p-4 sticky top-0 z-10">
      <div class="flex items-center">
        <Button variant="ghost" class="text-gray-700 hover:bg-gray-100 mr-2 p-2" @click="goBack">
          <span class="text-xl">←</span>
        </Button>
        <h1 class="text-lg font-medium">Butiran Derma</h1>
        <!-- Updated title -->
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="p-4 space-y-4">
      <Skeleton class="h-48 w-full" />
      <div class="bg-white p-4 space-y-3">
        <Skeleton class="h-6 w-3/4" />
        <Skeleton class="h-4 w-1/2" />
        <Skeleton class="h-2 w-full" />
        <Skeleton class="h-4 w-1/4" />
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-4">
      <Alert variant="destructive">
        <AlertTitle>Ralat</AlertTitle>
        <AlertDescription>{{ error }}</AlertDescription>
      </Alert>
      <Button @click="donationStore.fetchDonationById(donationId)" variant="outline" class="mt-4"
        >Cuba Lagi</Button
      >
      <!-- Use renamed action -->
    </div>

    <!-- Donation Details -->
    <div v-else-if="donation.id">
      <!-- Donation Image -->
      <div class="relative h-48 bg-gray-200">
        <img
          :src="donation.image || '/images/placeholder.jpg'"
          :alt="donation.title"
          class="w-full h-full object-cover"
          onerror="this.src='/images/placeholder.jpg'"
        />
      </div>

      <!-- Donation Details -->
      <div class="bg-white p-4">
        <h2 class="text-xl font-medium mb-1">{{ donation.title }}</h2>
        <p class="text-sm text-gray-600 mb-3">{{ donation.organization }}</p>

        <!-- Progress bar -->
        <div class="mb-4">
          <div class="flex justify-between text-sm mb-1">
            <span class="font-medium">{{ formatAmount(donation.amount) }}</span>
            <span class="text-gray-500">daripada {{ formatAmount(donation.target) }}</span>
          </div>
          <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              class="h-full bg-green-500 rounded-full"
              :style="`width: ${progressPercentage}%`"
            ></div>
          </div>
          <div class="flex justify-between text-xs mt-1">
            <span>{{ progressPercentage }}% terkumpul</span>
            <span v-if="donation.daysLeft != null">{{
              donation.daysLeft >= 0 ? `${donation.daysLeft} hari lagi` : 'Tamat'
            }}</span>
          </div>
        </div>

        <!-- Donors count -->
        <div class="flex items-center text-sm text-gray-600 mb-4">
          <span class="mr-1">👥</span>
          <span>{{ donation.donors }} penderma</span>
        </div>

        <!-- Description -->
        <div class="border-t border-b py-4 my-4">
          <h3 class="font-medium mb-2">Mengenai derma ini</h3>
          <!-- Updated text -->
          <p class="text-sm text-gray-700">{{ donation.description }}</p>
        </div>
      </div>

      <!-- Donation Amount Selection -->
      <div class="bg-white mt-4 p-4">
        <h3 class="font-medium mb-3">Pilih jumlah derma</h3>

        <!-- Currency Tabs -->
        <div class="mb-4 border-b">
          <div class="flex overflow-x-auto space-x-2 pb-2">
            <button
              @click="activeCurrency = 'RM'"
              class="px-4 py-2 whitespace-nowrap"
              :class="
                activeCurrency === 'RM'
                  ? 'border-b-2 border-primary-600 font-medium text-primary-600'
                  : 'text-gray-500'
              "
            >
              Ringgit Malaysia (RM)
            </button>
            <button
              @click="activeCurrency = 'BTC'"
              class="px-4 py-2 whitespace-nowrap"
              :class="
                activeCurrency === 'BTC'
                  ? 'border-b-2 border-primary-600 font-medium text-primary-600'
                  : 'text-gray-500'
              "
            >
              Bitcoin (BTC)
            </button>
            <button
              @click="activeCurrency = 'ETH'"
              class="px-4 py-2 whitespace-nowrap"
              :class="
                activeCurrency === 'ETH'
                  ? 'border-b-2 border-primary-600 font-medium text-primary-600'
                  : 'text-gray-500'
              "
            >
              Ethereum (ETH)
            </button>
            <button
              @click="activeCurrency = 'USDT'"
              class="px-4 py-2 whitespace-nowrap"
              :class="
                activeCurrency === 'USDT'
                  ? 'border-b-2 border-primary-600 font-medium text-primary-600'
                  : 'text-gray-500'
              "
            >
              Tether (USDT)
            </button>
          </div>
        </div>

        <!-- RM Options -->
        <div v-if="activeCurrency === 'RM'" class="grid grid-cols-3 gap-3 mb-4">
          <Button
            @click="setAmount(10, 'RM')"
            :variant="
              donationAmount === 10 && donationCurrency === 'RM' && !customAmount
                ? 'default'
                : 'outline'
            "
            class="h-12"
          >
            RM10
          </Button>
          <Button
            @click="setAmount(20, 'RM')"
            :variant="
              donationAmount === 20 && donationCurrency === 'RM' && !customAmount
                ? 'default'
                : 'outline'
            "
            class="h-12"
          >
            RM20
          </Button>
          <Button
            @click="setAmount(50, 'RM')"
            :variant="
              donationAmount === 50 && donationCurrency === 'RM' && !customAmount
                ? 'default'
                : 'outline'
            "
            class="h-12"
          >
            RM50
          </Button>
          <Button
            @click="setAmount(100, 'RM')"
            :variant="
              donationAmount === 100 && donationCurrency === 'RM' && !customAmount
                ? 'default'
                : 'outline'
            "
            class="h-12"
          >
            RM100
          </Button>
          <Button
            @click="setCustomAmount('RM')"
            :variant="customAmount && donationCurrency === 'RM' ? 'default' : 'outline'"
            class="col-span-3 h-12"
          >
            Jumlah Lain
          </Button>
        </div>

        <!-- BTC Options -->
        <div v-if="activeCurrency === 'BTC'" class="grid grid-cols-2 gap-3 mb-4">
          <Button
            @click="setAmount(0.0005, 'BTC')"
            :variant="
              donationAmount === 0.0005 && donationCurrency === 'BTC' && !customAmount
                ? 'default'
                : 'outline'
            "
            class="h-12"
          >
            0.0005 BTC
          </Button>
          <Button
            @click="setAmount(0.001, 'BTC')"
            :variant="
              donationAmount === 0.001 && donationCurrency === 'BTC' && !customAmount
                ? 'default'
                : 'outline'
            "
            class="h-12"
          >
            0.001 BTC
          </Button>
          <Button
            @click="setAmount(0.005, 'BTC')"
            :variant="
              donationAmount === 0.005 && donationCurrency === 'BTC' && !customAmount
                ? 'default'
                : 'outline'
            "
            class="h-12"
          >
            0.005 BTC
          </Button>
          <Button
            @click="setAmount(0.01, 'BTC')"
            :variant="
              donationAmount === 0.01 && donationCurrency === 'BTC' && !customAmount
                ? 'default'
                : 'outline'
            "
            class="h-12"
          >
            0.01 BTC
          </Button>
          <Button
            @click="setCustomAmount('BTC')"
            :variant="customAmount && donationCurrency === 'BTC' ? 'default' : 'outline'"
            class="col-span-2 h-12"
          >
            Jumlah Lain
          </Button>
        </div>

        <!-- ETH Options -->
        <div v-if="activeCurrency === 'ETH'" class="grid grid-cols-2 gap-3 mb-4">
          <Button
            @click="setAmount(0.01, 'ETH')"
            :variant="
              donationAmount === 0.01 && donationCurrency === 'ETH' && !customAmount
                ? 'default'
                : 'outline'
            "
            class="h-12"
          >
            0.01 ETH
          </Button>
          <Button
            @click="setAmount(0.05, 'ETH')"
            :variant="
              donationAmount === 0.05 && donationCurrency === 'ETH' && !customAmount
                ? 'default'
                : 'outline'
            "
            class="h-12"
          >
            0.05 ETH
          </Button>
          <Button
            @click="setAmount(0.1, 'ETH')"
            :variant="
              donationAmount === 0.1 && donationCurrency === 'ETH' && !customAmount
                ? 'default'
                : 'outline'
            "
            class="h-12"
          >
            0.1 ETH
          </Button>
          <Button
            @click="setAmount(0.5, 'ETH')"
            :variant="
              donationAmount === 0.5 && donationCurrency === 'ETH' && !customAmount
                ? 'default'
                : 'outline'
            "
            class="h-12"
          >
            0.5 ETH
          </Button>
          <Button
            @click="setCustomAmount('ETH')"
            :variant="customAmount && donationCurrency === 'ETH' ? 'default' : 'outline'"
            class="col-span-2 h-12"
          >
            Jumlah Lain
          </Button>
        </div>

        <!-- USDT Options -->
        <div v-if="activeCurrency === 'USDT'" class="grid grid-cols-2 gap-3 mb-4">
          <Button
            @click="setAmount(10, 'USDT')"
            :variant="
              donationAmount === 10 && donationCurrency === 'USDT' && !customAmount
                ? 'default'
                : 'outline'
            "
            class="h-12"
          >
            10 USDT
          </Button>
          <Button
            @click="setAmount(20, 'USDT')"
            :variant="
              donationAmount === 20 && donationCurrency === 'USDT' && !customAmount
                ? 'default'
                : 'outline'
            "
            class="h-12"
          >
            20 USDT
          </Button>
          <Button
            @click="setAmount(50, 'USDT')"
            :variant="
              donationAmount === 50 && donationCurrency === 'USDT' && !customAmount
                ? 'default'
                : 'outline'
            "
            class="h-12"
          >
            50 USDT
          </Button>
          <Button
            @click="setAmount(100, 'USDT')"
            :variant="
              donationAmount === 100 && donationCurrency === 'USDT' && !customAmount
                ? 'default'
                : 'outline'
            "
            class="h-12"
          >
            100 USDT
          </Button>
          <Button
            @click="setCustomAmount('USDT')"
            :variant="customAmount && donationCurrency === 'USDT' ? 'default' : 'outline'"
            class="col-span-2 h-12"
          >
            Jumlah Lain
          </Button>
        </div>

        <!-- Custom Amount Input -->
        <div v-if="customAmount" class="mt-4">
          <label :for="`custom-amount-${activeCurrency}`" class="text-sm mb-1 block">
            Masukkan Jumlah ({{ activeCurrency }})
          </label>
          <Input
            :id="`custom-amount-${activeCurrency}`"
            type="number"
            v-model.number="donationAmount"
            :placeholder="`Jumlah ${activeCurrency}`"
            class="h-12"
          />
        </div>
      </div>

      <!-- Donate Button -->
      <div class="p-4 sticky bottom-0 bg-white border-t">
        <Button
          @click="proceedToDonate"
          class="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12"
          :disabled="!donationAmount || donationAmount <= 0"
        >
          Derma Sekarang {{ formatDonationAmount() }}
        </Button>
      </div>
    </div>
    <!-- Fallback if donation not found after loading -->
    <div v-else class="p-4 text-center text-gray-500">
      <p>Butiran derma tidak dapat dimuatkan.</p>
    </div>

    <!-- Bottom Navigation might not be needed here, depending on flow -->
    <!-- <BottomNavigation /> -->
  </div>
</template>

<style scoped>
/* Custom styles if needed */
.overflow-x-auto::-webkit-scrollbar {
  display: none;
}
.overflow-x-auto {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
</style>
