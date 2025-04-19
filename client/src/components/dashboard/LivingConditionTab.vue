<template>
  <div class="space-y-8">
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6 border-b pb-4"
    >
      <h2 class="text-2xl font-bold tracking-tight">Asnaf Living Condition Analysis</h2>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Upload Section -->
      <Card class="bg-white">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <UploadIcon class="h-5 w-5" />
            Upload House Image
          </CardTitle>
          <CardDescription>
            Upload a photo of an Asnaf's house to analyze its condition
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            class="border-dashed border-2 border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
            @click="fileInputRef?.click()"
            @dragover.prevent="dragover = true"
            @dragleave.prevent="dragover = false"
            @drop.prevent="onFileDrop"
            :class="{ 'bg-muted/50': dragover }"
          >
            <div class="flex flex-col items-center justify-center gap-4">
              <div v-if="!imagePreview" class="text-4xl text-muted-foreground/50">
                <UploadCloudIcon class="h-10 w-10 mx-auto mb-2" />
                <p class="text-sm">Drop house image here or click to select</p>
                <p class="text-xs text-muted-foreground mt-2">Supports: JPG, PNG, JPEG</p>
              </div>
              <div v-else class="relative w-full">
                <img
                  :src="imagePreview"
                  alt="House preview"
                  class="max-h-64 mx-auto rounded-lg shadow-sm"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  class="absolute top-2 right-2 h-8 w-8"
                  @click.stop="clearImage"
                >
                  <XIcon class="h-4 w-4" />
                </Button>
              </div>
            </div>
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              class="hidden"
              @change="onFileChange"
            />
          </div>

          <div class="mt-6 flex justify-end">
            <Button
              variant="default"
              :disabled="!selectedFile || isAnalyzing"
              :loading="isAnalyzing"
              @click="analyzeImage"
            >
              <HomeIcon class="h-4 w-4 mr-2" />
              Analyze House Condition
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- Results Section -->
      <Card class="bg-white" :class="{ 'opacity-50': !analysisResult }">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <BarChartIcon class="h-5 w-5" />
            Analysis Results
          </CardTitle>
          <CardDescription>
            {{
              analysisResult
                ? 'House condition analysis results'
                : 'Upload and analyze an image to see results'
            }}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div v-if="!analysisResult" class="text-center py-12">
            <HomeIcon class="h-16 w-16 mx-auto text-muted-foreground/25 mb-4" />
            <p class="text-muted-foreground">No analysis results yet</p>
            <p class="text-xs text-muted-foreground mt-2">
              Upload a house image to analyze its condition
            </p>
          </div>

          <div v-else class="space-y-6">
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-semibold">Classification Result:</h3>
              <Badge
                :variant="getBadgeVariant(analysisResult.classification)"
                class="text-sm py-1 px-3"
              >
                {{ analysisResult.classification }}
              </Badge>
            </div>

            <Separator />

            <div>
              <h4 class="text-sm font-medium mb-3">Class Probabilities:</h4>
              <div class="space-y-3">
                <div
                  class="space-y-1"
                  v-for="(prob, cls) in analysisResult.probabilities"
                  :key="cls"
                >
                  <div class="flex justify-between items-center">
                    <span class="text-sm">{{ cls }}</span>
                    <span class="text-xs text-muted-foreground"
                      >{{ (prob * 100).toFixed(1) }}%</span
                    >
                  </div>
                  <Progress :value="prob * 100" :class="getProgressColor(cls)" />
                </div>
              </div>
            </div>

            <Separator />

            <div class="flex flex-col">
              <h4 class="text-sm font-medium mb-3">Analysis Summary:</h4>
              <p class="text-sm">{{ getAnalysisSummary(analysisResult.classification) }}</p>

              <div
                class="mt-4 p-3 rounded-md"
                :class="getBackgroundByClass(analysisResult.classification)"
              >
                <h5 class="font-medium mb-1">Recommended Action:</h5>
                <p class="text-sm">{{ getRecommendation(analysisResult.classification) }}</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter v-if="analysisResult" class="flex justify-end">
          <Button variant="outline" size="sm" @click="downloadReport">
            <DownloadIcon class="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </CardFooter>
      </Card>
    </div>

    <Card class="bg-white mt-8">
      <CardHeader>
        <CardTitle>Previous Analysis History</CardTitle>
        <CardDescription>Recent house condition assessments</CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="analysisHistory.length === 0" class="text-center py-6 text-muted-foreground">
          No previous analyses found.
        </div>
        <div v-else class="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Classification</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead class="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="(item, index) in analysisHistory" :key="index">
                <TableCell>{{ formatDate(item.date) }}</TableCell>
                <TableCell>
                  <img
                    :src="item.imageUrl"
                    alt="House thumbnail"
                    class="w-16 h-12 object-cover rounded"
                    @click="openImageViewer(item.imageUrl)"
                  />
                </TableCell>
                <TableCell>
                  <Badge :variant="getBadgeVariant(item.classification)">
                    {{ item.classification }}
                  </Badge>
                </TableCell>
                <TableCell>{{ (item.confidence * 100).toFixed(1) }}%</TableCell>
                <TableCell class="text-right">
                  <Button variant="ghost" size="sm" @click="viewDetails(item)">
                    <EyeIcon class="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <!-- Image Viewer Dialog -->
    <Dialog :open="!!viewedImage" @update:open="viewedImage = null">
      <DialogContent class="max-w-3xl">
        <DialogHeader>
          <DialogTitle>House Image</DialogTitle>
        </DialogHeader>
        <div class="flex items-center justify-center">
          <img
            :src="viewedImage"
            alt="House full view"
            class="max-h-[70vh] max-w-full object-contain rounded"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" @click="viewedImage = null">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'vue-sonner'
import {
  UploadIcon,
  HomeIcon,
  BarChartIcon,
  UploadCloudIcon,
  XIcon,
  EyeIcon,
  DownloadIcon,
} from 'lucide-vue-next'

// Refs for file handling
const fileInputRef = ref(null)
const selectedFile = ref(null)
const imagePreview = ref(null)
const dragover = ref(false)
const isAnalyzing = ref(false)
const analysisResult = ref(null)
const viewedImage = ref(null)

// Mock analysis history (would be loaded from API in real app)
const analysisHistory = ref([])

function onFileChange(e) {
  const files = e.target.files
  if (files.length > 0) {
    handleSelectedFile(files[0])
  }
}

function onFileDrop(e) {
  dragover.value = false
  const files = e.dataTransfer.files
  if (files.length > 0) {
    handleSelectedFile(files[0])
  }
}

function handleSelectedFile(file) {
  // Check file type
  if (!file.type.match('image.*')) {
    toast.error('Please select an image file')
    return
  }

  selectedFile.value = file

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target.result
  }
  reader.readAsDataURL(file)

  // Reset analysis result when new image is selected
  analysisResult.value = null
}

function clearImage(e) {
  e.stopPropagation()
  selectedFile.value = null
  imagePreview.value = null
  analysisResult.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = null
  }
}

async function analyzeImage() {
  if (!selectedFile.value) return

  isAnalyzing.value = true

  // Prepare form data
  const formData = new FormData()
  formData.append('image', selectedFile.value)

  try {
    // Call the API endpoint to analyze the image
    // This is where we'll connect to the backend
    const response = await fetch('http://localhost:5000/analyze-house', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    // Mock result for development
    /*
    const result = {
      classification: ['baik', 'sederhana', 'dhoif'][Math.floor(Math.random() * 3)],
      probabilities: {
        baik: Math.random() * 0.3,
        sederhana: Math.random() * 0.5,
        dhoif: Math.random() * 0.7
      }
    }
    
    // Normalize to ensure they sum to 1
    const sum = Object.values(result.probabilities).reduce((a, b) => a + b, 0)
    Object.keys(result.probabilities).forEach(key => {
      result.probabilities[key] = result.probabilities[key] / sum
    })
    */

    // Update the analysis result
    analysisResult.value = result

    // Add to history
    const newHistoryEntry = {
      date: new Date(),
      imageUrl: imagePreview.value,
      classification: result.classification,
      confidence: Math.max(...Object.values(result.probabilities)),
      result: result,
    }

    analysisHistory.value = [newHistoryEntry, ...analysisHistory.value]

    toast.success('Analysis completed successfully')
  } catch (error) {
    console.error('Error analyzing image:', error)
    toast.error('Failed to analyze image. Please try again.')
  } finally {
    isAnalyzing.value = false
  }
}

function getBadgeVariant(classification) {
  const classLower = classification.toLowerCase()
  if (classLower === 'baik') return 'success'
  if (classLower === 'sederhana') return 'warning'
  if (classLower === 'dhoif') return 'destructive'
  return 'default'
}

function getProgressColor(classification) {
  const classLower = classification.toLowerCase()
  if (classLower === 'baik') return 'bg-green-600'
  if (classLower === 'sederhana') return 'bg-yellow-500'
  if (classLower === 'dhoif') return 'bg-red-600'
  return ''
}

function getBackgroundByClass(classification) {
  const classLower = classification.toLowerCase()
  if (classLower === 'baik') return 'bg-green-50 text-green-800 border-green-200 border'
  if (classLower === 'sederhana') return 'bg-yellow-50 text-yellow-800 border-yellow-200 border'
  if (classLower === 'dhoif') return 'bg-red-50 text-red-800 border-red-200 border'
  return 'bg-gray-50'
}

function getAnalysisSummary(classification) {
  const classLower = classification.toLowerCase()
  if (classLower === 'baik') {
    return 'The house is in good condition with stable structure, proper roofing, and adequate living space. No immediate action needed.'
  } else if (classLower === 'sederhana') {
    return 'The house is in moderate condition with some visible issues. Minor repairs and improvements would enhance living conditions.'
  } else if (classLower === 'dhoif') {
    return 'The house is in poor condition with significant structural problems, leaking roof, or inadequate protection from elements. Urgent assistance required.'
  }
  return 'Analysis could not determine the condition of the house.'
}

function getRecommendation(classification) {
  const classLower = classification.toLowerCase()
  if (classLower === 'baik') {
    return 'No immediate action required. Consider reassessment in 1 year.'
  } else if (classLower === 'sederhana') {
    return 'Schedule a follow-up assessment. Consider allocating moderate financial assistance for repairs.'
  } else if (classLower === 'dhoif') {
    return 'Prioritize for immediate assistance. Allocate funds for significant repairs or replacement.'
  }
  return 'Further manual assessment recommended.'
}

function downloadReport() {
  if (!analysisResult.value) return

  // In a real app, this would generate a PDF report or detailed document
  toast.info('Report download feature will be available in the next update')
}

function formatDate(date) {
  return new Date(date).toLocaleString('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function openImageViewer(imageUrl) {
  viewedImage.value = imageUrl
}

function viewDetails(item) {
  // Set the current analysis result to the selected history item
  analysisResult.value = item.result
  imagePreview.value = item.imageUrl

  // Scroll to results section
  document.querySelector('.space-y-8')?.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => {
  // Fetch any existing analysis history
  // This would be an API call in a real application
})
</script>
