<template>
  <div class="products-page">
    <div class="products-container">
      <!-- 广告轮播部分 -->
      <div class="ad-section">
        <!-- 新增广告轮播部分 -->
        <el-carousel
            v-if="ads.length > 0"
            :interval="5000"
            type="card"
            height="360px"
            class="ad-carousel"
        >
          <el-carousel-item
              v-for="ad in ads"
              :key="ad.id"
              class="ad-item"
              @click="goToProduct(ad.productId, ad.id)"
          >
            <div class="ad-content">
              <el-image
                  :src="ad.imgUrl"
                  fit="cover"
                  class="ad-image"
              />
              <div class="ad-overlay">
                <h3 class="ad-title">{{ ad.title }}</h3>
                <p class="ad-description">{{ ad.content }}</p>
              </div>
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>


      <el-card class="list-card">
        <div>

          <!-- 修改后的创建按钮 -->
          <router-link v-if="role === 'admin'" to="/create">
            <el-button type="primary" size="default" class="create-button">
              创建商品
            </el-button>
          </router-link>

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
                <div class="product-wrapper">
                  <!-- 修改后的删除按钮 -->
                  <div v-if="role === 'admin'" class="delete-wrapper">
                    <el-popconfirm
                        title="确认要删除该商品吗？"
                        @confirm="handleDelete(String(product.id))"
                    >
                      <template #reference>
                        <el-button
                            type="danger"
                            size="small"
                            circle
                            class="delete-btn"
                            @click.stop
                        >
                          <el-icon><Delete /></el-icon>
                        </el-button>
                      </template>
                    </el-popconfirm>
                  </div>

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

                            <el-rate
                                v-model="product.rate"
                                disabled
                                :max="5"
                                :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
                                class="product-rate"
                            />
                          </div>

                          <div class="price-show">
                            <span class="product-price">¥{{ formatPrice(product.price) }}</span>
                          </div>



                        </div>
                      </div>
                    </el-card>
                  </router-link>
                </div>


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
import { ref, onMounted,computed } from 'vue'
import { getProducts } from '../../api/product.ts'
import { Picture } from '@element-plus/icons-vue'
import {routes} from '../../router'
import { Delete } from '@element-plus/icons-vue'
import { deleteProduct } from '../../api/product.ts'


// 新增广告相关导入
import { getAd } from '../../api/advertisement.ts'

// 广告数据
const ads = ref<any[]>([])

// 获取广告数据
const fetchAds = async () => {
  try {
    const res = await getAd()
    if (res.data.code === '200') {
      ads.value = res.data.data
    }
  } catch (error) {
    ElMessage.error('获取广告数据失败')
  }
}

// 修改原来的goToProduct方法
const goToProduct = (productId: string, adId: string) => {
  const role = sessionStorage.getItem('role')
  if (role === 'admin') {
    routes.push({ name: 'UpdateAdvertisement', params: { id: adId } })
  } else {
    routes.push({ name: 'ProductDetail', params: { id: productId } })
  }
}

onMounted(async () => {
  await Promise.all([fetchProducts(), fetchAds()])
})


const role = computed(() => sessionStorage.getItem('role') || '');
// 在原有代码基础上增加删除逻辑
const handleDelete = async (id: string) => {
  try {
    const res = await deleteProduct(id)
    if (res.data.code === '200') {
      ElMessage.success('删除成功')
      // 删除后重新获取列表
      await fetchProducts()
    } else {
      ElMessage.error(res.data.msg || '删除失败')
    }
  } catch (error) {
    ElMessage.error('删除操作失败')
  }
}

// 商品类型定义
interface Product {
  id: string | number
  title?: string
  cover?: string
  price?: number | bigint
  rate?: number
  // 其他字段可按需补充
}

// 商品列表数据
const products = ref<Product[]>([])
const loading = ref(true)

// 格式化价格显示
const formatPrice = (price?: number | bigint) => {
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

/* 新增样式 */
.product-wrapper {
  position: relative;
}

.delete-wrapper {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
}

.delete-btn {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.delete-btn:hover {
  transform: scale(1.1) rotate(90deg);
}

/* 调整卡片间距 */
.product-col {
  margin-bottom: 20px;
  padding: 8px; /* 增加内边距防止遮挡 */
}

.products-page {
  width: 100%;
  height: 100%;
  margin: 0 ;
  background-image: url('../../assets/OIP-C.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  display: block;
  /* 添加全屏设置 */
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto; /* 允许内容滚动 */
  padding: 20px 0 60px; /* 增加底部内边距 */
}

.products-container {
  max-width: 1500px;
  margin: 0 auto;
  flex: 1;
  width: 100%;
  display: flex; /* 新增 */
  flex-direction: column; /* 新增 */
}



/* 新增广告容器样式 */
.ad-section {
  padding: 90px 0 20px;
  margin-bottom: 20px;
  height: 400px;

}

/* 调整轮播样式 */
.ad-carousel {
  width: 100%;
  margin: 0 auto;
  height: 100%;

}

/* 新增响应式调整 */
@media (max-width: 768px) {
  .ad-carousel {
    height: 200px !important;
  }

  .ad-overlay {
    padding: 12px;

    .ad-title {
      font-size: 1.2em;
    }

    .ad-description {
      display: none;
    }
  }

  .products-page {
    padding: 10px;
  }
}

.ad-item {

  border-radius: 12px;
  overflow: hidden;
  transform: scale(0.85);
  transition: transform 0.3s;
  cursor: pointer;

  &.is-active {
    transform: scale(1);
    z-index: 3;
  }
}

.ad-content {
  position: relative;
  height: 100%;
}

.ad-image {
  width: 100%;
  height: 100%;
  filter: brightness(0.8);
}

.ad-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  color: white;

  .ad-title {
    margin: 0;
    font-size: 1.5em;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  }

  .ad-description {
    margin: 10px 0 0;
    font-size: 0.9em;
    line-height: 1.4;
    opacity: 0.9;
  }
}

/* 调整列表卡片样式 */
.list-card {
  background-color: rgba(255, 255, 255, 0.75);
  border-radius: 12px;
  overflow: hidden;
  padding-top: 20px; /* 为顶部留出空间 */

  display: flex;
  flex-direction: column;

  margin-bottom: 50px;
  flex: 1;
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
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
}

.price-show {
  text-align: center;
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