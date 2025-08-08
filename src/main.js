import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 1. 匯入 Toast 套件和它的 CSS 樣式
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

const app = createApp(App)

app.use(router)

// 2. 告訴 Vue 使用 Toast 套件，並可以傳入一些預設設定
app.use(Toast, {
  transition: "Vue-Toastification__bounce",
  maxToasts: 5,
  newestOnTop: true
})

app.mount('#app')
