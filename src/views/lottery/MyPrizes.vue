<template>
  <div class="page-bg">
    <div class="prizes-container">
      <div class="prizes-content">
        <el-card class="prizes-card">
          <div v-loading="loading">
            <!-- 头部 -->
            <div class="header-section">
              <!-- 左侧区域 -->
              <div class="header-left">
                <router-link to="/lottery" v-slot="{ navigate }">
                  <el-button @click="navigate" type="primary" plain>
                    返回抽奖
                  </el-button>
                </router-link>
              </div>
              
              <!-- 中间标题区域 -->
              <div class="header-center">
                <h1 class="prizes-title">我的奖品（{{ prizes.length }}件）</h1>
              </div>
              
              <!-- 右侧操作区域 -->
              <div class="header-right">
                <div class="batch-actions" v-if="selectedPrizes.length > 0">
                  <el-button 
                    type="success" 
                    @click="showOrderDialog = true"
                    :disabled="!hasAvailableSelection"
                  >
                    生成订单 ({{ selectedAvailableCount }}件)
                  </el-button>
                  <el-button @click="clearSelection">清空选择</el-button>
                </div>
                <!-- 占位元素，保持右侧区域宽度一致 -->
                <div class="placeholder" v-else></div>
              </div>
            </div>

            <!-- 状态筛选 -->
            <div class="filter-section">
              <el-radio-group v-model="statusFilter" @change="filterPrizes">
                <el-radio-button label="">全部</el-radio-button>
                <el-radio-button label="AVAILABLE">可兑换</el-radio-button>
                <el-radio-button label="GENERATED">已兑换</el-radio-button>
              </el-radio-group>
            </div>

            <!-- 奖品列表 -->
            <div class="prizes-items">
              <div v-for="item in filteredPrizes" :key="item.id" class="prize-item">
                <!-- 选择框 -->
                <div class="checkbox-section">
                  <el-checkbox 
                    v-model="item.selected"
                    :disabled="item.status !== 'AVAILABLE'"
                    @change="handleSelectionChange"
                  />
                </div>

                <!-- 类型图标 -->
                <div class="icon-section">
                  <el-icon :class="getIconClass(item.type)" size="32">
                    <component :is="getTypeIcon(item.type)" />
                  </el-icon>
                </div>

                <!-- 奖品信息 -->
                <div class="info-section">
                  <h3 class="item-title">{{ getDisplayName(item) }}</h3>
                  <p class="item-subtitle">{{ getTypeName(item.type) }}</p>
                </div>

                <!-- 奖品值/ID -->
                <div class="value-section">
                  <span class="item-value">{{ getItemValue(item) }}</span>
                </div>

                <!-- 状态标签 -->
                <div class="status-section">
                  <el-tag 
                    :type="getStatusType(item.status)"
                    size="large"
                  >
                    {{ parseStatus(item.status) }}
                  </el-tag>
                </div>
              </div>
            </div>

            <!-- 空奖品提示 -->
            <el-empty
                v-if="!loading && filteredPrizes.length === 0"
                description="暂无奖品"
            />
          </div>
        </el-card>
      </div>
    </div>

    <!-- 生成订单对话框 -->
    <el-dialog
      v-model="showOrderDialog"
      title="生成订单"
      width="500px"
      align-center
      :close-on-click-modal="false"
    >
      <el-form 
        ref="orderFormRef" 
        :model="orderForm" 
        :rules="orderRules" 
        label-width="100px"
      >
        <el-form-item label="收件人" prop="name">
          <el-input v-model="orderForm.name" placeholder="请输入收件人姓名" />
        </el-form-item>
        
        <el-form-item label="联系电话" prop="telephone">
          <el-input v-model="orderForm.telephone" placeholder="请输入联系电话" />
        </el-form-item>
        
        <el-form-item label="收货地址" prop="location">
          <el-input 
            v-model="orderForm.location" 
            type="textarea" 
            :rows="3"
            placeholder="请输入详细收货地址"
          />
        </el-form-item>
      </el-form>

      <!-- 选中的奖品列表 -->
      <div class="selected-prizes">
        <h4>选中的奖品：</h4>
        <div class="selected-list">
          <div 
            v-for="prize in selectedAvailablePrizes" 
            :key="prize.id"
            class="selected-item"
          >
            <el-icon :class="getIconClass(prize.type)" size="16">
              <component :is="getTypeIcon(prize.type)" />
            </el-icon>
            <span>{{ getDisplayName(prize) }}</span>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showOrderDialog = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="handleGenerateOrder"
            :loading="orderLoading"
          >
            确认生成订单
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import {
  Notebook,
  Ticket,
  Coin,
  Box
} from '@element-plus/icons-vue'
import { getPrizes, generatePrizeOrder } from '../../api/lottery'
import { getProductById } from '../../api/product'
import { parseStatus } from '../../utils'
import { PrizeStatus, PrizeType, Recipient } from '../../utils/type'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

// 扩展奖品接口，添加选择状态和显示名称
interface PrizeItemExtended {
  id: string
  type: PrizeType
  itemId: string
  status: PrizeStatus
  selected?: boolean
  displayName?: string
  bookName?: string
}

// 订单请求接口
interface PrizeOrder {
  prizeIds: string[]
  recipient: Recipient
}

const loading = ref(true)
const orderLoading = ref(false)
const prizes = ref<PrizeItemExtended[]>([])
const statusFilter = ref('')
const showOrderDialog = ref(false)
const orderFormRef = ref<FormInstance>()

// 订单表单
const orderForm = reactive({
  name: '',
  telephone: '',
  location: ''
})

// 表单验证规则
const orderRules: FormRules = {
  name: [
    { required: true, message: '请输入收件人姓名', trigger: 'blur' }
  ],
  telephone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  location: [
    { required: true, message: '请输入收货地址', trigger: 'blur' }
  ]
}

// 计算属性
const selectedPrizes = computed(() => 
  prizes.value.filter(item => item.selected)
)

const selectedAvailablePrizes = computed(() => 
  selectedPrizes.value.filter(item => item.status === 'AVAILABLE')
)

const selectedAvailableCount = computed(() => 
  selectedAvailablePrizes.value.length
)

const hasAvailableSelection = computed(() => 
  selectedAvailableCount.value > 0
)

const filteredPrizes = computed(() => {
  if (!statusFilter.value) return prizes.value
  return prizes.value.filter(item => item.status === statusFilter.value)
})

// 获取用户奖品
async function fetchUserPrizes() {
  try {
    loading.value = true
    const res = await getPrizes()
    
    if (res.data.code === '200') {
      prizes.value = res.data.data || []
      
      // 为书籍类型的奖品获取书名
      await Promise.all(
        prizes.value.map(async (prize) => {
          if (prize.type === PrizeType.book) {
            prize.bookName = await getBookName(prize.itemId)
          }
          prize.selected = false // 初始化选择状态
        })
      )
    } else {
      ElMessage.error(res.data.msg || '获取奖品失败')
    }
  } catch (error: any) {
    console.error('获取奖品失败:', error)
    ElMessage.error('获取奖品失败')
  } finally {
    loading.value = false
  }
}

// 获取书籍名称（修正为异步函数）
async function getBookName(itemId: string): Promise<string> {
  try {
    const res = await getProductById(itemId)
    if (res.data.code === '200') {
      return res.data.data.title || '未知书籍'
    } else {
      console.error('无法获取商品', res.data.msg)
    }
  } catch (error) {
    console.error('Error fetching product:', error)
  }
  return '未知书籍'
}

// 图标映射
const getTypeIcon = (type: PrizeType) => {
  const icons = {
    [PrizeType.book]: Notebook,
    [PrizeType.coupon]: Ticket,
    [PrizeType.credit]: Coin,
    [PrizeType.blindbox]: Box
  }
  return icons[type] || Box
}

// 图标样式
const getIconClass = (type: PrizeType): string => {
  const classes = {
    [PrizeType.book]: 'book-icon',
    [PrizeType.coupon]: 'coupon-icon',
    [PrizeType.credit]: 'credit-icon',
    [PrizeType.blindbox]: 'blindbox-icon'
  }
  return classes[type] || ''
}

// 类型名称
const getTypeName = (type: PrizeType): string => {
  const names = {
    [PrizeType.book]: '书籍',
    [PrizeType.coupon]: '折扣券',
    [PrizeType.credit]: '积分',
    [PrizeType.blindbox]: '盲盒'
  }
  return names[type] || '未知奖品'
}

// 获取显示名称
const getDisplayName = (item: PrizeItemExtended): string => {
  if (item.type === PrizeType.book && item.bookName) {
    return item.bookName
  }
  return getTypeName(item.type)
}

// 获取奖品值
const getItemValue = (item: PrizeItemExtended): string => {
  if (item.type === PrizeType.credit) {
    return `${item.itemId} 积分`
  }
  if (item.type === PrizeType.coupon) {
    return `${item.itemId}% 折扣`
  }
  
  return ''
}

// 状态标签类型（只有AVAILABLE和GENERATED两种）
const getStatusType = (status: PrizeStatus): "success" | "warning" | "info" | "primary" | "danger" => {
  const types: Record<PrizeStatus, "success" | "warning" | "info" | "primary" | "danger"> = {
    AVAILABLE: 'success',
    GENERATED: 'info'
  }
  return types[status] || 'info'
}

// 处理选择变化
const handleSelectionChange = () => {
  // 选择变化时的逻辑，如果需要的话
}

// 清空选择
const clearSelection = () => {
  prizes.value.forEach(item => {
    item.selected = false
  })
}

// 筛选奖品
const filterPrizes = () => {
  // 筛选逻辑已在计算属性中处理
}

// 生成订单
const handleGenerateOrder = async () => {
  if (!orderFormRef.value) return
  
  try {
    await orderFormRef.value.validate()
    
    orderLoading.value = true
    
    const orderRequest: PrizeOrder = {
      prizeIds: selectedAvailablePrizes.value.map(item => item.id),
      recipient: {
        name: orderForm.name,
        telephone: orderForm.telephone,
        location: orderForm.location
      }
    }
    
    const res = await generatePrizeOrder(orderRequest)
    
    if (res.data.code === '200') {
      ElMessage.success('订单生成成功！')
      showOrderDialog.value = false
      
      // 重置表单
      orderFormRef.value.resetFields()
      
      // 刷新奖品列表
      await fetchUserPrizes()
    } else {
      ElMessage.error(res.data.msg || '订单生成失败')
    }
  } catch (error: any) {
    if (error.response) {
      ElMessage.error(error.response.data?.msg || '订单生成失败')
    }
  } finally {
    orderLoading.value = false
  }
}

onMounted(() => {
  fetchUserPrizes()
})
</script>

<style scoped>
.page-bg {
  width: 100%;
  height: 100%;
  min-height: 100vh;
  background-image: url('../../assets/OIP-C.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: scroll;
  position: fixed;
  display: flex;
  left: 0;
  overflow-y: auto;
  padding-bottom: 20px;
}

.prizes-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}

.prizes-card {
  min-width: 1000px;
  margin-top: 80px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  min-height: calc(90vh - 120px);
}

/* 修改头部布局 */
.header-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding: 0 20px;
  min-height: 60px; /* 固定高度，防止跳动 */
}

.header-left {
  flex: 0 0 auto; /* 不伸缩，保持原有大小 */
  display: flex;
  align-items: center;
}

.header-center {
  flex: 1; /* 占据剩余空间 */
  display: flex;
  justify-content: center;
  align-items: center;
}

.header-right {
  flex: 0 0 auto; /* 不伸缩，保持原有大小 */
  display: flex;
  align-items: center;
  min-width: 200px; /* 设置最小宽度，确保右侧区域宽度一致 */
  justify-content: flex-end;
}

.prizes-title {
  margin: 0;
  font-size: 24px;
  color: #333;
  font-weight: 600;
  text-align: center; /* 确保标题居中 */
}

.batch-actions {
  display: flex;
  gap: 12px;
}

/* 占位元素，与批量操作按钮占用相同空间 */
.placeholder {
  min-height: 32px; /* 与按钮高度一致 */
  width: 100%; /* 占满右侧区域 */
}

.filter-section {
  padding: 0 20px 20px;
  border-bottom: 1px solid #eee;
}

.prizes-items {
  margin-top: 20px;
}

.prize-item {
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
  gap: 20px;
  transition: background-color 0.2s;
}

.prize-item:hover {
  background-color: #f8f9fa;
}

.checkbox-section {
  width: 40px;
  display: flex;
  justify-content: center;
}

.icon-section {
  width: 60px;
  display: flex;
  justify-content: center;
}

.info-section {
  flex: 1;
  min-width: 200px;
}

.item-title {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #333;
  font-weight: 600;
}

.item-subtitle {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.value-section {
  width: 150px;
  display: flex;
  justify-content: center;
}

.item-value {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.status-section {
  width: 100px;
  display: flex;
  justify-content: center;
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

.blindbox-icon {
  color: #9c27b0;
}

/* 对话框样式 */
.selected-prizes {
  margin-top: 20px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.selected-prizes h4 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 14px;
}

.selected-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.selected-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .prizes-card {
    min-width: auto;
    margin: 10px;
  }
  
  .header-section {
    flex-direction: column;
    align-items: center;
    gap: 15px;
    min-height: auto;
  }
  
  .header-left,
  .header-center,
  .header-right {
    flex: none;
    width: 100%;
  }
  
  .header-center {
    order: -1; /* 在移动端让标题排在最前面 */
  }
  
  .header-right {
    min-width: auto;
    justify-content: center;
  }
  
  .prize-item {
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .info-section {
    min-width: 150px;
  }
}
</style>