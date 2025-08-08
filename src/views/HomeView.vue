<template>
  <div class="app-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h3>無人機系統</h3>
      </div>
      <nav class="sidebar-nav">
        <RouterLink to="/">儀表板</RouterLink>
        <RouterLink to="/flight-logs">飛行日誌</RouterLink>
        <RouterLink to="/equipment">設備管理</RouterLink>
      </nav>
      <div class="sidebar-footer">
        <button @click="handleLogout" class="logout-button">登出</button>
      </div>
    </aside>

    <main class="main-content">
      <header class="main-header">
        <span>歡迎您，{{ store.username }}</span>
      </header>
      <div class="page-content">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script setup>
import { RouterView, RouterLink, useRouter } from 'vue-router';
import { store } from '../store.js';

const router = useRouter();

const handleLogout = () => {
  // *** FIX: 從 localStorage 移除登入資訊 ***
  localStorage.removeItem('authToken');
  localStorage.removeItem('username');

  // 清除 store (記憶體)
  store.isAuthenticated = false;
  store.authToken = null;
  store.username = null;
  
  // 導航回登入頁面
  router.push('/login');
};
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 250px;
  background-color: #2c3e50;
  color: white;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-header {
  padding: 1.5rem;
  text-align: center;
  font-size: 1.2rem;
  border-bottom: 1px solid #34495e;
}

.sidebar-nav {
  flex-grow: 1;
  padding: 1rem 0;
}

.sidebar-nav a {
  display: block;
  padding: 1rem 1.5rem;
  color: #bdc3c7;
  text-decoration: none;
  transition: background-color 0.2s, color 0.2s;
}

.sidebar-nav a:hover,
.sidebar-nav a.router-link-exact-active {
  background-color: #34495e;
  color: white;
}

.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid #34495e;
}

.logout-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.main-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  background-color: #f0f2f5;
  overflow-y: auto;
}

.main-header {
  padding: 1rem 2rem;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  text-align: right;
}

.page-content {
  flex-grow: 1;
}
</style>
