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
import { ref, onMounted, onUnmounted } from 'vue';
import L from 'leaflet';
import 'leaflet-control-geocoder';
import { convertLatLngToTWD97 } from '../utils/coord-converter.js';

const props = defineProps({
  initialCoords: Object
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


const initMap = () => {
  const mapCenter = [23.973875, 120.982025];
  map.value = L.map('map').setView(mapCenter, 8);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map.value);

  L.Control.geocoder({
    defaultMarkGeocode: false,
    placeholder: '搜尋地址或地標...',
    errorMessage: '找不到結果',
    collapsed: false,
    geocoder: new L.Control.Geocoder.Nominatim()
  })
  .on('markgeocode', function(e) {
    const { lat, lng } = e.geocode.center;
    updateMarkerAndCoords(lat, lng);
  })
  .addTo(map.value);


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

<!-- *** FIX: 分離 Scoped 和 Global 樣式 *** -->

<!-- 這是只作用於此元件內部的樣式 -->
<style scoped>
.map-container {
  height: 400px;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-top: 0.5em;
  z-index: 0;
}
.coords-display {
  margin-top: 0.5em;
  font-size: 0.9em;
  color: #555;
  display: flex;
  gap: 1em;
}
</style>

<!-- 這是用來覆蓋 Leaflet Geocoder 外掛的全域樣式 -->
<style>
.leaflet-control-geocoder.leaflet-bar {
  box-shadow: 0 1px 5px rgba(0,0,0,0.2) !important;
  border-radius: 4px !important;
  border: none !important;
}

.leaflet-control-geocoder-form input {
  padding: 0.5em !important;
  border: 1px solid #ccc !important;
  border-radius: 4px 0 0 4px !important;
  font-size: 14px !important;
  width: 200px !important;
  border-right: none !important;
  outline: none !important;
  background-color: white !important;
}

.leaflet-control-geocoder-form button {
  background-color: #007bff !important;
  border: 1px solid #007bff !important;
  padding: 0 12px !important;
  border-radius: 0 4px 4px 0 !important;
  cursor: pointer !important;
}

.leaflet-control-geocoder-form button::after {
  font-family: "Font Awesome 6 Free";
  font-weight: 900;
  content: "\f002"; /* 放大鏡圖示 */
  color: white;
  border: none;
}

.leaflet-control-geocoder-alternatives {
  background-color: white !important;
  border: 1px solid #ddd !important;
  border-radius: 4px !important;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1) !important;
  list-style: none !important;
  padding: 0 !important;
  margin-top: 5px !important;
}

.leaflet-control-geocoder-alternatives li {
  padding: 0.75em 1em !important;
  cursor: pointer !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  color: #333 !important;
}

.leaflet-control-geocoder-alternatives li:hover {
  background-color: #f0f2f5 !important;
  color: #000 !important;
}

.leaflet-control-geocoder-alternatives li:not(:last-child) {
  border-bottom: 1px solid #eee !important;
}

.leaflet-control-geocoder-alternatives li > img {
  display: none !important;
}

.leaflet-control-geocoder-alternatives .leaflet-control-geocoder-error {
  color: #999 !important;
  font-style: italic !important;
}
</style>
