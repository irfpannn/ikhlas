<template>
  <div class="flex min-h-screen items-center justify-center bg-background p-4">
    <Card class="w-full max-w-sm">
      <CardHeader>
        <CardTitle class="text-2xl font-bold text-center">Sign Up</CardTitle>
        <CardDescription class="text-center">
          Enter your email and password to create an account.
        </CardDescription>
      </CardHeader>
      <CardContent class="grid gap-4">
        <form @submit.prevent="handleSignup" class="grid gap-4">
          <div class="grid gap-2">
            <Label for="email">Email</Label>
            <Input id="email" v-model="email" type="email" placeholder="m@example.com" required />
          </div>
          <div class="grid gap-2">
            <Label for="password">Password</Label>
            <Input id="password" v-model="password" type="password" required />
          </div>
          <Button type="submit" class="w-full" :disabled="loading">
            {{ loading ? 'Signing Up...' : 'Sign Up' }}
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
      <CardFooter class="text-center text-sm">
        Already have an account?
        <router-link to="/login" class="underline"> Login </router-link>
      </CardFooter>
    </Card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signUp } from '@/services/authService'
import { createUserProfile } from '@/services/userService' // Import to create Firestore doc
import { AlertCircle } from 'lucide-vue-next' // Icon for alert

// Import shadcn-vue components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false) // Add loading state
const router = useRouter()

const handleSignup = async () => {
  error.value = ''
  loading.value = true
  try {
    // Create Auth user
    const userCredential = await signUp(email.value, password.value)
    const user = userCredential.user

    // Use Firebase Auth UID as Firestore document ID
    // Create initial user profile document
    await createUserProfile(user.uid, {
      user_email: email.value,
      user_fullname: '', // Placeholder, to be filled in ProfileCompleteView
      user_phone: '', // Placeholder
      user_address: '', // Placeholder
      user_role: 'user', // Default role
    })

    // Redirect to complete profile
    router.push('/profile-complete')
  } catch (e) {
    // Improve error message handling
    if (e.code === 'auth/email-already-in-use') {
      error.value = 'This email address is already in use.'
    } else if (e.code === 'auth/weak-password') {
      error.value = 'Password should be at least 6 characters.'
    } else {
      error.value = e.message || 'An unexpected error occurred during sign up.'
    }
    console.error('Signup Error:', e) // Log the full error for debugging
  } finally {
    loading.value = false // Set loading false
  }
}
</script>
