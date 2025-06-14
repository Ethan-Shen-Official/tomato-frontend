<script setup lang="ts">
import { ref, computed } from 'vue'
import { Box, Coin, Warning } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { drawBlindBox } from '../../api/blindbox.ts'
import { getCredits } from '../../api/user.ts'

const router = useRouter()

// 管理员判断
const isAdmin = computed(() => sessionStorage.getItem('role') === 'admin')

// 购买相关数据
const buyDialogVisible = ref(false)
const quantity = ref(1)
const buyLoading = ref(false)
const userCredit = ref('')

// 图标点击处理
const handleIconClick = () => {
  if (isAdmin.value) {
    router.push('/blindboxpool')
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
      ElMessage.success(`成功兑换 ${quantity.value} 个盲盒！`)
      buyDialogVisible.value = false
      // 购买成功后刷新积分
      getMyCredits()
    } else if (res.data.code === '400') {
        if (res.data.msg === 'Insufficient pool') {
          ElMessage.error('盲盒不足，请联系管理员')
        }
    }
  } finally {
    buyLoading.value = false
  }
}

// 获取用户积分
function getMyCredits() {
  getCredits().then(res => {
    if (res.data.code === '200') {
      userCredit.value = res.data.data
    } else {
      ElMessage.error('获取积分失败')
    }
  }).catch(error => {
    console.error('获取积分失败:', error)
    ElMessage.error('获取积分失败')
  })
}

// 跳转到我的奖品
const goToMyPrize = () => {
  router.push('/my_prizes')
}

// 初始化获取积分
getMyCredits()
</script>

<template>
  <div class="lottery-page">
    <div class="lottery-container">
      <!-- 盲盒购买卡 -->
      <el-card class="lottery-card">
        <div class="lottery-content">
          <h1>盲盒购买</h1>
          
          <!-- 积分显示区域 -->
          <div class="credit-display">
            <div class="credit-info">
              <el-icon class="credit-icon" :size="24">
                <Coin />
              </el-icon>
              <span class="credit-text">剩余积分：</span>
              <span class="credit-amount">{{ userCredit }}</span>
            </div>
          </div>
          
          <div class="lottery-icon" @click="handleIconClick">
            <el-icon :size="80" color="#d53ce6">
              <Box />
            </el-icon>
          </div>
          
          <div class="action-buttons">
            <el-button
                type="primary"
                size="large"
                @click="openBuyDialog"
                :disabled="parseInt(userCredit) < 500"
            >
              兑换盲盒 (500积分)
            </el-button>
          </div>
          
          <!-- 积分不足提示 -->
          <div v-if="parseInt(userCredit) < 100" class="insufficient-credit">
            <el-icon class="warning-icon" :size="16">
              <Warning />
            </el-icon>
            <span class="warning-text">积分不足，无法兑换盲盒</span>
          </div>
        </div>
      </el-card>

      <!-- 我的奖品按钮 -->
      <div class="nav-buttons">
        <el-button 
          type="info" 
          size="large" 
          @click="goToMyPrize"
          class="nav-button"
        >
          我的奖品
        </el-button>
      </div>
    </div>

    <!-- 购买对话框 -->
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
          <span class="label">兑换数量：</span>
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
          <span class="value">500 积分</span>
        </div>

        <div class="dialog-row">
          <span class="label">总价：</span>
          <span class="value total-price">{{ quantity * 500 }} 积分</span>
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
            确认兑换
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
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 40px;
}

.lottery-card {
  width: 750px;
  max-width: 90%;
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  border-radius: 20px;
  padding: 0;
}

.lottery-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 35px;
  padding: 40px 35px;
}

.lottery-content h1 {
  color: #333;
  font-size: 2.5rem;
  margin: 0;
  font-weight: 600;
}

.lottery-icon {
  cursor: pointer;
  transition: all 0.3s ease;
  animation: float 3s ease-in-out infinite;
}

.lottery-icon:hover {
  transform: scale(1.1);
  filter: drop-shadow(0 10px 20px rgba(213, 60, 230, 0.4));
}

/* 积分显示样式 */
.credit-display {
  width: 66%;
  margin-bottom: 15px;
}

.credit-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: linear-gradient(45deg, #f8f9fa, #e9ecef);
  padding: 16px 25px;
  border-radius: 15px;
  border: 1px solid #dee2e6;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.credit-icon {
  color: #ffc107;
}

.credit-text {
  font-size: 1.2rem;
  color: #495057;
  font-weight: 500;
}

.credit-amount {
  font-size: 1.4rem;
  font-weight: 700;
  color: #484848;
  background: rgb(255, 255, 255);
  padding: 6px 16px;
  border-radius: 10px;
  border: 1px solid #d1e7dd;
  min-width: 60px;
  text-align: center;
}

/* 积分不足提示 */
.insufficient-credit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: #f8d7da;
  color: #721c24;
  font-size: 1.1rem;
  font-weight: 500;
  margin-top: 20px;
  padding: 12px 20px;
  border-radius: 10px;
  border: 1px solid #f5c6cb;
}

.warning-icon {
  color: #dc3545;
}

.warning-text {
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  width: 100%;
}

/* 按钮样式 */
.action-buttons .el-button--primary {
  padding: 16px 28px;
  font-size: 1.2rem;
  border-radius: 25px;
  font-weight: 600;
  min-width: 220px;
  transition: all 0.3s ease;
  background: linear-gradient(45deg, #d53ce6, #9c27b0);
  border: none;
  color: white;
  box-shadow: 0 8px 20px rgba(213, 60, 230, 0.3);
}

.action-buttons .el-button--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(213, 60, 230, 0.4);
  background: linear-gradient(45deg, #e65cff, #ad42c4);
}

/* 我的奖品按钮样式 */
.nav-buttons {
  margin-top: 25px;
}

.nav-button {
  padding: 16px 35px;
  font-size: 1.2rem;
  border-radius: 25px;
  background: linear-gradient(45deg, #6c757d, #495057);
  color: white;
  border: none;
  box-shadow: 0 5px 15px rgba(108, 117, 125, 0.3);
  transition: all 0.3s ease;
  font-weight: 600;
}

.nav-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(108, 117, 125, 0.4);
  background: linear-gradient(45deg, #ed994f, #b03d03);
}

/* 禁用状态 */
.action-buttons .el-button.is-disabled {
  background: linear-gradient(45deg, #bdc3c7, #95a5a6) !important;
  box-shadow: 0 3px 8px rgba(189, 195, 199, 0.2) !important;
  transform: none !important;
  opacity: 0.6 !important;
}

/* 浮动动画 */
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-12px);
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .lottery-card {
    width: 95%;
    margin: 0 auto;
  }
  
  .lottery-content {
    padding: 30px 25px;
    gap: 25px;
  }
  
  .lottery-content h1 {
    font-size: 2.2rem;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }
  
  .action-buttons .el-button--primary {
    width: 100%;
    min-width: auto;
    max-width: 320px;
  }
  
  .credit-info {
    padding: 14px 20px;
  }
  
  .credit-text {
    font-size: 1.1rem;
  }
  
  .credit-amount {
    font-size: 1.3rem;
    padding: 5px 14px;
  }
}

/* 购买对话框样式 */
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
  color: #d53ce6;
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

.confirm-button {
  padding: 12px 30px;
  font-size: 1.1rem;
  min-width: 120px;
  background-color: #409EFF;
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

.confirm-button.is-loading:before {
  background-color: #409EFF;
}
</style>