<template>
  <div class="login-container">
    <div class="login-box">
      <h2>無人機管理系統登入</h2>
      <form @submit.prevent="handleLogin">
        <div class="input-group">
          <label for="username">使用者名稱</label>
          <input type="text" id="username" v-model="username" required>
        </div>
        <div class="input-group">
          <label for="password">密碼</label>
          <input type="password" id="password" v-model="password" required>
        </div>
        <button type="submit" class="login-button">登入</button>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        
        <!-- 註冊連結區塊 -->
        <div class="register-link">
          <p>還沒有帳號嗎？ <RouterLink to="/register">點此註冊</RouterLink></p>
        </div>

      </form>
    </div>
  </div>
</template>

<script setup>
// 確保 RouterLink 有被匯入
import { ref } from 'vue';
import axios from 'axios';
import { useRouter, RouterLink } from 'vue-router'; 
import { store } from '../store.js';

const username = ref('');
const password = ref('');
const errorMessage = ref('');
const router = useRouter();

const handleLogin = async () => {
  errorMessage.value = '';
  try {
    const response = await axios.post('https://drone-api-v2.onrender.com/api/auth/login/', {
      username: username.value,
      password: password.value,
    });
    const token = response.data.token; 
    const user = username.value;
    if (!token) {
        throw new Error("從伺服器回傳的資料中找不到 Token。");
    }
    localStorage.setItem('authToken', token);
    localStorage.setItem('username', user);
    store.authToken = token;
    store.username = user;
    store.isAuthenticated = true;
    console.log('登入成功! Token:', store.authToken);
    router.push('/');
  } catch (error) {
    console.error('登入失敗:', error);
    errorMessage.value = '登入失敗，請檢查您的帳號或密碼。';
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    store.isAuthenticated = false;
    store.authToken = null;
    store.username = null;
  }
};
</script>

<style scoped>
.login-container { display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f0f2f5; }
.login-box { padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); width: 100%; max-width: 400px; }
h2 { text-align: center; margin-bottom: 1.5rem; }
.input-group { margin-bottom: 1rem; }
.input-group label { display: block; margin-bottom: 0.5rem; }
.input-group input { width: 100%; padding: 0.75rem; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
.login-button { width: 100%; padding: 0.75rem; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem; }
.error-message { color: red; text-align: center; margin-top: 1rem; }
/* 註冊連結的樣式 */
.register-link {
  text-align: center;
  margin-top: 1.5rem;
}
</style>
