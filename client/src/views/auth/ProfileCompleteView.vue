<template>
  <div class="flex min-h-screen items-center justify-center bg-background p-4">
    <Card class="w-full max-w-md">
      <!-- Increased max-width slightly -->
      <CardHeader>
        <CardTitle class="text-2xl font-bold text-center">Complete Your Profile</CardTitle>
        <CardDescription class="text-center">
          Please provide some additional details to complete your registration.
        </CardDescription>
      </CardHeader>
      <CardContent class="grid gap-4">
        <form @submit.prevent="handleComplete" class="grid gap-4">
          <div class="grid gap-2">
            <Label for="fullname">Full Name</Label>
            <Input
              id="fullname"
              v-model="fullname"
              type="text"
              placeholder="e.g., Ali bin Abu"
              required
            />
          </div>
          <div class="grid gap-2">
            <Label for="occupation">Occupation</Label>
            <Input
              id="occupation"
              v-model="occupation"
              type="text"
              placeholder="e.g., Teacher"
              required
            />
          </div>
          <div class="grid gap-2">
            <Label for="phone">Phone Number</Label>
            <Input id="phone" v-model="phone" type="tel" placeholder="e.g., 0123456789" required />
          </div>
          <div class="grid gap-2">
            <Label for="salary">Monthly Salary (RM)</Label>
            <Input id="salary" v-model="salary" type="number" placeholder="e.g., 3500" required />
          </div>
          <Button type="submit" class="w-full" :disabled="loading">
            {{ loading ? 'Saving...' : 'Save Profile' }}
          </Button>
          <Alert v-if="error" variant="destructive">
            <AlertCircle class="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {{ error }}
            </AlertDescription>
          </Alert>
        </form>
      </CardContent>
      <!-- Optional: Add a CardFooter if needed -->
    </Card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { createUserProfile } from '@/services/userService'
import { AlertCircle } from 'lucide-vue-next' // Icon for alert

// Import shadcn-vue components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const fullname = ref('')
const occupation = ref('')
const phone = ref('')
const salary = ref('')
const error = ref('')
const loading = ref(false) // Add loading state
const router = useRouter()
const auth = useAuthStore()

const handleComplete = async () => {
  error.value = ''
  loading.value = true // Set loading true
  try {
    const user = auth.user
    if (!user) throw new Error('Not authenticated. Please log in again.')

    // Ensure salary is a number
    const salaryValue = parseFloat(salary.value)
    if (isNaN(salaryValue)) {
      throw new Error('Please enter a valid number for salary.')
    }

    await createUserProfile(user.uid, {
      user_address: '', // Address can be added later in profile edit
      user_email: user.email, // Get email from auth user
      user_fullname: fullname.value,
      user_occupation: occupation.value,
      user_phone: phone.value,
      user_salary: salaryValue, // Use the parsed number
      user_role: 'user', // Default role for new signups
    })

    // Fetch the newly created profile into the auth store
    await auth.fetchProfile()

    router.push('/') // Redirect to home page after completion
  } catch (e) {
    error.value = e.message || 'An unexpected error occurred.'
    console.error('Profile Completion Error:', e)
  } finally {
    loading.value = false // Set loading false
  }
}
</script>
