<template>
  <div class="page-container">
    <h1>飛行日誌管理</h1>

    <!-- 編輯/新增 表單容器 -->
    <div class="container">
      <h2>{{ isEditing ? '編輯飛行日誌' : '新增飛行日誌' }}</h2>
      <form @submit.prevent="isEditing ? handleUpdateLog() : handleAddLog()">
        <input type="text" v-model="formModel.mission_name" placeholder="任務名稱" required>
        <input type="text" v-model="formModel.location" placeholder="地點" required>
        <input type="date" v-model="formModel.flight_date" required>
        <input type="number" v-model.number="formModel.duration_minutes" placeholder="飛行時長 (分鐘)" required>
        
        <label>選擇主飛手:</label>
        <select v-model="formModel.main_pilot" required>
          <option disabled :value="null">請選擇一位主飛手</option>
          <option v-for="pilot in userList" :key="pilot.id" :value="pilot.id">
            {{ pilot.username }}
          </option>
        </select>

        <label>選擇副飛手 (可不選，或按住 Ctrl 多選):</label>
        <select v-model="formModel.assistant_pilots" multiple>
          <option v-for="pilot in userList" :key="pilot.id" :value="pilot.id">
            {{ pilot.username }}
          </option>
        </select>

        <label>選擇使用的設備 (可按住 Ctrl 多選):</label>
        <select v-model="formModel.equipment_used" multiple required>
          <option v-for="equip in equipmentList" :key="equip.id" :value="equip.id">
            {{ equip.model_name }} ({{ equip.serial_number }})
          </option>
        </select>
        
        <button type="submit" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="spinner"></span>
          <span v-else>{{ isEditing ? '儲存變更' : '新增日誌' }}</span>
        </button>
        <button v-if="isEditing" type="button" @click="cancelEdit" style="background-color: #6c757d; margin-top: 0.5em;">取消</button>
      </form>
    </div>

    <!-- 日誌列表區塊 -->
    <div class="container">
      <h2>飛行日誌列表</h2>
      <div v-if="isLoading">
        <SkeletonLoader v-for="n in 3" :key="n" />
      </div>
      <p v-else-if="logs.length === 0">目前沒有任何飛行日誌。</p>
      <div v-else>
        <div v-for="log in logs" :key="log.id" class="log-entry">
          <div class="log-header">
            <h3><i class="fa-solid fa-paper-plane"></i> 任務名稱: {{ log.mission_name }}</h3>
            <!-- 只有主飛手才能編輯/刪除 -->
            <div v-if="store.username === log.main_pilot_username" class="action-buttons">
              <button @click="handleEditClick(log)" class="edit-button" :disabled="isSubmitting"><i class="fa-solid fa-pencil"></i> 編輯</button>
              <button @click="handleDeleteLog(log.id)" class="delete-button" :disabled="isSubmitting"><i class="fa-solid fa-trash"></i> 刪除</button>
            </div>
          </div>
          <p><strong><i class="fa-solid fa-location-dot"></i> 地點:</strong> {{ log.location }}</p>
          <p><strong><i class="fa-solid fa-calendar-days"></i> 日期:</strong> {{ log.flight_date }}</p>
          <p><strong><i class="fa-solid fa-clock"></i> 飛行時長:</strong> {{ log.duration_minutes }} 分鐘</p>
          <p><strong><i class="fa-solid fa-user-astronaut"></i> 主飛手:</strong> {{ log.main_pilot_username }}</p>
          
          <div v-if="log.assistant_pilots_details && log.assistant_pilots_details.length > 0">
            <strong><i class="fa-solid fa-users"></i> 副飛手:</strong>
            <ul><li v-for="pilot in log.assistant_pilots_details" :key="pilot">{{ pilot }}</li></ul>
          </div>

          <div v-if="log.equipment_used_details && log.equipment_used_details.length > 0">
            <strong><i class="fa-solid fa-toolbox"></i> 使用設備:</strong>
            <ul><li v-for="equip in log.equipment_used_details" :key="equip">{{ equip }}</li></ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { store } from '../store.js';
import { useToast } from 'vue-toastification';
import SkeletonLoader from '../components/SkeletonLoader.vue';

const toast = useToast();
const logs = ref([]);
const equipmentList = ref([]);
const userList = ref([]);
const isLoading = ref(true);
const isSubmitting = ref(false);
const isEditing = ref(false);

const initialFormState = {
  mission_name: '',
  location: '',
  flight_date: '',
  duration_minutes: null,
  main_pilot: null,
  assistant_pilots: [],
  equipment_used: [],
};

const formModel = ref({ ...initialFormState });

const apiUrlBase = 'https://drone-api-v2.onrender.com';

const fetchLogs = async () => {
  isLoading.value = true;
  try {
    const response = await axios.get(`${apiUrlBase}/api/flight-logs/`);
    logs.value = response.data;
  } catch (error) {
    console.error('獲取日誌列表失敗:', error);
    toast.error('無法載入飛行日誌。');
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

const fetchUsers = async () => {
  if (!store.authToken) return;
  try {
    const response = await axios.get(`${apiUrlBase}/api/users/`, {
         headers: { 'Authorization': `Token ${store.authToken}` }
    });
    userList.value = response.data;
  } catch (error) {
    console.error('獲取使用者列表失敗:', error);
    toast.error('無法載入飛手列表，請確認您有管理員權限。');
  }
};

const handleAddLog = async () => {
  if (!store.authToken) return;
  isSubmitting.value = true;
  try {
    await axios.post(`${apiUrlBase}/api/flight-logs/`, formModel.value, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${store.authToken}`
      }
    });
    formModel.value = { ...initialFormState };
    fetchLogs();
    toast.success('日誌新增成功！');
  } catch (error) {
    console.error('新增日誌失敗:', error.response.data);
    toast.error(`新增失敗: ${JSON.stringify(error.response.data)}`);
  } finally {
    isSubmitting.value = false;
  }
};

const handleDeleteLog = async (logId) => {
  if (!store.authToken || !confirm('您確定要刪除這筆日誌嗎？')) return;
  isSubmitting.value = true;
  try {
    await axios.delete(`${apiUrlBase}/api/flight-logs/${logId}/`, {
      headers: { 'Authorization': `Token ${store.authToken}` }
    });
    fetchLogs();
    toast.error('日誌刪除成功！');
  } catch (error) {
    console.error('刪除日誌失敗:', error);
    toast.error('刪除失敗。');
  } finally {
    isSubmitting.value = false;
  }
};

const handleEditClick = (logToEdit) => {
  formModel.value = {
      id: logToEdit.id,
      mission_name: logToEdit.mission_name,
      location: logToEdit.location,
      flight_date: logToEdit.flight_date,
      duration_minutes: logToEdit.duration_minutes,
      main_pilot: logToEdit.main_pilot,
      assistant_pilots: logToEdit.assistant_pilots,
      equipment_used: logToEdit.equipment_used,
  };
  isEditing.value = true;
};

const cancelEdit = () => {
  isEditing.value = false;
  formModel.value = { ...initialFormState };
};

const handleUpdateLog = async () => {
  if (!store.authToken || !formModel.value.id) return;
  isSubmitting.value = true;
  const logId = formModel.value.id;
  try {
    await axios.put(`${apiUrlBase}/api/flight-logs/${logId}/`, formModel.value, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${store.authToken}`
      }
    });
    cancelEdit();
    fetchLogs();
    toast.warning('日誌更新成功！');
  } catch (error) {
    console.error('更新日誌失敗:', error.response.data);
    toast.error(`更新失敗: ${JSON.stringify(error.response.data)}`);
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  fetchLogs();
  fetchEquipment();
  // *** FIX: 暫時註解掉 fetchUsers()，讓頁面可以先正常顯示 ***
  // fetchUsers(); 
});
</script>

<style scoped>
.page-container { padding: 2rem; }
.container { background-color: #fff; padding: 2em; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 2em; }
.log-entry { position: relative; border: 1px solid #e0e0e0; padding: 1.5em; margin-bottom: 1em; border-radius: 8px; background-color: #fafafa; }
.log-entry i { margin-right: 8px; color: #555; width: 1.2em; text-align: center; }
ul { margin-top: 0.5em; padding-left: 2.2em; list-style-type: none; }
form { display: flex; flex-direction: column; gap: 1em; }
input, select, button { padding: 0.8em; font-size: 1em; border-radius: 5px; border: 1px solid #ccc; }
select[multiple] { height: 150px; }
button { background-color: #007bff; color: white; border: none; cursor: pointer; }
.action-buttons { flex-shrink: 0; }
.action-buttons button { display: inline-block; font-size: 0.8em; padding: 0.4em 0.8em; margin-left: 0.5em; }
.action-buttons i { margin-right: 5px; }
.edit-button { background-color: #ffc107; }
.delete-button { background-color: #dc3545; }
.log-header { display: flex; justify-content: space-between; align-items: center; }
</style>
