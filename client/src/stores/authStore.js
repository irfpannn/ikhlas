// Pinia Auth Store
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { onAuthChange, getCurrentUser, logout } from '@/services/authService'
import { getUserProfile } from '@/services/userService'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const profile = ref(null)
  const loading = ref(true)

  const fetchProfile = async () => {
    if (user.value) {
      profile.value = await getUserProfile(user.value.uid)
    }
  }

  const signOut = async () => {
    await logout()
    user.value = null
    profile.value = null
  }

  onAuthChange(async (u) => {
    user.value = u
    loading.value = false
    if (u) await fetchProfile()
  })

  return { user, profile, loading, signOut, fetchProfile }
})
