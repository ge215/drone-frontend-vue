<template>
  <div class="page-container">
    <h1>飛行日誌管理</h1>

    <div class="container">
      <h2>{{ isEditing ? '編輯飛行日誌' : '新增飛行日誌' }}</h2>
      <form @submit.prevent="isEditing ? handleUpdateLog() : handleAddLog()">
        <input type="text" v-model="formModel.mission_name" placeholder="任務名稱" required>
        
        <label for="location-text">地點文字描述:</label>
        <div class="location-input-group">
          <input type="text" id="location-text" v-model="formModel.location" placeholder="輸入地標或地址後按右方按鈕搜尋" required>
          <button type="button" @click="searchLocationOnMap" class="search-map-button" title="在地圖上搜尋定位">
            <i class="fa-solid fa-magnifying-glass-location"></i>
          </button>
        </div>
        
        <InteractiveMap :search-request="mapSearchRequest" @update:coordinates="updateCoordinates" />

        <input type="date" v-model="formModel.flight_date" required>
        <input type="number" v-model.number="formModel.duration_minutes" placeholder="飛行時長 (分鐘)" required>
        
        <label>選擇主飛手:</label>
        <select v-model="formModel.main_pilot" required>
          <option v-for="pilot in userList" :key="pilot.id" :value="pilot.id">{{ pilot.username }}</option>
        </select>

        <label>選擇副飛手 (可不選):</label>
        <select v-model="formModel.assistant_pilots" multiple>
          <option v-for="pilot in userList" :key="pilot.id" :value="pilot.id">{{ pilot.username }}</option>
        </select>

        <label>選擇使用的設備:</label>
        <select v-model="formModel.equipment_used" multiple required>
          <option v-for="equip in equipmentList" :key="equip.id" :value="equip.id">{{ equip.model_name }}</option>
        </select>
        
        <button type="submit" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="spinner"></span>
          <span v-else>{{ isEditing ? '儲存變更' : '新增日誌' }}</span>
        </button>
        <button v-if="isEditing" type="button" @click="cancelEdit" style="background-color: #6c757d; margin-top: 0.5em;">取消</button>
      </form>
    </div>

    <div class="container">
        <h2>飛行日誌列表</h2>
        <div v-if="isLoading">
            <SkeletonLoader v-for="n in 3" :key="n" />
        </div>
        <p v-else-if="logs.length === 0">目前沒有任何飛行日誌。</p>
        
        <div v-else class="log-list">
            <div v-for="log in logs" :key="log.id" class="log-list-item">
            <div class="log-info">
                <i class="fa-solid fa-paper-plane"></i>
                <span><strong>任務名稱：</strong>{{ log.mission_name }}</span>
            </div>
            <div class="log-actions">
                <RouterLink :to="{ name: 'FlightLogDetail', params: { id: log.id } }" class="action-button view-button">
                <i class="fa-solid fa-eye"></i> 查看詳情
                </RouterLink>
                <div v-if="store.username === log.main_pilot_username" class="action-buttons-inline">
                <button @click="handleEditClick(log)" class="action-button edit-button" :disabled="isSubmitting"><i class="fa-solid fa-pencil"></i> 編輯</button>
                <button @click="handleDeleteLog(log.id)" class="action-button delete-button" :disabled="isSubmitting"><i class="fa-solid fa-trash"></i> 刪除</button>
                </div>
            </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { store } from '../store.js';
import { useToast } from 'vue-toastification';
import SkeletonLoader from '../components/SkeletonLoader.vue';
import InteractiveMap from '../components/InteractiveMap.vue';

const route = useRoute();
const toast = useToast();
const logs = ref([]);
const equipmentList = ref([]);
const userList = ref([]);
const isLoading = ref(true);
const isSubmitting = ref(false);
const isEditing = ref(false);

const mapSearchRequest = ref({
  query: '',
  trigger: 0,
});

const initialFormState = {
  mission_name: '',
  location: '',
  flight_date: '',
  duration_minutes: null,
  main_pilot: null,
  assistant_pilots: [],
  equipment_used: [],
  twd97_x: null,
  twd97_y: null,
};

const formModel = ref({ ...initialFormState });
const apiUrlBase = 'https://drone-api-v2.onrender.com';

const updateCoordinates = (coords) => {
  if (coords && typeof coords.x === 'number' && typeof coords.y === 'number') {
    formModel.value.twd97_x = coords.x.toFixed(3);
    formModel.value.twd97_y = coords.y.toFixed(3);
  }
};

const searchLocationOnMap = () => {
  if (!formModel.value.location) {
    toast.warning('請先輸入地點描述再進行搜尋。');
    return;
  }
  mapSearchRequest.value = {
    query: formModel.value.location,
    trigger: Date.now(),
  };
};

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
  isEditing.value = true;
  formModel.value = {
      id: logToEdit.id,
      mission_name: logToEdit.mission_name,
      location: logToEdit.location,
      flight_date: logToEdit.flight_date,
      duration_minutes: logToEdit.duration_minutes,
      main_pilot: logToEdit.main_pilot,
      assistant_pilots: logToEdit.assistant_pilots,
      equipment_used: logToEdit.equipment_used,
      twd97_x: logToEdit.twd97_x,
      twd97_y: logToEdit.twd97_y,
  };
  
  searchLocationOnMap();
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const cancelEdit = () => {
  isEditing.value = false;
  formModel.value = { ...initialFormState };
  mapSearchRequest.value = { query: '', trigger: 0 };
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

onMounted(async () => {
  await fetchLogs();
  await fetchEquipment();
  await fetchUsers();

  const logIdToEdit = route.query.edit;
  if (logIdToEdit) {
    const logToEdit = logs.value.find(log => log.id == logIdToEdit);
    if (logToEdit) {
      handleEditClick(logToEdit);
    }
  }
});
</script>

<style scoped>
.page-container { padding: 2rem; }
.container { background-color: #fff; padding: 2em; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 2em; }
.log-list { display: flex; flex-direction: column; gap: 1em; }
.log-list-item { display: flex; justify-content: space-between; align-items: center; padding: 1em 1.5em; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #fafafa; transition: box-shadow 0.2s, transform 0.2s; }
.log-list-item:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.08); }
.log-info { font-size: 1.1em; font-weight: 500; display: flex; align-items: center; }
.log-info i { margin-right: 12px; color: #007bff; }
.log-info strong { color: #495057; font-weight: 600; }
.log-actions { display: flex; align-items: center; gap: 0.75em; }
.action-button { display: inline-flex; align-items: center; gap: 6px; font-size: 0.9em; padding: 0.5em 1em; border: none; border-radius: 5px; color: white; cursor: pointer; text-decoration: none; }
.view-button { background-color: #17a2b8; }
.edit-button { background-color: #ffc107; }
.delete-button { background-color: #dc3545; }
.action-buttons-inline { display: inline-flex; gap: 0.75em; }
form { display: flex; flex-direction: column; gap: 1em; }
input, select, button { padding: 0.8em; font-size: 1em; border-radius: 5px; border: 1px solid #ccc; }
select[multiple] { height: 150px; }
form > button { background-color: #007bff; color: white; border: none; cursor: pointer; }
.spinner { display: inline-block; width: 1em; height: 1em; border: 2px solid rgba(255, 255, 255, 0.3); border-radius: 50%; border-top-color: #fff; animation: spin 1s ease-in-out infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
button:disabled { opacity: 0.7; cursor: not-allowed; }
.location-input-group { display: flex; }
.location-input-group input { flex-grow: 1; border-radius: 5px 0 0 5px; }
.search-map-button { border-radius: 0 5px 5px 0; border-left: none; padding: 0 1em; }
</style>