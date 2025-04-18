<template>
  <div class="cart-container">
    <el-card class="cart-card">
      <div v-loading="loading">
        <!-- 返回按钮 -->
        <div class="header-section">
          <router-link to="/all" v-slot="{navigate}">
            <el-button @click="navigate" type="primary" plain>
              返回商品列表
            </el-button>
          </router-link>

          <h1 class="cart-title">我的购物车（{{ cartData?.total || 0 }}件）</h1>
        </div>

        <!-- 商品列表 -->
        <div class="cart-items">
          <div v-for="item in cartData?.items" :key="item.productId" class="cart-item">
            <!-- 选择框 -->
            <div class="checkbox-section">
              <el-checkbox v-model="item.selected" />
            </div>

            <!-- 商品图片 -->
            <el-image
                :src="item.cover"
                class="item-image"
                fit="cover"
            />

            <!-- 商品信息 -->
            <div class="item-info">
              <h3 class="item-title">{{ item.title }}</h3>
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
                  @click="handleDelete(item)"
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
            <span class="total-label">已选 {{ selectedTotal }} 件商品，合计：</span>
            <span class="total-amount">¥{{ formatPrice(selectedTotalAmount) }}</span>
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
import { ref, onMounted,computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'
import { getCartItems,deleteFromCart,updateCartItem } from '../../api/cart'
import { getStockpile } from "../../api/product";
import {routes} from '../../router'


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
const handleQuantityChange = async (item: MergedCartItem) => {
  try {
    if (!item.cartItemIds?.length) {
      ElMessage.error('商品数据异常')
      return
    }

    // 获取要修改的第一个条目ID
    const [firstId, ...otherIds] = item.cartItemIds

    // 更新第一个条目数量
    await updateCartItem({
      cartItemId: firstId,
      quantity: item.quantity
    })

    // 删除其他冗余条目
    if (otherIds.length > 0) {
      const deletePromises = otherIds.map(id =>
          deleteFromCart(id).catch(e => {
            console.warn(`删除条目 ${id} 失败:`, e)
            return null
          })
      )
      await Promise.all(deletePromises)
    }

    // 刷新购物车数据
    await fetchCartItems()
    ElMessage.success('商品数量更新成功')
  } catch (error) {
    ElMessage.error('数量更新失败')
    console.error('更新错误:', error)
    // 失败时重新加载确保数据一致
    await fetchCartItems()
  }
}

// 删除逻辑
const handleDelete = async (mergedItem: MergedCartItem) => {
  try {
    // 确认对话框（可选）
    await ElMessageBox.confirm('确定移除该商品所有数量吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 循环删除
    const deletePromises = mergedItem.cartItemIds.map(id =>
        deleteFromCart(id).catch(e => {
          console.warn(`删除 ${id} 失败（可忽略）:`, e)
          return null // 标记失败但继续执行
        })
    )

    await Promise.all(deletePromises)
    await fetchCartItems()
    ElMessage.success('已移除商品')
  } catch (error) {
    // 用户取消删除时不需要处理
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
      console.error(error)
    }
  }
}

// 处理结算
const handleCheckout = () => {
  if (selectedTotal.value === 0) {
    ElMessage.warning('请选择要结算的商品')
    return
  }
  ElMessage.success(`跳转结算页面，共${selectedTotal.value}件商品`)
  // 实际跳转逻辑
  const selected = selectedItems.value;
  sessionStorage.setItem('selectedItems', JSON.stringify(selected));
  routes.push({
    path: '/payment'
  })
}

//获取购物车数据
interface MergedCartItem {
  productId: string
  title: string
  price: number
  cover: string
  quantity: number
  cartItemIds: string[] // 保留原始ID用于后续操作
  selected: boolean
}

// 计算选中商品
const selectedItems = computed(() => {
  return cartData.value.items.filter(item => item.selected)
})

// 计算选中总数量
const selectedTotal = computed(() => {
  return selectedItems.value.reduce((sum, item) => sum + item.quantity, 0)
})

// 计算选中总金额
const selectedTotalAmount = computed(() => {
  return selectedItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
})

// 在 fetchCartItems 中添加 selected 状态
const fetchCartItems = async () => {
  try {
    loading.value = true
    const res = await getCartItems()

    if (res.data.code === '200') {
      const originalItems = res.data.data.items || []
      const itemsMap = new Map<string, MergedCartItem>()

      for (const item of originalItems) {
        const stockRes = await getStockpile(item.productId)
        const stock = stockRes.data.code === '200' ? stockRes.data.data.amount : 0

        if (itemsMap.has(item.productId)) {
          const existing = itemsMap.get(item.productId)!
          existing.quantity += item.quantity
          existing.quantity = Math.min(existing.quantity, stock)
          existing.cartItemIds.push(item.cartItemId)
        } else {
          itemsMap.set(item.productId, {
            productId: item.productId,
            title: item.title,
            price: item.price,
            cover: item.cover,
            quantity: Math.min(item.quantity, stock),
            cartItemIds: [item.cartItemId],
            selected: false
          })
        }
      }

      cartData.value = {
        items: Array.from(itemsMap.values()),
        total: Array.from(itemsMap.values()).reduce((sum, item) => sum + item.quantity, 0),
        totalAmount: Array.from(itemsMap.values()).reduce((sum, item) => sum + (item.price * item.quantity), 0)
      }
    }
  } catch (error) {
    console.error('Error fetching cart items:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  console.log('组件挂载')
  fetchCartItems()
})
</script>

<style scoped>

/* 新增复选框样式 */
.checkbox-section {
  margin-right: 20px;
}

/* 调整商品项布局 */
.cart-item {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s ease;
}

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