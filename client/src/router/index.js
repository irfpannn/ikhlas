import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CategoriesView from '../views/CategoriesView.vue'
import ZakatPendapatanView from '@/views/ZakatPendapatanView.vue'
import PaymentView from '@/views/PaymentView.vue'
import TransactionHistoryView from '@/views/TransactionHistoryView.vue'
import HistoryView from '@/views/HistoryView.vue'
import AsnafReportingView from '@/views/AsnafReportingView.vue'
import AuditZakatView from '@/views/AuditZakatView.vue'
import ZakatSahamView from '@/views/ZakatSahamView.vue'
import ZakatFitrahView from '@/views/ZakatFitrahView.vue'
import ZakatStatsView from '@/views/ZakatStatsView.vue' // Import the new view
import { getAuth } from 'firebase/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/categories',
      name: 'categories',
      component: CategoriesView,
    },
    {
      path: '/zakat-pendapatan',
      name: 'zakat-pendapatan',
      component: ZakatPendapatanView,
    },
    {
      path: '/zakat-wang-simpanan',
      name: 'zakat-wang-simpanan',
      component: () => import('@/views/ZakatWangSimpananView.vue'),
    },
    {
      path: '/zakat-emas',
      name: 'zakat-emas',
      component: () => import('@/views/ZakatEmasView.vue'),
    },
    {
      path: '/zakat-saham',
      name: 'zakat-saham',
      component: ZakatSahamView,
    },
    {
      path: '/zakat-fitrah',
      name: 'zakat-fitrah',
      component: ZakatFitrahView,
    },
    {
      path: '/zakat-stats', // Add path for Zakat Stats
      name: 'zakat-stats', // Add route name
      component: ZakatStatsView, // Point to the imported component
    },
    {
      path: '/payment',
      name: 'payment',
      component: PaymentView,
    },

    {
      path: '/transaction-history',
      name: 'transaction-history',
      component: TransactionHistoryView,
    },
    {
      path: '/history',
      name: 'history',
      component: HistoryView,
    },
    {
      path: '/asnaf-reporting',
      name: 'asnaf-reporting',
      component: AsnafReportingView,
    },
    {
      path: '/audit-zakat',
      name: 'audit-zakat',
      component: AuditZakatView,
    },
    {
      path: '/distribution-sources',
      name: 'DistributionSources',
      component: () => import('../views/DistributionSourcesView.vue'),
      // meta: {
      //   requiresAuth: true
      // }
    },
    {
      path: '/admin/login',
      name: 'AdminLogin',
      component: () => import('../views/admin/LoginView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/admin/dashboard',
      name: 'AdminDashboard',
      component: () => import('../views/admin/DashboardView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/impact-monitoring',
      name: 'ImpactMonitoring',
      component: () => import('../views/admin/ImpactMonitoringView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/donation',
      name: 'donation',
      component: () => import('@/views/DonationView.vue'),
    },
    {
      path: '/donation/:id',
      name: 'DonationDetails',
      component: () => import('@/views/DonationDetailsView.vue'),
    },
    {
      path: '/donation/:id/payment',
      name: 'DonationPayment',
      component: () => import('@/views/DonationPaymentView.vue'),
    },
    {
      path: '/donation/:id/success',
      name: 'DonationSuccess',
      component: () => import('@/views/DonationSuccessView.vue'),
    },
    {
      path: '/rewards',
      name: 'rewards',
      component: () => import('@/views/RewardsView.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
    },
  ],
})

// Add admin authentication guard
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin)

  const auth = getAuth()
  const currentUser = auth.currentUser

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
  } else {
    next()
  }
})

export default router
