<template>
  <div class="skeleton-card">
    <div class="skeleton-header">
      <div class="skeleton-line title"></div>
      <div class="skeleton-line button"></div>
    </div>
    <div class="skeleton-line text"></div>
    <div class="skeleton-line text short"></div>
  </div>
</template>

<style scoped>
.skeleton-card {
  border: 1px solid #e0e0e0;
  padding: 1.5em;
  margin-bottom: 1em;
  border-radius: 8px;
  background-color: #fafafa;
}

.skeleton-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1em;
}

.skeleton-line {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: pulse 1.5s infinite ease-in-out;
  border-radius: 4px;
  height: 1em;
}

.skeleton-line.title {
  width: 60%;
  height: 1.5em;
}

.skeleton-line.button {
  width: 20%;
  height: 2em;
}

.skeleton-line.text {
  width: 90%;
  margin-top: 0.5em;
}

.skeleton-line.text.short {
  width: 70%;
}

@keyframes pulse {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
