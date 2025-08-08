<template>
  <RouterView />
</template>

<script setup>
import { RouterView } from 'vue-router'
</script>

<style>
/* 我們將 App.vue 的 <style scoped> 改為全域 <style>
  這樣才能正確覆蓋 Toast 的預設樣式
*/
.Vue-Toastification__toast--success {
    background-color: #28a745;
}
.Vue-Toastification__toast--error {
    background-color: #dc3545;
}
.Vue-Toastification__toast--warning {
    background-color: #ffc107;
}
</style>
