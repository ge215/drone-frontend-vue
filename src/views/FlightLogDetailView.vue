<template>
  <div class="page-container">
    <div class="detail-container" v-if="log && !isLoading">
      <div class="detail-header">
        <h1><i class="fa-solid fa-paper-plane"></i> {{ log.mission_name }}</h1>
        
        <div class="header-actions">
          <RouterLink
            v-if="store.username === log.main_pilot_username"
            :to="{ path: '/flight-logs', query: { edit: log.id } }"
            class="action-button edit-button"
          >
            <i class="fa-solid fa-pencil"></i> 編輯
          </RouterLink>
          
          <button
            v-if="store.username === log.main_pilot_username"
            @click="handleDelete"
            class="action-button delete-button"
          >
            <i class="fa-solid fa-trash"></i> 刪除
          </button>
          
          <RouterLink to="/flight-logs" class="action-button back-button">
            <i class="fa-solid fa-arrow-left"></i> 返回列表
          </RouterLink>
        </div>
      </div>

      <div class="detail-grid">
        <p><strong><i class="fa-solid fa-location-dot"></i> 地點:</strong> {{ log.location }}</p>
        <p><strong><i class="fa-solid fa-calendar-days"></i> 日期:</strong> {{ log.flight_date }}</p>
        <p><strong><i class="fa-solid fa-clock"></i> 飛行時長:</strong> {{ log.duration_minutes }} 分鐘</p>
        <p><strong><i class="fa-solid fa-user-astronaut"></i> 主飛手:</strong> {{ log.main_pilot_username }}</p>
      </div>

      <div class="detail-section" v-if="log.assistant_pilots_details && log.assistant_pilots_details.length > 0">
        <h3><i class="fa-solid fa-users"></i> 副飛手</h3>
        <ul>
          <li v-for="pilot in log.assistant_pilots_details" :key="pilot">{{ pilot }}</li>
        </ul>
      </div>

      <div class="detail-section" v-if="log.equipment_used_details && log.equipment_used_details.length > 0">
        <h3><i class="fa-solid fa-toolbox"></i> 使用設備</h3>
        <ul>
          <li v-for="equip in log.equipment_used_details" :key="equip">{{ equip }}</li>
        </ul>
      </div>

    </div>
    <div v-if="isLoading" class="loading-message">
      <p>正在載入日誌資料...</p>
    </div>
    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
      <RouterLink to="/flight-logs" class="back-button">返回列表</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useToast } from 'vue-toastification';
import { store } from '../store.js'; // 引入 store 是 v-if 能夠判斷使用者身份的關鍵

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const router = useRouter();
const toast = useToast();
const log = ref(null);
const isLoading = ref(true);
const error = ref(null);
const apiUrlBase = 'https://drone-api-v2.onrender.com';

// 刪除功能的函式，對應到刪除按鈕的 @click
const handleDelete = async () => {
  if (!confirm('您確定要永久刪除這筆日誌嗎？此操作無法復原。')) return;

  try {
    await axios.delete(`${apiUrlBase}/api/flight-logs/${props.id}/`, {
      headers: { 'Authorization': `Token ${store.authToken}` }
    });
    toast.error('日誌已成功刪除');
    router.push('/flight-logs'); // 刪除成功後，跳轉回列表頁
  } catch (err) {
    console.error('刪除日誌失敗:', err);
    toast.error('刪除失敗，請稍後再試。');
  }
};

onMounted(async () => {
  try {
    // 從後端 API 獲取資料，後端回傳的資料決定了畫面上顯示的內容
    const response = await axios.get(`${apiUrlBase}/api/flight-logs/${props.id}/`);
    log.value = response.data;
  } catch (err) {
    console.error('獲取日誌詳情失敗:', err);
    error.value = '無法載入飛行日誌，可能該日誌不存在或發生錯誤。';
    toast.error(error.value);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.page-container { padding: 2rem; }
.detail-container { background-color: #fff; padding: 2em; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.detail-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 1em; margin-bottom: 1em; }
.detail-header h1 { margin: 0; font-size: 1.8em; color: #333; }
.header-actions { display: flex; gap: 0.75em; }
.action-button { display: inline-flex; align-items: center; gap: 6px; padding: 0.6em 1.2em; border-radius: 5px; text-decoration: none; color: white; border: none; cursor: pointer; transition: opacity 0.2s; }
.action-button:hover { opacity: 0.85; }
.edit-button { background-color: #ffc107; }
.delete-button { background-color: #dc3545; }
.back-button { background-color: #6c757d; }
.detail-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1em; margin-bottom: 2em; }
.detail-grid p { background-color: #f8f9fa; padding: 0.8em; border-radius: 5px; margin: 0; }
.detail-section h3 { border-bottom: 2px solid #007bff; padding-bottom: 0.5em; margin-top: 1.5em; color: #333; }
.detail-section ul { list-style-type: none; padding-left: 0; }
.detail-section li { padding: 0.5em; border-bottom: 1px solid #f0f0f0; }
i { margin-right: 10px; color: #555; width: 20px; text-align: center; }
.loading-message, .error-message { text-align: center; padding: 2rem; font-size: 1.2em; color: #666; }
</style>