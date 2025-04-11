import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CategoriesView from '../views/CategoriesView.vue'
import ZakatPendapatanView from '@/views/ZakatPendapatanView.vue'
import PaymentView from '@/views/PaymentView.vue'
import TransactionHistoryView from '@/views/TransactionHistoryView.vue'
import HistoryView from '@/views/HistoryView.vue'
import AsnafReportingView from '@/views/AsnafReportingView.vue'

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
    }
    // Add other routes as needed
  ]
})

export default router
