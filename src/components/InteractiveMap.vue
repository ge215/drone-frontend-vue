<template>
  <div>
    <label>地點標記 (可使用搜尋框或點擊地圖設定位置):</label>
    <div id="map" class="map-container"></div>
    <div v-if="selectedCoords" class="coords-display">
      <span>TWD97 X: {{ selectedCoords.x.toFixed(3) }}</span>
      <span>TWD97 Y: {{ selectedCoords.y.toFixed(3) }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import L from 'leaflet';
// 我們不再需要 'leaflet-control-geocoder'，因為我們要自己處理搜尋邏輯
import { convertLatLngToTWD97 } from '../utils/coord-converter.js';

const props = defineProps({
  searchRequest: {
    type: Object,
    default: () => ({ query: '', trigger: 0 })
  }
});

const emit = defineEmits(['update:coordinates']);

const map = ref(null);
const marker = ref(null);
const selectedCoords = ref(null);

const updateMarkerAndCoords = (lat, lng) => {
  const twd97Coords = convertLatLngToTWD97(lat, lng);
  selectedCoords.value = twd97Coords;

  if (!marker.value) {
    marker.value = L.marker([lat, lng]).addTo(map.value);
  } else {
    marker.value.setLatLng([lat, lng]);
  }
  
  map.value.panTo([lat, lng]);
  emit('update:coordinates', twd97Coords);
};

// [核心修改] 我們建立一個新的函式，直接呼叫 Geoapify API
const triggerGeocodeWithGeoapify = (query) => {
  if (!query) return;

  // 從環境變數讀取您的 API 金鑰
  const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;

  if (!apiKey) {
    const errorMsg = "地圖金鑰 (API Key) 未設定，請檢查專案根目錄下的 .env.local 檔案。";
    console.error(errorMsg);
    alert(errorMsg);
    return;
  }

  const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(query)}&apiKey=${apiKey}`;

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('網路回應錯誤');
      }
      return response.json();
    })
    .then(data => {
      if (data.features && data.features.length > 0) {
        const [lon, lat] = data.features[0].geometry.coordinates;
        updateMarkerAndCoords(lat, lon);
        map.value.setView([lat, lon], 15);
      } else {
        alert('在地圖上找不到您輸入的地點。');
      }
    })
    .catch(error => {
      console.error('地理編碼 API 呼叫失敗:', error);
      alert('搜尋地點時發生網路或伺服器錯誤。');
    });
};

// 監聽器現在呼叫我們新的、可靠的函式
watch(() => props.searchRequest, (newRequest) => {
  if (newRequest && newRequest.trigger > 0) {
    triggerGeocodeWithGeoapify(newRequest.query);
  }
}, { deep: true });

const initMap = () => {
  const mapCenter = [23.973875, 120.982025];
  map.value = L.map('map', {
      center: mapCenter,
      zoom: 8,
      zoomControl: true // 我們自己處理搜尋，可以把縮放控制項加回來
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map.value);

  // [核心修改] 我們不再需要加入 L.Control.Geocoder.Nominatim
  // 因為我們來自父元件的搜尋請求會直接呼叫 Geoapify
  
  map.value.on('click', (e) => {
    const { lat, lng } = e.latlng;
    updateMarkerAndCoords(lat, lng);
  });
};

onMounted(() => {
  initMap();
});

onUnmounted(() => {
  if (map.value) {
    map.value.remove();
  }
});
</script>

<style>
/* 樣式保持不變 */
.map-container { height: 400px; width: 100%; border: 1px solid #ccc; border-radius: 8px; margin-top: 0.5em; z-index: 0; }
.coords-display { margin-top: 0.5em; font-size: 0.9em; color: #555; display: flex; gap: 1em; }
</style>