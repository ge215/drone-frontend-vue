<template>
  <div class="page-container">
    <h1>設備管理</h1>

    <div class="container">
      <h2>{{ isEditing ? '編輯設備' : '新增設備' }}</h2>
      <form @submit.prevent="isEditing ? handleUpdateEquipment() : handleAddEquipment()">
        <input type="text" v-model="formModel.model_name" placeholder="型號名稱" required>
        <input type="text" v-model="formModel.serial_number" placeholder="序號" required>
        <label>採購日期:</label>
        <input type="date" v-model="formModel.purchase_date" required>

        <label>設備照片 (選填):</label>
        <input type="file" @change="handleFileChange" accept="image/*" ref="fileInputRef">
        <button type="submit" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="spinner"></span>
          <span v-else>{{ isEditing ? '儲存變更' : '新增設備' }}</span>
        </button>
        <button v-if="isEditing" type="button" @click="cancelEdit" class="cancel-button">取消</button>
      </form>
    </div>

    <div class="container">
      <h2>設備列表</h2>
      <div v-if="isLoading">
        <SkeletonLoader v-for="n in 3" :key="n" />
      </div>
      <p v-else-if="equipments.length === 0">目前沒有任何設備。</p>
      <ul v-else class="equipment-list">
        <li v-for="equip in equipments" :key="equip.id" class="equipment-item">
          
          <img :src="equip.equipment_image || '/placeholder.png'" alt="設備照片" class="equipment-image">
          <div class="equipment-details">
            <h3>{{ equip.model_name }}</h3>
            <p><strong>序號:</strong> {{ equip.serial_number }}</p>
            <p><strong>採購日期:</strong> {{ equip.purchase_date }}</p>
          </div>
          <div v-if="store.isAdmin" class="action-buttons">
            <button @click="handleEditClick(equip)" class="edit-button" :disabled="isSubmitting">編輯</button>
            <button @click="handleDeleteEquipment(equip.id)" class="delete-button" :disabled="isSubmitting">刪除</button>
          </div>
        </li>
      </ul>
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
const equipments = ref([]);
const isLoading = ref(true);
const isSubmitting = ref(false);
const isEditing = ref(false);

const initialFormState = { id: null, model_name: '', serial_number: '', purchase_date: '' };
const formModel = ref({ ...initialFormState });

const selectedFile = ref(null);
const fileInputRef = ref(null); // 建立一個 ref 來參照 file input 元素

const apiUrlBase = 'https://drone-api-v2.onrender.com';

const handleFileChange = (event) => {
  selectedFile.value = event.target.files[0];
};

const fetchEquipment = async () => {
  isLoading.value = true;
  try {
    const response = await axios.get(`${apiUrlBase}/api/equipment/`);
    equipments.value = response.data;
  } catch (error) {
    console.error('獲取設備列表失敗:', error);
    toast.error('無法載入設備列表。');
  } finally {
    isLoading.value = false;
  }
};

const handleAddEquipment = async () => {
  if (!store.authToken || !store.isAdmin) {
    toast.error('您沒有權限執行此操作。');
    return;
  }
  isSubmitting.value = true;
  
  const formData = new FormData();
  formData.append('model_name', formModel.value.model_name);
  formData.append('serial_number', formModel.value.serial_number);
  formData.append('purchase_date', formModel.value.purchase_date);
  if (selectedFile.value) {
    formData.append('equipment_image', selectedFile.value);
  }
  
  try {
    await axios.post(`${apiUrlBase}/api/equipment/`, formData, {
      headers: {
        'Authorization': `Token ${store.authToken}`,
      }
    });
    formModel.value = { ...initialFormState };
    selectedFile.value = null; 
    if (fileInputRef.value) fileInputRef.value.value = '';
    fetchEquipment();
    toast.success('設備新增成功！');
  } catch (error) {
    console.error('新增設備失敗:', error.response?.data);
    toast.error(`新增失敗: ${JSON.stringify(error.response?.data)}`);
  } finally {
    isSubmitting.value = false;
  }
};

const handleDeleteEquipment = async (id) => {
  if (!store.authToken || !store.isAdmin || !confirm('您確定要刪除這項設備嗎？')) return;
  
  isSubmitting.value = true;
  try {
    await axios.delete(`${apiUrlBase}/api/equipment/${id}/`, {
      headers: { 'Authorization': `Token ${store.authToken}` }
    });
    fetchEquipment();
    toast.error('設備刪除成功！');
  } catch (error) {
    console.error('刪除設備失敗:', error);
    toast.error('刪除失敗。');
  } finally {
    isSubmitting.value = false;
  }
};

const handleEditClick = (equip) => {
  isEditing.value = true;
  formModel.value = { ...equip };
  selectedFile.value = null;
  if (fileInputRef.value) fileInputRef.value.value = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const cancelEdit = () => {
  isEditing.value = false;
  formModel.value = { ...initialFormState };
  selectedFile.value = null;
  if (fileInputRef.value) fileInputRef.value.value = '';
};

const handleUpdateEquipment = async () => {
  if (!store.authToken || !store.isAdmin || !formModel.value.id) return;
  isSubmitting.value = true;
  const id = formModel.value.id;

  const formData = new FormData();
  formData.append('model_name', formModel.value.model_name);
  formData.append('serial_number', formModel.value.serial_number);
  formData.append('purchase_date', formModel.value.purchase_date);
  if (selectedFile.value) {
    formData.append('equipment_image', selectedFile.value);
  }

  try {
    await axios.patch(`${apiUrlBase}/api/equipment/${id}/`, formData, {
      headers: {
        'Authorization': `Token ${store.authToken}`,
      }
    });
    cancelEdit();
    fetchEquipment();
    toast.warning('設備更新成功！');
  } catch (error) {
    console.error('更新設備失敗:', error.response?.data);
    toast.error(`更新失敗: ${JSON.stringify(error.response?.data)}`);
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(fetchEquipment);
</script>

<style scoped>
.page-container { padding: 2rem; max-width: 900px; margin: auto; }
.container { background-color: #fff; padding: 2em; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 2em; }
form { display: flex; flex-direction: column; gap: 1em; }
input, select, button { padding: 0.8em; font-size: 1em; border-radius: 5px; border: 1px solid #ccc; }
button { background-color: #007bff; color: white; border: none; cursor: pointer; transition: background-color 0.2s; }
button:hover { background-color: #0056b3; }
.cancel-button { background-color: #6c757d; margin-top: 0.5em; }
.cancel-button:hover { background-color: #5a6268; }
.spinner { display: inline-block; width: 1em; height: 1em; border: 2px solid rgba(255, 255, 255, 0.3); border-radius: 50%; border-top-color: #fff; animation: spin 1s ease-in-out infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
button:disabled { background-color: #007bff; opacity: 0.7; cursor: not-allowed; }

.equipment-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 1.5rem; }
.equipment-item { display: flex; align-items: center; gap: 1.5rem; padding: 1rem; border: 1px solid #e0e0e0; border-radius: 8px; transition: box-shadow 0.2s; }
.equipment-item:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.equipment-image { width: 100px; height: 100px; object-fit: cover; border-radius: 6px; background-color: #f0f0f0; flex-shrink: 0; }
.equipment-details { flex-grow: 1; }
.equipment-details h3 { margin: 0 0 0.5rem 0; }
.equipment-details p { margin: 0.25rem 0; color: #555; font-size: 0.9em; }
.action-buttons { display: flex; flex-direction: column; gap: 0.5rem; }
.edit-button { background-color: #ffc107; }
.edit-button:hover { background-color: #e0a800; }
.delete-button { background-color: #dc3545; }
.delete-button:hover { background-color: #c82333; }
</style>