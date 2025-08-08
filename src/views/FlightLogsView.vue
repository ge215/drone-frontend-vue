<template>
  <div class="page-container">
    <h1>飛行日誌管理</h1>

    <!-- 編輯日誌區塊 (預設隱藏) -->
    <div v-if="isEditing" class="container">
      <h2>編輯飛行日誌</h2>
      <form @submit.prevent="handleUpdateLog">
        <input type="text" v-model="editingLog.mission_name" placeholder="任務名稱" required>
        <input type="text" v-model="editingLog.location" placeholder="地點" required>
        <input type="date" v-model="editingLog.flight_date" required>
        <input type="number" v-model="editingLog.duration_minutes" placeholder="飛行時長 (分鐘)" required>
        <label>選擇使用的設備 (可按住 Ctrl 多選):</label>
        <select v-model="editingLog.equipment_used" multiple required>
          <option v-for="equip in equipmentList" :key="equip.id" :value="equip.id">
            {{ equip.model_name }} ({{ equip.serial_number }})
          </option>
        </select>
        <button type="submit">儲存變更</button>
        <button type="button" @click="cancelEdit" style="background-color: #6c757d; margin-top: 0.5em;">取消</button>
      </form>
    </div>

    <!-- 新增日誌區塊 -->
    <div v-else class="container">
      <h2>新增飛行日誌</h2>
      <form @submit.prevent="handleAddLog">
        <input type="text" v-model="newLog.mission_name" placeholder="任務名稱" required>
        <input type="text" v-model="newLog.location" placeholder="地點" required>
        <input type="date" v-model="newLog.flight_date" required>
        <input type="number" v-model="newLog.duration_minutes" placeholder="飛行時長 (分鐘)" required>
        <label>選擇使用的設備 (可按住 Ctrl 多選):</label>
        <select v-model="newLog.equipment_used" multiple required>
          <option v-for="equip in equipmentList" :key="equip.id" :value="equip.id">
            {{ equip.model_name }} ({{ equip.serial_number }})
          </option>
        </select>
        <button type="submit">新增日誌</button>
      </form>
    </div>

    <!-- 日誌列表區塊 -->
    <div class="container">
      <h2>飛行日誌列表</h2>
      <p v-if="isLoading">正在載入日誌...</p>
      <p v-else-if="logs.length === 0">目前沒有任何飛行日誌。</p>
      <div v-else>
        <div v-for="log in logs" :key="log.id" class="log-entry">
          <div class="log-header">
            <h3>任務名稱: {{ log.mission_name }}</h3>
            <div v-if="store.username === log.pilot_username" class="action-buttons">
              <!-- *** FIX: 移除 disabled 屬性 *** -->
              <button @click="handleEditClick(log)" class="edit-button">編輯</button>
              <button @click="handleDeleteLog(log.id)" class="delete-button">刪除</button>
            </div>
          </div>
          <p><strong>地點:</strong> {{ log.location }}</p>
          <p><strong>日期:</strong> {{ log.flight_date }}</p>
          <p><strong>飛手:</strong> {{ log.pilot_username }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { store } from '../store.js';

const logs = ref([]);
const equipmentList = ref([]);
const isLoading = ref(true);
const isEditing = ref(false);
const newLog = ref({
  mission_name: '',
  location: '',
  flight_date: '',
  duration_minutes: null,
  equipment_used: [],
});
const editingLog = ref(null);

const apiUrlBase = 'https://drone-api-v2.onrender.com';

const fetchLogs = async () => {
  isLoading.value = true;
  try {
    const response = await axios.get(`${apiUrlBase}/api/flight-logs/`);
    logs.value = response.data;
  } catch (error) {
    console.error('獲取日誌列表失敗:', error);
    alert('無法載入飛行日誌。');
  } finally {
    isLoading.value = false;
  }
};

const fetchEquipment = async () => {
  if (!store.authToken) return;
  try {
    const response = await axios.get(`${apiUrlBase}/api/equipment/`, {
      headers: { 'Authorization': `Token ${store.authToken}` }
    });
    equipmentList.value = response.data;
  } catch (error) {
    console.error('獲取設備列表失敗:', error);
  }
};

const handleAddLog = async () => {
  if (!store.authToken) return;
  try {
    await axios.post(`${apiUrlBase}/api/flight-logs/`, newLog.value, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${store.authToken}`
      }
    });
    newLog.value = { mission_name: '', location: '', flight_date: '', duration_minutes: null, equipment_used: [] };
    fetchLogs();
  } catch (error) {
    console.error('新增日誌失敗:', error.response.data);
    alert(`新增失敗: ${JSON.stringify(error.response.data)}`);
  }
};

const handleDeleteLog = async (logId) => {
  if (!store.authToken || !confirm('您確定要刪除這筆日誌嗎？')) return;
  try {
    await axios.delete(`${apiUrlBase}/api/flight-logs/${logId}/`, {
      headers: { 'Authorization': `Token ${store.authToken}` }
    });
    fetchLogs();
  } catch (error) {
    console.error('刪除日誌失敗:', error);
    alert('刪除失敗。');
  }
};

const handleEditClick = (logToEdit) => {
  editingLog.value = JSON.parse(JSON.stringify(logToEdit));
  isEditing.value = true;
  if (equipmentList.value.length === 0) {
      fetchEquipment();
  }
};

const cancelEdit = () => {
  isEditing.value = false;
  editingLog.value = null;
};

const handleUpdateLog = async () => {
  if (!store.authToken || !editingLog.value) return;
  const logId = editingLog.value.id;
  try {
    const payload = { ...editingLog.value };
    delete payload.pilot_username;
    delete payload.url;

    await axios.put(`${apiUrlBase}/api/flight-logs/${logId}/`, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${store.authToken}`
      }
    });
    cancelEdit();
    fetchLogs();
  } catch (error) {
    console.error('更新日誌失敗:', error.response.data);
    alert(`更新失敗: ${JSON.stringify(error.response.data)}`);
  }
};

onMounted(() => {
  fetchLogs();
  fetchEquipment();
});
</script>

<style scoped>
.page-container {
  padding: 2rem;
}
.container { 
  background-color: #fff; 
  padding: 2em; 
  border-radius: 8px; 
  box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
  margin-bottom: 2em;
}
.log-entry { 
  position: relative; 
  border: 1px solid #e0e0e0; 
  padding: 1.5em; 
  margin-bottom: 1em; 
  border-radius: 8px; 
  background-color: #fafafa; 
}
form { 
  display: flex; 
  flex-direction: column; 
  gap: 1em; 
}
input, select, button { 
  padding: 0.8em; 
  font-size: 1em; 
  border-radius: 5px; 
  border: 1px solid #ccc; 
}
select[multiple] { 
  height: 150px; 
}
button { 
  background-color: #007bff; 
  color: white; 
  border: none; 
  cursor: pointer; 
}
.action-buttons {
  flex-shrink: 0;
}
.action-buttons button { 
  display: inline-block; 
  font-size: 0.8em; 
  padding: 0.4em 0.8em; 
  margin-left: 0.5em;
}
.edit-button { 
  background-color: #ffc107; 
}
.delete-button { 
  background-color: #dc3545; 
}
.log-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
}
</style>
