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

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Auth routes
    {
      path: '/signup',
      name: 'signup',
      component: () => import('@/views/auth/SignupView.vue'),
      meta: { requiresUserAuth: false },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { requiresUserAuth: false },
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
      path: '/admin/login',
      name: 'AdminLogin',
      component: () => import('../views/admin/LoginView.vue'),
      meta: { requiresAuth: false }, // Keep admin auth logic separate for now
    },
    {
      path: '/admin/dashboard',
      name: 'AdminDashboard',
      component: () => import('../views/admin/DashboardView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true, requiresUserAuth: true }, // Added requiresUserAuth
    },
    {
      path: '/admin/impact-monitoring',
      name: 'ImpactMonitoring',
      component: () => import('../views/admin/ImpactMonitoringView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true, requiresUserAuth: true }, // Added requiresUserAuth
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
        currency: route.query.currency
      }),
      meta: { requiresUserAuth: true }
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
        requiresAuth: true
      }
    },
  ],
})

// Add user authentication guard
import { getCurrentUser } from '@/services/authService'

router.beforeEach(async (to, from, next) => {
  // Admin guard (existing)
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin)
  const requiresUserAuth = to.matched.some((record) => record.meta.requiresUserAuth)

  const currentUser = getCurrentUser()

  if (requiresAuth && !currentUser) {
    next('/admin/login')
  } else if (requiresAdmin) {
    // Check if user is an admin
    // This is a simplified example - you should implement proper admin role checking
    // For example, checking a user's role in Firestore
    try {
      // You would check admin status here
      // For now, we'll just let them through
      next()
    } catch (error) {
      console.error('Error checking admin status:', error)
      next('/admin/login')
    }
  } else if (requiresUserAuth && !currentUser) {
    next('/login')
  } else {
    next()
  }
})

export default router
