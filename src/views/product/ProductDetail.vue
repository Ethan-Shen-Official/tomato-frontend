<template>
  <div class="product-detail-page">
    <div class="detail-container">
      <el-card class="detail-card">
        <div v-loading="loading">
          <!-- 返回按钮 -->
          <div class="back-button">
            <el-button @click="$router.go(-1)" type="primary" plain>
              ← 返回列表
            </el-button>
          </div>

          <!-- 商品详情内容 -->
          <div v-if="product">
            <div class="detail-header">
              <h1 class="product-title">{{ product.title }}</h1>
              <el-rate
                  v-model="product.rate"
                  disabled
                  :max="10"
                  :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
                  class="product-rating"
              />
              <!-- 添加角色验证 -->
              <div v-if="role === 'admin'" class="action-buttons">
                <el-button
                    type="primary"
                    @click="goToEditPage"
                    class="edit-btn"
                >
                  编辑商品
                </el-button>

                <el-button
                    type="success"
                    @click="showStockDialog"
                >
                  更新库存
                </el-button>
              </div>
            </div>

            <div class="detail-content">
              <!-- 商品图片 -->
              <div class="detail-image">
                <el-image
                    :src="product.cover"
                    fit="contain"
                    class="image"
                />
              </div>

              <!-- 商品信息 -->
              <div class="detail-info">
                <div class="price-section">
                  <span class="price">¥{{ formatPrice(product.price) }}</span>
                </div>

                <!-- 商品规格 -->
                <div v-if="product.specifications?.length" class="specs">
                  <h3>商品规格</h3>
                  <el-descriptions border>
                    <el-descriptions-item
                        v-for="(spec, index) in product.specifications"
                        :key="index"
                        :label="spec.item"
                    >
                      {{ spec.value }}
                    </el-descriptions-item>
                  </el-descriptions>
                </div>

                <!-- 商品描述 -->
                <div class="description">
                  <h3>商品详情</h3>
                  <div v-html="product.detail"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 更新库存对话框 -->
          <el-dialog
              v-model="stockDialogVisible"
              title="更新库存"
              width="30%"
          >
            <el-input
                v-model.number="stockAmount"
                type="number"
                placeholder="请输入库存数量"
                min="0"
            />
            <template #footer>
              <span class="dialog-footer">
                <el-button @click="stockDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="updateStock">
                  确认
                </el-button>
              </span>
            </template>
          </el-dialog>

          <!-- 错误提示 -->
          <el-empty
              v-if="!loading && !product"
              description="找不到该商品信息"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, computed} from 'vue'
import { useRoute } from 'vue-router'
import { getProductById,updateStockpile } from '../../api/product.ts'
import { ElMessage } from 'element-plus'
import {routes} from '../../router'
const route = useRoute()
const loading = ref(true)
const product = ref<any>(null)

const stockDialogVisible = ref(false)
const stockAmount = ref(0)
const role = computed(() => sessionStorage.getItem('role') || '');
const showStockDialog = () => {
  stockAmount.value = product.value.stock // 初始化输入框为当前库存
  stockDialogVisible.value = true
}

const updateStock = async () => {
  try {
    const res = await updateStockpile({
      id: product.value.id,
      amount: stockAmount.value
    })

    // 处理成功情况
    if (res.data.code === '200') {
      ElMessage.success('库存更新成功')
      product.value.stock = stockAmount.value
      stockDialogVisible.value = false
    } else {
      // 处理业务逻辑错误
      ElMessage.error(res.data.msg || '库存更新失败')
    }
  } catch (error: any) {
    // 细化错误类型
    if (error.response) {
      // 请求已发出且服务器响应状态码非 2xx
      ElMessage.error(`服务器错误: ${error.response.data?.message || error.message}`)
    } else if (error.request) {
      // 请求已发出但没有收到响应
      ElMessage.error('网络连接异常，请检查网络')
    } else {
      // 其他错误
      ElMessage.error('请求配置错误')
    }
  }
}
// 添加路由跳转方法


const goToEditPage = () => {
  routes.push({
    name: 'UpdateProduct',
    params: { id: product.value.id }
  })
}

// 复用价格格式化逻辑
const formatPrice = (price?: number) => {
  return price ? (price).toFixed(2) : '0.00'
}

// 获取商品详情
const fetchProduct = async () => {
  try {
    loading.value = true
    const res = await getProductById(route.params.id as string)

    if (res.data.code === '200') {
      product.value = res.data.data
    } else {
      ElMessage.error(res.data.msg || '获取商品详情失败')
    }
  } catch (error) {
    ElMessage.error('网络请求失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProduct()
})
</script>

<style scoped>
.product-detail-page {
  margin: 0;
  padding: 0;
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  overflow: auto;
}

.detail-container {
  width: 100%;
  height: 100%;
  background-image: url('../../assets/background.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-card {
  width: 70%;
  max-width: 900px;
  padding: 30px;
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
}

.back-button {
  margin-bottom: 20px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 0 10px;
}

.product-title {
  font-size: 26px;
  color: #303133;
  margin: 0;
  flex-grow: 1;
}

.action-buttons {
  display: flex;
  gap: 15px;
  margin-left: 20px;
}

.detail-content {
  display: flex;
  gap: 40px;
  margin-top: 20px;
}

.detail-image {
  flex: 1;
  min-width: 400px;
}

.image {
  width: 100%;
  height: 400px;
  border-radius: 8px;
  object-fit: contain;
  background: rgba(245, 247, 250, 0.8);
  padding: 15px;
}

.detail-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.price-section {
  background: rgba(245, 247, 250, 0.8);
  padding: 20px;
  border-radius: 8px;
}

.price {
  font-size: 32px;
  color: #f56c6c;
  font-weight: 600;
}

.specs {
  background: rgba(245, 247, 250, 0.8);
  padding: 20px;
  border-radius: 8px;
}

.specs :deep(.el-descriptions) {
  margin-top: 15px;
}

.description {
  background: rgba(245, 247, 250, 0.8);
  padding: 20px;
  border-radius: 8px;
  line-height: 1.8;
}

/* 统一表单元素样式 */
:deep(.el-descriptions__title) {
  font-size: 18px;
  color: #303133 !important;
}

:deep(.el-descriptions__label) {
  color: #606266 !important;
  font-weight: 500;
}

:deep(.el-button) {
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* 对话框样式统一 */
:deep(.el-dialog) {
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(5px);
}

:deep(.el-dialog__header) {
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-input__inner) {
  background: rgba(245, 247, 250, 0.8);
}
</style>