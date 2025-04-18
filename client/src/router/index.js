import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/home/index.vue'
import CategoriesView from '../views/home/category/CategoriesView.vue'
import ZakatPendapatanView from '@/views/home/category/ZakatPendapatanView.vue'
import PaymentView from '@/views/home/category/PaymentView.vue'
import TransactionHistoryView from '@/views/history/TransactionHistoryView.vue'
import HistoryView from '@/views/history/index.vue'
import AsnafReportingView from '@/views/asnaf/index.vue'
import AuditZakatView from '@/views/home/category/AuditZakatView.vue'
import ZakatSahamView from '@/views/home/category/ZakatSahamView.vue'
import ZakatFitrahView from '@/views/home/category/ZakatFitrahView.vue'
import ZakatStatsView from '@/views/home/category/ZakatStatsView.vue' // Import the new view
import { auth } from '@/services/firebaseService'
// Import the updated auth service functions
import { getCurrentUser, checkAdminRole, getUserRole } from '@/services/authService' // Updated import

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Auth routes
    {
      path: '/signup',
      name: 'signup',
      component: () => import('@/views/auth/SignupView.vue'),
      meta: { requiresUserAuth: false, requiresNoAuth: true }, // Add requiresNoAuth
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { requiresUserAuth: false, requiresNoAuth: true }, // Add requiresNoAuth
    },
    {
      path: '/profile-complete',
      name: 'profile-complete',
      component: () => import('@/views/auth/ProfileCompleteView.vue'),
      meta: { requiresUserAuth: true },
    },
    // Main app routes (protected)
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresUserAuth: true },
    },
    {
      path: '/categories',
      name: 'categories',
      component: CategoriesView,
      meta: { requiresUserAuth: true },
    },
    {
      path: '/zakat-pendapatan',
      name: 'zakat-pendapatan',
      component: ZakatPendapatanView,
      meta: { requiresUserAuth: true },
    },
    {
      path: '/zakat-wang-simpanan',
      name: 'zakat-wang-simpanan',
      component: () => import('@/views/home/category/ZakatWangSimpananView.vue'),
      meta: { requiresUserAuth: true },
    },
    {
      path: '/zakat-emas',
      name: 'zakat-emas',
      component: () => import('@/views/home/category/ZakatEmasView.vue'),
      meta: { requiresUserAuth: true },
    },
    {
      path: '/zakat-saham',
      name: 'zakat-saham',
      component: ZakatSahamView,
      meta: { requiresUserAuth: true },
    },
    {
      path: '/zakat-fitrah',
      name: 'zakat-fitrah',
      component: ZakatFitrahView,
      meta: { requiresUserAuth: true },
    },
    {
      path: '/zakat-stats', // Add path for Zakat Stats
      name: 'zakat-stats', // Add route name
      component: ZakatStatsView, // Point to the imported component
      meta: { requiresUserAuth: true },
    },
    {
      path: '/payment',
      name: 'payment',
      component: PaymentView,
      meta: { requiresUserAuth: true },
    },

    {
      path: '/transaction-history',
      name: 'transaction-history',
      component: TransactionHistoryView,
      meta: { requiresUserAuth: true },
    },
    {
      path: '/history',
      name: 'history',
      component: HistoryView,
      meta: { requiresUserAuth: true },
    },
    {
      path: '/asnaf-reporting',
      name: 'asnaf-reporting',
      component: AsnafReportingView,
      meta: { requiresUserAuth: true },
    },
    {
      path: '/audit-zakat',
      name: 'audit-zakat',
      component: AuditZakatView,
      meta: { requiresUserAuth: true },
    },
    {
      path: '/distribution-sources',
      name: 'DistributionSources',
      component: () => import('../views/home/category/DistributionSourcesView.vue'),
      meta: { requiresUserAuth: true }, // Added meta tag
    },
    {
      path: '/admin/dashboard',
      name: 'AdminDashboard',
      component: () => import('../views/admin/DashboardView.vue'),
      // Keep requiresAdmin, requiresUserAuth ensures a user is logged in
      meta: { requiresUserAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/impact-monitoring',
      name: 'ImpactMonitoring',
      component: () => import('../views/admin/ImpactMonitoringView.vue'),
      // Keep requiresAdmin, requiresUserAuth ensures a user is logged in
      meta: { requiresUserAuth: true, requiresAdmin: true },
    },
    {
      path: '/donation',
      name: 'donation',
      component: () => import('@/views/home/category/DonationView.vue'),
      meta: { requiresUserAuth: true }, // Added meta tag
    },
    {
      path: '/donation/:id',
      name: 'DonationDetails',
      component: () => import('@/views/home/category/DonationDetailsView.vue'),
      meta: { requiresUserAuth: true }, // Added meta tag
    },
    {
      path: '/donation/:id/payment',
      name: 'DonationPayment',
      component: () => import('@/views/home/category/DonationPaymentView.vue'),
      props: (route) => ({
        id: route.params.id,
        amount: route.query.amount,
        currency: route.query.currency,
      }),
      meta: { requiresUserAuth: true },
    },
    {
      path: '/donation/:id/success',
      name: 'DonationSuccess',
      component: () => import('@/views/home/category/DonationSuccessView.vue'),
      meta: { requiresUserAuth: true }, // Added meta tag
    },
    {
      path: '/rewards',
      name: 'rewards',
      component: () => import('@/views/home/reward/RewardsView.vue'),
      meta: { requiresUserAuth: true }, // Added meta tag
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/profile/index.vue'),
      meta: { requiresUserAuth: true },
    },
    // Add Top Up route
    {
      path: '/topup',
      name: 'topup',
      component: () => import('@/views/topup/index.vue'),
      meta: { requiresUserAuth: true },
    },
    // Add Request Donation route
    {
      path: '/request-donation',
      name: 'request-donation',
      component: () => import('@/views/donation/RequestDonationView.vue'),
      meta: { requiresUserAuth: true },
    },
    // Add Pay Request route
    {
      path: '/pay-request/:requestId',
      name: 'pay-request',
      component: () => import('@/views/donation/PayRequestView.vue'),
      meta: { requiresUserAuth: false }, // Allow anyone with the link to pay
    },
    {
      path: '/transactions',
      name: 'TransactionHistory',
      component: () => import('../views/home/TransactionHistoryView.vue'),
      meta: {
        requiresAuth: true,
      },
    },
  ],
})

// Updated Navigation Guard
router.beforeEach(async (to, from, next) => {
  const requiresUserAuth = to.matched.some((record) => record.meta.requiresUserAuth)
  const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin)
  const requiresNoAuth = to.matched.some((record) => record.meta.requiresNoAuth) // Check for routes that require no auth
  const currentUser = getCurrentUser()

  if (requiresUserAuth) {
    // Route requires user to be logged in
    if (!currentUser) {
      console.log('User not logged in, redirecting to login for route:', to.path)
      return next({ name: 'login', query: { redirect: to.fullPath } }) // Redirect to login, pass intended destination
    }

    // If route requires admin privileges, check the role
    if (requiresAdmin) {
      try {
        const isAdmin = await checkAdminRole(currentUser.uid) // Use checkAdminRole
        if (isAdmin) {
          console.log('Admin user verified, allowing access to admin route:', to.path)
          return next() // Allow access
        } else {
          console.warn('Non-admin user attempted to access admin route:', to.path)
          return next({ name: 'home' }) // Redirect non-admins away from admin routes
        }
      } catch (error) {
        console.error('Error checking admin status:', error)
        return next({ name: 'home' }) // Redirect on error
      }
    } else {
      // Route requires auth but not admin, allow access
      return next()
    }
  } else if (requiresNoAuth && currentUser) {
    // Route should only be accessed by logged-out users (like login/signup), but user is logged in
    console.log('User already logged in, redirecting from auth route:', to.path)
    // Redirect logged-in users away from login/signup pages
    // We need to determine if they are admin or regular user to redirect correctly
    try {
      // Fetch the role instead of just checking admin status
      const role = await getUserRole(currentUser.uid)
      if (role === 'admin') {
        return next({ name: 'AdminDashboard' })
      } else {
        return next({ name: 'home' })
      }
    } catch (error) {
      console.error('Error checking role for redirect:', error)
      // Attempt logout on error to clear state, then redirect to login
      try {
        await logout() // Assuming logout is available from authService
      } catch (logoutError) {
        console.error('Failed to logout after role check error:', logoutError)
      }
      return next({ name: 'login' }) // Redirect to login on error
    }
  } else {
    // Public route or route doesn't have specific auth requirements handled here
    return next()
  }
})

export default router
