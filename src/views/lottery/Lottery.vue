<script setup lang="ts">
import { ref, computed } from 'vue'
import { Present, Box, Notebook, Ticket, Coin } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { drawLottery } from '../../api/lottery'
import { drawBlindBox } from '../../api/blindbox.ts'
import { getProductById } from '../../api/product'
import { PrizeType } from '../../utils/type.ts'

const router = useRouter()

// 定义类型接口
interface LotteryItem {
  id: string
  type: PrizeType 
  itemId: string
  status: 'AVAILABLE' | 'GENERATED' | 'USED'
  product?: {
    title: string
    // 添加其他产品属性
  }
}

// 奖品类型映射
const typeIconMap: Record<string, any> = {
  BOOK: Notebook,
  COUPON: Ticket,
  CREDIT: Coin,
  BLIND_BOX: Box
}

const statusTypeMap: Record<string, 'success' | 'warning' | 'info'> = {
  AVAILABLE: 'success',
  GENERATED: 'warning',
  USED: 'info'
}

const statusTextMap: Record<string, string> = {
  AVAILABLE: '未使用',
  GENERATED: '已生成',
  USED: '已使用'
}

// 抽奖相关数据
const results = ref<LotteryItem[]>([])
const drawLoading = ref(false)
const dialogVisible = ref(false)

// 处理抽奖操作
const handleDraw = async (quantity: number) => {
  try {
    drawLoading.value = true
    const res = await drawLottery({ quantity })

    if (res.data.code === '200') {
      ElMessage.success('抽奖成功！')
      const items: LotteryItem[] = res.data.data

      // 获取书籍详情
      const enhancedItems = await Promise.all(
          items.map(async (item: LotteryItem) => {
            if (item.type === 'BOOK') {
              try {
                const productRes = await getProductById(item.itemId)
                if (productRes.data.code === '200') {
                  return { ...item, product: productRes.data.data }
                }
              } catch (error) {
                console.error('获取书籍详情失败:', error)
              }
            }
            return item
          })
      )

      // 处理动画显示
      if (quantity === 10) {
        results.value = []
        dialogVisible.value = true
        for (let i = 0; i < enhancedItems.length; i++) {
          await new Promise<void>(resolve => setTimeout(resolve, 200))
          results.value.push(enhancedItems[i])
        }
      } else {
        results.value = enhancedItems
        dialogVisible.value = true
      }
    }

  } catch (error: any) {
    ElMessage.error(error.response?.data?.msg || '抽奖失败')
  } finally {
    drawLoading.value = false
  }
}

const handleBlindBoxDraw = async (quantity: number) => {
  try {
    drawLoading.value = true
    const res = await drawBlindBox({ quantity })

    if (res.data.code === '200') {
      ElMessage.success('抽奖成功！')
      const items: LotteryItem[] = res.data.data

      // 获取书籍详情
      const enhancedItems = await Promise.all(
          items.map(async (item: LotteryItem) => {
            if (item.type === 'BOOK') {
              try {
                const productRes = await getProductById(item.itemId)
                if (productRes.data.code === '200') {
                  return { ...item, product: productRes.data.data }
                }
              } catch (error) {
                console.error('获取书籍详情失败:', error)
              }
            }
            return item
          })
      )

      // 处理动画显示
      if (quantity === 10) {
        results.value = []
        dialogVisible.value = true
        for (let i = 0; i < enhancedItems.length; i++) {
          await new Promise<void>(resolve => setTimeout(resolve, 200))
          results.value.push(enhancedItems[i])
        }
      } else {
        results.value = enhancedItems
        dialogVisible.value = true
      }
    }

  } catch (error: any) {
    ElMessage.error(error.response?.data?.msg || '抽奖失败')
  } finally {
    drawLoading.value = false
  }
}

// 类型处理函数
const getTypeIcon = (type: string) => typeIconMap[type] || Box
const getIconClass = (type: string) => `${type.toLowerCase()}-icon`
const getTypeName = (type: string): string => {
  const typeNameMap: Record<string, string> = {
    BOOK: '书籍',
    COUPON: '优惠券',
    CREDIT: '积分',
    BLIND_BOX: '盲盒'
  }
  return typeNameMap[type] || '未知类型'
}

// 管理员判断
const isAdmin = computed(() => sessionStorage.getItem('role') === 'admin')

// 图标点击处理
const handleIconClick = () => {
  if (isAdmin.value) {
    router.push('/pool')
  }
}

// 模拟抽奖函数
const showComingSoon = () => {
  ElMessage.info('功能开发中，敬请期待')
}
</script>

<template>
  <div class="lottery-page">
    <div class="lottery-container">
      <!-- 普通抽奖卡 -->
      <el-card class="lottery-card">
        <div class="lottery-content">
          <h1>普通抽奖</h1>
          <div class="lottery-icon" @click="handleIconClick">
            <el-icon :size="100" color="#ff6b6b">
              <Present />
            </el-icon>
          </div>
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

      <!-- 盲盒抽奖卡 -->
      <el-card class="lottery-card">
        <div class="lottery-content">
          <h1>盲盒抽奖</h1>
          <div class="lottery-icon" @click="handleIconClick">
            <el-icon :size="100" color="#d53ce6">
              <Box />
            </el-icon>
          </div>
          <div class="action-buttons">
            <el-button
                type="primary"
                size="large"
                @click="handleBlindBoxDraw(1)"
                :loading="drawLoading"
                :disabled="drawLoading"
            >
              单抽 (100积分)
            </el-button>
            <el-button
                type="danger"
                size="large"
                @click="handleBlindBoxDraw(10)"
                :loading="drawLoading"
                :disabled="drawLoading"
            >
              十连抽 (900积分)
              <span class="discount-tag">九折</span>
            </el-button>
          </div>
        </div>
      </el-card>

      <!-- 抽奖结果对话框 -->
      <el-dialog
          v-model="dialogVisible"
          title="抽奖结果"
          width="60%"
          align-center
          class="result-dialog"
          :close-on-click-modal="false"
      >
        <div class="result-container">
          <transition-group name="list">
            <div
                v-for="(item, index) in results"
                :key="item.id"
                class="result-item"
                :style="{ transitionDelay: `${index * 0.1}s` }"
            >
              <div class="icon-section">
                <el-icon :class="getIconClass(item.type)" size="36">
                  <component :is="getTypeIcon(item.type)" />
                </el-icon>
              </div>

              <!-- 书籍类奖品 -->
              <div v-if="item.type === 'BOOK' && item.product" class="detail-section">

                <div class="book-info">
                  <h4>{{ item.product.title }}</h4>
                </div>
              </div>

              <!-- 盲盒类奖品 -->
              <div v-if="item.type === 'BLIND_BOX'" class="blind-box--info">
                <h3 class="blind_context">{{ getTypeName(item.type) }}</h3>
              </div>

              <!-- 其他类型奖品 -->
              <div v-else class="common-info">
                <h3>{{ getTypeName(item.type) }}</h3>
                <p>{{ item.itemId }}</p>
              </div>

              <!-- 状态显示 -->
              <div class="status-section">
                <el-tag :type="statusTypeMap[item.status]">
                  {{ statusTextMap[item.status] }}
                </el-tag>
              </div>
            </div>
          </transition-group>
        </div>

        <template #footer>
          <el-button type="primary" @click="dialogVisible = false">
            关闭
          </el-button>
        </template>
      </el-dialog>
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

.blind-box--info {
  flex: 1;
  min-height: 80px;
  display: flex;
  align-items: center;
}

.blind_context {
  margin-left: 150px;
  font-size: 16px;
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

/* 抽奖结果样式 */
.result-container {
  max-height: 60vh;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 改为两列布局 */
  gap: 20px;
  padding: 10px;
}

.result-item {
  background: white;
  border-radius: 12px;
  padding: 15px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.result-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.icon-section {
  margin-right: 15px;
}

.book-cover {
  width: 80px;
  height: 110px;
  border-radius: 6px;
  margin-right: 15px;
  object-fit: cover;
}

.book-info h4 {
  margin: 0 0 8px;
  font-size: 16px;
  color: #333;
}

.book-info p {
  margin: 4px 0;
  font-size: 14px;
  color: #666;
}

.common-info h3 {
  margin: 0 0 8px;
  color: #2c3e50;
}

.status-section {
  margin-left: auto;
}

/* 入场动画 */
.list-enter-active {
  transition: all 0.5s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

/* 对话框标题样式 */
:deep(.el-dialog__header) {
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
  margin-bottom: 15px;
}

:deep(.el-dialog__title) {
  color: #2c3e50;
  font-size: 24px;
  font-weight: 600;
}

</style>