<script setup lang="ts">
import { ref, computed } from 'vue'
import { Present, Box, Notebook, Ticket, Coin, Warning } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { getCredits } from '../../api/user.ts'
import { drawLottery } from '../../api/lottery'
import { getProductById } from '../../api/product'
import { getCouponType } from '../../api/discount.ts'
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
  coupon?: {
    title: string
    description: string
    trigger: number
    discount: number
    lastHour: number
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
const isSingleDraw = ref(false) // 新增：标记是否为单抽

// 处理抽奖操作
const handleDraw = async (quantity: number) => {
  try {
    drawLoading.value = true
    isSingleDraw.value = quantity === 1 // 设置是否为单抽
    const res = await drawLottery({ quantity })

    if (res.data.code === '200') {
      ElMessage.success(quantity === 1 ? '抽奖成功！' : '十连抽成功！')
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
            } else if (item.type === 'COUPON') {
              try {
                const couponRes = await getCouponType(item.itemId)
                if (couponRes.data.code === '200') {
                  return { ...item, coupon: couponRes.data.data }
                }
              } catch (error) {
                console.error('获取优惠券详情失败:', error)
              }
            }
            return item
          })
      )

      if (quantity === 10) {
        // 十连抽动画效果
        results.value = []
        dialogVisible.value = true
        for (let i = 0; i < enhancedItems.length; i++) {
          await new Promise<void>(resolve => setTimeout(resolve, 200))
          results.value.push(enhancedItems[i])
        }
      } else {
        // 单抽直接显示
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
      <el-card class="lottery-card">
        <div class="lottery-content">
          <h1>普通抽奖</h1>

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

          <div v-if="parseInt(userCredit) < 100" class="insufficient-credit">
            <el-icon class="warning-icon" :size="16">
              <Warning />
            </el-icon>
            <span class="warning-text">积分不足，无法进行抽奖</span>
          </div>
        </div>
      </el-card>

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
        :title="isSingleDraw ? '抽奖结果' : '十连抽结果'"
        :width="isSingleDraw ? '40%' : '70%'"
        align-center
        class="result-dialog"
        :class="{'single-draw-dialog': isSingleDraw, 'multi-draw-dialog': !isSingleDraw}"
        :close-on-click-modal="false"
    >
      <div class="result-scroll-container" :class="{'single-scroll': isSingleDraw}">
        <div class="result-container" :class="{'single-container': isSingleDraw}">
          <transition-group name="list">
            <!-- 单抽显示 -->
            <template v-if="isSingleDraw">
              <div class="single-result-item" v-for="item in results" :key="item.id">
                <div class="prize-vertical">
                  <div class="prize-icon-type">
                    <el-icon :class="getIconClass(item.type)" size="48">
                      <component :is="getTypeIcon(item.type)" />
                    </el-icon>
                    <span class="type-name-">{{ getTypeName(item.type) }}</span>
                  </div>

                  <el-image
                      v-if="item.type === 'BOOK' && item.product"
                      :src="item.product.cover"
                      fit="contain"
                      class="single-image"
                  />

                  <div class="prize-info-center">
                    <span v-if="item.type === 'BOOK' && item.product">
                      {{ item.product.title }}
                    </span>
                    <span v-else-if="item.type === 'COUPON' && item.coupon">
                      {{ item.coupon.title }}
                    </span>
                    <span v-else>
                      {{ item.itemId }}
                    </span>
                  </div>
                </div>
              </div>
            </template>

            <!-- 十连抽显示 -->
            <template v-else>
              <div class="result-row" v-for="(_, rowIndex) in Math.ceil(results.length / 2)" :key="rowIndex">
                <div
                    v-for="(item, _) in results.slice((rowIndex * 2), (rowIndex * 2) + 2)"
                    :key="item.id"
                    class="result-item"
                >
                  <div class="prize-horizontal">
                    <div class="prize-icon-type">
                      <el-icon :class="getIconClass(item.type)" size="36">
                        <component :is="getTypeIcon(item.type)" />
                      </el-icon>
                      <span class="type-name">{{ getTypeName(item.type) }}</span>
                    </div>

                    <el-image
                        v-if="item.type === 'BOOK' && item.product"
                        :src="item.product.cover"
                        fit="contain"
                        class="image"
                    />

                    <div class="prize-info">
                      <span v-if="item.type === 'BOOK' && item.product">
                        {{ item.product.title }}
                      </span>
                      <span v-else-if="item.type === 'COUPON' && item.coupon">
                        {{ item.coupon.title }}
                      </span>
                      <span v-else>
                        {{ item.itemId }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </transition-group>
        </div>
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

/* 图标颜色 */
.book-icon {
  color: #409eff;
}

.coupon-icon {
  color: #f56c6c;
}

.credit-icon {
  color: #e6a23c;
}

.blind-box-icon {
  color: #67c23a;
}

/* 抽奖结果对话框样式 */
.result-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  max-height: 80vh;

}

.result-row {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
}

.result-item {
  flex: 1;
  min-width: 0;
  display: flex;
  padding: 15px;
  border-radius: 12px;
  background-color: #f8f9fa;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.5s ease;
}

.item-content {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.icon-section {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.type-name {
  margin-left: 100px;
  font-weight: bold;
  color: #333;
}

.type-name- {
  margin-left: 150px;
  font-weight: bold;
  color: #333;
}

.common-info, .book-info, .blind-box--info {
  text-align: center;
  width: 100%;
}

.book-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.common-info p, .book-info p {
  margin: 5px 0 0 0;
  color: #666;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.blind_context {
  margin: 5px 0 0 0;
  color: #666;
  font-size: 0.9rem;
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

  /* 移动端抽奖结果改为单列 */
  .result-row {
    flex-direction: column;
  }

  /* 对话框在移动端的样式 */
  .result-dialog {
    width: 90% !important;
    margin-top: 10vh !important;
    margin-bottom: 10vh !important;
  }
}

.nav-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25);
  background-color: rgba(244, 161, 161, 0.95);
}

/* 动画效果 */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
.list-move {
  transition: transform 0.5s ease;
}

/* 新增的滚动容器样式 */
.result-scroll-container {
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 8px;
}

/* 奖品水平排列样式 */
.prize-horizontal {
  display: flex;
  align-items: center;
  gap: 15px;
  width: 100%;
  min-height: 70px;
}

.prize-icon-type {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 120px;
  margin-left: 60px;
}

.prize-info {
  flex: 1;
  color: #666;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image {
  width: 60px;
  height: 80px;
  margin-left: 60px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .prize-horizontal {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .prize-info {
    padding-left: 46px;
    white-space: normal;
  }

  .result-row {
    flex-direction: column;
  }

  .result-dialog {
    width: 90% !important;
    margin-top: 10vh !important;
    margin-bottom: 10vh !important;
  }
}

/* 原有样式保持不变... */
.result-row {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
}

.result-item {
  flex: 1;
  min-width: 0;
  padding: 15px;
  border-radius: 12px;
  background-color: #f8f9fa;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.5s ease;
}

/* 单抽对话框样式 */
.single-draw-dialog {
  margin-top: 15vh !important;
}

.single-scroll {
  max-height: 50vh;
}

.single-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.single-result-item {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 20px;
  border-radius: 12px;
  background-color: #f8f9fa;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.prize-vertical {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 15px;
  width: 100%;
}



.single-image {
  width: 100px;
  height: 140px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.prize-info-center {
  text-align: center;

  color: #333;
  font-weight: 500;
  margin-left: 150px;
}
</style>