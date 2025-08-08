<template>
  <div class="page-container">
    <h1>設備管理</h1>
    <p class="info">注意：只有管理員帳號才能在此頁面進行新增或刪除操作。</p>

    <!-- 新增設備區塊 -->
    <div class="container">
      <h2>新增設備</h2>
      <form @submit.prevent="handleAddEquipment">
        <select v-model="newEquipment.equipment_type" required>
          <option disabled value="">請選擇設備類型</option>
          <option value="drone">無人機</option>
          <option value="battery">電池</option>
          <option value="other">其他</option>
        </select>
        <input type="text" v-model="newEquipment.model_name" placeholder="品牌型號" required>
        <input type="text" v-model="newEquipment.serial_number" placeholder="唯一識別碼 (序號)" required>
        <input type="date" v-model="newEquipment.purchase_date">
        <input v-if="newEquipment.equipment_type === 'battery'" type="number" v-model.number="newEquipment.cycle_count" placeholder="電池循環次數">
        
        <button type="submit">新增設備</button>
      </form>
    </div>

    <!-- 設備列表區塊 -->
    <div class="container">
      <h2>設備列表</h2>
      <p v-if="isLoading">正在載入設備...</p>
      <p v-else-if="equipmentList.length === 0">目前沒有任何設備。</p>
      <div v-else class="equipment-grid">
        <div v-for="equip in equipmentList" :key="equip.id" class="equipment-card">
            <h4>{{ equip.model_name }}</h4>
            <p><strong>序號:</strong> {{ equip.serial_number }}</p>
            <p><strong>類型:</strong> {{ equip.equipment_type }}</p>
            <p><strong>狀態:</strong> {{ equip.status }}</p>
            <p v-if="equip.equipment_type === 'battery'"><strong>循環次數:</strong> {{ equip.cycle_count }}</p>
            <button @click="handleDeleteEquipment(equip.id)" class="delete-button">刪除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { store } from '../store.js';

const equipmentList = ref([]);
const isLoading = ref(true);
const newEquipment = ref({
  equipment_type: '',
  model_name: '',
  serial_number: '',
  purchase_date: null,
  cycle_count: 0,
});

const apiUrlBase = 'https://drone-api-v2.onrender.com';

const fetchEquipment = async () => {
  // *** NEW: 加入詳細的偵錯日誌 ***
  console.log('--- fetchEquipment() 被呼叫 ---');
  console.log('檢查 store 的狀態:', JSON.stringify(store));
  console.log('直接讀取 store.authToken:', store.authToken);

  isLoading.value = true;
  if (!store.authToken) {
      console.error('在 fetchEquipment 中找不到 authToken，請求被中止！');
      isLoading.value = false;
      return;
  }
  
  console.log('Token 存在，準備發送 API 請求...');
  try {
    const response = await axios.get(`${apiUrlBase}/api/equipment/`, {
      headers: { 'Authorization': `Token ${store.authToken}` }
    });
    equipmentList.value = response.data;
    console.log('成功獲取設備列表！');
  } catch (error) {
    console.error('獲取設備列表失敗:', error);
    if (error.response && error.response.status === 403) {
        alert('權限不足：只有管理員才能查看設備列表。');
    } else {
        alert('無法載入設備列表。');
    }
  } finally {
    isLoading.value = false;
  }
};

const handleAddEquipment = async () => {
  if (!store.authToken) return;
  try {
    const payload = { ...newEquipment.value };
    if (payload.equipment_type !== 'battery') {
        delete payload.cycle_count;
    }
    if (!payload.purchase_date) {
        delete payload.purchase_date;
    }

    await axios.post(`${apiUrlBase}/api/equipment/`, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${store.authToken}`
      }
    });
    newEquipment.value = { equipment_type: '', model_name: '', serial_number: '', purchase_date: null, cycle_count: 0 };
    fetchEquipment();
  } catch (error) {
    console.error('新增設備失敗:', error.response.data);
    alert(`新增失敗: ${JSON.stringify(error.response.data)}`);
  }
};

const handleDeleteEquipment = async (equipId) => {
  if (!store.authToken || !confirm('您確定要刪除這項設備嗎？')) return;
  try {
    await axios.delete(`${apiUrlBase}/api/equipment/${equipId}/`, {
      headers: { 'Authorization': `Token ${store.authToken}` }
    });
    fetchEquipment();
  } catch (error) {
    console.error('刪除設備失敗:', error);
    alert('刪除失敗。');
  }
};

onMounted(() => {
  console.log('--- EquipmentView 元件已掛載 (mounted) ---');
  fetchEquipment();
});
</script>

<style scoped>
/* 樣式保持不變 */
.page-container { padding: 2rem; }
.info { background-color: #fff3cd; border: 1px solid #ffeeba; color: #856404; padding: 1rem; border-radius: 8px; margin-bottom: 2em; }
.container { background-color: #fff; padding: 2em; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 2em; }
form { display: flex; flex-direction: column; gap: 1em; }
input, select, button { padding: 0.8em; font-size: 1em; border-radius: 5px; border: 1px solid #ccc; }
button { background-color: #007bff; color: white; border: none; cursor: pointer; }
.equipment-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; }
.equipment-card { border: 1px solid #e0e0e0; padding: 1.5em; border-radius: 8px; background-color: #fafafa; }
.delete-button { background-color: #dc3545; color: white; margin-top: 1rem; width: 100%; }
</style>
