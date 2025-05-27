<script setup lang="ts">
import { ref, computed } from 'vue'
import { Present,Box,Notebook, Ticket, Coin } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {routes} from '../../router'
import { drawLottery } from '../../api/lottery'
import { getProductById } from '../../api/product'

// 奖品类型映射
const typeIconMap = {
  BOOK: Notebook,
  COUPON: Ticket,
  CREDIT: Coin,
  BLIND_BOX: Box
}

const statusTypeMap = {
  AVAILABLE: 'success',
  GENERATED: 'warning',
  USED: 'info'
}

const statusTextMap = {
  AVAILABLE: '未使用',
  GENERATED: '已生成',
  USED: '已使用'
}

// 抽奖结果数据
const results = ref<any[]>([])
const drawLoading = ref(false)

// 处理抽奖操作
const handleDraw = async (quantity: number) => {
  try {

    drawLoading.value = true

    const res = await drawLottery({ quantity })


    if (res.data.code === '200') {
      const items = res.data.data

      // 获取书籍详情
      const enhancedItems = await Promise.all(
          items.map(async item => {
            if (item.type === 'BOOK') {
              const productRes = await getProductById(item.itemId)
              if (productRes.data.code === '200') {
                return { ...item, product: productRes.data.data }
              }
            }
            return item
          })
      )

      // 十连抽动画处理
      if (quantity === 10) {
        results.value = []
        for (let i = 0; i < enhancedItems.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 200))
          results.value.push(enhancedItems[i])
        }
      } else {
        results.value = enhancedItems
      }
    }
  } catch (error) {
    ElMessage.error(error.response?.data?.msg || '抽奖失败')
  } finally {
    drawLoading.value = false
  }
}

// 类型图标处理
const getTypeIcon = (type: string) => typeIconMap[type] || Box
const getIconClass = (type: string) => `${type.toLowerCase()}-icon`
const getTypeName = (type: string) => ({
  BOOK: '书籍',
  COUPON: '优惠券',
  CREDIT: '积分',
  BLIND_BOX: '盲盒'
})[type]

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
                @click="handleDraw(1)"
                :loading="drawLoading"
                :disabled="drawLoading"
            >
              单抽 (100积分)
            </el-button>

            <el-button
                type="danger"
                size="large"
                @click="handleDraw(10)"
                :loading="drawLoading"
                :disabled="drawLoading"
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

      <!-- 抽奖结果展示 -->
      <el-card class="result-card" v-if="results.length > 0">
        <div class="result-container">
          <transition-group name="list">
            <div
                v-for="(item, index) in results"
                :key="item.id"
                class="result-item"
                :style="{ transitionDelay: `${index * 0.1}s` }"
            >
              <!-- 奖品图标 -->
              <div class="icon-section">
                <el-icon :class="getIconClass(item.type)" size="36">
                  <component :is="getTypeIcon(item.type)" />
                </el-icon>
              </div>

              <!-- 书籍类奖品详情 -->
              <div class="detail-section" v-if="item.type === 'BOOK' && item.product">
                <img :src="item.product.cover" class="book-cover" />
                <div class="book-info">
                  <h4>{{ item.product.title }}</h4>
                  <p>价格: ¥{{ item.product.price }}</p>
                  <p>评分: {{ item.product.rate }}</p>
                </div>
              </div>

              <!-- 其他类型奖品 -->
              <div class="common-info" v-else>
                <h3>{{ getTypeName(item.type) }}</h3>
                <p>{{ item.itemId }}</p>
              </div>

              <!-- 状态标签 -->
              <div class="status-section">
                <el-tag :type="statusTypeMap[item.status]">
                  {{ statusTextMap[item.status] }}
                </el-tag>
              </div>
            </div>
          </transition-group>
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

.action-section {
  display: flex;
  justify-content: center;
  gap: 30px;
  padding: 20px;
}

.result-card {
  background: rgba(255, 255, 255, 0.9);
}

.result-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 20px;
}

.result-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.list-enter-active, .list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from, .list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.icon-section {
  margin-right: 15px;
}

.book-cover {
  width: 60px;
  height: 80px;
  object-fit: cover;
  margin-right: 15px;
  border-radius: 4px;
}

.book-info {
  flex: 1;
}

.book-info h4 {
  margin: 0 0 8px;
  font-size: 14px;
}

.common-info {
  flex: 1;
}

.common-info h3 {
  margin: 0 0 8px;
  font-size: 16px;
}

.status-section {
  margin-left: auto;
}

/* 图标颜色 */
.book-icon { color: #409eff; }
.coupon-icon { color: #f56c6c; }
.credit-icon { color: #e6a23c; }
.blind_box-icon { color: #d53ce6; }

.discount-tag {
  margin-left: 8px;
  font-size: 0.9em;
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 4px;
}
</style>