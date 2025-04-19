<template>
  <div class="flex min-h-screen items-center justify-center bg-background p-4">
    <Card class="w-full max-w-sm">
      <CardHeader>
        <CardTitle class="text-2xl font-bold text-center">Login</CardTitle>
        <CardDescription class="text-center">
          Enter your email below to login to your account.
        </CardDescription>
      </CardHeader>
      <CardContent class="grid gap-4">
        <form @submit.prevent="handleLogin" class="grid gap-4">
          <div class="grid gap-2">
            <Label for="email">Email</Label>
            <Input id="email" v-model="email" type="email" placeholder="m@example.com" required />
          </div>
          <div class="grid gap-2">
            <Label for="password">Password</Label>
            <Input id="password" v-model="password" type="password" required />
          </div>
          <Button type="submit" class="w-full" :disabled="loading">
            {{ loading ? 'Logging in...' : 'Login' }}
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
        Don't have an account?
        <router-link to="/signup" class="underline"> Sign Up </router-link>
      </CardFooter>
    </Card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { login, getUserRole } from '@/services/authService'
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
const loading = ref(false)
const router = useRouter()
const route = useRoute()

const handleLogin = async () => {
  error.value = ''
  loading.value = true
  try {
    const userCredential = await login(email.value, password.value)
    const user = userCredential.user

    if (user) {
      const role = await getUserRole(user.uid)
      let redirectPath = '/'
      if (role === 'admin') {
        redirectPath = '/admin/dashboard'
      }

      const redirectQuery = route.query.redirect
      if (redirectQuery) {
        const isAdminRedirect = redirectQuery.startsWith('/admin')
        if (isAdminRedirect && role !== 'admin') {
          console.warn(
            'Non-admin user attempted redirect to admin route after login:',
            redirectQuery,
          )
          router.push('/')
        } else {
          router.push(redirectQuery)
        }
      } else {
        router.push(redirectPath)
      }
    } else {
      throw new Error('Login successful but user data not found.')
    }
  } catch (e) {
    // Improve error message handling
    if (
      e.code === 'auth/invalid-credential' ||
      e.code === 'auth/user-not-found' ||
      e.code === 'auth/wrong-password'
    ) {
      error.value = 'Invalid email or password.'
    } else {
      error.value = e.message || 'An unexpected error occurred.'
    }
    console.error('Login Error:', e) // Log the full error for debugging
  } finally {
    loading.value = false
  }
}
</script>
