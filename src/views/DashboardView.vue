<template>
  <div class="dashboard">
    <h1>儀表板</h1>
    <p class="welcome-message">歡迎回來，{{ store.username }}！這裡是您團隊的飛行數據總覽。</p>

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

    <div class="recent-logs-section">
      <h2>近期動態</h2>
      <div class="tabs-container">
        <button 
          @click="activeTab = 'created'" 
          :class="['tab-button', { active: activeTab === 'created' }]"
        >
          <i class="fa-solid fa-plus"></i> 最新建立
        </button>
        <button 
          @click="activeTab = 'flights'" 
          :class="['tab-button', { active: activeTab === 'flights' }]"
        >
          <i class="fa-solid fa-plane-up"></i> 近期飛行
        </button>
      </div>

      <div class="tab-content">
        <RecentLogList v-if="activeTab === 'created'" :logs="recentLogs.recently_created" />
        <RecentLogList v-if="activeTab === 'flights'" :logs="recentLogs.recent_flights" />
      </div>
    </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, onActivated } from 'vue';
import axios from 'axios';
import { store } from '../store.js';
import { useToast } from 'vue-toastification';
// 1. 引入剛剛建立的新元件
import RecentLogList from '../components/RecentLogList.vue';

const toast = useToast();
const isLoading = ref(true);
const stats = ref({
  equipment_count: 0,
  log_count: 0,
  total_flight_duration_minutes: 0,
});

// 2. 新增 state 來儲存近期日誌資料和當前選擇的頁籤
const recentLogs = ref({
  recently_created: [],
  recent_flights: [],
});
const activeTab = ref('created'); // 預設顯示 '最新建立'

const apiUrlBase = 'https://drone-api-v2.onrender.com';

const flightHours = computed(() => {
  if (stats.value.total_flight_duration_minutes) {
    return (stats.value.total_flight_duration_minutes / 60).toFixed(1);
  }
  return 0;
});

// 3. 分拆 API 請求，一個負責統計數據，一個負責近期日誌
const fetchStats = async () => {
  if (!store.authToken) return;
  try {
    const response = await axios.get(`${apiUrlBase}/api/dashboard-stats/`, {
      headers: { 'Authorization': `Token ${store.authToken}` }
    });
    stats.value = response.data;
  } catch (error) {
    console.error('獲取儀表板數據失敗:', error);
    toast.error('無法載入儀表板數據。');
  }
};

const fetchRecentLogs = async () => {
  if (!store.authToken) return;
  try {
    // 注意：這裡的 API 端點是我們假設的
    const response = await axios.get(`${apiUrlBase}/api/recent-logs/`, {
        headers: { 'Authorization': `Token ${store.authToken}` }
    });
    recentLogs.value = response.data;
  } catch (error) {
    console.error('獲取近期日誌失敗:', error);
    // 這邊可以先不提示錯誤，避免在後端API還沒好時一直跳通知
    // toast.error('無法載入近期日誌。');
  }
}

// 4. 建立一個主載入函式，使用 Promise.all 同時發送多個請求
const loadAllData = async () => {
  isLoading.value = true;
  await Promise.all([
    fetchStats(),
    fetchRecentLogs()
  ]);
  isLoading.value = false;
};


onMounted(() => {
  loadAllData();
});

onActivated(() => {
  loadAllData();
});
</script>

<style scoped>
.dashboard { padding: 2rem; }
.welcome-message { font-size: 1.1rem; color: #555; margin-bottom: 2rem; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; }
.stat-card { background-color: #fff; padding: 1.5rem; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); text-align: center; transition: transform 0.2s, box-shadow 0.2s; }
.stat-card:hover { transform: translateY(-5px); box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12); }
.card-icon { font-size: 2.5rem; color: #007bff; margin-bottom: 1rem; }
.stat-value { font-size: 2.5rem; font-weight: bold; color: #333; }
.stat-label { font-size: 1rem; color: #777; margin-top: 0.5rem; }
.loading-container { display: flex; justify-content: center; align-items: center; gap: 1em; padding: 2em; color: #888; }
.spinner { display: inline-block; width: 2em; height: 2em; border: 3px solid rgba(0, 0, 0, 0.1); border-radius: 50%; border-top-color: #333; animation: spin 1s ease-in-out infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ▼▼▼ 新增的頁籤樣式 ▼▼▼ */
.recent-logs-section {
  margin-top: 3rem;
  background-color: #fff;
  padding: 1.5rem 2rem 2rem 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.recent-logs-section h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
}
.tabs-container {
  display: flex;
  border-bottom: 2px solid #dee2e6;
  margin-bottom: 1.5rem;
}
.tab-button {
  padding: 0.75rem 1.25rem;
  border: none;
  background-color: transparent;
  cursor: pointer;
  font-size: 1rem;
  color: #495057;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px; /* 讓底下 border 跟 tabs-container 的 border 重合 */
  transition: color 0.2s, border-color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.tab-button:hover {
  color: #0056b3;
}
.tab-button.active {
  color: #007bff;
  border-color: #007bff;
  font-weight: 600;
}
</style>