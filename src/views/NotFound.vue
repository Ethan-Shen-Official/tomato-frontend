<template>
  <div class="error-page">
    <div class="error-container">
      <div class="error-content">
        <div class="error-icon">
          <el-icon :size="180" color="#f56c6c">
            <Warning />
          </el-icon>
        </div>
        
        <h1 class="error-title">404</h1>
        <h2 class="error-subtitle">页面未找到</h2>
        <p class="error-description">
          抱歉，您访问的页面不存在或已被移除
        </p>
        
        <div class="error-actions">
          <el-button 
            type="primary" 
            size="large" 
            @click="goHome"
            class="home-button"
          >
            返回首页
          </el-button>
          <el-button 
            size="large" 
            @click="goBack"
            class="back-button"
          >
            返回上页
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Warning } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.go(-1)
}
</script>

<style scoped>
.error-page {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-container {
  text-align: center;
  background: rgba(255, 255, 255, 0.95);
  padding: 80px 50px;
  border-radius: 25px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.error-icon {
  margin-bottom: 40px;
  animation: bounce 2s infinite;
  filter: drop-shadow(0 10px 20px rgba(245, 108, 108, 0.3));
}

.error-title {
  font-size: 7rem;
  font-weight: bold;
  color: #f56c6c;
  margin: 0 0 25px;
  text-shadow: 0 5px 10px rgba(245, 108, 108, 0.3);
}

.error-subtitle {
  font-size: 2.2rem;
  color: #333;
  margin: 0 0 20px;
}

.error-description {
  font-size: 1.3rem;
  color: #666;
  margin: 0 0 50px;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 25px;
  justify-content: center;
}

/* 首页按钮样式 */
.home-button {
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  border: none;
  padding: 15px 30px;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  box-shadow: 0 8px 20px rgba(255, 107, 107, 0.4);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.home-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.home-button:hover::before {
  left: 100%;
}

.home-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 25px rgba(255, 107, 107, 0.5);
  background: linear-gradient(45deg, #ff5252, #d63031);
}

/* 返回按钮样式 */
.back-button {
  background: linear-gradient(45deg, #74b9ff, #0984e3);
  border: none;
  padding: 15px 30px;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  box-shadow: 0 8px 20px rgba(116, 185, 255, 0.4);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.back-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.back-button:hover::before {
  left: 100%;
}

.back-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 25px rgba(116, 185, 255, 0.5);
  background: linear-gradient(45deg, #5dade2, #2980b9);
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-25px);
  }
  60% {
    transform: translateY(-15px);
  }
}

@media (max-width: 768px) {
  .error-container {
    padding: 60px 30px;
  }
  
  .error-icon {
    margin-bottom: 30px;
  }
  
  .error-title {
    font-size: 5rem;
  }
  
  .error-subtitle {
    font-size: 1.8rem;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }
  
  .home-button,
  .back-button {
    width: 200px;
  }
}
</style>