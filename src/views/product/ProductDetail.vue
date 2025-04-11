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
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getProductById } from '../../api/product.ts'
import { ElMessage } from 'element-plus'

const route = useRoute()
const loading = ref(true)
const product = ref<any>(null)

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
  background-color: #f5f5f5; /* 背景色稍更柔和 */
  min-height: 100vh;
  padding: 20px;
}

.detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.detail-card {
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.back-button {
  margin-bottom: 20px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.product-title {
  font-size: 26px;
  color: #303133;
  margin: 0;
}

.product-rating {
  margin-left: 10px;
}

.detail-content {
  display: flex;
  gap: 40px; /* 使用 flexbox 布局，使内容更均匀 */
}

.detail-image {
  flex: 1; /* 商品图片占用更多空间 */
}

.image {
  height: 400px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); /* 图片增加阴影 */
}

.detail-info {
  flex: 1; /* 商品信息占用剩余空间 */
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.price-section {
  margin: 20px 0;
}

.price {
  font-size: 28px;
  color: #f56c6c;
  font-weight: bold;
}

.specs {
  margin: 30px 0;
}

.description {
  margin-top: 30px;
  line-height: 1.8;
}

h3 {
  color: #606266; /* 统一标题颜色 */
}
</style>