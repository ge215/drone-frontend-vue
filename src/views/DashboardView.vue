<template>
  <div class="dashboard">
    <h1>儀表板</h1>
    <p v-if="store.isAuthenticated">歡迎回來，{{ store.username }}！</p>
    <p>這裡是系統的主頁面，未來可以放上數據統計圖表或常用功能捷徑。</p>
  </div>
</template>

<script setup>
import { store } from '../store.js';
</script>

<style scoped>
.dashboard {
  padding: 2rem;
}
</style>
