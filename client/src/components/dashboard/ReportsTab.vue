<template>
  <div class="space-y-8">
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6 border-b pb-4"
    >
      <h2 class="text-2xl font-bold tracking-tight">Asnaf Reports</h2>
      <div class="flex items-center gap-2">
        <Select v-model="reportStatusFilter">
          <SelectTrigger class="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reports</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="converted">Converted to Asnaf</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <Card v-if="asnafReportStore.isLoading" class="p-6 flex justify-center items-center">
      <Spinner class="mr-2" />
      <span>Loading reports...</span>
    </Card>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <Card v-for="report in filteredReports" :key="report.id" class="relative group shadow-md">
        <CardHeader class="pb-2 flex flex-row items-center justify-between border-b mb-2">
          <CardTitle class="text-base font-semibold">{{ report.name }}</CardTitle>
          <Badge :variant="statusVariant(report.status)">{{ report.status }}</Badge>
        </CardHeader>
        <CardContent class="space-y-3">
          <div class="text-sm text-muted-foreground space-y-1">
            <div>
              <span class="font-medium">Reported on:</span> {{ formatDate(report.reportDate) }}
            </div>
            <div><span class="font-medium">Address:</span> {{ report.address }}</div>
            <div v-if="report.phoneNumber">
              <span class="font-medium">Phone:</span> {{ report.phoneNumber }}
            </div>
            <div><span class="font-medium">Description:</span> {{ report.description }}</div>
            <div v-if="report.location">
              <span class="font-medium">Location:</span> {{ report.location.address }}
            </div>
          </div>
          <div v-if="report.images && report.images.length > 0" class="mt-2">
            <div class="flex flex-wrap gap-2">
              <div
                v-for="(image, index) in report.images"
                :key="index"
                class="w-16 h-16 rounded overflow-hidden border cursor-pointer relative group"
              >
                <img
                  :src="image.url"
                  alt="Report evidence"
                  class="object-cover w-full h-full"
                  @click="viewImage(image.url)"
                />
                <div
                  class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Button
                    size="icon"
                    variant="ghost"
                    class="h-7 w-7 rounded-full bg-white/80 hover:bg-white text-gray-800"
                    @click.stop="analyzeHousingCondition(image.url, report.id)"
                    :disabled="analyzingImageId === report.id"
                  >
                    <HomeIcon class="h-4 w-4" />
                  </Button>
                </div>
                <Badge
                  v-if="housingAnalysisResults[image.url]"
                  :variant="
                    getHousingClassVariant(housingAnalysisResults[image.url].classification)
                  "
                  class="absolute bottom-0 right-0 text-[8px] py-0.5"
                >
                  {{
                    translateHousingClass(housingAnalysisResults[image.url].classification).split(
                      ' ',
                    )[0]
                  }}
                </Badge>
              </div>
            </div>
          </div>
          <div class="flex flex-wrap gap-2 pt-3 items-center justify-center">
            <Button
              v-if="report.status === 'Pending'"
              size="md"
              variant="success"
              :loading="asnafReportStore.verifyingId === report.id"
              :disabled="
                asnafReportStore.verifyingId === report.id ||
                asnafReportStore.rejectingId === report.id
              "
              @click="onVerify(report)"
            >
              <CheckIcon class="h-4 w-4 mr-1" /> Verify
            </Button>
            <Button
              v-if="report.status === 'Pending'"
              size="default"
              variant="destructive"
              :loading="asnafReportStore.rejectingId === report.id"
              :disabled="
                asnafReportStore.verifyingId === report.id ||
                asnafReportStore.rejectingId === report.id
              "
              @click="onReject(report)"
            >
              <XIcon class="h-4 w-4 mr-1" /> Reject
            </Button>
            <Button
              v-if="report.status === 'Verified'"
              size="default"
              variant="secondary"
              @click="openConvertModal(report)"
            >
              <ArrowRightIcon class="h-4 w-4 mr-1" /> Convert to Asnaf
            </Button>
            <Button size="default" variant="outline" @click="viewReportDetails(report)">
              <EyeIcon class="h-4 w-4 mr-1" /> View Details
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card
        v-if="filteredReports.length === 0"
        class="flex items-center justify-center p-8 text-muted-foreground"
      >
        No reports found matching the selected filter
      </Card>
    </div>

    <!-- Report Details Dialog -->
    <Dialog :open="!!selectedReport" @update:open="selectedReport = null">
      <DialogContent class="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report Details: {{ selectedReport?.name }}</DialogTitle>
        </DialogHeader>
        <div class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 border-b pb-4">
            <div>
              <div class="mb-2">
                <Badge :variant="statusVariant(selectedReport?.status)">{{
                  selectedReport?.status
                }}</Badge>
              </div>
              <div class="text-sm text-muted-foreground space-y-1">
                <div>
                  <span class="font-medium">Reported on:</span>
                  {{ formatDate(selectedReport?.reportDate) }}
                </div>
                <div>
                  <span class="font-medium">Reported by:</span>
                  {{ selectedReport?.reportedBy || 'Anonymous' }}
                </div>
                <div v-if="selectedReport?.verifiedBy">
                  <span class="font-medium">Verified by:</span> {{ selectedReport?.verifiedBy }} on
                  {{ formatDate(selectedReport?.verifiedDate) }}
                </div>
                <div v-if="selectedReport?.rejectedBy">
                  <span class="font-medium">Rejected by:</span> {{ selectedReport?.rejectedBy }} on
                  {{ formatDate(selectedReport?.rejectedDate) }}
                </div>
              </div>
            </div>
            <div>
              <div class="text-sm text-muted-foreground space-y-1">
                <div><span class="font-medium">Name:</span> {{ selectedReport?.name }}</div>
                <div><span class="font-medium">Address:</span> {{ selectedReport?.address }}</div>
                <div v-if="selectedReport?.phoneNumber">
                  <span class="font-medium">Phone Number:</span> {{ selectedReport?.phoneNumber }}
                </div>
                <div v-if="selectedReport?.location">
                  <span class="font-medium">Location:</span> {{ selectedReport?.location.address }}
                </div>
                <div v-if="selectedReport?.location">
                  <span class="font-medium">Coordinates:</span> Lat:
                  {{ selectedReport?.location.latitude }}, Long:
                  {{ selectedReport?.location.longitude }}
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 class="font-semibold mb-1">Situation Description</h3>
            <p>{{ selectedReport?.description }}</p>
            <div v-if="selectedReport?.notes" class="mt-2">
              <h4 class="font-medium">Additional Notes</h4>
              <p>{{ selectedReport?.notes }}</p>
            </div>
          </div>
          <div v-if="selectedReport?.images && selectedReport?.images.length > 0" class="mt-4">
            <h3 class="font-semibold mb-1">
              Evidence Images ({{ selectedReport?.images.length }})
            </h3>
            <div class="flex flex-wrap gap-2">
              <div
                v-for="(image, index) in selectedReport.images"
                :key="index"
                class="w-24 h-24 rounded overflow-hidden border cursor-pointer"
                @click="viewImage(image.url)"
              >
                <img :src="image.url" alt="Report evidence" class="object-cover w-full h-full" />
              </div>
            </div>
          </div>
          <div
            v-if="selectedReport?.status === 'Pending' || selectedReport?.status === 'Verified'"
            class="mt-4"
          >
            <div v-if="selectedReport?.status === 'Pending'">
              <h3 class="font-semibold mb-2">Take Action</h3>
              <Textarea
                v-model="reportActionNotes"
                placeholder="Add notes about this report"
                rows="3"
              />
              <div class="flex gap-2 mt-2">
                <Button
                  variant="success"
                  :loading="asnafReportStore.verifyingId === selectedReport?.id"
                  :disabled="
                    asnafReportStore.verifyingId === selectedReport?.id ||
                    asnafReportStore.rejectingId === selectedReport?.id
                  "
                  @click="onVerify(selectedReport)"
                  ><CheckIcon class="h-4 w-4 mr-1" /> Verify Report</Button
                >
                <Button
                  variant="destructive"
                  :loading="asnafReportStore.rejectingId === selectedReport?.id"
                  :disabled="
                    asnafReportStore.verifyingId === selectedReport?.id ||
                    asnafReportStore.rejectingId === selectedReport?.id
                  "
                  @click="onReject(selectedReport)"
                  ><XIcon class="h-4 w-4 mr-1" /> Reject Report</Button
                >
              </div>
            </div>
            <div v-if="selectedReport?.status === 'Verified'">
              <h3 class="font-semibold mb-2">Convert to Asnaf</h3>
              <p class="text-muted-foreground mb-2">
                Convert this verified report into an asnaf recipient record
              </p>
              <Button variant="secondary" @click="openConvertModal(selectedReport)"
                ><ArrowRightIcon class="h-4 w-4 mr-1" /> Convert to Asnaf</Button
              >
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Image Viewer Dialog -->
    <Dialog :open="!!selectedImage" @update:open="selectedImage = null">
      <DialogContent class="max-w-2xl p-0">
        <div class="relative">
          <img :src="selectedImage" alt="Report evidence" class="w-full h-auto rounded" />

          <!-- Housing Analysis Results -->
          <div
            v-if="selectedImage && housingAnalysisResults[selectedImage]"
            class="p-4 bg-white border-t"
          >
            <div class="flex justify-between items-center mb-3">
              <h3 class="font-semibold flex items-center gap-2">
                <HomeIcon class="h-4 w-4" />
                House Condition Analysis
              </h3>
              <Badge
                :variant="
                  getHousingClassVariant(housingAnalysisResults[selectedImage].classification)
                "
              >
                {{
                  translateHousingClass(housingAnalysisResults[selectedImage].classification).split(
                    ' ',
                  )[0]
                }}
              </Badge>
            </div>

            <div class="space-y-2">
              <div
                v-for="(probability, className) in housingAnalysisResults[selectedImage]
                  .probabilities"
                :key="className"
                class="space-y-1"
              >
                <div class="flex justify-between text-sm">
                  <span>{{ translateHousingClass(className) }}</span>
                  <span class="font-medium">{{ (probability * 100).toFixed(1) }}%</span>
                </div>
                <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full"
                    :class="{
                      'bg-green-500': className === 'baik',
                      'bg-yellow-500': className === 'sederhana',
                      'bg-red-500': className === 'dhoif',
                    }"
                    :style="{ width: `${probability * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>

            <div class="mt-4 text-sm text-gray-500">
              <p v-if="housingAnalysisResults[selectedImage].classification === 'dhoif'">
                This house appears to be in poor condition and may require significant repairs.
              </p>
              <p v-else-if="housingAnalysisResults[selectedImage].classification === 'sederhana'">
                This house appears to be in moderate condition and may benefit from some
                improvements.
              </p>
              <p v-else>This house appears to be in good condition.</p>
            </div>
          </div>

          <div v-else-if="selectedImage" class="p-4 border-t">
            <Button
              @click="analyzeHousingCondition(selectedImage)"
              variant="outline"
              size="sm"
              class="flex items-center gap-2"
              :disabled="analyzingImageId !== null"
            >
              <BarChart class="h-4 w-4" />
              Analyze House Condition
              <Spinner v-if="analyzingImageId !== null" />
            </Button>
          </div>
        </div>

        <DialogFooter class="p-4">
          <Button variant="outline" @click="selectedImage = null">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Convert to Asnaf Dialog -->
    <Dialog :open="showConvertModal" @update:open="showConvertModal = $event">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Convert to Asnaf</DialogTitle>
        </DialogHeader>
        <div class="space-y-4">
          <Select v-model="conversionCategory">
            <SelectTrigger><SelectValue placeholder="Select Asnaf Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Poor (Fakir)">Poor (Fakir)</SelectItem>
              <SelectItem value="Needy (Miskin)">Needy (Miskin)</SelectItem>
              <SelectItem value="Zakat Administrator (Amil)">Zakat Administrator (Amil)</SelectItem>
              <SelectItem value="New Muslim (Muallaf)">New Muslim (Muallaf)</SelectItem>
              <SelectItem value="To Free Slaves (Riqab)">To Free Slaves (Riqab)</SelectItem>
              <SelectItem value="Debtor (Gharimin)">Debtor (Gharimin)</SelectItem>
              <SelectItem value="Allah's Cause (Fi Sabilillah)"
                >Allah's Cause (Fi Sabilillah)</SelectItem
              >
              <SelectItem value="Traveler (Ibnus Sabil)">Traveler (Ibnus Sabil)</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            v-model="conversionNeeds"
            placeholder="Describe the needs of this asnaf"
            rows="4"
          />
          <DialogFooter>
            <Button variant="outline" @click="showConvertModal = false">Cancel</Button>
            <Button variant="default" @click="confirmConvertToAsnaf" :disabled="!conversionCategory"
              >Convert to Asnaf</Button
            >
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { EyeIcon, CheckIcon, XIcon, ArrowRightIcon, HomeIcon, BarChart } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import {
  analyzeHouseImage,
  translateHousingClass,
  getHousingClassVariant,
} from '@/services/housingAnalysisService'
import { useUserAsnafReportStore } from '@/stores/userAsnafReportStore'

// Use the asnaf report store
const asnafReportStore = useUserAsnafReportStore()

// Local state
const reportStatusFilter = ref('all')
const selectedReport = ref(null)
const selectedImage = ref(null)
const showConvertModal = ref(false)
const conversionCategory = ref('')
const conversionNeeds = ref('')
const reportActionNotes = ref('')
const reportToConvert = ref(null)
const analyzingImageId = ref(null)
const housingAnalysisResults = ref({}) // Store analysis results by image URL

// Fetch reports on component mount
onMounted(async () => {
  await asnafReportStore.fetchReports()
})

const filteredReports = computed(() => {
  if (reportStatusFilter.value === 'all') {
    return asnafReportStore.reports
  }
  return asnafReportStore.reports.filter((report) => {
    if (reportStatusFilter.value === 'pending') return report.status === 'Pending'
    if (reportStatusFilter.value === 'verified') return report.status === 'Verified'
    if (reportStatusFilter.value === 'rejected') return report.status === 'Rejected'
    if (reportStatusFilter.value === 'converted') return report.status === 'Converted to Asnaf'
    return true
  })
})

function formatDate(date) {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function viewReportDetails(report) {
  selectedReport.value = report
  reportActionNotes.value = report.notes || ''
}

function viewImage(imageUrl) {
  selectedImage.value = imageUrl
}

async function onVerify(report) {
  const success = await asnafReportStore.verifyReport(report, reportActionNotes.value)
  if (success) {
    toast.success('Report verified successfully!')
    if (selectedReport.value) {
      selectedReport.value = null
    }
  } else {
    toast.error('Failed to verify report')
  }
}

async function onReject(report) {
  const success = await asnafReportStore.rejectReport(report, reportActionNotes.value)
  if (success) {
    toast('Report rejected.', { description: 'The report has been rejected.' })
    if (selectedReport.value) {
      selectedReport.value = null
    }
  } else {
    toast.error('Failed to reject report')
  }
}

function openConvertModal(report) {
  reportToConvert.value = report
  conversionCategory.value = ''
  conversionNeeds.value = report.description || ''
  showConvertModal.value = true
}

async function confirmConvertToAsnaf() {
  if (!conversionCategory.value) {
    toast.error('Please select an Asnaf category')
    return
  }

  const result = await asnafReportStore.convertReportToAsnaf(reportToConvert.value, {
    category: conversionCategory.value,
    needs: conversionNeeds.value,
  })

  if (result.success) {
    toast.success('Report converted to Asnaf!')
    showConvertModal.value = false
    if (selectedReport.value) {
      selectedReport.value = null
    }
  } else {
    toast.error('Failed to convert report to Asnaf')
  }
}

function statusVariant(status) {
  if (status === 'Pending') return 'warning'
  if (status === 'Verified') return 'success'
  if (status === 'Rejected') return 'destructive'
  if (status === 'Converted to Asnaf') return 'secondary'
  return 'secondary'
}

// Housing condition analysis
async function analyzeHousingCondition(imageUrl, reportId) {
  if (housingAnalysisResults.value[imageUrl]) {
    // If we already analyzed this image, just return the cached result
    return housingAnalysisResults.value[imageUrl]
  }

  try {
    analyzingImageId.value = reportId
    const result = await analyzeHouseImage(imageUrl)

    // Store the result by image URL for future reference
    housingAnalysisResults.value[imageUrl] = result
    return result
  } catch (error) {
    toast.error('Failed to analyze house image', {
      description: error.message || 'Please try again later',
    })
    return null
  } finally {
    analyzingImageId.value = null
  }
}

const Spinner = {
  name: 'Spinner',
  template: `<div class="animate-spin h-4 w-4 border-2 border-current border-t-transparent text-primary rounded-full"></div>`,
}
</script>
