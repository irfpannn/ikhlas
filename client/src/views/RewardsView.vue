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
    description: '1 Medium Size Cup',
    points: 250,
    price: 'RM 3',
    image: '☕',
    partner: 'ZUS Coffee',
  },
  {
    id: 2,
    name: 'PEACHY TEA + MANGO',
    description: '1 Medium Size Cup',
    points: 250,
    price: 'RM 3',
    image: '🍹',
    partner: 'ZUS Coffee',
  },
  {
    id: 3,
    name: 'CHOCOLATE FRAPPE',
    description: '1 Medium Size Cup',
    points: 300,
    price: 'RM 4',
    image: '🥤',
    partner: 'ZUS Coffee',
  },
  {
    id: 4,
    name: 'COFFEE VOUCHER',
    description: 'Any Coffee of Choice',
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
    description: 'Valid at all Mydin outlets',
    points: 400,
    price: 'RM 10',
    image: '🛒',
    partner: 'Mydin',
  },
  {
    id: 202,
    name: 'RM20 VOUCHER',
    description: 'Valid at all Mydin outlets',
    points: 750,
    price: 'RM 20',
    image: '🛍️',
    partner: 'Mydin',
  },
  {
    id: 203,
    name: 'GROCERY PACKAGE',
    description: 'Essential items package',
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
    description: 'Any cake slice of choice',
    points: 300,
    price: 'RM 8',
    image: '🍰',
    partner: 'Secret Recipe',
  },
  {
    id: 302,
    name: 'BEVERAGE VOUCHER',
    description: 'Any hot/cold beverage',
    points: 200,
    price: 'RM 5',
    image: '🥤',
    partner: 'Secret Recipe',
  },
  {
    id: 303,
    name: 'RM15 VOUCHER',
    description: 'Valid for any menu items',
    points: 600,
    price: 'RM 15',
    image: '🎫',
    partner: 'Secret Recipe',
  },
  {
    id: 304,
    name: 'WHOLE CAKE DISCOUNT',
    description: '20% off any whole cake',
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
    description: '2 Hours at ZUS Workspace',
    points: 1000,
    price: 'RM 12',
    image: '💻',
    partner: 'ZUS Coffee',
  },
  {
    id: 102,
    name: 'PREMIUM COFFEE SET',
    description: 'Coffee + Pastry',
    points: 1200,
    price: 'RM 15',
    image: '🥐',
    partner: 'ZUS Coffee',
  },
  {
    id: 401,
    name: 'MYDIN PREMIUM VOUCHER',
    description: 'RM50 shopping voucher',
    points: 1800,
    price: 'RM 50',
    image: '🛍️',
    partner: 'Mydin',
  },
  {
    id: 402,
    name: 'SECRET RECIPE PARTY SET',
    description: 'Whole cake + 4 beverages',
    points: 2000,
    price: 'RM 60',
    image: '🎂',
    partner: 'Secret Recipe',
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
    status: 'Active',
    image: '☕',
    partner: 'ZUS Coffee',
  },
  {
    id: 202,
    name: 'RM10 VOUCHER',
    redeemDate: '2024-05-10',
    expiryDate: '2024-06-10',
    status: 'Active',
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
      status: 'Active',
      image: reward.image,
      partner: reward.partner,
    })

    alert(`Successfully redeemed ${reward.name}!`)
  } else {
    alert('Not enough points to redeem this reward.')
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
        <h1 class="text-lg font-semibold">Missions and Rewards</h1>
      </div>
    </div>

    <!-- Tabs for different sections -->
    <Tabs defaultValue="redeem" class="w-full pt-4 px-2">
      <TabsList class="grid w-full grid-cols-3">
        <TabsTrigger value="missions">Missions</TabsTrigger>
        <TabsTrigger value="redeem">Redeem Rewards</TabsTrigger>
        <TabsTrigger value="myrewards">My Rewards</TabsTrigger>
      </TabsList>

      <!-- Missions Tab -->
      <TabsContent value="missions">
        <div class="p-4">
          <Card class="shadow-sm mb-4">
            <CardContent>
              <h3 class="font-semibold mb-2">Daily Missions</h3>
              <div class="space-y-3">
                <div class="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                  <div>
                    <p class="font-medium">Make a donation</p>
                    <p class="text-sm text-gray-500">+50 points</p>
                  </div>
                  <Button size="sm" variant="outline">Complete</Button>
                </div>
                <div class="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                  <div>
                    <p class="font-medium">Share on social media</p>
                    <p class="text-sm text-gray-500">+20 points</p>
                  </div>
                  <Button size="sm" variant="outline">Complete</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card class="shadow-sm">
            <CardContent>
              <h3 class="font-semibold mb-2">Monthly Missions</h3>
              <div class="space-y-3">
                <div class="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                  <div>
                    <p class="font-medium">Donate 3 times</p>
                    <p class="text-sm text-gray-500">+200 points</p>
                  </div>
                  <div class="text-sm">1/3</div>
                </div>
                <div class="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                  <div>
                    <p class="font-medium">Refer a friend</p>
                    <p class="text-sm text-gray-500">+100 points per referral</p>
                  </div>
                  <Button size="sm" variant="outline">Refer</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <!-- Redeem Rewards Tab -->
      <TabsContent value="redeem">
        <div class="p-4">
          <!-- User tier and points -->
          <Card class="shadow-sm mb-4 bg-[#75a868] text-white">
            <CardContent>
              <div class="flex justify-between items-center">
                <div>
                  <h3 class="font-semibold text-lg">
                    {{ userTier }}
                  </h3>
                  <div class="flex items-center mt-1">
                    <p class="text-sm">PUZ Points</p>
                  </div>
                  <p class="font-bold text-xl">{{ userPoints }} pts</p>
                </div>
                <Button variant="secondary" class="bg-white hover:bg-gray-100 text-black">
                  My Rewards
                </Button>
              </div>
            </CardContent>
          </Card>

          <!-- Partner selection -->
          <h3 class="font-semibold mb-2">Our Partners</h3>
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
          <h3 class="font-semibold mb-3">{{ partners.find((p) => p.active)?.name }} Rewards</h3>

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
                          <span class="text-xs ml-1">Redeem with</span>
                        </div>
                        <p class="font-semibold text-sm mt-1">{{ reward.points }} pts</p>
                      </div>

                      <div class="flex flex-col items-center">
                        <div class="flex items-center">
                          <span class="text-xs bg-gray-100 text-gray-700 p-1 rounded-full">💰</span>
                          <span class="text-xs ml-1">Redeem with</span>
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
                  Redeem
                </Button>
              </div>
            </div>
          </div>

          <!-- Elite rewards -->
          <h3 class="font-semibold mb-3 mt-6">{{ userTier }} Exclusive</h3>
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
                    <div class="text-xs inline-block bg-gray-100 px-2 py-1 rounded-full mb-1">
                      {{ reward.partner }}
                    </div>
                    <h4 class="font-semibold text-sm">{{ reward.name }}</h4>
                    <p class="text-xs text-gray-500">{{ reward.description }}</p>

                    <div class="flex justify-between items-center mt-3">
                      <div class="flex flex-col items-center">
                        <div class="flex items-center">
                          <span class="text-xs bg-yellow-100 text-yellow-700 p-1 rounded-full"
                            >⭐</span
                          >
                          <span class="text-xs ml-1">Redeem with</span>
                        </div>
                        <p class="font-semibold text-sm mt-1">{{ reward.points }} pts</p>
                      </div>

                      <div class="flex flex-col items-center">
                        <div class="flex items-center">
                          <span class="text-xs bg-gray-100 text-gray-700 p-1 rounded-full">💰</span>
                          <span class="text-xs ml-1">Redeem with</span>
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
                  Redeem
                </Button>
              </div>
            </div>
          </div>

          <!-- How it works section -->
          <div class="mt-6 mb-2">
            <h3 class="font-semibold">How It Works</h3>
            <div class="bg-white rounded-lg p-3 mt-2 shadow-sm">
              <ol class="list-decimal pl-4 space-y-2 text-sm">
                <li>Make donations through Pusat Urus Zakat to earn PUZ Points</li>
                <li>Complete missions to earn additional points</li>
                <li>Redeem your points for rewards from our partner merchants</li>
                <li>Reach higher tiers for exclusive rewards from premium partners</li>
              </ol>
            </div>
          </div>
        </div>
      </TabsContent>

      <!-- My Rewards Tab -->
      <TabsContent value="myrewards">
        <div class="p-4">
          <h3 class="font-semibold mb-2">My Redeemed Rewards</h3>

          <div v-if="myRewards.length === 0" class="text-center py-8">
            <p class="text-gray-500">You haven't redeemed any rewards yet.</p>
            <Button
              variant="outline"
              class="mt-2"
              @click="() => document.querySelector('[value=redeem]').click()"
            >
              Browse Rewards
            </Button>
          </div>

          <div v-else class="space-y-3">
            <Card v-for="reward in myRewards" :key="reward.id" class="shadow-sm">
              <CardContent class="pt-4">
                <div class="flex items-start">
                  <div class="bg-gray-100 p-3 rounded-lg mr-3 flex-shrink-0">
                    <span class="text-2xl">{{ reward.image }}</span>
                  </div>
                  <div class="flex-grow">
                    <div class="text-xs inline-block bg-gray-100 px-2 py-0.5 rounded-full mb-1">
                      {{ reward.partner }}
                    </div>
                    <h4 class="font-semibold text-sm">{{ reward.name }}</h4>

                    <p class="text-xs text-gray-500">Redeemed: {{ reward.redeemDate }}</p>
                    <p class="text-xs text-gray-500">Expires: {{ reward.expiryDate }}</p>
                    <div class="mt-1">
                      <Badge
                        :variant="reward.status === 'Active' ? 'success' : 'secondary'"
                        class="text-xs"
                      >
                        {{ reward.status }}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div class="mt-3 flex justify-end">
                  <Button size="sm" variant="outline">Use Reward</Button>
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
