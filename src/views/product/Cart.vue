<template>
  <div class="cart-container">
    <el-card class="cart-card">
      <div v-loading="loading">
        <!-- 返回按钮 -->
        <div class="header-section">
          <el-button @click="$router.go(-1)" type="primary" plain>
            ← 返回商品列表
          </el-button>
          <h1 class="cart-title">我的购物车（{{ cartData?.total || 0 }}件）</h1>
        </div>

        <!-- 商品列表 -->
        <div class="cart-items">
          <div v-for="item in cartData?.items" :key="item.cartItemId" class="cart-item">
            <!-- 商品图片 -->
            <el-image
                :src="item.cover"
                class="item-image"
                fit="cover"
            />

            <!-- 商品信息 -->
            <div class="item-info">
              <h3 class="item-title">{{ item.title }}</h3>
              <p class="item-desc">{{ item.description }}</p>
            </div>

            <!-- 价格区域 -->
            <div class="price-section">
              <div class="price-row">
                <span class="label">单价：</span>
                <span class="price">¥{{ formatPrice(item.price) }}</span>
              </div>
              <div class="price-row">
                <span class="label">小计：</span>
                <span class="price-total">¥{{ formatPrice(item.price * item.quantity) }}</span>
              </div>
            </div>

            <!-- 数量操作 -->
            <div class="quantity-section">
              <el-input-number
                  v-model="item.quantity"
                  :min="1"
                  :max="10"
                  :precision="0"
                  size="small"
                  @change="handleQuantityChange(item)"
              />
            </div>

            <!-- 删除按钮 -->
            <div class="action-section">
              <el-button
                  type="danger"
                  size="small"
                  @click="handleDelete(item.cartItemId)"
                  circle
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </div>

        <!-- 汇总信息 -->
        <div v-if="cartData?.total > 0" class="summary-section">
          <div class="total-info">
            <span class="total-label">共 {{ cartData.total }} 件商品，合计：</span>
            <span class="total-amount">¥{{ formatPrice(cartData.totalAmount) }}</span>
          </div>
          <el-button type="danger" size="large" @click="handleCheckout">
            去结算
          </el-button>
        </div>

        <!-- 空购物车提示 -->
        <el-empty
            v-if="!loading && (!cartData || cartData.total === 0)"
            description="您的购物车还没有商品哦～"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'
import { getCartItems } from '../../api/cart'

interface CartItem {
  cartItemId: string
  productId: string
  title: string
  price: number
  description: string
  cover: string
  detail: string
  quantity: number
}

interface CartData {
  items: CartItem[]
  total: number
  totalAmount: number
}

const loading = ref(true)
const cartData = ref<CartData | null>({
  items: [],
  total: 0,
  totalAmount: 0
})

// 格式化价格
const formatPrice = (price: number) => {
  return price.toFixed(2)
}

// 处理数量变化
const handleQuantityChange = async (item: CartItem) => {
  try {
    // 这里需要调用更新购物车数量的API
    ElMessage.success('已更新商品数量')
  } catch (error) {
    ElMessage.error('数量更新失败')
    console.error('更新数量错误:', error)
  }
}

// 处理删除商品
const handleDelete = async (cartItemId: string) => {
  try {
    // 这里需要调用删除购物车商品的API
    cartData.value!.items = cartData.value!.items.filter(
        item => item.cartItemId !== cartItemId
    )
    cartData.value!.total -= 1
    ElMessage.success('已移除商品')
  } catch (error) {
    ElMessage.error('删除商品失败')
    console.error('删除错误:', error)
  }
}

// 处理结算
const handleCheckout = () => {
  ElMessage.success('跳转结算页面')
  // 实际应跳转到结算页面
}

//获取购物车数据
const fetchCartItems = async () => {
  try {
    loading.value = true
    const res = await getCartItems()
    console.log('完整响应:', res)
    console.log('响应数据:', res.data)

    if (res.data.code === '200') {
      console.log('购物车数据:', res.data.data)
      cartData.value = {
        items: res.data.data.items || [],
        total: res.data.data.total || 0,
        totalAmount: res.data.data.totalAmount || 0
      }
    } else {
      ElMessage.error(res.data.msg || '获取购物车数据失败')
    }
  } catch (error) {
    console.error('请求错误:', error)
    ElMessage.error('网络请求失败')
  } finally {
    loading.value = false
    console.log('最终cartData值:', cartData.value)
  }
}

onMounted(() => {
  console.log('组件挂载')
  fetchCartItems()
})
</script>

<style scoped>
.cart-container {
  width: 100vw; /* 视口宽度 */
  height: 100vh; /* 视口高度 */
  margin: 0; /* 去掉外边距 */
  padding: 0; /* 去掉内边距 */
}

.cart-card {
  border-radius: 0; /* 如果需要全屏，可以去掉边角半径 */
  box-shadow: none; /* 去掉阴影，使其更平面 */
  height: 100%; /* 让卡片家具填满容器 */
}

.header-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.cart-title {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
}

.item-image {
  width: 100px;
  height: 100px;
  border-radius: 6px;
  margin-right: 20px;
}

.item-info {
  flex: 1;
  min-width: 250px;
  margin-right: 30px;
}

.item-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #303133;
}

.item-desc {
  margin: 0;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.price-section {
  width: 150px;
  margin-right: 30px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.label {
  color: #606266;
  font-size: 12px;
}

.price {
  color: #f56c6c;
  font-weight: 500;
}

.price-total {
  color: #303133;
  font-weight: 600;
}

.quantity-section {
  width: 120px;
  margin-right: 30px;
}

.action-section {
  width: 50px;
}

.summary-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 30px;
}

.total-info {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.total-label {
  font-size: 14px;
  color: #606266;
}

.total-amount {
  font-size: 24px;
  color: #f56c6c;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .cart-item {
    flex-wrap: wrap;
    gap: 15px;
    padding: 15px;
  }

  .item-image {
    width: 80px;
    height: 80px;
    margin-right: 15px;
  }

  .item-info {
    min-width: auto;
    margin-right: 0;
    order: 1;
    flex-basis: 100%;
  }

  .price-section,
  .quantity-section,
  .action-section {
    margin-right: 0;
    flex: 1;
    text-align: center;
  }

  .summary-section {
    flex-direction: column;
    gap: 15px;
  }
}
</style>