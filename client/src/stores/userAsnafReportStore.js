// userAsnafReportStore.js
// Store for managing Asnaf reporting state and operations

import { ref } from 'vue'
import { defineStore } from 'pinia'
import {
  submitAsnafReport,
  fetchAsnafReports,
  verifyAsnafReport,
  rejectAsnafReport,
  convertToAsnaf,
} from '@/services/userAsnafReportService'

export const useUserAsnafReportStore = defineStore('userAsnafReportStore', () => {
  // State
  const isSubmitting = ref(false)
  const isSuccess = ref(false)
  const rewardPoints = ref(Math.floor(Math.random() * 30) + 20) // Random points between 20-49
  const errors = ref({})

  // Admin state
  const reports = ref([])
  const isLoading = ref(false)
  const verifyingId = ref(null)
  const rejectingId = ref(null)

  // Form data
  const formData = ref({
    name: '',
    address: '',
    phoneNumber: '',
    description: '',
    location: null,
    images: [],
  })

  // Reset form state
  const resetForm = () => {
    formData.value = {
      name: '',
      address: '',
      phoneNumber: '',
      description: '',
      location: null,
      images: [],
    }
    errors.value = {}
    isSubmitting.value = false
    isSuccess.value = false
    rewardPoints.value = Math.floor(Math.random() * 30) + 20 // Generate new reward points
  }

  // Handle location selection
  const handleLocationSelect = () => {
    // In a real implementation, this would open a map interface
    // For now, we'll just set a mock location
    formData.value.location = {
      latitude: 3.139,
      longitude: 101.6869,
      address: 'Kuala Lumpur, Malaysia',
    }
  }

  // Handle image upload
  const handleImageUpload = (event) => {
    const files = event.target.files
    if (!files.length) return

    // Preview images
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const reader = new FileReader()

      reader.onload = (e) => {
        formData.value.images.push({
          id: Date.now() + i,
          url: e.target.result,
          file: file,
        })
      }

      reader.readAsDataURL(file)
    }
  }

  // Remove image
  const removeImage = (imageId) => {
    formData.value.images = formData.value.images.filter((img) => img.id !== imageId)
  }

  // Validate form
  const validateForm = () => {
    errors.value = {}

    if (!formData.value.name.trim()) {
      errors.value.name = 'Nama diperlukan'
    }

    if (!formData.value.address.trim()) {
      errors.value.address = 'Alamat diperlukan'
    }

    if (!formData.value.description.trim()) {
      errors.value.description = 'Penerangan diperlukan'
    }

    if (!formData.value.location) {
      errors.value.location = 'Lokasi diperlukan'
    }

    return Object.keys(errors.value).length === 0
  }

  // Submit report
  const submitReport = async () => {
    if (!validateForm()) return

    isSubmitting.value = true

    try {
      // Use the service to submit the report
      const result = await submitAsnafReport({
        ...formData.value,
        rewardPoints: rewardPoints.value,
      })

      if (result.success) {
        isSuccess.value = true
        console.log('Report submitted successfully with ID:', result.docRef.id)
        return true
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error('Error in store while submitting report:', error)
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  // Admin functions

  // Fetch all asnaf reports
  const fetchReports = async () => {
    isLoading.value = true
    try {
      const result = await fetchAsnafReports()
      if (result.success) {
        reports.value = result.reports
        return result.reports
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error('Error fetching asnaf reports:', error)
      return []
    } finally {
      isLoading.value = false
    }
  }

  // Verify a report
  const verifyReport = async (report, notes = '') => {
    verifyingId.value = report.id
    try {
      const result = await verifyAsnafReport(report.id, notes)

      if (result.success) {
        // Update the report in the local state
        const index = reports.value.findIndex((r) => r.id === report.id)
        if (index !== -1) {
          reports.value[index].status = 'Verified'
          reports.value[index].verifiedDate = new Date()
          reports.value[index].notes = notes
        }
        return true
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error('Error verifying report:', error)
      return false
    } finally {
      verifyingId.value = null
    }
  }

  // Reject a report
  const rejectReport = async (report, notes = '') => {
    rejectingId.value = report.id
    try {
      const result = await rejectAsnafReport(report.id, notes)

      if (result.success) {
        // Update the report in the local state
        const index = reports.value.findIndex((r) => r.id === report.id)
        if (index !== -1) {
          reports.value[index].status = 'Rejected'
          reports.value[index].rejectedDate = new Date()
          reports.value[index].notes = notes
        }
        return true
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error('Error rejecting report:', error)
      return false
    } finally {
      rejectingId.value = null
    }
  }

  // Convert a report to an asnaf
  const convertReportToAsnaf = async (report, asnafData) => {
    try {
      const result = await convertToAsnaf(report.id, asnafData)

      if (result.success) {
        // Update the report in the local state
        const index = reports.value.findIndex((r) => r.id === report.id)
        if (index !== -1) {
          reports.value[index].status = 'Converted to Asnaf'
          reports.value[index].convertedDate = new Date()
        }
        return { success: true, asnafId: result.asnafId }
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error('Error converting report to asnaf:', error)
      return { success: false, error }
    }
  }

  return {
    // State
    formData,
    isSubmitting,
    isSuccess,
    rewardPoints,
    errors,
    reports,
    isLoading,
    verifyingId,
    rejectingId,

    // Actions
    handleLocationSelect,
    handleImageUpload,
    removeImage,
    submitReport,
    validateForm,
    resetForm,

    // Admin actions
    fetchReports,
    verifyReport,
    rejectReport,
    convertReportToAsnaf,
  }
})
