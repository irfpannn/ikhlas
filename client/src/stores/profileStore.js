// Pinia store for user profile
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUserProfile, updateUserProfile } from '@/services/userService'
import { useAuthStore } from './authStore'

export const useProfileStore = defineStore('profile', () => {
  const profile = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const fetchProfile = async () => {
    loading.value = true
    error.value = null
    try {
      const auth = useAuthStore()
      if (!auth.user) throw new Error('Not authenticated')
      profile.value = await getUserProfile(auth.user.uid)
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const updateProfile = async (data) => {
    loading.value = true
    error.value = null
    try {
      const auth = useAuthStore()
      if (!auth.user) throw new Error('Not authenticated')
      await updateUserProfile(auth.user.uid, data)
      await fetchProfile()
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  return { profile, loading, error, fetchProfile, updateProfile }
})
