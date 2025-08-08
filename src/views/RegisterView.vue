<template>
  <div class="register-container">
    <div class="register-box">
      <h2>建立新帳號</h2>
      <form @submit.prevent="handleRegister">
        <div class="input-group">
          <label for="username">使用者名稱</label>
          <input type="text" id="username" v-model="form.username" required>
        </div>
        <div class="input-group">
          <label for="email">電子郵件</label>
          <input type="email" id="email" v-model="form.email" required>
        </div>
        <div class="input-group">
          <label for="password">密碼</label>
          <input type="password" id="password" v-model="form.password" required>
        </div>
        <button type="submit" class="register-button">註冊</button>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
        <div class="login-link">
          <p>已經有帳號了？ <RouterLink to="/login">點此登入</RouterLink></p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter, RouterLink } from 'vue-router';

const form = ref({
  username: '',
  email: '',
  password: '',
});
const errorMessage = ref('');
const successMessage = ref('');
const router = useRouter();

const handleRegister = async () => {
  errorMessage.value = '';
  successMessage.value = '';

  try {
    await axios.post('https://drone-api-v2.onrender.com/api/auth/register/', form.value);

    successMessage.value = '註冊成功！將在 3 秒後將您導向登入頁面...';
    
    setTimeout(() => {
      router.push('/login');
    }, 3000);

  } catch (error) {
    console.error('註冊失敗:', error.response.data);
    const errors = error.response.data;
    let messages = [];
    for (const key in errors) {
      messages.push(`${key}: ${errors[key].join(', ')}`);
    }
    errorMessage.value = messages.join('\n');
  }
};
</script>

<style scoped>
.register-container { display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f0f2f5; }
.register-box { padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); width: 100%; max-width: 400px; }
h2 { text-align: center; margin-bottom: 1.5rem; }
.input-group { margin-bottom: 1rem; }
.input-group label { display: block; margin-bottom: 0.5rem; }
.input-group input { width: 100%; padding: 0.75rem; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
.register-button { width: 100%; padding: 0.75rem; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem; }
.error-message { color: red; white-space: pre-wrap; text-align: center; margin-top: 1rem; }
.success-message { color: green; text-align: center; margin-top: 1rem; }
.login-link { text-align: center; margin-top: 1.5rem; }
</style>
