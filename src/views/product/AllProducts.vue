<template>
  <div class="products-page">
    <div class="products-container">
      <el-card class="list-card">
        <div>
          <h1 style="margin-bottom: 30px">全部商品</h1>
          <div v-loading="loading" class="products-list">
            <el-row :gutter="20">
                <el-col
                    v-for="product in products"
                    :key="product.id"
                    :xs="24"
                    :sm="12"
                    :md="8"
                    :lg="6"
                    class="product-col"
                >
                  <router-link :to="{ name: 'ProductDetail', params: { id: product.id } }"style="text-decoration: none; color: inherit;">
                    <el-card class="product-card" shadow="hover">
                      <div class="product-content">
                        <!-- 商品封面 -->
                        <div class="product-image">
                          <el-image
                              v-if="product.cover"
                              :src="product.cover"
                              fit="cover"
                              class="cover-image"
                          />
                          <div v-else class="image-placeholder">
                            <el-icon :size="50"><Picture /></el-icon>
                          </div>
                        </div>

                        <!-- 商品基本信息 -->
                        <div class="product-info">
                          <h3 class="product-title">{{ product.title }}</h3>
                          <div class="price-rate">
                            <span class="product-price">¥{{ formatPrice(product.price) }}</span>
                            <el-rate
                                v-model="product.rate"
                                disabled
                                :max="10"
                                :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
                                class="product-rate"
                            />
                          </div>
                          <p class="product-desc">{{ product.description }}</p>

                          <!-- 商品规格 -->
                          <div v-if="product.specifications?.length" class="specifications">
                            <div
                                v-for="(spec, index) in product.specifications"
                                :key="index"
                                class="spec-item"
                            >
                              <span class="spec-label">{{ spec.item }}：</span>
                              <span class="spec-value">{{ spec.value }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </el-card>
                  </router-link>

                </el-col>


            </el-row>

            <!-- 空状态 -->
            <el-empty
                v-if="!loading && products.length === 0"
                description="暂无商品数据"
                class="empty-tip"
            />
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getProducts } from '../../api/product.ts'
import { Picture } from '@element-plus/icons-vue'

// 商品列表数据
const products = ref<[]>([])
const loading = ref(true)

// 格式化价格显示
const formatPrice = (price?: bigint) => {
  if (!price) return '0.00'
  // 假设price以分为单位，转换为元
  return (Number(price)).toFixed(2)
}

// 获取商品列表
const fetchProducts = async () => {
  try {
    loading.value = true
    const res = await getProducts()
    if (res.data.code === '200') {
      products.value = res.data.data
    }
  } catch (error) {
    ElMessage.error('获取商品列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
.products-page {
  margin: 0;
  padding: 0;
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  overflow: auto;
}

.products-container {
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

.list-card {
  width: 90%;
  max-width: 1200px;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  margin: 20px 0;
}

.products-list {
  min-height: 500px;
}

.product-col {
  margin-bottom: 20px;
}

.product-card {
  height: 100%;
  transition: transform 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.product-image {
  height: 200px;
  background-color: #f5f7fa;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  color: #c0c4cc;
}

.product-info {
  padding: 15px;
  flex: 1;
}

.product-title {
  margin: 0 0 10px;
  font-size: 16px;
  color: #303133;
}

.price-rate {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.product-price {
  font-size: 18px;
  color: #f56c6c;
  font-weight: bold;
}

.product-desc {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
  margin: 10px 0;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.specifications {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #ebeef5;
}

.spec-item {
  font-size: 12px;
  color: #606266;
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.spec-label {
  color: #909399;
}

.spec-value {
  color: #303133;
}

.empty-tip {
  padding: 50px 0;
}
</style>