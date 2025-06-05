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
              <h1 class="pool-title">我的盲盒（{{ blindBoxTypesCount }}种）</h1>
            </div>

            <!-- 奖品列表 -->
            <div class="pool-items">
              <div v-for="item in filteredPoolData" :key="item.id" class="pool-item">
                <!-- 类型图标 -->
                <div class="icon-section">
                  <el-icon class="blind_box-icon" size="28">
                    <Box />
                  </el-icon>
                </div>

                <!-- 类型名称 -->
                <div class="type-section">
                  <h3 class="item-title">盲盒</h3>
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
                v-if="!loading && blindBoxTypesCount === 0"
                description="当前盲盒奖池还没有奖品哦～"
            />
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Box, Delete } from '@element-plus/icons-vue'
import { getLotteryPool, deleteItem, updateQuantity } from '../../api/lottery'
import { ElMessage, ElMessageBox } from 'element-plus'
import { PrizeType } from '../../utils/type'

interface PoolItem {
  id: string
  type: PrizeType
  itemId: string | number
  quantity: number
}

const loading = ref(true)
const poolData = ref<PoolItem[]>([])

// 计算属性：只返回盲盒类型的奖品
const filteredPoolData = computed(() => {
  return poolData.value.filter(item => item.type === 'BLIND_BOX')
})

// 计算属性：统计不同盲盒类型的数量（基于itemId）
const blindBoxTypesCount = computed(() => {
  const blindBoxItems = poolData.value.filter(item => item.type === 'BLIND_BOX')
  const uniqueIds = new Set(blindBoxItems.map(item => item.itemId))
  return uniqueIds.size
})

const fetchData = async () => {
  try {
    const res = await getLotteryPool()
    if (res.data.code === "200") {
      poolData.value = res.data.data
    }
  } finally {
    loading.value = false
  }
}

const updatingIds = ref<Set<string>>(new Set())

const handleQuantityChange = async (item: PoolItem) => {
  try {
    updatingIds.value.add(item.id)
    const oldValue = item.quantity

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
    item.quantity = item.quantity
    ElMessage.error(error.response?.data?.msg || '更新失败')
  } finally {
    updatingIds.value.delete(item.id)
  }
}

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除该盲盒吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await deleteItem(id)
    if (res.data.code === '200') {
      poolData.value = poolData.value.filter(item => item.id !== id)
      ElMessage.success('删除成功')
    } else {
      ElMessage.error(res.data.msg || '删除失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.msg || '删除操作失败')
    }
  }
}

fetchData()
</script>

<style scoped>
/* 原有样式保持不变 */
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
  justify-content: center;
}

.type-section {
  width: 150px;
  justify-content: center;
}

.value-section {
  flex: 1;
  color: #666;
  width: 150px;
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

.blind_box-icon {
  color: #d53ce6;
}

.item-title {
  margin: 0;
  font-size: 16px;
  color: #333;
}
</style>