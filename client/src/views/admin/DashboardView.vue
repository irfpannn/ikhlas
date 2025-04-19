<template>
  <div class="p-5 max-w-7xl mx-auto">
    <!-- Header -->
    <header class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-slate-800">Admin Dashboard</h1>
      <Button @click="handleLogout" variant="destructive" size="sm"> Logout </Button>
    </header>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card class="bg-white">
        <CardContent class="p-4 text-center">
          <CardTitle class="text-sm font-medium text-slate-500 mb-1">Total Users</CardTitle>
          <p class="text-2xl font-bold text-emerald-600">{{ totalUsers }}</p>
        </CardContent>
      </Card>

      <Card class="bg-white">
        <CardContent class="p-4 text-center">
          <CardTitle class="text-sm font-medium text-slate-500 mb-1">Total Zakat (RM)</CardTitle>
          <p class="text-2xl font-bold text-emerald-600">RM {{ totalZakatRM.toFixed(2) }}</p>
        </CardContent>
      </Card>

      <Card class="bg-white">
        <CardContent class="p-4 text-center">
          <CardTitle class="text-sm font-medium text-slate-500 mb-1"
            >Total Zakat (Crypto)</CardTitle
          >
          <p class="text-2xl font-bold text-emerald-600">{{ totalZakatCrypto.toFixed(8) }} BTC</p>
        </CardContent>
      </Card>

      <Card class="bg-white">
        <CardContent class="p-4 text-center">
          <CardTitle class="text-sm font-medium text-slate-500 mb-1">Distributed Zakat</CardTitle>
          <p class="text-2xl font-bold text-emerald-600">RM {{ totalDistributedRM.toFixed(2) }}</p>
        </CardContent>
      </Card>
    </div>

    <!-- Tabs -->
    <Tabs v-model="activeTab" class="w-full">
      <TabsList class="w-full overflow-x-auto border-b border-slate-200 mb-6">
        <TabsTrigger value="payments" class="px-4 py-2">Zakat Payments</TabsTrigger>
        <!-- <TabsTrigger value="distributions" class="px-4 py-2">Zakat Distributions</TabsTrigger> -->
        <TabsTrigger value="distributions2" class="px-4 py-2">Zakat Distributions</TabsTrigger>
        <TabsTrigger value="asnaf" class="px-4 py-2">Asnaf Listing</TabsTrigger>
        <TabsTrigger value="reports" class="px-4 py-2">Asnaf Reports</TabsTrigger>
        <TabsTrigger value="impact" class="px-4 py-2">Impact Monitoring</TabsTrigger>
        <TabsTrigger value="living-condition" class="px-4 py-2">Asnaf Living Condition</TabsTrigger>
        <TabsTrigger value="admin" class="px-4 py-2">Admin Tools</TabsTrigger>
      </TabsList>

      <TabsContent value="payments">
        <payments-tab
          :zakat-payments="zakatPayments"
          :loading="loading"
          @update-payment-status="updatePaymentStatus"
        />
      </TabsContent>

      <!-- <TabsContent value="distributions">
        <distributions-tab
          :zakat-distributions="zakatDistributions"
          :loading="loadingDistributions"
          :grouped-asnaf="groupedAsnaf"
          :available-payments="availablePayments"
          :available-zakat-funds="availableZakatFunds"
          @save-distribution="saveDistribution"
          @show-add-asnaf-modal="showAddAsnafModal = true"
          @handle-file-upload="handleFileUpload"
          @handle-asnaf-selection="handleAsnafSelection"
        />
      </TabsContent> -->

      <TabsContent value="distributions2">
        <zakat-distribution-view />
      </TabsContent>

      <TabsContent value="asnaf">
        <asnaf-listing-tab
          :grouped-asnaf="groupedAsnaf"
          :loading="loadingAsnaf"
          @add-new-asnaf="addNewAsnaf"
          @edit-asnaf="editAsnaf"
          @validate-asnaf-eligibility="validateAsnafEligibility"
          @batch-validate-all-asnaf="batchValidateAllAsnaf"
          @show-assess-eligibility-modal="showAssessEligibilityModal = true"
        />
      </TabsContent>

      <TabsContent value="reports">
        <reports-tab
          :reports="asnafReports"
          :loading="loadingReports"
          @verify-report="verifyReport"
          @reject-report="rejectReport"
          @convert-to-asnaf="convertReportToAsnaf"
          @view-image="viewImage"
        />
      </TabsContent>

      <TabsContent value="impact">
        <impact-tab
          :impact-data="impactData"
          :asnaf-locations="asnafLocations"
          @save-impact-story="saveImpactStory"
          @handle-story-image-upload="handleStoryImageUpload"
          @remove-story-image="removeStoryImage"
          @view-image="viewImage"
        />
      </TabsContent>

      <TabsContent value="living-condition">
        <living-condition-tab />
      </TabsContent>

      <TabsContent value="admin">
        <admin-tools-tab
          @import-asnaf-data="importAsnafDataToFirebase"
          @export-asnaf-data="exportAsnafDataFromFirebase"
          @import-zakat-payments="importZakatPaymentsToFirebase"
          @export-zakat-payments="exportZakatPaymentsFromFirebase"
          @import-zakat-distributions="importZakatDistributionsToFirebase"
          @export-zakat-distributions="exportZakatDistributionsFromFirebase"
          @import-asnaf-reports="importAsnafReportsToFirebase"
          @export-asnaf-reports="exportAsnafReportsFromFirebase"
          @view-model-details="viewModelDetails"
          @show-batch-assessment="showBatchAssessmentModal = true"
        />
      </TabsContent>
    </Tabs>
  </div>
</template>

<script setup>
// Imports
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth, signOut } from 'firebase/auth'

// Import shadcn components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

// Import all dashboard tab components
import {
  PaymentsTab,
  DistributionsTab,
  AsnafListingTab,
  ReportsTab,
  ImpactTab,
  LivingConditionTab,
  AdminToolsTab,
} from '@/components/dashboard'

// Import ZakatDistributionView component
import ZakatDistributionView from '@/views/admin/ZakatDistribution.vue'

// Import mock data
import zakatPaymentsData from '@/data/zakatPayments.json'
import zakatDistributionsData from '@/data/zakatDistributions.json'
import asnafRecipientsData from '@/data/asnafRecipients.json'
import asnafReportsData from '@/data/asnafReports.json'
import asnafLocationsData from '@/data/asnafLocations.json'
import impactDataJson from '@/data/impactData.json'


// Setup
const router = useRouter()

// Refs
const zakatPayments = ref([])
const zakatDistributions = ref([])
const asnafRecipients = ref([])
const asnafReports = ref([])
const asnafLocations = ref([])
const impactData = ref({})
const availablePayments = ref([])

const loading = ref(true)
const loadingDistributions = ref(true)
const loadingAsnaf = ref(true)
const loadingReports = ref(true)

const activeTab = ref('payments')
const showAddAsnafModal = ref(false)
const showAssessEligibilityModal = ref(false)
const showBatchAssessmentModal = ref(false)
const selectedImage = ref(null)

// Computed properties
const totalUsers = computed(() => {
  const uniqueUsers = new Set(zakatPayments.value.map((payment) => payment.userId))
  return uniqueUsers.size
})

const totalZakatRM = computed(() => {
  return zakatPayments.value.reduce((total, payment) => {
    return total + payment.amountRM
  }, 0)
})

const totalZakatCrypto = computed(() => {
  return zakatPayments.value.reduce((total, payment) => {
    return total + payment.amountCrypto
  }, 0)
})

const totalDistributedRM = computed(() => {
  return zakatDistributions.value.reduce((total, dist) => {
    return total + dist.amountRM
  }, 0)
})

const availableZakatFunds = computed(() => {
  return totalZakatRM.value - totalDistributedRM.value
})

const groupedAsnaf = computed(() => {
  const grouped = {}
  const categories = [
    'Poor (Fakir)',
    'Needy (Miskin)',
    'Zakat Administrator (Amil)',
    'New Muslim (Muallaf)',
    'To Free Slaves (Riqab)',
    'Debtor (Gharimin)',
    "Allah's Cause (Fi Sabilillah)",
    'Traveler (Ibnus Sabil)',
  ]

  categories.forEach((category) => {
    grouped[category] = []
  })

  asnafRecipients.value.forEach((asnaf) => {
    if (grouped[asnaf.category]) {
      grouped[asnaf.category].push(asnaf)
    } else {
      if (!grouped['Other']) grouped['Other'] = []
      grouped['Other'].push(asnaf)
    }
  })

  return grouped
})

// Load data
onMounted(async () => {
  await Promise.all([
    fetchZakatPayments(),
    fetchZakatDistributions(),
    fetchAsnafRecipients(),
    fetchAsnafReports(),
    fetchAsnafLocations(),
    fetchImpactData(),
  ])

  fetchAvailablePayments()
})

// Data fetching methods
const fetchZakatPayments = async () => {
  try {
    loading.value = true
    const payments = zakatPaymentsData.map((payment) => ({
      ...payment,
      date: new Date(payment.date),
      amountRM: Number(payment.amountRM),
      amountCrypto: Number(payment.amountCrypto),
    }))
    zakatPayments.value = payments
  } catch (error) {
    console.error('Error fetching zakat payments:', error)
  } finally {
    loading.value = false
  }
}

const fetchZakatDistributions = async () => {
  try {
    loadingDistributions.value = true
    const distributions = zakatDistributionsData.map((distribution) => ({
      ...distribution,
      date: new Date(distribution.date),
      amountRM: Number(distribution.amountRM),
    }))
    zakatDistributions.value = distributions
  } catch (error) {
    console.error('Error fetching zakat distributions:', error)
  } finally {
    loadingDistributions.value = false
  }
}

const fetchAsnafRecipients = async () => {
  try {
    loadingAsnaf.value = true
    asnafRecipients.value = asnafRecipientsData
  } catch (error) {
    console.error('Error fetching asnaf recipients:', error)
  } finally {
    loadingAsnaf.value = false
  }
}

const fetchAsnafReports = async () => {
  try {
    loadingReports.value = true
    asnafReports.value = asnafReportsData
  } catch (error) {
    console.error('Error fetching asnaf reports:', error)
  } finally {
    loadingReports.value = false
  }
}

const fetchAsnafLocations = async () => {
  try {
    asnafLocations.value = asnafLocationsData
  } catch (error) {
    console.error('Error fetching asnaf locations:', error)
  }
}

const fetchImpactData = async () => {
  try {
    impactData.value = impactDataJson
  } catch (error) {
    console.error('Error fetching impact data:', error)
  }
}

const fetchAvailablePayments = () => {
  availablePayments.value = zakatPayments.value
    .filter(
      (payment) =>
        payment.status === 'Approved' &&
        (!payment.usedAmount || payment.usedAmount < payment.amountRM),
    )
    .map((payment) => ({
      ...payment,
      remainingAmount: payment.usedAmount
        ? payment.amountRM - payment.usedAmount
        : payment.amountRM,
    }))
}

// Action handlers
const handleLogout = async () => {
  try {
    const auth = getAuth()
    await signOut(auth)
    router.push('/login')
  } catch (error) {
    console.error('Error signing out:', error)
  }
}

const updatePaymentStatus = (paymentId, status) => {
  const index = zakatPayments.value.findIndex((p) => p.id === paymentId)
  if (index !== -1) {
    zakatPayments.value[index].status = status
  }
  fetchAvailablePayments()
}

const handleAsnafSelection = (asnafId) => {
  console.log('Asnaf selected:', asnafId)
}

const handleFileUpload = (event, progressCallback, completionCallback) => {
  setTimeout(() => {
    progressCallback(100)
    completionCallback('https://example.com/uploads/sample.jpg')
  }, 1500)
}

const saveDistribution = (distributionData) => {
  if (distributionData.id) {
    const index = zakatDistributions.value.findIndex((d) => d.id === distributionData.id)
    if (index !== -1) {
      zakatDistributions.value[index] = {
        ...zakatDistributions.value[index],
        ...distributionData,
      }
    }
  } else {
    const newId = Date.now().toString()
    zakatDistributions.value.push({
      id: newId,
      ...distributionData,
      date: new Date(),
    })
  }

  if (distributionData.sourcePayments) {
    distributionData.sourcePayments.forEach((paymentId) => {
      const paymentIndex = zakatPayments.value.findIndex((p) => p.id === paymentId)
      if (paymentIndex !== -1) {
        if (!zakatPayments.value[paymentIndex].usedAmount) {
          zakatPayments.value[paymentIndex].usedAmount = 0
        }
        zakatPayments.value[paymentIndex].usedAmount +=
          distributionData.amountRM / distributionData.sourcePayments.length
      }
    })
  }

  fetchAvailablePayments()
}

const addNewAsnaf = () => {
  showAddAsnafModal.value = true
}

const editAsnaf = (asnaf) => {
  console.log('Edit asnaf:', asnaf)
  showAddAsnafModal.value = true
}

const validateAsnafEligibility = (asnaf) => {
  console.log('Validate asnaf eligibility:', asnaf)
}

const batchValidateAllAsnaf = () => {
  console.log('Batch validate all asnaf')
}

const verifyReport = (report, notes) => {
  console.log('Verify report:', report, 'Notes:', notes)
}

const rejectReport = (report, notes) => {
  console.log('Reject report:', report, 'Notes:', notes)
}

const convertReportToAsnaf = (report, conversionData) => {
  console.log('Convert report to asnaf:', report, 'Conversion data:', conversionData)
}

const viewImage = (imageUrl) => {
  selectedImage.value = imageUrl
}

const saveImpactStory = (storyData) => {
  console.log('Save impact story:', storyData)
}

const handleStoryImageUpload = (event, progressCallback, completionCallback) => {
  setTimeout(() => {
    progressCallback(100)
    completionCallback(['https://example.com/uploads/story1.jpg'])
  }, 1500)
}

const removeStoryImage = (image) => {
  console.log('Remove story image:', image)
}

const importAsnafDataToFirebase = () => {
  console.log('Import asnaf data to Firebase')
}

const exportAsnafDataFromFirebase = () => {
  console.log('Export asnaf data from Firebase')
}

const importZakatPaymentsToFirebase = () => {
  console.log('Import zakat payments to Firebase')
}

const exportZakatPaymentsFromFirebase = () => {
  console.log('Export zakat payments from Firebase')
}

const importZakatDistributionsToFirebase = () => {
  console.log('Import zakat distributions to Firebase')
}

const exportZakatDistributionsFromFirebase = () => {
  console.log('Export zakat distributions from Firebase')
}

const importAsnafReportsToFirebase = () => {
  console.log('Import asnaf reports to Firebase')
}

const exportAsnafReportsFromFirebase = () => {
  console.log('Export asnaf reports from Firebase')
}

const viewModelDetails = () => {
  console.log('View model details')
}
</script>
