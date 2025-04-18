<template>
  <div class="flex flex-col min-h-screen items-center justify-center bg-gray-100">
    <form
      @submit.prevent="handleLogin"
      class="bg-white p-6 rounded shadow w-full max-w-sm space-y-4"
    >
      <h2 class="text-xl font-bold">Login</h2>
      <input v-model="email" type="email" placeholder="Email" required class="input" />
      <input v-model="password" type="password" placeholder="Password" required class="input" />
      <button type="submit" class="btn w-full" :disabled="loading">
        {{ loading ? 'Logging in...' : 'Login' }}
      </button>
      <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
      <p class="text-sm">Don't have an account? <router-link to="/signup">Sign Up</router-link></p>
    </form>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router' // Import useRoute
import { login, getUserRole, getCurrentUser } from '@/services/authService' // Import getUserRole and getCurrentUser

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false) // Add loading state
const router = useRouter()
const route = useRoute() // Get current route for redirect query

const handleLogin = async () => {
  error.value = ''
  loading.value = true // Set loading true
  try {
    const userCredential = await login(email.value, password.value)
    const user = userCredential.user // Get user from credential

    if (user) {
      // Fetch user role after successful login
      const role = await getUserRole(user.uid)

      // Determine redirect path based on role
      let redirectPath = '/' // Default redirect for regular users
      if (role === 'admin') {
        redirectPath = '/admin/dashboard' // Redirect admins to dashboard
      }

      // Check if there was a redirect query parameter
      const redirectQuery = route.query.redirect
      if (redirectQuery) {
        // Check if the intended redirect is an admin route
        const isAdminRedirect = redirectQuery.startsWith('/admin')
        if (isAdminRedirect && role !== 'admin') {
          // If a non-admin tries to go to an admin page via redirect, send them home
          console.warn(
            'Non-admin user attempted redirect to admin route after login:',
            redirectQuery,
          )
          router.push('/')
        } else {
          // Otherwise, proceed to the intended redirect path
          router.push(redirectQuery)
        }
      } else {
        // No redirect query, use the role-based path
        router.push(redirectPath)
      }
    } else {
      // Should not happen if login is successful, but handle defensively
      throw new Error('Login successful but user data not found.')
    }
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false // Set loading false
  }
}
</script>
<style scoped>
.input {
  border: 1px solid #ccc;
  padding: 8px;
  border-radius: 4px;
  width: 100%;
}
.btn {
  background: #75a868;
  color: #fff;
  padding: 8px 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>
