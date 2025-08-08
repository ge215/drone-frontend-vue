// src/store.js
import { reactive } from 'vue';

// reactive() 讓這個物件變成「響應式」的
export const store = reactive({
  // *** FIX: 從 localStorage 初始化狀態 ***
  // 檢查 localStorage 中是否有 token，'!!' 會將字串或 null 轉為 true/false
  isAuthenticated: !!localStorage.getItem('authToken'), 
  // 如果 localStorage 有 token 就用它，否則為 null
  authToken: localStorage.getItem('authToken') || null,
  // 如果 localStorage 有 username 就用它，否則為 null
  username: localStorage.getItem('username') || null,
});
