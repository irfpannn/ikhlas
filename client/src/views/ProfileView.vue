<template>
  <div class="flex flex-col min-h-screen bg-gray-100 overflow-y-auto pb-20">
    <!-- Content wrapper with padding -->
    <div class="p-4 flex-grow">
      <h1 class="text-xl font-semibold text-center mb-5 text-gray-800">My Profile</h1>

      <Card class="overflow-hidden shadow-sm mb-4">
        <CardHeader class="bg-gray-50 p-4 flex flex-col sm:flex-row items-center gap-4">
          <div
            class="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0"
          >
            <img
              v-if="user.avatar"
              :src="user.avatar"
              alt="Profile Picture"
              class="w-full h-full object-cover"
            />
            <span v-else class="text-2xl font-semibold text-gray-500">{{
              getInitials(user.name)
            }}</span>
          </div>
          <div class="text-center sm:text-left">
            <h2 class="text-lg font-semibold text-gray-900">{{ user.name }}</h2>
            <p class="text-sm text-gray-600">{{ user.email }}</p>
            <p v-if="user.phone" class="text-sm text-gray-600">{{ user.phone }}</p>
          </div>
        </CardHeader>
      </Card>

      <Card class="overflow-hidden shadow-sm mb-4">
        <CardContent class="p-4 space-y-5">
          <div>
            <h3 class="text-base font-semibold mb-3 text-gray-700">Personal Information</h3>
            <form @submit.prevent="updateProfile" class="space-y-3">
              <div class="grid grid-cols-1 gap-3">
                <div>
                  <Label for="name" class="text-xs font-medium text-gray-600">Full Name</Label>
                  <Input id="name" type="text" v-model="user.name" class="mt-1 h-9 text-sm" />
                </div>
                <div>
                  <Label for="email" class="text-xs font-medium text-gray-600">Email</Label>
                  <Input id="email" type="email" v-model="user.email" class="mt-1 h-9 text-sm" />
                </div>
                <div>
                  <Label for="phone" class="text-xs font-medium text-gray-600">Phone Number</Label>
                  <Input id="phone" type="tel" v-model="user.phone" class="mt-1 h-9 text-sm" />
                </div>
                <div>
                  <Label for="address" class="text-xs font-medium text-gray-600">Address</Label>
                  <Textarea id="address" v-model="user.address" class="mt-1 min-h-[70px] text-sm" />
                </div>
              </div>
              <Button
                type="submit"
                size="sm"
                class="bg-[#75a868] hover:bg-[#75a868]/90 w-full sm:w-auto"
                >Update Profile</Button
              >
            </form>
          </div>
        </CardContent>
      </Card>

      <Card class="overflow-hidden shadow-sm mb-4">
        <CardHeader class="pb-2">
          <CardTitle class="text-base">Donation History</CardTitle>
        </CardHeader>
        <CardContent class="pt-0">
          <div v-if="donations.length > 0" class="space-y-2">
            <div
              v-for="(donation, index) in donations"
              :key="index"
              class="flex justify-between items-center p-3 bg-gray-50 rounded-md border border-gray-100"
            >
              <div>
                <p class="font-medium text-sm text-gray-800">RM {{ donation.amount.toFixed(2) }}</p>
                <p class="text-xs text-gray-500">
                  {{ formatDate(donation.date) }} • {{ donation.category }}
                </p>
              </div>
              <Badge
                :variant="
                  donation.status === 'Completed'
                    ? 'success'
                    : donation.status === 'Processing'
                      ? 'warning'
                      : 'secondary'
                "
                class="text-xs"
                >{{ donation.status }}</Badge
              >
            </div>
          </div>
          <div v-else class="text-center py-4 px-3 bg-gray-50 rounded-md border border-gray-100">
            <p class="text-sm text-gray-500 mb-2">You haven't made any donations yet.</p>
            <Button
              variant="outline"
              size="sm"
              @click="$router.push('/donation')"
              class="border-[#75a868] text-[#75a868] hover:bg-[#75a868]/10 hover:text-[#75a868]"
              >Make a Donation</Button
            >
          </div>
        </CardContent>
      </Card>

      <Card class="overflow-hidden shadow-sm">
        <CardHeader class="pb-2">
          <CardTitle class="text-base">My Rewards</CardTitle>
        </CardHeader>
        <CardContent class="pt-0">
          <div v-if="rewards.length > 0" class="space-y-2">
            <div
              v-for="(reward, index) in rewards"
              :key="index"
              class="flex justify-between items-center p-3 bg-gray-50 rounded-md border border-gray-100"
            >
              <div>
                <h4 class="font-medium text-sm text-gray-800">{{ reward.name }}</h4>
                <p class="text-xs text-gray-500">{{ reward.description }}</p>
                <p class="text-xs text-gray-400" v-if="reward.expiryDate">
                  Expires: {{ formatDate(reward.expiryDate) }}
                </p>
              </div>
              <Badge
                :variant="
                  reward.status === 'Available'
                    ? 'success'
                    : reward.status === 'Claimed'
                      ? 'info'
                      : 'secondary'
                "
                class="text-xs"
                >{{ reward.status }}</Badge
              >
            </div>
          </div>
          <div v-else class="text-center py-4 px-3 bg-gray-50 rounded-md border border-gray-100">
            <p class="text-sm text-gray-500 mb-2">You don't have any rewards yet.</p>
            <Button
              variant="outline"
              size="sm"
              @click="$router.push('/rewards')"
              class="border-[#75a868] text-[#75a868] hover:bg-[#75a868]/10 hover:text-[#75a868]"
              >View Available Rewards</Button
            >
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card' // Added CardTitle
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { BottomNavigation } from '@/components/ui/bottom-navigation' // Import BottomNavigation

const router = useRouter()

const user = ref({
  name: 'Bima Sakti', // Updated to match HomeView example
  email: 'bima.sakti@example.com',
  phone: '081987378782', // Updated to match HomeView example
  address: '123 Jalan Merdeka, Kuala Lumpur, 50480',
  avatar: null, // Example: '/path/to/avatar.jpg' or null
})

const donations = ref([
  {
    amount: 100.0,
    date: new Date('2023-10-15'),
    category: 'Fakir (Poor)',
    status: 'Completed',
  },
  {
    amount: 50.0,
    date: new Date('2023-09-01'),
    category: 'Miskin (Needy)',
    status: 'Completed',
  },
  {
    amount: 75.0,
    date: new Date('2023-11-05'),
    category: 'Fi Sabilillah',
    status: 'Processing',
  },
])

const rewards = ref([
  {
    id: 101, // Added ID for consistency
    name: 'Tax Deduction Certificate',
    description: 'Certificate for tax deduction purposes for your donation of RM 100.00',
    status: 'Available',
    expiryDate: new Date('2024-12-31'), // Extended expiry
  },
  {
    id: 102, // Added ID
    name: 'ZUS Coffee Voucher', // Example reward
    description: 'RM5 off any beverage',
    status: 'Available',
    expiryDate: new Date('2024-08-31'),
  },
  {
    id: 103, // Added ID
    name: 'Donation Badge',
    description: 'Silver donor badge for your contribution',
    status: 'Claimed',
    expiryDate: null,
  },
])

const updateProfile = () => {
  // Here you would implement the logic to update the user profile
  // For example, making an API call to your backend
  // Consider using a notification system instead of alert
  console.log('Profile update submitted:', user.value)
  alert('Profile updated successfully!') // Placeholder
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const getInitials = (name) => {
  if (!name) return ''
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .slice(0, 2) // Limit to 2 initials
    .join('')
    .toUpperCase()
}

// Define badge variants if not already globally defined or part of the Badge component logic
// This is conceptual - actual implementation depends on how Badge variants are handled
// You might need to adjust the :variant binding based on your Badge component setup
// e.g., using computed properties or a mapping function.
</script>
