import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getAllDonations, getDonationById } from '@/services/donationService' // Updated import

export const useDonationStore = defineStore('donation', () => {
  const donations = ref([]) // Renamed from campaigns
  const currentDonation = ref(null) // Renamed from currentCampaign
  const loading = ref(false)
  const error = ref(null)

  const fetchAllDonations = async () => {
    // Renamed from fetchAllCampaigns
    loading.value = true
    error.value = null
    try {
      donations.value = await getAllDonations() // Use renamed service function
    } catch (err) {
      error.value = err.message || 'Ralat semasa memuatkan senarai derma.' // Updated error message
    } finally {
      loading.value = false
    }
  }

  const fetchDonationById = async (id) => {
    // Renamed from fetchCampaignById
    loading.value = true
    error.value = null
    currentDonation.value = null // Reset before fetching
    try {
      currentDonation.value = await getDonationById(id) // Use renamed service function
      if (!currentDonation.value) {
        throw new Error('Derma tidak dijumpai.') // Updated error message
      }
    } catch (err) {
      error.value = err.message || 'Ralat semasa memuatkan butiran derma.' // Updated error message
    } finally {
      loading.value = false
    }
  }

  return {
    donations, // Export renamed state
    currentDonation, // Export renamed state
    loading,
    error,
    fetchAllDonations, // Export renamed action
    fetchDonationById, // Export renamed action
  }
})
