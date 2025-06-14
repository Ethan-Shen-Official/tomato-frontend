<template>
  <div class="error-page">
    <div class="error-content">
      <!-- 404图标 -->
      <div class="error-icon">
        <el-icon :size="120" color="#e91e63">
          <Warning />
        </el-icon>
      </div>
      
      <!-- 404文字 -->
      <h1 class="error-title">404</h1>
      <p class="error-message">页面不存在</p>
      
      <!-- 导航按钮 -->
      <div class="nav-buttons">
        <router-link to="/home" class="nav-button primary-button">
          <el-icon :size="20">
            <House />
          </el-icon>
          <span>返回首页</span>
        </router-link>
        
        <div class="nav-button secondary-button" @click="goBack">
          <el-icon :size="20">
            <Back />
          </el-icon>
          <span>返回上一页</span>
        </div>
      </div>
      
      <!-- 其他导航图标 -->
      <div class="other-nav">
        <router-link to="/dashboard" class="icon-nav">
          <el-icon :size="30" color="#4caf50">
            <User />
          </el-icon>
          <span>个人中心</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Warning, House, User, Back } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.go(-1)
}
</script>

<style scoped>
.error-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  text-align: center;
  animation: fadeIn 0.8s ease-in-out;
}

.error-icon {
  animation: bounce 2s infinite;
}

.error-title {
  font-size: 4rem;
  font-weight: 700;
  color: #fb74a5;
  margin: 0;
  text-shadow: 0 2px 4px rgba(216, 27, 96, 0.2);
}

.error-message {
  font-size: 1.5rem;
  color: #87043d;
  margin: 0;
  font-weight: 500;
}

/* 主要导航按钮区域 */
.nav-buttons {
  display: flex;
  gap: 30px;
  margin-top: 10px;
}

.nav-button {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 32px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: 600;
  min-width: 160px;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(216, 27, 96, 0.2);
  border: 2px solid transparent;
}

/* 主要按钮 - 返回首页 */
.primary-button {
  background: linear-gradient(45deg, #fb74a5, #f06292);
  color: white;
}

.primary-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(233, 30, 99, 0.4);
  background: linear-gradient(45deg, #d81b60, #ec407a);
}

/* 次要按钮 - 返回上一页 */
.secondary-button {
  background: rgba(255, 255, 255, 0.8);
  color: #d81b60;
  border: 2px solid #f48fb1;
  backdrop-filter: blur(10px);
}

.secondary-button:hover {
  transform: translateY(-3px);
  background: rgba(255, 255, 255, 0.95);
  border-color: #e91e63;
  box-shadow: 0 8px 25px rgba(244, 143, 177, 0.4);
  color: #ad1457;
}

/* 其他导航区域 */
.other-nav {
  display: flex;
  gap: 20px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(216, 27, 96, 0.2);
}

.icon-nav {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 10px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(244, 143, 177, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  color: #ad1457;
  min-width: 70px;
}

.icon-nav:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.8);
  border-color: rgba(233, 30, 99, 0.4);
}

.icon-nav span {
  font-size: 0.9rem;
  font-weight: 500;
  color: #ad1457;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .error-title {
    font-size: 3rem;
  }
  
  .error-message {
    font-size: 1.2rem;
  }
  
  .nav-buttons {
    flex-direction: column;
    gap: 20px;
    width: 100%;
    max-width: 280px;
  }
  
  .nav-button {
    padding: 14px 24px;
    font-size: 1rem;
    min-width: auto;
    width: 100%;
  }
  
  .other-nav {
    justify-content: center;
  }
  
  .icon-nav {
    padding: 12px;
    min-width: 60px;
  }
  
  .icon-nav span {
    font-size: 0.8rem;
  }
}
</style>