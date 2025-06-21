<template>
  <div class="products-page">
    <div class="products-container">
      <!-- 广告轮播部分 -->
      <div class="ad-section">
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
          <!-- 搜索表单 -->
          <el-form :model="searchForm" label-width="80px" class="search-form">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="关键词">
                  <el-input
                      v-model="searchForm.query"
                      placeholder="商品名称/描述"
                      clearable
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="价格范围">
                  <el-input-number
                      v-model="searchForm.minPrice"
                      :min="0"
                      :precision="2"
                      placeholder="最低价"
                      controls-position="right"
                  />
                  <span class="range-separator">-</span>
                  <el-input-number
                      v-model="searchForm.maxPrice"
                      :min="searchForm.minPrice || 0"
                      :precision="2"
                      placeholder="最高价"
                      controls-position="right"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="评分范围">
                  <el-input-number
                      v-model="searchForm.minRate"
                      :min="0"
                      :max="5"
                      :precision="1"
                      placeholder="最低分"
                      controls-position="right"
                  />
                  <span class="range-separator">-</span>
                  <el-input-number
                      v-model="searchForm.maxRate"
                      :min="searchForm.minRate || 0"
                      :max="5"
                      :precision="1"
                      placeholder="最高分"
                      controls-position="right"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="评论数">
                  <el-input-number
                      v-model="searchForm.minComment"
                      :min="0"
                      placeholder="最少"
                      controls-position="right"
                  />
                  <span class="range-separator">-</span>
                  <el-input-number
                      v-model="searchForm.maxComment"
                      :min="searchForm.minComment || 0"
                      placeholder="最多"
                      controls-position="right"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="库存状态">
                  <el-checkbox
                      v-model="searchForm.excludeOutOfStock"
                      label="仅显示有库存"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="折扣">
                  <el-checkbox
                      v-model="searchForm.hasDiscount"
                      label="仅显示有折扣"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24" style="text-align: right;">
                <el-button
                    type="primary"
                    @click="handleSearch"
                    :loading="loading"
                >
                  搜索
                </el-button>
                <el-button
                    @click="resetSearch"
                >
                  重置
                </el-button>
              </el-col>
            </el-row>
          </el-form>

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

                  <router-link :to="{ name: 'ProductDetail', params: { id: product.id } }" style="text-decoration: none; color: inherit;">
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
import { ref, onMounted, computed } from 'vue'
import { getProducts, deleteProduct } from '../../api/product.ts'
import { searchProducts } from '../../api/product.ts' // 新增搜索API
import { Picture, Delete } from '@element-plus/icons-vue'
import routes from '../../router'
import { getAd } from '../../api/advertisement.ts'
import { ElMessage } from 'element-plus'

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

// 搜索表单
const searchForm = ref({
  query: '',
  minPrice: undefined as number | undefined,
  maxPrice: undefined as number | undefined,
  minRate: undefined as number | undefined,
  maxRate: undefined as number | undefined,
  minComment: undefined as number | undefined,
  maxComment: undefined as number | undefined,
  excludeOutOfStock: false,
  hasDiscount: false
})

// 处理搜索
const handleSearch = async () => {
  try {
    loading.value = true
    // 构建搜索参数，过滤掉undefined/null/空字符串的值

    const params = Object.fromEntries(
        Object.entries(searchForm.value)
            .filter(([_, value]) =>
                value !== undefined &&
                value !== null &&
                (typeof value !== 'string' || value.trim() !== '')
            )
    )
    const res = await searchProducts(params)
    if (res.data.code === '200') {

      products.value = res.data.data

    } else {
      ElMessage.error(res.data.msg || '搜索失败')
    }
  } catch (error) {
    ElMessage.error('搜索请求失败')
  } finally {
    loading.value = false
  }
}

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    query: '',
    minPrice: undefined,
    maxPrice: undefined,
    minRate: undefined,
    maxRate: undefined,
    minComment: undefined,
    maxComment: undefined,
    excludeOutOfStock: false,
    hasDiscount: false
  }
  fetchProducts() // 重置后重新获取全部商品
}

const role = computed(() => sessionStorage.getItem('role') || '')

// 修改原来的goToProduct方法
const goToProduct = (productId: string, adId: string) => {
  const role = sessionStorage.getItem('role')
  if (role === 'admin') {
    routes.push({ name: 'UpdateAdvertisement', params: { id: adId } })
  } else {
    routes.push({ name: 'ProductDetail', params: { id: productId } })
  }
}

// 商品类型定义
interface Product {
  id: string | number
  title?: string
  cover?: string
  price?: number | bigint
  rate?: number
  stock?: number
  commentCount?: number
  hasDiscount?: boolean
  // 其他字段可按需补充
}

// 商品列表数据
const products = ref<Product[]>([])
const loading = ref(true)

// 格式化价格显示
const formatPrice = (price?: number | bigint) => {
  if (!price) return '0.00'
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

// 删除商品
const handleDelete = async (id: string) => {
  try {
    const res = await deleteProduct(id)
    if (res.data.code === '200') {
      ElMessage.success('删除成功')
      await handleSearch() // 删除后重新搜索
    } else {
      ElMessage.error(res.data.msg || '删除失败')
    }
  } catch (error) {
    ElMessage.error('删除操作失败')
  }
}

onMounted(async () => {
  await Promise.all([fetchProducts(), fetchAds()])
})
</script>

<style scoped>
/* 新增搜索表单样式 */
.search-form {
  margin-bottom: 20px;
  padding: 20px;

  border-radius: 8px;

}

.range-separator {
  margin: 0 10px;
  color: #999;
}

/* 调整输入框间距 */
.el-input-number {
  width: 120px;
}

/* 其他原有样式保持不变 */
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

.product-col {
  margin-bottom: 20px;
  padding: 8px;
}

.products-page {
  width: 100%;
  height: 100%;
  margin: 0;
  background-image: url('../../assets/OIP-C.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  display: block;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  padding: 20px 0 60px;
}

.products-container {
  max-width: 1500px;
  margin: 0 auto;
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.ad-section {
  padding: 90px 0 20px;
  margin-bottom: 20px;
  height: 400px;
}

.ad-carousel {
  width: 100%;
  margin: 0 auto;
  height: 100%;
}

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

.list-card {
  background-color: rgba(255, 255, 255, 0.75);
  border-radius: 12px;
  overflow: hidden;
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  margin-bottom: 50px;
  flex: 1;
}

.products-list {
  min-height: 500px;
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

.empty-tip {
  padding: 50px 0;
}
</style>