import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue' // <-- 匯入註冊頁面
import DashboardView from '../views/DashboardView.vue'
import FlightLogsView from '../views/FlightLogsView.vue'
import EquipmentView from '../views/EquipmentView.vue'
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
        { path: 'flight-logs', name: 'flight-logs', component: FlightLogsView },
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
