<template>
  <div class="page-bg">
    <div class="pool-container">
      <div class="pool-content">
        <el-card class="pool-card">
          <div v-loading="loading">
            <!-- 头部 -->
            <div class="header-section">
              <router-link to="/lottery" v-slot="{ navigate }">
                <el-button @click="navigate" type="primary" plain>
                  返回首页
                </el-button>
              </router-link>
              <h1 class="pool-title">我的奖池（{{ filteredPoolData.length }}种奖品）</h1>
            </div>

            <!-- 奖品列表 -->
            <div class="pool-items">
              <div v-for="item in filteredPoolData" :key="item.id" class="pool-item">
                <!-- 类型图标 -->
                <div class="icon-section">
                  <el-icon :class="getIconClass(item.type)" size="28">
                    <component :is="getTypeIcon(item.type)" />
                  </el-icon>
                </div>

                <!-- 类型名称 -->
                <div class="type-section">
                  <h3 class="item-title">{{ getTypeName(item.type) }}</h3>
                </div>

                <!-- ID/数值 -->
                <div class="value-section">
                  <span>{{ item.itemId }}</span>
                </div>

                <!-- 数量调整 -->
                <div class="quantity-section">
                  <el-input-number
                      v-model="item.quantity"
                      :min="1"
                      :precision="0"
                      size="small"
                      @change="handleQuantityChange(item)"
                      :disabled="updatingIds.has(item.id)"
                  />
                </div>

                <!-- 操作列 -->
                <div class="action-section">
                  <el-button
                      type="danger"
                      size="small"
                      @click="handleDelete(item.id)"
                      circle
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>

            <!-- 空奖池提示 -->
            <el-empty
                v-if="!loading && filteredPoolData.length === 0"
                description="当前奖池还没有奖品哦～"
            />
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Notebook,
  Ticket,
  Coin,
  Delete
} from '@element-plus/icons-vue'
import { getLotteryPool, deleteItem, updateQuantity } from '../../api/lottery'
import { ElMessage, ElMessageBox } from 'element-plus'

// 定义奖池项目的类型
interface PoolItem {
  id: string
  type: string
  itemId: string | number
  quantity: number
  updating?: boolean
}

const loading = ref(true)
const poolData = ref<PoolItem[]>([])

// 过滤掉盲盒类型的奖品
const filteredPoolData = computed(() => {
  return poolData.value.filter(item => item.type !== 'BLIND_BOX')
})

// 初始化加载数据
const fetchData = async () => {
  try {
    const res = await getLotteryPool()
    if (res.data.code === "200") {
      // 添加排序逻辑
      poolData.value = res.data.data.sort((a: PoolItem, b: PoolItem) => {
        const aOrder = getTypeOrder(a.type)
        const bOrder = getTypeOrder(b.type)
        return aOrder - bOrder
      })
    }
  } finally {
    loading.value = false
  }
}

// 获取类型排序优先级
const getTypeOrder = (type: string): number => {
  const order: { [key: string]: number } = {
    BOOK: 1,
    COUPON: 2,
    CREDIT: 3,
    BLIND_BOX: 999
  }
  return order[type] || 999
}

// 图标颜色样式
const getIconClass = (type: string): string => {
  const classes: { [key: string]: string } = {
    BOOK: 'book-icon',
    COUPON: 'coupon-icon',
    CREDIT: 'credit-icon'
  }
  return classes[type] || ''
}

// 奖品类型图标映射
const getTypeIcon = (type: string) => {
  const icons: { [key: string]: any } = {
    BOOK: Notebook,
    COUPON: Ticket,
    CREDIT: Coin
  }
  return icons[type] || Notebook
}

// 类型名称映射
const getTypeName = (type: string): string => {
  const names: { [key: string]: string } = {
    BOOK: '书籍',
    COUPON: '折扣券',
    CREDIT: '积分'
  }
  return names[type] || '未知奖品'
}

// 新增状态
const updatingIds = ref<Set<string>>(new Set())

// 优化后的处理函数
const handleQuantityChange = async (item: PoolItem) => {
  const oldValue = item.quantity
  try {
    updatingIds.value.add(item.id)

    const res = await updateQuantity({
      id: item.id,
      quantity: item.quantity
    })

    if (res.data.code !== '200') {
      item.quantity = oldValue
      ElMessage.error(res.data.msg || '更新失败')
      return
    }

    ElMessage.success('数量更新成功')
  } catch (error: any) {
    item.quantity = oldValue // 恢复原值
    ElMessage.error(error.response?.data?.msg || '更新失败')
  } finally {
    updatingIds.value.delete(item.id)
  }
}

// 添加带确认的删除逻辑
const handleDelete = async (id: string) => {
  try {
    // 确认对话框
    await ElMessageBox.confirm('确定要删除该奖品吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 调用删除接口
    const res = await deleteItem(id)
    if (res.data.code === '200') {
      // 前端过滤已删除项
      poolData.value = poolData.value.filter(item => item.id !== id)
      ElMessage.success('删除成功')
    } else {
      ElMessage.error(res.data.msg || '删除失败')
    }
  } catch (error: any) {
    // 错误处理（排除用户取消的情况）
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.msg || '删除操作失败')
    }
  }
}

fetchData()
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

.pool-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}

.pool-card {
  min-width: 1000px;
  margin-top: 80px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  min-height: calc(90vh - 120px);
}

.header-section {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
  margin-left: 50px;
}

.pool-title {
  margin: 0;
  font-size: 24px;
  color: #333;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.pool-items {
  margin-top: 20px;
}

.pool-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
  gap: 20px;
}

.icon-section {
  width: 150px;
  display: flex;
  justify-content: center;
}

.type-section {
  width: 150px;
  display: flex;
  justify-content: center;
}

.value-section {
  flex: 1;
  color: #666;
  width: 150px;
  display: flex;
  justify-content: center;
}

.quantity-section {
  width: 150px;
  display: flex;
  justify-content: center;
}

.action-section {
  width: 150px;
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

.item-title {
  margin: 0;
  font-size: 16px;
  color: #333;
}
</style>