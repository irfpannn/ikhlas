<template>
  <div class="space-y-8 pb-8">
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6 border-b pb-4"
    >
      <h2 class="text-2xl font-bold tracking-tight">Admin Tools</h2>
    </div>

    <!-- Data Management Section -->
    <Card class="mb-8 bg-gray-50">
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <DatabaseIcon class="h-5 w-5" />
          Data Management
        </CardTitle>
        <p class="text-muted-foreground">Use these tools to manage data in Firebase.</p>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card class="shadow-sm">
            <CardHeader class="pb-2">
              <CardTitle class="text-base">Asnaf Recipients</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="mb-3 text-xs text-muted-foreground">
                Import or export asnaf recipient data.
              </p>
              <div class="flex flex-col xs:flex-row gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  @click="openFileDialog('asnaf')"
                  :disabled="isLoading.import"
                  :loading="isLoading.import && activeCollection === 'asnaf'"
                >
                  <UploadIcon class="h-4 w-4 mr-2" /> Import
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  @click="exportData('asnaf')"
                  :disabled="isLoading.export"
                  :loading="isLoading.export && activeCollection === 'asnaf'"
                >
                  <DownloadIcon class="h-4 w-4 mr-2" /> Export
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card class="shadow-sm">
            <CardHeader class="pb-2">
              <CardTitle class="text-base">Zakat Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="mb-3 text-xs text-muted-foreground">Import or export zakat payment data.</p>
              <div class="flex flex-col xs:flex-row gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  @click="openFileDialog('payments')"
                  :disabled="isLoading.import"
                  :loading="isLoading.import && activeCollection === 'payments'"
                >
                  <UploadIcon class="h-4 w-4 mr-2" /> Import
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  @click="exportData('payments')"
                  :disabled="isLoading.export"
                  :loading="isLoading.export && activeCollection === 'payments'"
                >
                  <DownloadIcon class="h-4 w-4 mr-2" /> Export
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card class="shadow-sm">
            <CardHeader class="pb-2">
              <CardTitle class="text-base">Zakat Distributions</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="mb-3 text-xs text-muted-foreground">
                Import or export zakat distribution data.
              </p>
              <div class="flex flex-col xs:flex-row gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  @click="openFileDialog('distributions')"
                  :disabled="isLoading.import"
                  :loading="isLoading.import && activeCollection === 'distributions'"
                >
                  <UploadIcon class="h-4 w-4 mr-2" /> Import
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  @click="exportData('distributions')"
                  :disabled="isLoading.export"
                  :loading="isLoading.export && activeCollection === 'distributions'"
                >
                  <DownloadIcon class="h-4 w-4 mr-2" /> Export
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card class="shadow-sm">
            <CardHeader class="pb-2">
              <CardTitle class="text-base">Asnaf Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="mb-3 text-xs text-muted-foreground">Import or export asnaf report data.</p>
              <div class="flex flex-col xs:flex-row gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  @click="openFileDialog('reports')"
                  :disabled="isLoading.import"
                  :loading="isLoading.import && activeCollection === 'reports'"
                >
                  <UploadIcon class="h-4 w-4 mr-2" /> Import
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  @click="exportData('reports')"
                  :disabled="isLoading.export"
                  :loading="isLoading.export && activeCollection === 'reports'"
                >
                  <DownloadIcon class="h-4 w-4 mr-2" /> Export
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>

    <!-- ML Model Management Section -->
    <Card class="bg-gray-50">
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <BrainCircuitIcon class="h-5 w-5" />
          ML Model Management
        </CardTitle>
        <p class="text-muted-foreground">Tools for managing the eligibility assessment model.</p>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card class="shadow-sm">
            <CardHeader class="pb-2">
              <CardTitle class="text-base flex items-center gap-2">
                <ActivityIcon class="h-4 w-4" />
                Model Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="mb-4">
                <div class="grid grid-cols-2 gap-2">
                  <div class="flex flex-col">
                    <span class="text-xs text-muted-foreground">Accuracy</span>
                    <div class="flex items-center gap-2">
                      <Badge variant="success">{{ modelMetrics.accuracy }}</Badge>
                    </div>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-xs text-muted-foreground">Precision</span>
                    <div class="flex items-center gap-2">
                      <Badge variant="secondary">{{ modelMetrics.precision }}</Badge>
                    </div>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-xs text-muted-foreground">Recall</span>
                    <div class="flex items-center gap-2">
                      <Badge variant="secondary">{{ modelMetrics.recall }}</Badge>
                    </div>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-xs text-muted-foreground">F1 Score</span>
                    <div class="flex items-center gap-2">
                      <Badge variant="success">{{ modelMetrics.f1Score }}</Badge>
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex">
                <Button size="sm" variant="outline" @click="openModelDetails" class="w-full">
                  <LineChartIcon class="h-4 w-4 mr-2" /> View Details
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card class="shadow-sm">
            <CardHeader class="pb-2">
              <CardTitle class="text-base flex items-center gap-2">
                <FileDiff class="h-4 w-4" />
                Batch Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p class="mb-3 text-xs text-muted-foreground">
                Assess eligibility for multiple records at once.
              </p>
              <div class="mt-4">
                <Button
                  size="sm"
                  variant="secondary"
                  @click="openBatchAssessment"
                  class="w-full"
                  :loading="isLoading.assessment"
                  :disabled="isLoading.assessment"
                >
                  <BotIcon class="h-4 w-4 mr-2" /> Run Batch Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>

    <!-- System Monitoring Section -->
    <Card class="bg-gray-50">
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <ScanLineIcon class="h-5 w-5" />
          System Monitoring
        </CardTitle>
        <p class="text-muted-foreground">Monitor system health and performance.</p>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card class="shadow-sm">
            <CardHeader class="pb-2">
              <CardTitle class="text-base flex items-center gap-2">
                <ServerIcon class="h-4 w-4" />
                Server Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs text-muted-foreground">API Service</span>
                <Badge :variant="systemStatus.api ? 'success' : 'destructive'">
                  {{ systemStatus.api ? 'Online' : 'Offline' }}
                </Badge>
              </div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs text-muted-foreground">ML Service</span>
                <Badge :variant="systemStatus.ml ? 'success' : 'destructive'">
                  {{ systemStatus.ml ? 'Online' : 'Offline' }}
                </Badge>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs text-muted-foreground">Database</span>
                <Badge :variant="systemStatus.db ? 'success' : 'destructive'">
                  {{ systemStatus.db ? 'Connected' : 'Disconnected' }}
                </Badge>
              </div>
              <Separator class="my-3" />
              <div class="flex">
                <Button
                  size="sm"
                  variant="outline"
                  class="w-full"
                  @click="refreshSystemStatus"
                  :loading="isLoading.refresh"
                  :disabled="isLoading.refresh"
                >
                  <RefreshCcwIcon class="h-4 w-4 mr-2" /> Refresh Status
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card class="shadow-sm col-span-1 md:col-span-2">
            <CardHeader class="pb-2">
              <CardTitle class="text-base flex items-center gap-2">
                <BarChartIcon class="h-4 w-4" />
                System Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div class="space-y-1">
                  <div class="text-xs text-muted-foreground">CPU Usage</div>
                  <Progress :modelValue="systemMetrics.cpu" />
                  <div class="text-sm font-medium">{{ systemMetrics.cpu }}%</div>
                </div>
                <div class="space-y-1">
                  <div class="text-xs text-muted-foreground">Memory</div>
                  <Progress :modelValue="systemMetrics.memory" />
                  <div class="text-sm font-medium">{{ systemMetrics.memory }}%</div>
                </div>
                <div class="space-y-1">
                  <div class="text-xs text-muted-foreground">Storage</div>
                  <Progress :modelValue="systemMetrics.storage" />
                  <div class="text-sm font-medium">{{ systemMetrics.storage }}%</div>
                </div>
                <div class="space-y-1">
                  <div class="text-xs text-muted-foreground">Network</div>
                  <Progress :modelValue="systemMetrics.network" />
                  <div class="text-sm font-medium">{{ systemMetrics.network }}%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>

    <!-- File Upload Dialog -->
    <Dialog :open="showFileDialog" @update:open="showFileDialog = false">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import {{ collectionLabels[activeCollection] || '' }}</DialogTitle>
          <DialogDescription>
            Upload a JSON file to import {{ collectionLabels[activeCollection] || 'data' }}. This
            will merge with existing data.
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <div
            class="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 cursor-pointer"
            @click="fileInputRef?.click()"
          >
            <UploadCloudIcon class="h-10 w-10 text-muted-foreground/50 mb-2" />
            <p class="text-sm text-muted-foreground">
              Click to upload or drag and drop your file here
            </p>
            <p class="text-xs text-muted-foreground mt-1">JSON file supported (max 5MB)</p>
            <input
              type="file"
              ref="fileInputRef"
              accept=".json"
              class="hidden"
              @change="handleFileUpload"
            />
          </div>

          <div
            v-if="selectedFile"
            class="flex items-center gap-2 p-2 bg-primary-foreground/10 rounded"
          >
            <FileIcon class="h-4 w-4" />
            <span class="text-sm">{{ selectedFile.name }}</span>
            <span class="text-xs text-muted-foreground ml-1">
              {{ formatFileSize(selectedFile.size) }}
            </span>
            <Button variant="ghost" size="icon" class="ml-auto h-6 w-6 p-0" @click="removeFile">
              <XIcon class="h-4 w-4" />
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showFileDialog = false">Cancel</Button>
          <Button
            variant="default"
            @click="importSelectedFile"
            :disabled="!selectedFile || isLoading.import"
            :loading="isLoading.import"
          >
            Import Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Model Details Dialog -->
    <Dialog :open="showModelDialog" @update:open="showModelDialog = false" class="max-w-4xl">
      <DialogContent class="w-full">
        <DialogHeader>
          <DialogTitle>Model Performance Details</DialogTitle>
          <DialogDescription>
            Detailed performance metrics for the current ML model.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="overview" class="w-full">
          <TabsList class="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="features">Feature Importance</TabsTrigger>
            <TabsTrigger value="history">Training History</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" class="space-y-4 pt-2">
            <div class="rounded-lg border p-4">
              <h4 class="text-sm font-medium mb-2">Performance Metrics</h4>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p class="text-xs text-muted-foreground">Accuracy</p>
                  <p class="text-lg font-medium">{{ modelMetrics.accuracy }}</p>
                </div>
                <div>
                  <p class="text-xs text-muted-foreground">Precision</p>
                  <p class="text-lg font-medium">{{ modelMetrics.precision }}</p>
                </div>
                <div>
                  <p class="text-xs text-muted-foreground">Recall</p>
                  <p class="text-lg font-medium">{{ modelMetrics.recall }}</p>
                </div>
                <div>
                  <p class="text-xs text-muted-foreground">F1 Score</p>
                  <p class="text-lg font-medium">{{ modelMetrics.f1Score }}</p>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div class="rounded-lg border p-4">
                <h4 class="text-sm font-medium mb-2">Model Information</h4>
                <div class="space-y-1 text-sm">
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">Algorithm</span>
                    <span>{{ modelInfo.algorithm }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">Last Trained</span>
                    <span>{{ formatDate(modelInfo.lastTrained) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">Training Size</span>
                    <span>{{ modelInfo.trainingSize }} records</span>
                  </div>
                </div>
              </div>

              <div class="rounded-lg border p-4">
                <h4 class="text-sm font-medium mb-2">Confusion Matrix</h4>
                <div class="grid grid-cols-2 gap-1 mt-2">
                  <div class="bg-primary/10 p-2 text-center rounded">
                    <p class="text-xs text-muted-foreground">True Positive</p>
                    <p class="text-lg font-medium">{{ modelMatrix.tp }}</p>
                  </div>
                  <div class="bg-primary/5 p-2 text-center rounded">
                    <p class="text-xs text-muted-foreground">False Positive</p>
                    <p class="text-lg font-medium">{{ modelMatrix.fp }}</p>
                  </div>
                  <div class="bg-primary/5 p-2 text-center rounded">
                    <p class="text-xs text-muted-foreground">False Negative</p>
                    <p class="text-lg font-medium">{{ modelMatrix.fn }}</p>
                  </div>
                  <div class="bg-primary/10 p-2 text-center rounded">
                    <p class="text-xs text-muted-foreground">True Negative</p>
                    <p class="text-lg font-medium">{{ modelMatrix.tn }}</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="features" class="pt-2">
            <div class="rounded-lg border p-4">
              <h4 class="text-sm font-medium mb-2">Feature Importance</h4>
              <div class="space-y-3">
                <div v-for="(value, feature) in featureImportance" :key="feature" class="space-y-1">
                  <div class="flex justify-between items-center">
                    <span class="text-sm">{{ feature }}</span>
                    <span class="text-xs text-muted-foreground">{{ value }}%</span>
                  </div>
                  <Progress :value="value" />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" class="pt-2">
            <div class="rounded-lg border p-4">
              <h4 class="text-sm font-medium mb-2">Training History</h4>
              <div class="text-xs text-muted-foreground mb-2">
                Model performance over the last 5 training iterations
              </div>
              <div class="space-y-4">
                <div v-for="(item, index) in trainingHistory" :key="index" class="border-b pb-2">
                  <div class="flex justify-between items-center">
                    <div>
                      <p class="text-sm font-medium">Version {{ item.version }}</p>
                      <p class="text-xs text-muted-foreground">{{ formatDate(item.date) }}</p>
                    </div>
                    <Badge variant="success">{{ item.accuracy }}</Badge>
                  </div>
                  <div class="mt-1 text-xs">
                    <span class="text-muted-foreground">Data size: </span>
                    <span>{{ item.dataSize }} records</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" @click="showModelDialog = false">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Batch Assessment Dialog -->
    <Dialog :open="showBatchDialog" @update:open="showBatchDialog = false">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Batch Eligibility Assessment</DialogTitle>
          <DialogDescription>
            Run eligibility assessments on multiple asnaf records at once.
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <div class="space-y-3">
            <Label>Processing Method</Label>
            <Select v-model="batchConfig.method">
              <SelectTrigger>
                <SelectValue placeholder="Select processing method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Records</SelectItem>
                <SelectItem value="unprocessed">Unprocessed Records Only</SelectItem>
                <SelectItem value="flagged">Flagged Records Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Confidence Threshold</Label>
            <div class="flex items-center space-x-2">
              <Slider
                :model-value="[batchConfig.threshold]"
                @update:model-value="(val) => (batchConfig.threshold = val[0])"
                :min="50"
                :max="95"
                :step="5"
              />
              <span class="w-12 text-center">{{ batchConfig.threshold }}%</span>
            </div>
            <p class="text-xs text-muted-foreground mt-1">
              Records below this threshold will be flagged for manual review
            </p>
          </div>

          <div v-if="batchConfig.method === 'all'">
            <Alert>
              <AlertCircle class="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                This will process all records in the database. This may take some time.
              </AlertDescription>
            </Alert>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showBatchDialog = false">Cancel</Button>
          <Button
            @click="runBatchAssessment"
            :disabled="isLoading.assessment"
            :loading="isLoading.assessment"
          >
            Start Processing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { toast } from 'vue-sonner'
import {
  DatabaseIcon,
  DownloadIcon,
  UploadIcon,
  BrainCircuitIcon,
  ActivityIcon,
  LineChartIcon,
  FileDiff,
  BotIcon,
  ScanLineIcon,
  ServerIcon,
  RefreshCcwIcon,
  BarChartIcon,
  UploadCloudIcon,
  FileIcon,
  XIcon,
  AlertCircle,
} from 'lucide-vue-next'

const emit = defineEmits([
  'import-asnaf-data',
  'export-asnaf-data',
  'import-zakat-payments',
  'export-zakat-payments',
  'import-zakat-distributions',
  'export-zakat-distributions',
  'import-asnaf-reports',
  'export-asnaf-reports',
  'view-model-details',
  'show-batch-assessment',
])

// File handling state
const fileInputRef = ref(null)
const showFileDialog = ref(false)
const selectedFile = ref(null)
const activeCollection = ref('')

const collectionLabels = {
  asnaf: 'Asnaf Recipients',
  payments: 'Zakat Payments',
  distributions: 'Zakat Distributions',
  reports: 'Asnaf Reports',
}

// Loading states
const isLoading = reactive({
  import: false,
  export: false,
  assessment: false,
  refresh: false,
})

// System monitoring state
const systemStatus = reactive({
  api: true,
  ml: true,
  db: true,
})

const systemMetrics = reactive({
  cpu: 28,
  memory: 40,
  storage: 65,
  network: 12,
})

// Model metrics data
const modelMetrics = reactive({
  accuracy: '87.5%',
  precision: '83.2%',
  recall: '91.4%',
  f1Score: '89.2%',
})

// Model dialog state
const showModelDialog = ref(false)
const modelInfo = reactive({
  algorithm: 'Random Forest Classifier',
  lastTrained: '2025-03-15T14:30:00',
  trainingSize: 1248,
})

const modelMatrix = reactive({
  tp: 485,
  fp: 78,
  fn: 52,
  tn: 633,
})

const featureImportance = reactive({
  'Monthly Income': 25,
  'Household Size': 18,
  'Employment Status': 15,
  'Housing Cost': 12,
  'Debt Burden': 10,
  'Education Level': 8,
  'Medical Expenses': 7,
  'Transport Costs': 5,
})

const trainingHistory = reactive([
  { version: '2.1', date: '2025-03-15T14:30:00', accuracy: '87.5%', dataSize: 1248 },
  { version: '2.0', date: '2025-02-20T10:15:00', accuracy: '85.2%', dataSize: 1100 },
  { version: '1.9', date: '2025-01-05T09:45:00', accuracy: '82.8%', dataSize: 950 },
  { version: '1.8', date: '2024-11-22T16:20:00', accuracy: '81.6%', dataSize: 920 },
  { version: '1.7', date: '2024-10-14T11:30:00', accuracy: '80.1%', dataSize: 890 },
])

// Batch assessment state
const showBatchDialog = ref(false)
const batchConfig = reactive({
  method: 'unprocessed',
  threshold: 70,
})

// File dialog functions
function openFileDialog(collection) {
  activeCollection = collection
  showFileDialog.value = true
}

function handleFileUpload(event) {
  const file = event.target.files[0]
  if (file) {
    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large', {
        description: 'Maximum file size is 5MB',
      })
      return
    }

    // Check file type
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      toast.error('Invalid file type', {
        description: 'Please upload a JSON file',
      })
      return
    }

    selectedFile.value = file
  }
}

function removeFile() {
  selectedFile.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  const kb = bytes / 1024
  if (kb < 1024) return kb.toFixed(1) + ' KB'
  const mb = kb / 1024
  return mb.toFixed(1) + ' MB'
}

function importSelectedFile() {
  if (!selectedFile.value) return

  isLoading.import = true

  // Read the file content
  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const content = JSON.parse(e.target.result)

      // Process based on the collection type
      switch (activeCollection) {
        case 'asnaf':
          await importAsnafData(content)
          break
        case 'payments':
          await importZakatPayments(content)
          break
        case 'distributions':
          await importZakatDistributions(content)
          break
        case 'reports':
          await importAsnafReports(content)
          break
      }

      toast.success('Import successful', {
        description: `${Object.keys(content).length} records imported`,
      })

      showFileDialog.value = false
      selectedFile.value = null
    } catch (error) {
      toast.error('Import failed', {
        description: error.message,
      })
    } finally {
      isLoading.import = false
    }
  }

  reader.onerror = () => {
    toast.error('Error reading file')
    isLoading.import = false
  }

  reader.readAsText(selectedFile.value)
}

// Export functions
async function exportData(collection) {
  isLoading.export = true
  activeCollection = collection

  try {
    // Export based on collection type
    let data
    switch (collection) {
      case 'asnaf':
        data = await exportAsnafData()
        break
      case 'payments':
        data = await exportZakatPayments()
        break
      case 'distributions':
        data = await exportZakatDistributions()
        break
      case 'reports':
        data = await exportAsnafReports()
        break
    }

    // Create downloadable file
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${collection}-export-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success('Export successful', {
      description: `${Object.keys(data).length} records exported`,
    })
  } catch (error) {
    toast.error('Export failed', {
      description: error.message,
    })
  } finally {
    isLoading.export = false
  }
}

// Model functions
function openModelDetails() {
  showModelDialog.value = true
  emit('view-model-details')
}

function openBatchAssessment() {
  showBatchDialog.value = true
}

async function runBatchAssessment() {
  isLoading.assessment = true

  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const method = batchConfig.method
    const threshold = batchConfig.threshold

    emit('show-batch-assessment', { method, threshold })

    let processedCount
    if (method === 'all') {
      processedCount = 246
    } else if (method === 'unprocessed') {
      processedCount = 58
    } else {
      processedCount = 24
    }

    toast.success('Batch assessment complete', {
      description: `${processedCount} records processed successfully`,
    })

    showBatchDialog.value = false
  } catch (error) {
    toast.error('Assessment failed', {
      description: error.message || 'An error occurred during processing',
    })
  } finally {
    isLoading.assessment = false
  }
}

// System monitoring functions
async function refreshSystemStatus() {
  isLoading.refresh = true

  try {
    // Simulate API calls to check services
    await new Promise((resolve) => setTimeout(resolve, 1200))

    // Random updates to simulate real monitoring
    systemStatus.api = Math.random() > 0.1
    systemStatus.ml = Math.random() > 0.1
    systemStatus.db = Math.random() > 0.05

    systemMetrics.cpu = Math.floor(20 + Math.random() * 30)
    systemMetrics.memory = Math.floor(35 + Math.random() * 25)
    systemMetrics.storage = Math.floor(60 + Math.random() * 10)
    systemMetrics.network = Math.floor(5 + Math.random() * 15)

    if (systemStatus.api && systemStatus.ml && systemStatus.db) {
      toast.success('All systems operational')
    } else {
      const downServices = []
      if (!systemStatus.api) downServices.push('API Service')
      if (!systemStatus.ml) downServices.push('ML Service')
      if (!systemStatus.db) downServices.push('Database')

      toast.error('System issues detected', {
        description: `${downServices.join(', ')} ${downServices.length > 1 ? 'are' : 'is'} not operational`,
      })
    }
  } finally {
    isLoading.refresh = false
  }
}

// Helper functions
function formatDate(dateString) {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Asnaf import/export functions
const importAsnafData = async (data) => {
  await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate API call
  emit('import-asnaf-data', data)
  return true
}

const exportAsnafData = async () => {
  // In a real app, you would fetch this from your API
  await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call
  emit('export-asnaf-data')
  return {
    /* sample data would be returned here */
  }
}

// Payments import/export functions
const importZakatPayments = async (data) => {
  await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate API call
  emit('import-zakat-payments', data)
  return true
}

const exportZakatPayments = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call
  emit('export-zakat-payments')
  return {
    /* sample data would be returned here */
  }
}

// Distributions import/export functions
const importZakatDistributions = async (data) => {
  await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate API call
  emit('import-zakat-distributions', data)
  return true
}

const exportZakatDistributions = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call
  emit('export-zakat-distributions')
  return {
    /* sample data would be returned here */
  }
}

// Reports import/export functions
const importAsnafReports = async (data) => {
  await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate API call
  emit('import-asnaf-reports', data)
  return true
}

const exportAsnafReports = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call
  emit('export-asnaf-reports')
  return {
    /* sample data would be returned here */
  }
}

onMounted(() => {
  // Initial system status check
  refreshSystemStatus()
})
</script>

<style scoped>
/* Custom breakpoint for extra small screens */
@media (min-width: 480px) {
  .xs\:flex-row {
    flex-direction: row;
  }
}
</style>
