<script setup lang="ts">
import { ref, computed } from 'vue'
import { Present,Box } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {routes} from '../../router'


// 判断管理员状态
const isAdmin = computed(() => sessionStorage.role === 'admin')

// 图标点击处理
const handleIconClick = () => {

  if (isAdmin.value) {
    routes.push('/pool')
  }
}

// 模拟抽奖逻辑
const handleSingleDraw = () => {
  ElMessage({
    message: '单抽功能开发中',
    type: 'info',
    center: true
  })
}

const handleMultiDraw = () => {
  ElMessage({
    message: '十连抽功能开发中',
    type: 'info',
    center: true
  })
}
</script>

<template>
  <div class="lottery-page">
    <div class="lottery-container">
      <el-card class="lottery-card">
        <div class="lottery-content">
          <h1>普通抽奖</h1>

          <!-- 抽奖大图标 -->
          <div class="lottery-icon" @click="handleIconClick">
            <el-icon :size="100" color="#ff6b6b">
              <Present />
            </el-icon>
          </div>

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <el-button
                type="primary"
                size="large"
                @click="handleSingleDraw"
            >
              单抽 (100积分)
            </el-button>

            <el-button
                type="danger"
                size="large"
                @click="handleMultiDraw"
            >
              十连抽 (900积分)
              <span class="discount-tag">九折</span>
            </el-button>
          </div>
        </div>
      </el-card>

      <el-card class="lottery-card">
        <div class="lottery-content">
          <h1>盲盒抽奖</h1>

          <!-- 抽奖大图标 -->
          <div class="lottery-icon" @click="handleIconClick">
            <el-icon :size="100" color="#d53ce6">
              <Box />
            </el-icon>
          </div>

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <el-button
                type="primary"
                size="large"
                @click="handleSingleDraw"
            >
              单抽 (100积分)
            </el-button>

            <el-button
                type="danger"
                size="large"
                @click="handleMultiDraw"
            >
              十连抽 (900积分)
              <span class="discount-tag">九折</span>
            </el-button>
          </div>
        </div>
      </el-card>
    </div>
  </div>


</template>

<style scoped>
.lottery-page {
  margin: 0;
  padding: 0;
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  overflow: auto;
}

.lottery-container {
  width: 100%;
  height: 100%;
  background-image: url('../../assets/OIP-C.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  display: flex;
  align-items: center;
  justify-content: space-between; /* 左右分布 */
}

.lottery-card {
  width: 550px;
  max-width: 90%;
  padding: 30px;
  background-color: rgba(255, 255, 255, 0.7);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  border-radius: 12px;
  margin-left: auto;
  margin-right: auto;
}

.lottery-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

.lottery-content h1 {
  color: #333;
  font-size: 2.2rem;
  margin-bottom: 20px;
}

.lottery-icon {
  position: relative;
  cursor: pointer;
  margin-bottom: 60px;
  animation: float 3s ease-in-out infinite;
  transition: all 0.3s;
}

.lottery-icon:hover {
  animation-play-state: paused;
  transform: scale(1.05) translateY(-10px);
  filter: drop-shadow(0 10px 20px rgba(255,107,107,0.6));
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  width: 100%;
}

.el-button {
  flex: 1;
  min-width: 180px;
  padding: 15px 25px;
  font-size: 1.1rem;
  border-radius: 8px;
  transition: all 0.3s;
}

.el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.discount-tag {
  margin-left: 8px;
  font-size: 0.9em;
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .lottery-card {
    padding: 20px;
  }

  .lottery-content h1 {
    font-size: 1.8rem;
  }

  .el-button {
    width: 100%;
    min-width: auto;
  }
}

.sparkle {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(
      circle at center,
      rgba(255,255,255,0.8) 0%,
      rgba(255,255,255,0) 70%
  );
  pointer-events: none;
  animation: sparkle 2s linear infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
    filter: drop-shadow(0 5px 15px rgba(255,107,107,0.3));
  }
  50% {
    transform: translateY(-20px);
    filter: drop-shadow(0 15px 25px rgba(255,107,107,0.5));
  }
}

@keyframes sparkle {
  0% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; }
}
</style>