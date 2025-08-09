// src/utils/coord-converter.js
import proj4 from 'proj4';

// 定義 TWD97 座標系統 (EPSG:3826)
// 這個定義字串是公開的標準，可以直接使用
proj4.defs("EPSG:3826", "+proj=tmerc +lat_0=0 +lon_0=121 +k=0.9999 +x_0=250000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");

// 定義 WGS84 經緯度座標系統 (EPSG:4326)，這是 Leaflet 使用的標準
proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs");

// 建立一個轉換器
const twd97ToWgs84 = proj4("EPSG:3826", "EPSG:4326");

export function convertTWD97toLatLng(x, y) {
  if (typeof x !== 'number' || typeof y !== 'number') {
    return null;
  }
  const [lng, lat] = twd97ToWgs84.forward([x, y]);
  return [lat, lng]; // Leaflet 需要的順序是 [緯度, 經度]
}

export function convertLatLngToTWD97(lat, lng) {
    if (typeof lat !== 'number' || typeof lng !== 'number') {
    return null;
  }
  const [x, y] = twd97ToWgs84.inverse([lng, lat]); // Proj4js 需要的順序是 [經度, 緯度]
  return { x, y };
}
