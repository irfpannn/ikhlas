<template>
  <div class="p-4 sm:p-6 space-y-6">
    <div class="space-y-6">
      <!-- Filters -->
      <ImpactTabFilters
        :impactTimeRange="impactTimeRange"
        :impactCategoryFilter="impactCategoryFilter"
        @update:impactTimeRange="(val) => (impactTimeRange = val)"
        @update:impactCategoryFilter="(val) => (impactCategoryFilter = val)"
      />

      <!-- Impact Metrics -->
      <ImpactTabMetrics
        :metrics="{
          totalBeneficiaries: filteredImpactData.totalBeneficiaries,
          beneficiaryChange: beneficiaryChange,
          totalDistributed: filteredImpactData.totalDistributed,
          distributionChange: distributionChange,
          averagePerBeneficiary: filteredImpactData.averagePerBeneficiary,
          uniqueDonors: filteredImpactData.uniqueDonors,
        }"
      />

      <!-- Charts -->
      <ImpactTabCharts
        :categoryDistribution="filteredImpactData.categoryDistribution"
        :totalDistributed="filteredImpactData.totalDistributed"
        :monthlyTrend="filteredImpactData.monthlyTrend"
        :maxMonthlyAmount="maxMonthlyAmount"
      />

      <!-- Asnaf Recipients Heatmap -->
      <ImpactTabHeatmap :locations="asnafLocations" />

      <!-- Impact Stories -->
      <ImpactTabStories
        :stories="filteredImpactData.impactStories"
        :formatDate="formatDate"
        @add-story="showAddStoryModal()"
        @edit-story="editImpactStory"
        @view-story="viewImpactStoryDetails"
      />

      <!-- Outcome Metrics -->
      <ImpactTabOutcomes :outcomes="filteredImpactData.outcomes" />
    </div>

    <!-- Add/Edit Impact Story Dialog -->
    <Dialog v-model:open="isDialogOpen">
      <DialogContent class="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{{
            editingStory ? 'Edit Impact Story' : 'Add New Impact Story'
          }}</DialogTitle>
          <DialogDescription>
            Fill in the details for this impact story. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <form @submit.prevent="saveImpactStory" class="space-y-4 py-4">
          <div class="grid w-full items-center gap-1.5">
            <Label for="storyTitle">Title</Label>
            <Input
              id="storyTitle"
              v-model="storyForm.title"
              placeholder="Enter story title"
              required
            />
          </div>

          <div class="grid w-full items-center gap-1.5">
            <Label for="storyDescription">Description</Label>
            <Textarea
              id="storyDescription"
              v-model="storyForm.description"
              placeholder="Describe the impact story"
              rows="4"
              required
            />
          </div>

          <div class="grid w-full items-center gap-1.5">
            <Label for="storyCategory">Category</Label>
            <Select v-model="storyForm.category">
              <SelectTrigger id="storyCategory" aria-label="Select category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Poor">Poor (Fakir)</SelectItem>
                <SelectItem value="Needy">Needy (Miskin)</SelectItem>
                <SelectItem value="Zakat Administrator">Zakat Administrator (Amil)</SelectItem>
                <SelectItem value="New Muslim">New Muslim (Muallaf)</SelectItem>
                <SelectItem value="Slave">To Free Slaves (Riqab)</SelectItem>
                <SelectItem value="Debtor">Debtor (Gharimin)</SelectItem>
                <SelectItem value="Allah's Cause">Allah's Cause (Fi Sabilillah)</SelectItem>
                <SelectItem value="Traveler">Traveler (Ibnus Sabil)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="grid w-full items-center gap-1.5">
              <Label for="storyBeneficiaries">Number of Beneficiaries</Label>
              <Input
                id="storyBeneficiaries"
                v-model="storyForm.beneficiaries"
                type="number"
                min="1"
                required
              />
            </div>

            <div class="grid w-full items-center gap-1.5">
              <Label for="storyAmount">Amount Distributed (RM)</Label>
              <Input
                id="storyAmount"
                v-model="storyForm.amount"
                type="number"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          <div class="grid w-full items-center gap-1.5">
            <Label>Outcomes</Label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              <div class="flex items-center space-x-2">
                <Checkbox
                  id="storyOutcomeEducation"
                  v-model:checked="storyForm.outcomes.education"
                />
                <Label for="storyOutcomeEducation" class="text-sm font-normal"
                  >Education Support</Label
                >
              </div>
              <div class="flex items-center space-x-2">
                <Checkbox id="storyOutcomeHousing" v-model:checked="storyForm.outcomes.housing" />
                <Label for="storyOutcomeHousing" class="text-sm font-normal"
                  >Housing Improvement</Label
                >
              </div>
              <div class="flex items-center space-x-2">
                <Checkbox id="storyOutcomeMedical" v-model:checked="storyForm.outcomes.medical" />
                <Label for="storyOutcomeMedical" class="text-sm font-normal"
                  >Medical Assistance</Label
                >
              </div>
              <div class="flex items-center space-x-2">
                <Checkbox id="storyOutcomeBusiness" v-model:checked="storyForm.outcomes.business" />
                <Label for="storyOutcomeBusiness" class="text-sm font-normal"
                  >Business Support</Label
                >
              </div>
            </div>
          </div>

          <div class="grid w-full items-center gap-1.5">
            <Label for="storyImages">Images</Label>
            <div class="flex items-center gap-2">
              <Label
                for="storyImages"
                class="cursor-pointer flex items-center gap-2 px-4 py-2 bg-muted rounded-md hover:bg-muted/80 border"
              >
                <UploadIcon class="h-4 w-4" />
                <span>Upload Images</span>
              </Label>
              <Input
                id="storyImages"
                type="file"
                class="hidden"
                @change="handleStoryImageUpload"
                accept="image/*"
                multiple
              />
            </div>

            <!-- Upload progress -->
            <div
              v-if="storyUploadProgress > 0 && storyUploadProgress < 100"
              class="w-full bg-muted rounded-full h-2 mt-2"
            >
              <div
                class="bg-primary h-2 rounded-full"
                :style="{ width: storyUploadProgress + '%' }"
              ></div>
              <span class="text-xs mt-1">{{ storyUploadProgress }}% uploaded</span>
            </div>

            <!-- Image previews -->
            <div
              v-if="storyForm.images && storyForm.images.length > 0"
              class="grid grid-cols-3 gap-2 mt-2"
            >
              <div
                v-for="(image, index) in storyForm.images"
                :key="index"
                class="relative border rounded-md overflow-hidden aspect-square"
              >
                <img :src="image.url" alt="Story image" class="h-full w-full object-cover" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  class="absolute top-1 right-1 h-6 w-6 rounded-full"
                  @click="removeStoryImage(index)"
                >
                  <XIcon class="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" class="mr-2" @click="isDialogOpen = false"
              >Cancel</Button
            >
            <Button type="submit" :disabled="storyUploading">
              {{ editingStory ? 'Update' : 'Save' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Impact Story Details Dialog -->
    <Dialog v-model:open="isDetailsDialogOpen">
      <DialogContent v-if="selectedStory" class="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{{ selectedStory.title }}</DialogTitle>
          <DialogDescription>
            <Badge variant="outline">{{ formatDate(selectedStory.date) }}</Badge>
          </DialogDescription>
        </DialogHeader>

        <div class="py-4 space-y-6">
          <div>
            <h3 class="font-medium mb-1">Description</h3>
            <p class="text-sm text-muted-foreground">{{ selectedStory.description }}</p>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div class="flex flex-col">
              <span class="text-sm text-muted-foreground">Category</span>
              <span class="font-medium">{{ selectedStory.category }}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-sm text-muted-foreground">Beneficiaries</span>
              <span class="font-medium">{{ selectedStory.beneficiaries }}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-sm text-muted-foreground">Amount</span>
              <span class="font-medium">RM {{ selectedStory.amount.toFixed(2) }}</span>
            </div>
          </div>

          <div
            v-if="
              selectedStory.outcomes.education ||
              selectedStory.outcomes.housing ||
              selectedStory.outcomes.medical ||
              selectedStory.outcomes.business
            "
          >
            <h3 class="font-medium mb-2">Outcomes</h3>
            <div class="grid grid-cols-2 gap-2">
              <div
                v-if="selectedStory.outcomes.education"
                class="flex items-center gap-2 p-2 bg-muted/50 rounded"
              >
                <BookIcon class="h-4 w-4 text-primary" />
                <span class="text-sm">Education Support</span>
              </div>
              <div
                v-if="selectedStory.outcomes.housing"
                class="flex items-center gap-2 p-2 bg-muted/50 rounded"
              >
                <HomeIcon class="h-4 w-4 text-primary" />
                <span class="text-sm">Housing Improvement</span>
              </div>
              <div
                v-if="selectedStory.outcomes.medical"
                class="flex items-center gap-2 p-2 bg-muted/50 rounded"
              >
                <HeartIcon class="h-4 w-4 text-primary" />
                <span class="text-sm">Medical Assistance</span>
              </div>
              <div
                v-if="selectedStory.outcomes.business"
                class="flex items-center gap-2 p-2 bg-muted/50 rounded"
              >
                <BriefcaseIcon class="h-4 w-4 text-primary" />
                <span class="text-sm">Business Support</span>
              </div>
            </div>
          </div>

          <div v-if="selectedStory.images && selectedStory.images.length > 0">
            <h3 class="font-medium mb-2">Images</h3>
            <div class="grid grid-cols-3 gap-2">
              <div
                v-for="(image, index) in selectedStory.images"
                :key="index"
                class="cursor-pointer border rounded-md overflow-hidden aspect-square"
                @click="viewImage(image.url)"
              >
                <img :src="image.url" alt="Impact story image" class="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="isDetailsDialogOpen = false">Close</Button>
          <Button variant="default" @click="editImpactStory(selectedStory)">Edit Story</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Image Viewer Dialog -->
    <ImpactTabImageViewer
      :open="isImageViewerOpen"
      :image="selectedImage"
      @close="isImageViewerOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import AsnafHeatmap from '@/components/AsnafHeatmap.vue'
import { cn } from '@/lib/utils'

// Import UI components
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  CalendarIcon,
  Users2Icon,
  WalletIcon,
  BadgeDollarSignIcon,
  PlusIcon,
  PencilIcon,
  EyeIcon,
  UploadIcon,
  XIcon,
  BookIcon,
  HomeIcon,
  HeartIcon,
  BriefcaseIcon,
} from 'lucide-vue-next'
import ImpactTabFilters from './ImpactTabFilters.vue'
import ImpactTabMetrics from './ImpactTabMetrics.vue'
import ImpactTabCharts from './ImpactTabCharts.vue'
import ImpactTabHeatmap from './ImpactTabHeatmap.vue'
import ImpactTabStories from './ImpactTabStories.vue'
import ImpactTabOutcomes from './ImpactTabOutcomes.vue'
import ImpactTabImageViewer from './ImpactTabImageViewer.vue'

const props = defineProps({
  impactData: {
    type: Object,
    required: true,
  },
  asnafLocations: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits([
  'save-impact-story',
  'handle-story-image-upload',
  'remove-story-image',
  'view-image',
])

const impactTimeRange = ref('month')
const impactCategoryFilter = ref('all')
const isDialogOpen = ref(false)
const isDetailsDialogOpen = ref(false)
const isImageViewerOpen = ref(false)
const editingStory = ref(null)
const selectedStory = ref(null)
const selectedImage = ref(null)
const storyUploading = ref(false)
const storyUploadProgress = ref(0)

const storyForm = ref({
  title: '',
  description: '',
  category: '',
  beneficiaries: 1,
  amount: 0,
  outcomes: {
    education: false,
    housing: false,
    medical: false,
    business: false,
  },
  images: [],
})

const filteredImpactData = computed(() => {
  // Filter by time range and category
  let data = { ...props.impactData }

  // Apply category filter if not 'all'
  if (impactCategoryFilter.value !== 'all') {
    // Filter category distribution
    const filteredCategoryDistribution = {}
    if (data.categoryDistribution[impactCategoryFilter.value]) {
      filteredCategoryDistribution[impactCategoryFilter.value] =
        data.categoryDistribution[impactCategoryFilter.value]
    }

    // Filter impact stories
    const filteredImpactStories = data.impactStories.filter(
      (story) => story.category === impactCategoryFilter.value,
    )

    return {
      ...data,
      categoryDistribution: filteredCategoryDistribution,
      impactStories: filteredImpactStories,
    }
  }

  return data
})

const beneficiaryChange = computed(() => {
  // Placeholder for change calculation - would be based on previous period data
  return +5.2
})

const distributionChange = computed(() => {
  // Placeholder for change calculation - would be based on previous period data
  return +8.7
})

const maxMonthlyAmount = computed(() => {
  if (
    !filteredImpactData.value.monthlyTrend ||
    filteredImpactData.value.monthlyTrend.length === 0
  ) {
    return 0
  }
  return Math.max(...filteredImpactData.value.monthlyTrend.map((month) => month.amount))
})

const formatDate = (date) => {
  if (!date) return 'N/A'
  const dateObj = date instanceof Date ? date : new Date(date)
  if (isNaN(dateObj.getTime())) return 'Invalid Date'

  return dateObj.toLocaleDateString('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const resetStoryForm = () => {
  storyForm.value = {
    title: '',
    description: '',
    category: '',
    beneficiaries: 1,
    amount: 0,
    outcomes: {
      education: false,
      housing: false,
      medical: false,
      business: false,
    },
    images: [],
  }
  storyUploadProgress.value = 0
  editingStory.value = null
}

const showAddStoryModal = (story = null) => {
  if (story) {
    editingStory.value = story
    storyForm.value = { ...story }
  } else {
    resetStoryForm()
  }
  isDialogOpen.value = true
}

const editImpactStory = (story) => {
  showAddStoryModal(story)
}

const viewImpactStoryDetails = (story) => {
  selectedStory.value = story
  isDetailsDialogOpen.value = true
}

const handleStoryImageUpload = (event) => {
  storyUploading.value = true
  emit(
    'handle-story-image-upload',
    event,
    (progress) => {
      storyUploadProgress.value = progress
    },
    (urls) => {
      if (!storyForm.value.images) {
        storyForm.value.images = []
      }

      // Add new images
      urls.forEach((url) => {
        storyForm.value.images.push({ url })
      })
      storyUploading.value = false
    },
  )
}

const removeStoryImage = (index) => {
  emit('remove-story-image', storyForm.value.images[index])
  storyForm.value.images.splice(index, 1)
}

const viewImage = (imageUrl) => {
  selectedImage.value = imageUrl
  isImageViewerOpen.value = true
  emit('view-image', imageUrl)
}

const saveImpactStory = () => {
  if (storyUploading.value) {
    alert('Please wait for image uploads to complete')
    return
  }

  const storyData = {
    ...storyForm.value,
    id: editingStory.value?.id,
    date: editingStory.value?.date || new Date(),
  }

  emit('save-impact-story', storyData)
  isDialogOpen.value = false
  resetStoryForm()
}

// Close dialogs watcher
watch(isDialogOpen, (newValue) => {
  if (!newValue) {
    resetStoryForm()
  }
})

watch(isDetailsDialogOpen, (newValue) => {
  if (!newValue) {
    selectedStory.value = null
  }
})

watch(isImageViewerOpen, (newValue) => {
  if (!newValue) {
    selectedImage.value = null
  }
})
</script>

<style scoped>
/* Add any custom styles if needed */
</style>
