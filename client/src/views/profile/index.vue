<template>
  <div class="flex flex-col min-h-screen bg-gray-100 overflow-y-auto pb-20">
    <!-- Loading State -->
    <div v-if="authLoading || profileLoading" class="flex-grow flex items-center justify-center">
      <p>Loading profile...</p>
      <!-- Or a spinner component -->
    </div>

    <!-- Error State -->
    <div
      v-else-if="authError || profileError"
      class="flex-grow flex items-center justify-center p-4"
    >
      <Card class="w-full max-w-sm bg-red-50 border border-red-200">
        <CardHeader>
          <CardTitle class="text-red-700">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-red-600">{{ authError || profileError }}</p>
          <Button
            v-if="authError === 'Not authenticated'"
            @click="goToLogin"
            variant="destructive"
            size="sm"
            class="mt-4"
            >Go to Login</Button
          >
          <Button v-else @click="retryFetchProfile" variant="secondary" size="sm" class="mt-4"
            >Retry</Button
          >
        </CardContent>
      </Card>
    </div>

    <!-- Profile Content -->
    <div v-else class="p-4 flex-grow">
      <h1 class="text-xl font-semibold text-center mb-5 text-gray-800">Profil Saya</h1>
      <Card class="overflow-hidden shadow-sm mb-4 bg-green-50">
        <CardHeader class="p-4 flex flex-col sm:flex-row items-center gap-4">
          <div
            class="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0"
          >
            <span class="text-2xl font-semibold text-gray-500">{{ getInitials(form?.name) }}</span>
          </div>
          <div class="text-center sm:text-left">
            <h2 class="text-lg font-semibold text-gray-900">{{ form?.name }}</h2>
            <p class="text-sm text-gray-600">{{ form?.email }}</p>
            <p v-if="form?.phone" class="text-sm text-gray-600">{{ form?.phone }}</p>
          </div>
        </CardHeader>
      </Card>
      <Card class="overflow-hidden shadow-sm mb-4">
        <CardContent class="p-4 space-y-5">
          <div>
            <h3 class="text-base font-semibold mb-3 text-gray-700">Maklumat Peribadi</h3>
            <form @submit.prevent="handleUpdate" class="space-y-3">
              <div class="grid grid-cols-1 gap-3">
                <div>
                  <Label for="name" class="text-xs font-medium text-gray-600">Nama Penuh</Label>
                  <Input id="name" type="text" v-model="form.name" class="mt-1 h-9 text-sm" />
                </div>
                <div>
                  <Label for="email" class="text-xs font-medium text-gray-600">E-mel</Label>
                  <Input id="email" type="email" v-model="form.email" class="mt-1 h-9 text-sm" />
                </div>
                <div>
                  <Label for="phone" class="text-xs font-medium text-gray-600"
                    >Nombor Telefon</Label
                  >
                  <Input id="phone" type="tel" v-model="form.phone" class="mt-1 h-9 text-sm" />
                </div>
                <div>
                  <Label for="address" class="text-xs font-medium text-gray-600">Alamat</Label>
                  <Textarea id="address" v-model="form.address" class="mt-1 min-h-[70px] text-sm" />
                </div>
              </div>
              <Button
                type="submit"
                size="sm"
                class="bg-[#75a868] hover:bg-[#75a868]/90 w-full sm:w-auto"
                :disabled="profileLoading"
                >Kemas Kini Profil</Button
              >
              <p v-if="profileError" class="text-red-500 text-sm">{{ profileError }}</p>
            </form>
          </div>
        </CardContent>
      </Card>
      <Card class="overflow-hidden shadow-sm mb-4">
        <CardHeader class="pb-2">
          <CardTitle class="text-base">Sejarah Derma</CardTitle>
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
                  donation.status === 'Selesai'
                    ? 'success'
                    : donation.status === 'Diproses'
                      ? 'warning'
                      : 'secondary'
                "
                class="text-xs"
                >{{ donation.status }}</Badge
              >
            </div>
          </div>
          <div v-else class="text-center py-4 px-3 bg-gray-50 rounded-md border border-gray-100">
            <p class="text-sm text-gray-500 mb-2">Anda belum membuat sebarang derma.</p>
            <Button
              variant="outline"
              size="sm"
              @click="$router.push('/donation')"
              class="border-[#75a868] text-[#75a868] hover:bg-[#75a868]/10 hover:text-[#75a868]"
              >Buat Derma</Button
            >
          </div>
        </CardContent>
      </Card>
      <Card class="overflow-hidden shadow-sm">
        <CardHeader class="pb-2">
          <CardTitle class="text-base">Ganjaran Saya</CardTitle>
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
                  Tamat Tempoh: {{ formatDate(reward.expiryDate) }}
                </p>
              </div>
              <Badge
                :variant="
                  reward.status === 'Tersedia'
                    ? 'success'
                    : reward.status === 'Ditebus'
                      ? 'info'
                      : 'secondary'
                "
                class="text-xs"
                >{{ reward.status }}</Badge
              >
            </div>
          </div>
          <div v-else class="text-center py-4 px-3 bg-gray-50 rounded-md border border-gray-100">
            <p class="text-sm text-gray-500 mb-2">Anda belum mempunyai sebarang ganjaran.</p>
            <Button
              variant="outline"
              size="sm"
              @click="$router.push('/rewards')"
              class="border-[#75a868] text-[#75a868] hover:bg-[#75a868]/10 hover:text-[#75a868]"
              >Lihat Ganjaran Tersedia</Button
            >
          </div>
        </CardContent>
      </Card>

      <!-- Logout button card -->
      <Card class="overflow-hidden shadow-sm mt-4">
        <CardContent class="py-4">
          <Button
            @click="handleLogout"
            class="w-full bg-red-500 hover:bg-red-600 text-white"
            size="sm"
          >
            Log Keluar
          </Button>
        </CardContent>
      </Card>
    </div>
    <BottomNavigation />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { BottomNavigation } from '@/components/ui/bottom-navigation'
import { useProfileStore } from '@/stores/profileStore'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const profileStore = useProfileStore()
const authStore = useAuthStore()

// Use storeToRefs for reactivity
const { profile, loading: profileLoading, error: profileError } = storeToRefs(profileStore)
const { user, loading: authLoading, error: authError } = storeToRefs(authStore) // Get auth state

const { fetchProfile, updateProfile } = profileStore
const { signOut } = authStore

const form = ref({
  name: '',
  email: '',
  phone: '',
  address: '',
})

// Watch for auth state to be ready before fetching profile
onMounted(() => {
  let stopAuthWatcher = null // Declare with let, initialize to null

  stopAuthWatcher = watch(
    authLoading,
    (newAuthLoading, oldAuthLoading) => {
      console.log('Auth loading state changed:', newAuthLoading)

      // Only proceed if the loading state has actually finished (transitioned from true to false)
      // or if it was already false on the immediate run.
      if (!newAuthLoading) {
        if (user.value) {
          console.log('Auth ready, user found. Fetching profile...')
          fetchProfile()
        } else {
          console.log('Auth ready, but no user logged in.')
          // Fetch profile anyway to get the 'Not authenticated' error state in profileStore
          fetchProfile()
        }

        // Stop watching authLoading once it's confirmed false
        // Check if stopAuthWatcher has been assigned (it should be by now)
        if (stopAuthWatcher) {
          console.log('Stopping auth loading watcher.')
          stopAuthWatcher()
        }
      }
    },
    { immediate: true },
  ) // immediate: true checks the initial state
})

// Watch the profile store's profile data to update the local form
watch(
  profile,
  (newProfile) => {
    console.log('Profile Store Changed:', newProfile)
    if (newProfile) {
      form.value = {
        name: newProfile.user_fullname || '',
        email: newProfile.user_email || '',
        phone: newProfile.user_phone || '',
        address: newProfile.user_address || '',
      }
      console.log('Form updated:', form.value)
    } else {
      form.value = { name: '', email: '', phone: '', address: '' }
      console.log('Form reset due to null profile')
    }
  },
  { immediate: true }, // Populate form initially if profile is already available
)

const handleUpdate = async () => {
  const updateData = {
    user_fullname: form.value.name,
    user_email: form.value.email,
    user_phone: form.value.phone,
    user_address: form.value.address,
  }
  console.log('Attempting to update profile with:', updateData)
  await updateProfile(updateData)
  if (!profileStore.error) {
    console.log('Profile update successful (according to store)')
    alert('Profil berjaya dikemas kini!')
  } else {
    console.error('Profile update failed:', profileStore.error)
  }
}

const handleLogout = async () => {
  try {
    await signOut()
    console.log('Logged out successfully')
    router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

const getInitials = (name) => {
  if (!name) return ''
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

const formatDate = (date) => {
  if (!date) return ''
  // Ensure date is a Date object if it's a Firestore Timestamp
  const dateObj = date.toDate ? date.toDate() : new Date(date)
  return dateObj.toLocaleDateString('ms-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Function to navigate to login
const goToLogin = () => {
  router.push('/login')
}

// Function to retry fetching profile
const retryFetchProfile = () => {
  fetchProfile()
}

// --- Mock Data (Keep or replace with actual data fetching) ---
const donations = ref([
  {
    amount: 100.0,
    date: new Date('2023-10-15'),
    category: 'Fakir',
    status: 'Selesai',
  },
  {
    amount: 50.0,
    date: new Date('2023-09-01'),
    category: 'Miskin',
    status: 'Selesai',
  },
  {
    amount: 75.0,
    date: new Date('2023-11-05'),
    category: 'Fi Sabilillah',
    status: 'Diproses',
  },
])

const rewards = ref([
  {
    id: 101,
    name: 'Sijil Potongan Cukai',
    description: 'Sijil untuk tujuan potongan cukai bagi derma anda sebanyak RM 100.00',
    status: 'Tersedia',
    expiryDate: new Date('2024-12-31'),
  },
  {
    id: 102,
    name: 'Baucar ZUS Coffee',
    description: 'Diskaun RM5 untuk sebarang minuman',
    status: 'Tersedia',
    expiryDate: new Date('2024-08-31'),
  },
  {
    id: 103,
    name: 'Lencana Derma',
    description: 'Lencana penderma Perak untuk sumbangan anda',
    status: 'Ditebus',
    expiryDate: null,
  },
])
</script>
