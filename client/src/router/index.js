import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CategoriesView from '../views/CategoriesView.vue'
import ZakatPendapatanView from '@/views/ZakatPendapatanView.vue'
import PaymentView from '@/views/PaymentView.vue'
import TransactionHistoryView from '@/views/TransactionHistoryView.vue'
import HistoryView from '@/views/HistoryView.vue'
import AsnafReportingView from '@/views/AsnafReportingView.vue'
import AuditZakatView from '@/views/AuditZakatView.vue'
import { getAuth } from 'firebase/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/categories',
      name: 'categories',
      component: CategoriesView
    },
    {
      path: '/zakat-pendapatan',
      name: 'zakat-pendapatan',
      component: ZakatPendapatanView
    },
    {
      path: '/payment',
      name: 'payment',
      component: PaymentView
    },
    {
      path: '/transaction-history',
      name: 'transaction-history',
      component: TransactionHistoryView
    },
    {
      path: '/history',
      name: 'history',
      component: HistoryView
    },
    {
      path: '/asnaf-reporting',
      name: 'asnaf-reporting',
      component: AsnafReportingView
    },
    {
      path: '/audit-zakat',
      name: 'audit-zakat',
      component: AuditZakatView
    },
    {
      path: '/admin/login',
      name: 'AdminLogin',
      component: () => import('../views/admin/LoginView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/admin/dashboard',
      name: 'AdminDashboard',
      component: () => import('../views/admin/DashboardView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    }
  ]
})

// Add admin authentication guard
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);
  
  const auth = getAuth();
  const currentUser = auth.currentUser;
  
  if (requiresAuth && !currentUser) {
    next('/admin/login');
  } else if (requiresAdmin) {
    // Check if user is an admin
    // This is a simplified example - you should implement proper admin role checking
    // For example, checking a user's role in Firestore
    try {
      // You would check admin status here
      // For now, we'll just let them through
      next();
    } catch (error) {
      console.error('Error checking admin status:', error);
      next('/admin/login');
    }
  } else {
    next();
  }
});

export default router
