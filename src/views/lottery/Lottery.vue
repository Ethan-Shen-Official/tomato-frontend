<script setup lang="ts">
import { ref, computed } from 'vue'
import { Present, Box, Notebook, Ticket, Coin, Warning } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { getCredits } from '../../api/user.ts'
import { drawLottery } from '../../api/lottery'
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
    cover: string
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

// 抽奖相关数据
const results = ref<LotteryItem[]>([])
const drawLoading = ref(false)
const dialogVisible = ref(false)
const userCredit = ref('')

// 处理抽奖操作
const handleDraw = async (quantity: number) => {
  try {
    drawLoading.value = true
    const res = await drawLottery({ quantity })

    if (res.data.code === '200') {
      ElMessage.success('抽奖成功！')
      const items: LotteryItem[] = res.data.data
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
      getMyCredits()
    } else if (res.data.code === '400') {
      if (res.data.msg === 'Insufficient pool') {
          ElMessage.error('奖池已空，请联系管理员补充奖池')
      } 
    }
  } finally {
    drawLoading.value = false
  }
}

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
    sessionStorage.setItem('lotteryType', 'normal')
  }
}

// 跳转到我的奖品
const goToMyPrize = () => {
  router.push('/my_prizes')
}

getMyCredits()
</script>

<template>
  <div class="lottery-page">
    <div class="lottery-container">
      <!-- 普通抽奖卡 -->
      <el-card class="lottery-card">
        <div class="lottery-content">
          <h1>普通抽奖</h1>
          
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
            <el-icon :size="80" color="#ff6b6b">
              <Present />
            </el-icon>
          </div>
          <div class="action-buttons">
            <el-button
                type="primary"
                size="large"
                @click="handleDraw(1)"
                :loading="drawLoading"
                :disabled="drawLoading || parseInt(userCredit) < 100"
            >
              单抽 (100积分)
            </el-button>
            <el-button
                type="danger"
                size="large"
                @click="handleDraw(10)"
                :loading="drawLoading"
                :disabled="drawLoading || parseInt(userCredit) < 900"
            >
              十连抽 (900积分)
              <span class="discount-tag">九折</span>
            </el-button>
          </div>
          
          <!-- 积分不足提示 -->
          <div v-if="parseInt(userCredit) < 100" class="insufficient-credit">
            <el-icon class="warning-icon" :size="16">
              <Warning />
            </el-icon>
            <span class="warning-text">积分不足，无法进行抽奖</span>
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
              <div v-if="item.type === 'BOOK' && item.product" class="common-info">
                <el-image
                    :src="item.product.cover"
                    fit="contain"
                    class="image"
                />
              </div>

              <!-- 书籍类奖品 -->
              <div v-if="item.type === 'BOOK' && item.product" class="book-info">
                <h3>{{ getTypeName(item.type) }}</h3>
                <p>{{ item.product.title }}</p>
              </div>

              <!-- 盲盒类奖品 -->
              <div v-if="item.type === 'BLIND_BOX'" class="blind-box--info">
                <h3 class="blind_context">{{ getTypeName(item.type) }}</h3>
              </div>

              <!-- 其他类型奖品 -->
              <div v-if="item.type === 'COUPON' || item.type === 'CREDIT'" class="common-info">
                <h3>{{ getTypeName(item.type) }}</h3>
                <p>{{ item.itemId }}</p>
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
  filter: drop-shadow(0 10px 20px rgba(255,107,107,0.4));
}

/* 简化的积分显示样式 */
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

/* 简化的积分不足提示 */
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

/* 按钮样式保持之前的设计但稍微调大 */
.action-buttons .el-button--primary,
.action-buttons .el-button--danger {
  padding: 16px 28px;
  font-size: 1.2rem;
  border-radius: 25px;
  font-weight: 600;
  min-width: 190px;
  transition: all 0.3s ease;
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

/* 保持原有的按钮渐变效果 */
.action-buttons .el-button--primary {
  background: linear-gradient(45deg, #667eea, #764ba2);
  border: none;
  color: white;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.action-buttons .el-button--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
  background: linear-gradient(45deg, #5a67d8, #6b46c1);
}

.action-buttons .el-button--danger {
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  border: none;
  color: white;
  box-shadow: 0 8px 20px rgba(255, 107, 107, 0.3);
}

.action-buttons .el-button--danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(255, 107, 107, 0.4);
  background: linear-gradient(45deg, #ff5252, #d63031);
}

.discount-tag {
  margin-left: 8px;
  font-size: 0.85em;
  background: rgba(255, 255, 255, 0.3);
  padding: 3px 8px;
  border-radius: 10px;
}

/* 禁用状态 */
.action-buttons .el-button.is-disabled {
  background: linear-gradient(45deg, #bdc3c7, #95a5a6) !important;
  box-shadow: 0 3px 8px rgba(189, 195, 199, 0.2) !important;
  transform: none !important;
  opacity: 0.6 !important;
}

/* 浮动动画简化 */
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
  
  .action-buttons .el-button--primary,
  .action-buttons .el-button--danger {
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

.nav-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25);
  background-color: rgba(244, 161, 161, 0.95);
}
</style>