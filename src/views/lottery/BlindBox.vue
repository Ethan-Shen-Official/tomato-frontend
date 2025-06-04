<script setup lang="ts">
import { ref, computed } from 'vue'
import { Box } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { drawBlindBox } from '../../api/blindbox.ts'

const router = useRouter()

// 管理员判断
const isAdmin = computed(() => sessionStorage.getItem('role') === 'admin')

// 购买相关数据
const buyDialogVisible = ref(false)
const quantity = ref(1)
const buyLoading = ref(false)

// 图标点击处理
const handleIconClick = () => {
  if (isAdmin.value) {
    router.push('/pool')
  }
}

// 打开购买对话框
const openBuyDialog = () => {
  buyDialogVisible.value = true
}

// 处理盲盒购买
const handleBuy = async () => {
  try {
    buyLoading.value = true
    const res = await drawBlindBox({ quantity: quantity.value })

    if (res.data.code === '200') {
      ElMessage.success(`成功购买 ${quantity.value} 个盲盒！`)
      buyDialogVisible.value = false
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.msg || '购买失败')
  } finally {
    buyLoading.value = false
  }
}
</script>

<template>
  <div class="lottery-page">
    <div class="lottery-container">
      <!-- 盲盒购买卡 -->
      <el-card class="lottery-card">
        <div class="lottery-content">
          <h1>盲盒购买</h1>
          <div class="lottery-icon" @click="handleIconClick">
            <el-icon :size="100" color="#d53ce6">
              <Box />
            </el-icon>
          </div>
          <div class="action-buttons">
            <el-button
                type="primary"
                size="large"
                @click="openBuyDialog"
                class="buy-button"
            >
              购买盲盒
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 购买对话框 - 添加 align-center 属性确保居中 -->
    <el-dialog
        v-model="buyDialogVisible"
        title="购买盲盒"
        width="450px"
        align-center
        class="buy-dialog"
        :close-on-click-modal="false"
    >
      <div class="buy-dialog-content">
        <div class="dialog-row">
          <span class="label">购买数量：</span>
          <el-input-number
              v-model="quantity"
              :min="1"
              :max="10"
              size="large"
              class="quantity-input"
          />
        </div>

        <div class="dialog-row">
          <span class="label">单价：</span>
          <span class="value">100 积分</span>
        </div>

        <div class="dialog-row">
          <span class="label">总价：</span>
          <span class="value total-price">{{ quantity * 100 }} 积分</span>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button
              size="large"
              @click="buyDialogVisible = false"
              class="cancel-button"
          >
            取消
          </el-button>
          <el-button
              type="primary"
              size="large"
              @click="handleBuy"
              :loading="buyLoading"
              class="confirm-button"
          >
            确认购买
          </el-button>
        </div>
      </template>
    </el-dialog>
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
  display: flex;
  justify-content: center;
  align-items: center;
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
  justify-content: center;
  align-items: center;
}

.lottery-card {
  width: 550px;
  max-width: 90%;
  padding: 30px;
  background-color: rgba(255, 255, 255, 0.7);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  border-radius: 12px;
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
  text-align: center;
}

.lottery-icon {
  position: relative;
  cursor: pointer;
  margin-bottom: 40px;
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
  justify-content: center;
  width: 100%;
}

/* 加长购买按钮 */
.buy-button {
  min-width: 200px; /* 增加按钮宽度 */
  padding: 18px 35px; /* 增加内边距 */
  font-size: 1.2rem; /* 增大字体 */
  font-weight: bold;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(213, 60, 230, 0.3);
  transition: all 0.3s;
}

.buy-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(213, 60, 230, 0.4);
}

@media (max-width: 768px) {
  .lottery-card {
    padding: 20px;
  }

  .lottery-content h1 {
    font-size: 1.8rem;
  }

  .buy-button {
    min-width: 240px;
    padding: 18px 30px;
    font-size: 1.2rem;
  }
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

/* 购买对话框样式 - 增强布局 */
.buy-dialog :deep(.el-dialog) {
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.buy-dialog :deep(.el-dialog__header) {
  border-bottom: 1px solid #eee;
  padding: 20px;
  margin: 0;
}

.buy-dialog :deep(.el-dialog__title) {
  font-size: 1.5rem;
  color: #7e57c2;
  font-weight: 600;
}

.buy-dialog :deep(.el-dialog__body) {
  padding: 25px 30px;
}

.buy-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding: 10px 0;
}

.dialog-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px dashed #eee;
}

.dialog-row:last-child {
  border-bottom: none;
}

.label {
  font-size: 1.1rem;
  color: #555;
  font-weight: 500;
}

.value {
  font-size: 1.1rem;
  color: #333;
  font-weight: 600;
}

.total-price {
  color: #e53935;
  font-size: 1.3rem;
}

.quantity-input :deep(.el-input__inner) {
  text-align: center;
  font-size: 1.1rem;
  font-weight: bold;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 0 20px 20px;
}

.cancel-button {
  padding: 12px 30px;
  font-size: 1.1rem;
  min-width: 100px;
}

/* 将确认按钮改为蓝色 */
.confirm-button {
  padding: 12px 30px;
  font-size: 1.1rem;
  min-width: 120px;
  background-color: #409EFF; /* Element Plus 默认蓝色 */
  border-color: #409EFF;
  color: white;
}

.confirm-button:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

.confirm-button:active {
  background-color: #3a8ee6;
  border-color: #3a8ee6;
}

/* 确保加载状态下的按钮也是蓝色 */
.confirm-button.is-loading:before {
  background-color: #409EFF;
}
</style>