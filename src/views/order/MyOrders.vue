<template>
  <div class="page-bg">
    <div class="orders-container">
      <div class="orders-header">
        <h1>我的订单</h1>
        <div class="filters">
          <el-select v-model="statusFilter" placeholder="订单状态" clearable>
            <el-option label="全部" value="" />
            <el-option label="待支付" value="PENDING" />
            <el-option label="已支付" value="PAID" />
            <el-option label="已发货" value="SHIPPED" />
          </el-select>
          <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
          />
        </div>
      </div>

      <el-card shadow="hover" class="orders-card">
        <template #header>
          <div class="card-header">
            <span>订单列表</span>
            <el-button @click="fetchOrders" type="primary" plain circle>
              <el-icon><Refresh /></el-icon>
            </el-button>
          </div>
        </template>

        <el-table
            :data="paginatedOrders"
            stripe
            style="width: 100%"
            v-loading="loading"
            empty-text="暂无订单数据"
        >
          <el-table-column prop="orderId" label="订单号" width="180" />
          <el-table-column prop="time" label="下单时间" width="180" sortable>
            <template #default="scope">
              {{ formatDate(scope.row.time) }}
            </template>
          </el-table-column>
          <el-table-column prop="amount" label="金额" width="120" sortable>
            <template #default="scope">
              <span class="amount">¥{{ getDisplayAmount(scope.row).toFixed(2) }}</span>
              <span v-if="hasTempCoupon(scope.row.orderId)" class="original-amount">
                (原价:¥{{ scope.row.amount.toFixed(2) }})
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="method" label="支付方式" width="120" />
          <el-table-column prop="status" label="订单状态" width="150">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)" size="large">
                {{ traslateOrderStatus(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column align="middle" width="150" label="操作">
            <template #default="scope">
              <el-button
                  color="#409EFF"
                  @click="handlePay(scope.row)"
                  type="text"
                  v-if="scope.row.status === 'PENDING'"
              >
                去支付
              </el-button>
            </template>
          </el-table-column>

          <el-table-column prop="coupon" label="优惠券" width="150">
            <template #default="scope">
              <el-button
                  type="text"
                  color="#67C23A"
                  @click="showCouponDialog(scope.row)"
                  :disabled="scope.row.status !== 'PENDING'"
              >
                {{ getCouponButtonText(scope.row) }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 优惠券选择对话框 -->
        <el-dialog
            v-model="couponDialog.visible"
            :title="`选择优惠券 - 订单 ${couponDialog.orderId}`"
            width="700px"
        >
          <el-table :data="availableCoupons" empty-text="暂无可用优惠券">
            <el-table-column prop="title" label="优惠券名称" width="140" align="center"/>
            <el-table-column label="使用条件" width="140" align="center">
              <template #default="{ row }">
                {{ row.trigger > 0 ? `满${row.trigger}元可用` : '无门槛' }}
              </template>
            </el-table-column>
            <el-table-column label="优惠金额" width="100" align="center">
              <template #default="{ row }">{{`-¥${row.discount}`}}</template>
            </el-table-column>
            <el-table-column label="有效期" width="200" align="center">
              <template #default="{ row }">
                {{ dayjs(row.expireTime).format('YYYY-MM-DD HH:mm:ss') }} 到期
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" align="center">
              <template #default="{ row }">
                <el-button
                    type="primary"
                    size="small"
                    @click="selectTempCoupon(row)"
                    :disabled="!checkCouponAvailable(row)"
                    :plain="isTempCouponSelected(row)"
                >
                  {{ isTempCouponSelected(row) ? '已选' : '选择' }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="coupon-summary">
            <div v-if="tempSelectedCoupon" class="selected-coupon">
              <span>已选优惠券: {{ tempSelectedCoupon.title }} (减¥{{ tempSelectedCoupon.discount }})</span>
              <el-button
                  type="danger"
                  size="small"
                  @click="cancelTempCouponSelection"
                  plain
              >
                取消选择
              </el-button>
            </div>
            <div class="price-preview">
              订单原价: ¥{{ couponDialog.originalAmount.toFixed(2) }}，
              优惠后价格: ¥{{ getTempDiscountedAmount().toFixed(2) }}
            </div>
          </div>

          <template #footer>
            <el-button @click="couponDialog.visible = false">取消</el-button>
            <el-button
                type="primary"
                @click="confirmTempCouponSelection"
                :disabled="!tempSelectedCoupon"
            >
              确认选择
            </el-button>
          </template>
        </el-dialog>

        <div class="pagination-container">
          <el-pagination
              layout="prev, pager, next"
              :total="filteredOrders.length"
              :page-size="pageSize"
              v-model:current-page="currentPage"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAllOrders } from '../../api/order';
import { traslateOrderStatus } from '../../utils';
import { Refresh } from '@element-plus/icons-vue'
import routes from '../../router'
import { getUserCoupons, useCoupon } from '../../api/discount.ts'
import dayjs from 'dayjs'

interface Order {
  orderId: string;
  username: string;
  amount: number;
  method: string;
  time: string;
  status: string;
}

interface Coupon {
  id: string;
  title: string;
  description: string;
  trigger: number;
  discount: number;
  effectTime: string;
  expireTime: string;
  status: string;
}

interface TempCouponSelection {
  orderId: string;
  coupon: Coupon;
  originalAmount: number;
}

const orders = ref<Order[]>([])
const loading = ref(false)
const statusFilter = ref('')
const dateRange = ref([])
const currentPage = ref(1)
const pageSize = ref(8)
const coupons = ref<Coupon[]>([])
const tempCouponSelections = ref<TempCouponSelection[]>([])

const couponDialog = ref({
  visible: false,
  orderId: '',
  originalAmount: 0,
})

const tempSelectedCoupon = ref<Coupon | null>(null)

// 获取订单列表
function fetchOrders() {
  loading.value = true
  getAllOrders()
      .then((res) => {
        if (res.data.code === '200') {
          orders.value = res.data.data;
        } else {
          ElMessage.error(res.data.msg);
        }
      })
      .catch(err => {
        console.error('获取订单失败', err)
        ElMessage.error('获取订单列表失败')
      })
      .finally(() => {
        loading.value = false
      })
}

// 获取用户优惠券
const fetchCoupons = async () => {
  try {
    const res = await getUserCoupons()
    if (res.data.code === '200') {
      coupons.value = res.data.data
    }
  } catch (error) {
    console.error('获取优惠券失败', error)
    ElMessage.error('获取优惠券失败')
  }
}

// 显示优惠券对话框
const showCouponDialog = (order: Order) => {
  couponDialog.value = {
    visible: true,
    orderId: order.orderId,
    originalAmount: order.amount
  }

  // 初始化临时选中的优惠券
  const existingSelection = tempCouponSelections.value.find(sc => sc.orderId === order.orderId)
  tempSelectedCoupon.value = existingSelection ? existingSelection.coupon : null

  fetchCoupons()
}

// 可用的优惠券（过滤已使用和过期）
const availableCoupons = computed(() => {
  return coupons.value.filter(coupon =>
      coupon.status === 'AVAILABLE' &&
      dayjs().isBefore(coupon.expireTime)
  )
})

// 检查优惠券是否可用
const checkCouponAvailable = (coupon: Coupon) => {
  return couponDialog.value.originalAmount >= coupon.trigger
}

// 临时选择优惠券
const selectTempCoupon = (coupon: Coupon) => {
  if (tempSelectedCoupon.value?.id === coupon.id) {
    tempSelectedCoupon.value = null
  } else {
    tempSelectedCoupon.value = coupon
  }
}

// 是否已临时选择该优惠券
const isTempCouponSelected = (coupon: Coupon) => {
  return tempSelectedCoupon.value?.id === coupon.id
}

// 取消临时优惠券选择
const cancelTempCouponSelection = () => {
  tempSelectedCoupon.value = null
}

// 确认临时优惠券选择
const confirmTempCouponSelection = () => {
  if (!tempSelectedCoupon.value) return

  const { orderId, originalAmount } = couponDialog.value
  const existingIndex = tempCouponSelections.value.findIndex(sc => sc.orderId === orderId)

  if (existingIndex >= 0) {
    tempCouponSelections.value[existingIndex] = {
      orderId,
      coupon: tempSelectedCoupon.value,
      originalAmount
    }
  } else {
    tempCouponSelections.value.push({
      orderId,
      coupon: tempSelectedCoupon.value,
      originalAmount
    })
  }

  couponDialog.value.visible = false
  ElMessage.success('优惠券选择成功（预览）')
}

// 获取临时折扣后的金额
const getTempDiscountedAmount = () => {
  if (!tempSelectedCoupon.value) return couponDialog.value.originalAmount
  return Math.max(0, couponDialog.value.originalAmount - tempSelectedCoupon.value.discount)
}

// 获取显示金额（如果有临时优惠券则显示折扣后价格）
const getDisplayAmount = (order: Order) => {
  const tempSelection = tempCouponSelections.value.find(sc => sc.orderId === order.orderId)
  return tempSelection ? (tempSelection.originalAmount - tempSelection.coupon.discount) : order.amount
}

// 检查订单是否有临时选择的优惠券
const hasTempCoupon = (orderId: string) => {
  return tempCouponSelections.value.some(sc => sc.orderId === orderId)
}

// 获取优惠券按钮文本
const getCouponButtonText = (order: Order) => {
  const tempSelection = tempCouponSelections.value.find(sc => sc.orderId === order.orderId)
  return tempSelection ? `使用优惠券(预览)` : '使用优惠券'
}

// 处理支付（最终确认使用优惠券）
const handlePay = async (order: Order) => {
  const tempSelection = tempCouponSelections.value.find(sc => sc.orderId === order.orderId)

  if (tempSelection) {
    try {
      // 调用后端接口真正使用优惠券
      const res = await useCoupon({
        orderId: order.orderId,
        couponId: tempSelection.coupon.id
      })

      if (res.data.code === '200') {
        // 使用成功后跳转支付页面
        routes.push({ path: `/payment-detail/${order.orderId}` })
        // 移除临时选择的优惠券
        tempCouponSelections.value = tempCouponSelections.value.filter(
            sc => sc.orderId !== order.orderId
        )
      } else {
        ElMessage.error(res.data.msg)
      }
    } catch (error) {
      console.error('使用优惠券失败', error)
      ElMessage.error('使用优惠券失败')
    }
  } else {
    // 没有使用优惠券，直接跳转支付
    routes.push({ path: `/payment-detail/${order.orderId}` })
  }
}

// 根据状态获取标签类型
function getStatusType(status: string) {
  switch(status) {
    case 'PENDING': return 'warning'
    case 'PAID': return 'success'
    case 'SHIPPED': return 'info'
    default: return 'info'
  }
}

// 格式化日期
function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 过滤后的订单列表
const filteredOrders = computed(() => {
  let result = [...orders.value]

  // 状态过滤
  if (statusFilter.value) {
    result = result.filter(order => order.status === statusFilter.value)
  }

  // 日期范围过滤
  if (dateRange.value && dateRange.value.length === 2) {
    const startDate = new Date(dateRange.value[0])
    const endDate = new Date(dateRange.value[1])
    endDate.setHours(23, 59, 59, 999) // 设置为当天结束时间

    result = result.filter(order => {
      const orderDate = new Date(order.time)
      return orderDate >= startDate && orderDate <= endDate
    })
  }

  return result
})

// 分页后的订单列表
const paginatedOrders = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value;
  const endIndex = startIndex + pageSize.value;
  return filteredOrders.value.slice(startIndex, endIndex);
});

onMounted(fetchOrders);
</script>

<style scoped>
/* 新增优惠券对话框样式 */
.coupon-dialog-table :deep(.el-table__row) {
  cursor: pointer;
  transition: background-color 0.3s;
}

.coupon-dialog-table :deep(.el-table__row:hover) {
  background-color: #f5f7fa;
}

.expired-coupon {
  color: #909399;
  background-color: #f5f7fa;
}

.orders-container {
  max-width: 1200px;
  margin: 120px auto;
  padding: 0 20px;
}

.orders-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.orders-header h1 {
  margin: 0 0 20px 0;
  font-size: 32px;
  color: #333;
  font-weight: 700;
}

.filters {
  display: flex;
  gap: 15px;
}

.filters :deep(.el-select) {
  width: 140px;
}

.filters :deep(.el-input__inner) {
  font-size: 15px;
  padding: 10px 12px;
}

.filters :deep(.el-date-editor) {
  font-size: 15px;
}

.orders-card {
  margin-bottom: 30px;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.9);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
}

.orders-card :deep(.el-table) {
  font-size: 15px;
}

.orders-card :deep(.el-table th) {
  font-size: 16px;
  font-weight: 600;
  padding: 14px 0;
}

.orders-card :deep(.el-table td) {
  padding: 16px 0;
  font-size: 15px;
}

.orders-card :deep(.el-table td:first-child) {
  font-weight: 500;
  font-family: 'Monaco', 'Menlo', monospace;
}

.amount {
  font-weight: 700;
  color: #ff6600;
  font-size: 16px;
}

.original-amount {
  font-size: 12px;
  color: #999;
  text-decoration: line-through;
  margin-left: 5px;
}

.orders-card :deep(.el-tag) {
  font-size: 14px;
  font-weight: 500;
  padding: 6px 12px;
}

.orders-card :deep(.el-button) {
  font-size: 15px;
  padding: 8px 16px;
  font-weight: 500;
}

.orders-card :deep(.el-button--text) {
  font-size: 15px;
  font-weight: 600;
  padding: 8px 12px;
}

.card-header :deep(.el-button--primary) {
  font-size: 16px;
  padding: 10px;
}

.orders-card :deep(.el-dialog) {
  font-size: 15px;
}

.orders-card :deep(.el-dialog__title) {
  font-size: 20px;
  font-weight: 600;
}

.orders-card :deep(.el-dialog .el-table) {
  font-size: 15px;
}

.orders-card :deep(.el-dialog .el-table th) {
  font-size: 16px;
  font-weight: 600;
  padding: 14px 0;
}

.orders-card :deep(.el-dialog .el-table td) {
  padding: 16px 0;
  font-size: 15px;
}

.orders-card :deep(.el-dialog .el-button) {
  font-size: 14px;
  padding: 8px 16px;
  font-weight: 500;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.pagination-container :deep(.el-pagination) {
  font-size: 15px;
}

.pagination-container :deep(.el-pager li) {
  font-size: 15px;
  font-weight: 500;
  min-width: 36px;
  height: 36px;
  line-height: 36px;
}

.pagination-container :deep(.btn-prev),
.pagination-container :deep(.btn-next) {
  font-size: 15px;
  min-width: 36px;
  height: 36px;
}

.orders-card :deep(.el-table__empty-text) {
  font-size: 16px;
  color: #666;
  font-weight: 500;
}

.coupon-summary {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.selected-coupon {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.price-preview {
  font-size: 16px;
  font-weight: 500;
}

@media (max-width: 800px) {
  .orders-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .orders-header h1 {
    font-size: 28px;
  }

  .filters {
    width: 100%;
    flex-direction: column;
  }

  .orders-card :deep(.el-table) {
    font-size: 14px;
  }

  .orders-card :deep(.el-table th) {
    font-size: 15px;
    padding: 12px 0;
  }

  .orders-card :deep(.el-table td) {
    padding: 14px 0;
  }
}

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
</style>