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
            <span class="amount">¥{{ scope.row.amount.toFixed(2) }}</span>
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
              @click="payOrder(scope.row.orderId)"
              type="text" 
              v-if="scope.row.status === 'PENDING'"
            >
              去支付
            </el-button>

          </template>
        </el-table-column>

        <el-table-column prop="coupon" label="优惠券" width="150">
          <template #default="scope">
            <!-- 新增使用优惠券按钮 -->
            <el-button
                type="text"
                color="#67C23A"
                @click="showCouponDialog(scope.row)"
                :disabled="scope.row.status !== 'PENDING'"
                v-if="scope.row.status === 'PENDING' && !usedCoupons.includes(scope.row.orderId)"
            >
              使用优惠券
            </el-button>
          </template>
        </el-table-column>


      </el-table>

      <!-- 新增优惠券选择对话框 -->
      <el-dialog
          v-model="couponDialog.visible"
          :title="`选择优惠券 - 订单 ${couponDialog.orderId}`"
          width="700px"
      >
        <el-table :data="availableCoupons" empty-text="暂无可用优惠券" >
          <el-table-column prop="title" label="优惠券名称" width="140" align="center"/>
          <el-table-column label="使用条件" width="140"  align="center">
            <template #default="{ row }" >
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
                  @click="applyCoupon(row.id)"
                  :disabled="!checkCouponAvailable(row)"
              >
                使用
              </el-button>
            </template>
          </el-table-column>
        </el-table>
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

const orders = ref<Order[]>([])
const loading = ref(false)
const statusFilter = ref('')
const dateRange = ref([])
const currentPage = ref(1)
const pageSize = ref(8)

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

// 去支付
function payOrder(orderId: string) {
    routes.push({ path: `/payment-detail/${orderId}` })
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


const usedCoupons = ref<string[]>([]) // 存储已使用优惠券的订单ID

// 新增状态管理
interface Coupon {
  id: string
  title: string
  description: string
  trigger: number
  discount: number
  effectTime: string
  expireTime: string
  status: string
}

const coupons = ref<Coupon[]>([])
const couponDialog = ref({
  visible: false,
  orderId: '',
  orderAmount: 0
})

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
    orderAmount: order.amount
  }
  fetchCoupons()
}

// 可用的优惠券（过滤已使用和过期）
const availableCoupons = computed(() => {
  return coupons.value.filter(coupon =>
      coupon.status === 'AVAILABLE' &&
      dayjs().isBefore(coupon.expireTime))
})

// 检查优惠券是否可用
const checkCouponAvailable = (coupon: Coupon) => {
  return couponDialog.value.orderAmount >= coupon.trigger
}

// 应用优惠券
const applyCoupon = async (couponId: string) => {
  try {
    const { orderId } = couponDialog.value
    const res = await useCoupon({
      orderId,
      couponId
    })

    if (res.data.code === '200') {
      ElMessage.success('优惠券使用成功')
      // 更新订单金额
      const order = orders.value.find(o => o.orderId === orderId)
      if (order) order.amount = res.data.data.amount
      usedCoupons.value.push(orderId) // 记录已使用的订单
      couponDialog.value.visible = false
      fetchOrders() // 刷新订单列表
    }
  } catch (error) {
    console.error('使用优惠券失败', error)
    ElMessage.error('使用优惠券失败')
  }
}
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
  font-weight: 700; /* 从bold改为更粗的700 */
  color: #ff6600;
  font-size: 16px; /* 金额字体更大 */
}

.orders-card :deep(.el-tag) {
  font-size: 14px; /* 增加标签字体 */
  font-weight: 500; /* 标签字体加粗 */
  padding: 6px 12px; /* 增加标签内边距 */
  font-weight: 500;
}

/* 按钮放大 */
.orders-card :deep(.el-button) {
  font-size: 15px; /* 增加按钮字体 */
  padding: 8px 16px; /* 增加按钮内边距 */
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

/* 优惠券对话框表格放大 */
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
  font-size: 15px; /* 增加分页字体 */
}

.pagination-container :deep(.el-pager li) {
  font-size: 15px;
  font-weight: 500;
  min-width: 36px; /* 增加页码按钮大小 */
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

@media (max-width: 800px) {
  .orders-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .orders-header h1 {
    font-size: 28px; /* 移动端稍小但仍然比原来大 */
  }
  
  .filters {
    width: 100%;
    flex-direction: column;
  }
  
  /* 移动端表格字体调整 */
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