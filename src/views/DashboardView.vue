<template>
  <div class="dashboard">
    <h1>儀表板</h1>
    <p class="welcome-message">歡迎回來，{{ store.username }}！這裡是您團隊的飛行數據總覽。</p>

    <!-- 數據卡片區塊 -->
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>正在載入統計數據...</p>
    </div>
    <div v-else class="stats-grid">
      <div class="stat-card">
        <i class="fa-solid fa-satellite-dish card-icon"></i>
        <div class="stat-value">{{ stats.equipment_count }}</div>
        <div class="stat-label">設備總數</div>
      </div>
      <div class="stat-card">
        <i class="fa-solid fa-book card-icon"></i>
        <div class="stat-value">{{ stats.log_count }}</div>
        <div class="stat-label">日誌總數</div>
      </div>
      <div class="stat-card">
        <i class="fa-solid fa-clock card-icon"></i>
        <div class="stat-value">{{ flightHours }}</div>
        <div class="stat-label">總飛行時數 (小時)</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { store } from '../store.js';
import { useToast } from 'vue-toastification';

const toast = useToast();
const isLoading = ref(true);
const stats = ref({
  equipment_count: 0,
  log_count: 0,
  total_flight_duration_minutes: 0,
});

const apiUrlBase = 'https://drone-api-v2.onrender.com';

// 使用 computed 屬性來自動計算並格式化飛行時數
const flightHours = computed(() => {
  if (stats.value.total_flight_duration_minutes) {
    // 將分鐘轉換為小時，並保留一位小數
    return (stats.value.total_flight_duration_minutes / 60).toFixed(1);
  }
  return 0;
});

const fetchStats = async () => {
  isLoading.value = true;
  if (!store.authToken) return;
  try {
    const response = await axios.get(`${apiUrlBase}/api/dashboard-stats/`, {
      headers: { 'Authorization': `Token ${store.authToken}` }
    });
    stats.value = response.data;
  } catch (error) {
    console.error('獲取儀表板數據失敗:', error);
    toast.error('無法載入儀表板數據。');
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchStats();
});
</script>

<style scoped>
.dashboard {
  padding: 2rem;
}
.welcome-message {
  font-size: 1.1rem;
  color: #555;
  margin-bottom: 2rem;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}
.stat-card {
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
}
.stat-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}
.card-icon {
    font-size: 2.5rem;
    color: #007bff;
    margin-bottom: 1rem;
}
.stat-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: #333;
}
.stat-label {
  font-size: 1rem;
  color: #777;
  margin-top: 0.5rem;
}
.loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1em;
    padding: 2em;
    color: #888;
}
.spinner {
  display: inline-block;
  width: 2em;
  height: 2em;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #333;
  animation: spin 1s ease-in-out infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
