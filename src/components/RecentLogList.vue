<template>
  <div class="recent-logs-container">
    <ul v-if="logs && logs.length > 0" class="log-list">
      <li v-for="log in logs" :key="log.id" class="log-item">
        <RouterLink :to="{ name: 'FlightLogDetail', params: { id: log.id } }" class="log-link">
          <div class="log-info">
            <i class="fa-solid fa-file-alt"></i>
            <span class="log-name">{{ log.mission_name }}</span>
          </div>
          <div class="log-date">
            <i class="fa-solid fa-calendar-alt"></i>
            <span>{{ formatDate(log.flight_date || log.created_at) }}</span>
          </div>
        </RouterLink>
      </li>
    </ul>
    <div v-else class="no-logs">
      <p>目前沒有相關的日誌紀錄。</p>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  logs: {
    type: Array,
    required: true,
  },
});

// 一個簡單的日期格式化函式
const formatDate = (dateString) => {
  if (!dateString) return '日期未知';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' });
};
</script>

<style scoped>
.log-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}
.log-item {
  border-bottom: 1px solid #e9ecef;
}
.log-link {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0.5rem;
  text-decoration: none;
  color: #343a40;
  transition: background-color 0.2s ease-in-out;
}
.log-link:hover {
  background-color: #f8f9fa;
}
.log-info, .log-date {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.log-name {
  font-weight: 500;
}
.log-date {
  font-size: 0.9em;
  color: #6c757d;
}
i {
  color: #868e96;
}
.no-logs {
  padding: 2rem;
  text-align: center;
  color: #6c757d;
  background-color: #f8f9fa;
  border-radius: 6px;
}
</style>