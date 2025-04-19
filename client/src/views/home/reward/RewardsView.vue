<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { BottomNavigation } from '@/components/ui/bottom-navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

const router = useRouter()

// User points data (would come from API in a real app)
const userPoints = ref(4671)
const userTier = ref('PUZ Elite')

// Partners for rewards
const partners = ref([
  { id: 1, name: 'ZUS Coffee', logo: '☕', active: true },
  { id: 2, name: 'Mydin', logo: '🛒', active: false },
  { id: 3, name: 'Secret Recipe', logo: '🍰', active: false },
])

// Available rewards by partner
const zusRewards = ref([
  {
    id: 1,
    name: 'MATCHA LATTE',
    description: '1 Cawan Saiz Sederhana', // Translate description
    points: 250,
    price: 'RM 3',
    image: '☕',
    partner: 'ZUS Coffee',
  },
  {
    id: 2,
    name: 'PEACHY TEA + MANGO',
    description: '1 Cawan Saiz Sederhana', // Translate description
    points: 250,
    price: 'RM 3',
    image: '🍹',
    partner: 'ZUS Coffee',
  },
  {
    id: 3,
    name: 'CHOCOLATE FRAPPE',
    description: '1 Cawan Saiz Sederhana', // Translate description
    points: 300,
    price: 'RM 4',
    image: '🥤',
    partner: 'ZUS Coffee',
  },
  {
    id: 4,
    name: 'COFFEE VOUCHER',
    description: 'Mana-mana Kopi Pilihan', // Translate description
    points: 350,
    price: 'RM 5',
    image: '🎫',
    partner: 'ZUS Coffee',
  },
])

const mydinRewards = ref([
  {
    id: 201,
    name: 'RM10 VOUCHER',
    description: 'Sah di semua cawangan Mydin', // Translate description
    points: 400,
    price: 'RM 10',
    image: '🛒',
    partner: 'Mydin',
  },
  {
    id: 202,
    name: 'RM20 VOUCHER',
    description: 'Sah di semua cawangan Mydin', // Translate description
    points: 750,
    price: 'RM 20',
    image: '🛍️',
    partner: 'Mydin',
  },
  {
    id: 203,
    name: 'GROCERY PACKAGE',
    description: 'Pakej barangan keperluan', // Translate description
    points: 1000,
    price: 'RM 25',
    image: '🥫',
    partner: 'Mydin',
  },
])

const secretRecipeRewards = ref([
  {
    id: 301,
    name: 'SLICE OF CAKE',
    description: 'Mana-mana potongan kek pilihan', // Translate description
    points: 300,
    price: 'RM 8',
    image: '🍰',
    partner: 'Secret Recipe',
  },
  {
    id: 302,
    name: 'BEVERAGE VOUCHER',
    description: 'Mana-mana minuman panas/sejuk', // Translate description
    points: 200,
    price: 'RM 5',
    image: '🥤',
    partner: 'Secret Recipe',
  },
  {
    id: 303,
    name: 'RM15 VOUCHER',
    description: 'Sah untuk mana-mana item menu', // Translate description
    points: 600,
    price: 'RM 15',
    image: '🎫',
    partner: 'Secret Recipe',
  },
  {
    id: 304,
    name: 'WHOLE CAKE DISCOUNT',
    description: 'Diskaun 20% untuk mana-mana kek sebiji', // Translate description
    points: 800,
    price: 'RM 20',
    image: '🎂',
    partner: 'Secret Recipe',
  },
])

const eliteRewards = ref([
  {
    id: 101,
    name: 'WORKSPACE VOUCHER',
    description: '2 Jam di Ruang Kerja ZUS', // Translate description
    points: 1000,
    price: 'RM 12',
    image: '💻',
    partner: 'ZUS Coffee',
  },
  {
    id: 102,
    name: 'PREMIUM COFFEE SET',
    description: 'Kopi + Pastri', // Translate description
    points: 1200,
    price: 'RM 15',
    image: '🥐',
    partner: 'ZUS Coffee',
  },
  {
    id: 401,
    name: 'MYDIN PREMIUM VOUCHER',
    description: 'Baucar beli-belah RM50', // Translate description
    points: 1800,
    price: 'RM 50',
    image: '🛍️',
    partner: 'Mydin',
  },
  {
    id: 402,
    name: 'SECRET RECIPE PARTY SET',
    description: 'Kek sebiji + 4 minuman', // Translate description
    points: 2000,
    price: 'RM 60',
    image: '🎂',
    partner: 'Secret Recipe',
  },
])

// Update missions data
const missions = ref([
  {
    id: 1,
    title: 'DONATION STREAK',
    subtitle: 'Make donations 3 days in a row',
    points: 150,
    daysLeft: 7,
    icon: '🔥',
    unlimited: false,
    progress: '1/3',
  },
  {
    id: 2,
    title: 'ASNAF REPORTER',
    subtitle: 'Report 5 potential asnaf cases',
    points: 200,
    daysLeft: 30,
    icon: '📝',
    unlimited: true,
    progress: '2/5',
  },
  {
    id: 3,
    title: 'MONTHLY SUSTAINER',
    subtitle: 'Complete monthly donation commitment',
    points: 300,
    daysLeft: 10,
    icon: '🌙',
    unlimited: false,
    progress: '0/1',
  },
  {
    id: 4,
    title: 'COMMUNITY CHAMPION',
    subtitle: 'Help verify 3 asnaf reports',
    points: 180,
    daysLeft: 15,
    icon: '🤝',
    unlimited: true,
    progress: '1/3',
  },
  {
    id: 5,
    title: 'ZAKAT AWARENESS',
    subtitle: 'Share 3 zakat posts on social media',
    points: 100,
    daysLeft: 5,
    icon: '📢',
    unlimited: true,
    progress: '0/3',
  },
])

// Active rewards based on selected partner
const activeRewards = ref(zusRewards.value)

// User's redeemed rewards
const myRewards = ref([
  {
    id: 201,
    name: 'MATCHA LATTE',
    redeemDate: '2023-12-15',
    expiryDate: '2024-01-15',
    status: 'Aktif', // Translate status
    image: '☕',
    partner: 'ZUS Coffee',
  },
  {
    id: 202,
    name: 'RM10 VOUCHER',
    redeemDate: '2024-05-10',
    expiryDate: '2024-06-10',
    status: 'Aktif', // Translate status
    image: '🛒',
    partner: 'Mydin',
  },
])

const goBack = () => {
  router.push('/')
}

const selectPartner = (partner) => {
  // Set all partners to inactive
  partners.value.forEach((p) => (p.active = false))

  // Set selected partner to active
  const selectedPartner = partners.value.find((p) => p.id === partner.id)
  if (selectedPartner) {
    selectedPartner.active = true
  }

  // Update active rewards based on selected partner
  if (partner.name === 'ZUS Coffee') {
    activeRewards.value = zusRewards.value
  } else if (partner.name === 'Mydin') {
    activeRewards.value = mydinRewards.value
  } else if (partner.name === 'Secret Recipe') {
    activeRewards.value = secretRecipeRewards.value
  }
}

const redeemReward = (reward) => {
  if (userPoints.value >= reward.points) {
    // In a real app, this would call an API to redeem the reward
    userPoints.value -= reward.points

    // Add to my rewards
    myRewards.value.push({
      id: Date.now(), // Generate a unique ID
      name: reward.name,
      redeemDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      status: 'Aktif', // Translate status
      image: reward.image,
      partner: reward.partner,
    })

    alert(`Berjaya menebus ${reward.name}!`) // Translate alert
  } else {
    alert('Mata ganjaran tidak mencukupi untuk menebus ganjaran ini.') // Translate alert
  }
}
</script>

<template>
  <div class="flex flex-col min-h-dvh bg-gray-100 overflow-y-auto pb-20">
    <!-- Header with back button - sticky -->
    <div class="bg-[#75a868] text-white p-4 rounded-b-3xl sticky top-0 z-10">
      <div class="flex items-center mb-4">
        <Button
          variant="ghost"
          class="text-white hover:text-white hover:bg-[#217e0a]/50 mr-2 p-2"
          @click="goBack"
        >
          <span class="text-xl">←</span>
        </Button>
        <h1 class="text-lg font-semibold">Misi dan Ganjaran</h1>
      </div>
    </div>

    <!-- Tabs for different sections -->
    <Tabs defaultValue="redeem" class="w-full pt-4 px-2">
      <TabsList class="grid w-full grid-cols-3">
        <TabsTrigger value="missions">Misi</TabsTrigger>
        <TabsTrigger value="redeem">Tebus Ganjaran</TabsTrigger>
        <TabsTrigger value="myrewards">Ganjaran Saya</TabsTrigger>
      </TabsList>

      <!-- Missions Tab -->
      <TabsContent value="missions">
        <div class="p-4">
          <!-- User points summary for missions tab -->
          <Card class="shadow-sm mb-4 bg-gradient-to-r from-[#75a868] to-[#5d8652] text-white">
            <CardContent class="p-4">
              <div class="flex justify-between items-center">
                <div>
                  <h3 class="font-semibold text-lg">Misi Aktif</h3>
                  <p class="text-sm opacity-90">Selesaikan misi untuk mata tambahan</p>
                </div>
                <div class="text-right">
                  <p class="text-sm">Mata PUZ Anda</p>
                  <p class="font-bold text-xl">{{ userPoints }} ⭐</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <h3 class="font-semibold mb-3">Complete missions to help the community</h3>

          <!-- New missions grid -->
          <div class="grid grid-cols-1 gap-4">
            <div
              v-for="mission in missions"
              :key="mission.id"
              class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
            >
              <div class="p-4">
                <div class="mb-2">
                  <span class="text-3xl">{{ mission.icon }}</span>
                </div>
                <div class="space-y-1">
                  <h4 class="font-semibold text-gray-800">{{ mission.title }}</h4>
                  <p class="text-sm text-gray-600">{{ mission.subtitle }}</p>
                </div>
                <div class="mt-4 flex justify-between items-center">
                  <div class="flex items-center gap-1">
                    <span class="text-yellow-500">⭐</span>
                    <span class="text-sm font-medium">{{ mission.points }} pts</span>
                  </div>
                  <div class="flex items-center gap-1 text-gray-500">
                    <span class="text-sm">⏰</span>
                    <span class="text-sm">{{ mission.daysLeft }} days left</span>
                  </div>
                </div>
                <!-- Add progress bar -->
                <div class="mt-3 w-full bg-gray-100 rounded-full h-2">
                  <div
                    class="bg-[#75a868] h-2 rounded-full"
                    :style="{
                      width: `${(parseInt(mission.progress.split('/')[0]) / parseInt(mission.progress.split('/')[1])) * 100}%`,
                    }"
                  ></div>
                </div>
                <div class="mt-1 text-xs text-gray-500 text-right">
                  {{ mission.progress }}
                </div>
              </div>
              <div class="px-4 py-3 bg-gray-50 flex justify-between items-center">
                <Button variant="default" size="sm" class="w-full bg-[#75a868] hover:bg-[#5d8652]">
                  {{ mission.progress.startsWith('0') ? 'Start Now' : 'Continue' }}
                </Button>
              </div>
              <div v-if="mission.unlimited" class="px-4 py-2 bg-gray-50 border-t border-gray-100">
                <p class="text-xs text-center text-gray-500">Repeatable Mission</p>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>

      <!-- Redeem Rewards Tab -->
      <TabsContent value="redeem">
        <div class="p-4">
          <!-- User tier and points -->
          <Card class="shadow-sm mb-4 bg-gradient-to-r from-[#75a868] to-[#5d8652] text-white">
            <CardContent class="p-4">
              <div class="flex justify-between items-center">
                <div>
                  <h3 class="font-semibold text-lg">{{ userTier }}</h3>
                  <p class="text-sm opacity-90">Tebus mata anda untuk ganjaran</p>
                </div>
                <div class="text-right">
                  <p class="text-sm">Mata PUZ Anda</p>
                  <p class="font-bold text-xl flex items-center justify-end">
                    <span class="text-yellow-300 mr-1">⭐</span>
                    {{ userPoints }}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Partner selection -->
          <h3 class="font-semibold mb-2">Rakan Kongsi Kami</h3>
          <div class="flex space-x-2 mb-4 overflow-x-auto pb-2">
            <Button
              v-for="partner in partners"
              :key="partner.id"
              @click="selectPartner(partner)"
              :variant="partner.active ? 'default' : 'outline'"
              :class="partner.active ? 'bg-[#75a868] hover:bg-[#5d8652]' : ''"
              class="flex-shrink-0"
            >
              <span class="mr-1">{{ partner.logo }}</span> {{ partner.name }}
            </Button>
          </div>

          <!-- Partner name heading -->
          <h3 class="font-semibold mb-3">Ganjaran {{ partners.find((p) => p.active)?.name }}</h3>

          <!-- Rewards grid with updated layout -->
          <div class="space-y-4">
            <div
              v-for="reward in activeRewards"
              :key="reward.id"
              class="bg-[#f0f4f9] rounded-lg overflow-hidden"
            >
              <div class="p-4 border">
                <div class="flex items-center justify-between">
                  <div class="flex flex-col">
                    <div class="text-center mb-2">
                      <span class="text-4xl">{{ reward.image }}</span>
                    </div>
                  </div>
                  <div class="flex-1 ml-4">
                    <h4 class="font-semibold text-sm">{{ reward.name }}</h4>
                    <p class="text-xs text-gray-500">{{ reward.description }}</p>

                    <div class="flex justify-between items-center mt-3">
                      <div class="flex flex-col items-center">
                        <div class="flex items-center">
                          <span class="text-xs bg-yellow-100 text-yellow-700 p-1 rounded-full"
                            >⭐</span
                          >
                          <span class="text-xs ml-1">Tebus dengan</span>
                        </div>
                        <p class="font-semibold text-sm mt-1">{{ reward.points }} mata</p>
                      </div>

                      <div class="flex flex-col items-center">
                        <div class="flex items-center">
                          <span class="text-xs bg-gray-100 text-gray-700 p-1 rounded-full">💰</span>
                          <span class="text-xs ml-1">Tebus dengan</span>
                        </div>
                        <p class="font-semibold text-sm mt-1">{{ reward.price }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="bg-white p-2">
                <Button
                  @click="redeemReward(reward)"
                  size="sm"
                  variant="outline"
                  class="w-full"
                  :disabled="userPoints < reward.points"
                >
                  Tebus
                </Button>
              </div>
            </div>
          </div>

          <!-- Elite rewards -->
          <h3 class="font-semibold mb-3 mt-6">{{ userTier }} Eksklusif</h3>
          <div class="space-y-4">
            <div
              v-for="reward in eliteRewards"
              :key="reward.id"
              class="bg-[#f0f4f9] rounded-lg overflow-hidden"
            >
              <div class="p-4 border">
                <div class="flex items-center justify-between">
                  <div class="flex flex-col">
                    <div class="text-center mb-2">
                      <span class="text-4xl">{{ reward.image }}</span>
                    </div>
                  </div>
                  <div class="flex-1 ml-4">
                    <!-- Use Badge component here with dynamic variant -->
                    <Badge
                      :variant="
                        reward.partner === 'ZUS Coffee'
                          ? 'destructive'
                          : reward.partner === 'Mydin'
                            ? 'outline'
                            : 'default'
                      "
                      class="text-xs mb-1"
                    >
                      {{ reward.partner }}
                    </Badge>
                    <h4 class="font-semibold text-sm">{{ reward.name }}</h4>
                    <p class="text-xs text-gray-500">{{ reward.description }}</p>

                    <div class="flex justify-between items-center mt-3">
                      <div class="flex flex-col items-center">
                        <div class="flex items-center">
                          <span class="text-xs bg-yellow-100 text-yellow-700 p-1 rounded-full"
                            >⭐</span
                          >
                          <span class="text-xs ml-1">Tebus dengan</span>
                        </div>
                        <p class="font-semibold text-sm mt-1">{{ reward.points }} mata</p>
                      </div>

                      <div class="flex flex-col items-center">
                        <div class="flex items-center">
                          <span class="text-xs bg-gray-100 text-gray-700 p-1 rounded-full">💰</span>
                          <span class="text-xs ml-1">Tebus dengan</span>
                        </div>
                        <p class="font-semibold text-sm mt-1">{{ reward.price }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="bg-white p-2">
                <Button
                  @click="redeemReward(reward)"
                  size="sm"
                  variant="outline"
                  class="w-full"
                  :disabled="userPoints < reward.points"
                >
                  Tebus
                </Button>
              </div>
            </div>
          </div>

          <!-- How it works section -->
          <div class="mt-6 mb-2">
            <h3 class="font-semibold">Bagaimana Ia Berfungsi</h3>
            <div class="bg-white rounded-lg p-3 mt-2 shadow-sm">
              <ol class="list-decimal pl-4 space-y-2 text-sm">
                <li>Buat sumbangan melalui Pusat Urus Zakat untuk mendapatkan Mata PUZ</li>
                <li>Selesaikan misi untuk mendapatkan mata tambahan</li>
                <li>Tebus mata anda untuk ganjaran daripada rakan niaga kami</li>
                <li>
                  Capai tahap yang lebih tinggi untuk ganjaran eksklusif daripada rakan kongsi
                  premium
                </li>
              </ol>
            </div>
          </div>
        </div>
      </TabsContent>

      <!-- My Rewards Tab -->
      <TabsContent value="myrewards">
        <div class="p-4">
          <h3 class="font-semibold mb-2">Ganjaran Saya Yang Ditebus</h3>

          <div v-if="myRewards.length === 0" class="text-center py-8">
            <p class="text-gray-500">Anda belum menebus sebarang ganjaran.</p>
            <Button
              variant="outline"
              class="mt-2"
              @click="() => document.querySelector('[value=redeem]').click()"
            >
              Lihat Ganjaran
            </Button>
          </div>

          <div v-else class="space-y-3">
            <Card v-for="reward in myRewards" :key="reward.id" class="shadow-sm">
              <CardContent>
                <div class="flex items-start">
                  <div class="bg-gray-100 p-3 rounded-lg mr-3 flex-shrink-0">
                    <span class="text-2xl">{{ reward.image }}</span>
                  </div>
                  <div class="flex-grow">
                    <div class="text-xs inline-block bg-gray-100 px-2 py-0.5 rounded-full mb-1">
                      {{ reward.partner }}
                    </div>
                    <h4 class="font-semibold text-sm">{{ reward.name }}</h4>

                    <p class="text-xs text-gray-500">Ditebus: {{ reward.redeemDate }}</p>
                    <p class="text-xs text-gray-500">Luput: {{ reward.expiryDate }}</p>
                    <div class="mt-1">
                      <Badge
                        :variant="reward.status === 'Aktif' ? 'success' : 'secondary'"
                        class="text-xs"
                      >
                        {{ reward.status }}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div class="mt-3 flex justify-end">
                  <Button size="sm" variant="outline" class="w-full">Guna Ganjaran</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>
    </Tabs>

    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<style scoped>
/* Custom styles for the rewards page */
</style>
