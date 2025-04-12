<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BottomNavigation } from '@/components/ui/bottom-navigation'

const route = useRoute()
const router = useRouter()
const campaignId = parseInt(route.params.id)
const donationAmount = ref(10)
const customAmount = ref(false)
const activeCurrency = ref('RM')
const donationCurrency = ref('RM')

// Sample donation campaigns (same as in DonationView)
const campaigns = ref([
  {
    id: 1,
    title: 'Ayuh Bantu Pembinaan Masjid',
    organization: 'Masjid Busyra',
    image: '/images/mosque-construction.jpg',
    amount: 23423,
    daysLeft: 31,
    description:
      'Kempen ini bertujuan untuk menyiapkan pembinaan masjid yang akan berfungsi sebagai pusat komuniti untuk pendidikan, solat, dan perhimpunan sosial. Derma anda akan membantu menyediakan tempat ibadat untuk ratusan keluarga.',
    target: 50000,
    donors: 128,
  },
  {
    id: 2,
    title: 'Wakaf Air untuk Anak Yatim',
    organization: 'Yayasan Ilmuan',
    image: '/images/water-orphans.jpg',
    amount: 12000,
    daysLeft: 2,
    description:
      'Bantu menyediakan akses air bersih ke rumah anak yatim di kawasan luar bandar. Projek wakaf air lestari ini akan memastikan anak yatim mendapat akses kepada air minuman bersih untuk tahun-tahun mendatang.',
    target: 15000,
    donors: 75,
  },
  {
    id: 3,
    title: 'Warga Emas Penghidap Strok',
    organization: 'Yayasan Kebajikan',
    image: '/images/elderly-care.jpg',
    amount: 40200,
    daysLeft: 20,
    description:
      'Sokong warga emas yang mengalami strok dan memerlukan bantuan kewangan untuk penjagaan perubatan dan pemulihan. Derma anda akan membantu secara langsung menampung kos rawatan mereka.',
    target: 60000,
    donors: 210,
  },
  {
    id: 4,
    title: 'Bantu Pelajar Lanjut Pelajaran',
    organization: 'Tangga Ilmu',
    image: '/images/education.jpg',
    amount: 0,
    daysLeft: null,
    description:
      'Dana biasiswa ini membantu pelajar kurang berkemampuan meneruskan pendidikan mereka. Sumbangan anda akan menyediakan yuran pengajian, buku, dan bekalan untuk pelajar yang layak yang sebaliknya tidak mampu untuk belajar.',
    target: 25000,
    donors: 0,
  },
])

const campaign = computed(() => {
  return campaigns.value.find((c) => c.id === campaignId) || {}
})

const progressPercentage = computed(() => {
  if (!campaign.value.target) return 0
  return Math.min(100, Math.round((campaign.value.amount / campaign.value.target) * 100))
})

const formatAmount = (amount) => {
  // Keep RM prefix as it's standard
  return `RM${amount.toLocaleString()}`
}

const formatDonationAmount = () => {
  if (donationCurrency.value === 'RM') {
    // Keep RM prefix
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
  router.push('/donation')
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
      `/donation/${campaignId}/payment?amount=${donationAmount.value}&currency=${donationCurrency.value}`,
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
        <h1 class="text-lg font-medium">Butiran Kempen</h1>
      </div>
    </div>

    <!-- Campaign Image -->
    <div class="relative h-48 bg-gray-200">
      <img
        :src="campaign.image"
        :alt="campaign.title"
        class="w-full h-full object-cover"
        onerror="this.src='/images/placeholder.jpg'"
      />
    </div>

    <!-- Campaign Details -->
    <div class="bg-white p-4">
      <h2 class="text-xl font-medium mb-1">{{ campaign.title }}</h2>
      <p class="text-sm text-gray-600 mb-3">{{ campaign.organization }}</p>

      <!-- Progress bar -->
      <div class="mb-4">
        <div class="flex justify-between text-sm mb-1">
          <span class="font-medium">{{ formatAmount(campaign.amount) }}</span>
          <span class="text-gray-500">daripada {{ formatAmount(campaign.target) }}</span>
        </div>
        <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            class="h-full bg-green-500 rounded-full"
            :style="`width: ${progressPercentage}%`"
          ></div>
        </div>
        <div class="flex justify-between text-xs mt-1">
          <span>{{ progressPercentage }}% terkumpul</span>
          <span v-if="campaign.daysLeft">{{ campaign.daysLeft }} hari lagi</span>
        </div>
      </div>

      <!-- Donors count -->
      <div class="flex items-center text-sm text-gray-600 mb-4">
        <span class="mr-1">👥</span>
        <span>{{ campaign.donors }} penderma</span>
      </div>

      <!-- Description -->
      <div class="border-t border-b py-4 my-4">
        <h3 class="font-medium mb-2">Mengenai kempen ini</h3>
        <p class="text-sm text-gray-700">{{ campaign.description }}</p>
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
      <div v-if="activeCurrency === 'RM'" class="grid grid-cols-2 gap-3 mb-4">
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
          class="col-span-2 h-12"
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

      <div v-if="customAmount" class="mb-4">
        <Input
          v-model="donationAmount"
          type="number"
          :min="donationCurrency === 'BTC' || donationCurrency === 'ETH' ? '0.00001' : '1'"
          :step="donationCurrency === 'BTC' || donationCurrency === 'ETH' ? '0.00001' : '1'"
          :placeholder="`Masukkan jumlah (${donationCurrency})`"
          class="w-full"
        />
      </div>

      <Button @click="proceedToDonate" class="w-full h-12" :disabled="!donationAmount">
        Derma {{ donationAmount ? formatDonationAmount() : '' }}
      </Button>
    </div>

    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<style scoped>
/* Custom styles for donation details page */
</style>
