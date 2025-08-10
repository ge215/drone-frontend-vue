import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import DashboardView from '../views/DashboardView.vue'
import FlightLogsView from '../views/FlightLogsView.vue'
import EquipmentView from '../views/EquipmentView.vue'
import FlightLogDetailView from '../views/FlightLogDetailView.vue' // <-- 1. 匯入詳情頁元件
import { store } from '../store.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
      children: [
        { path: '', name: 'dashboard', component: DashboardView },
        { 
          path: 'flight-logs', 
          name: 'FlightLogs', // 統一命名風格為大寫開頭
          component: FlightLogsView 
        },
        { 
          path: 'flight-logs/:id', // <-- 2. 加入詳情頁的動態路由
          name: 'FlightLogDetail', 
          component: FlightLogDetailView,
          props: true 
        },
        { path: 'equipment', name: 'equipment', component: EquipmentView }
      ]
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !store.isAuthenticated) {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router