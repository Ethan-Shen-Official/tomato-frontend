<template>
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
        <el-table-column align="middle" width="200">
          <template #default="scope">
            <el-button 
              size="default" 
              @click="payOrder(scope.row.orderId)"
              type="success" 
              text
              v-if="scope.row.status === 'PENDING'"
            >
              去支付
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAllOrders } from '../../api/order';
import { traslateOrderStatus } from '../../utils';
import { Refresh } from '@element-plus/icons-vue'
import { routes } from '../../router'
import { de } from 'element-plus/es/locales.mjs';

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
const pageSize = ref(5)

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
</script>

<style scoped>
.orders-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}

.orders-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.orders-header h1 {
  margin: 12%;
  font-size: 24px;
  color: #333;
}

.filters {
  display: flex;
  gap: 15px;
}

.orders-card {
  margin-bottom: 30%;
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.amount {
  font-weight: bold;
  color: #ff6600;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

@media (max-width: 800px) {
  .orders-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .filters {
    width: 100%;
    flex-direction: column;
  }
}
</style>