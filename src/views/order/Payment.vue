<template>
  <div class="payment-container">
    <el-card class="payment-card">
      <h1 class="title">订单结算</h1>

      <!-- 商品信息 -->
      <div class="goods-section">
        <h2 class="section-title">商品信息</h2>
        <el-card
            v-for="item in selectedItems"
            :key="item.productId"
            class="goods-item"
        >
          <div class="goods-content">
            <el-image
                :src="item.cover"
                class="goods-image"
                fit="cover"
            />
            <div class="goods-info">
              <h3 class="goods-title">{{ item.title }}</h3>
              <div class="goods-price">
                <span>单价：¥{{ formatPrice(item.price) }}</span>
                <span>数量：{{ item.quantity }}</span>
                <span class="total">小计：¥{{ formatPrice(item.price * item.quantity) }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 收货信息表单 -->
      <div class="form-section">
        <h2 class="section-title">收货信息</h2>
        <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            label-width="100px"
        >
          <el-form-item label="收货人姓名" prop="name">
            <el-input v-model="form.name" placeholder="请输入姓名" />
          </el-form-item>
          <el-form-item label="手机号码" prop="phone">
            <el-input v-model="form.phone" placeholder="请输入手机号" />
          </el-form-item>
          <el-form-item label="收货地址" prop="address">
            <el-input
                v-model="form.address"
                type="textarea"
                :rows="3"
                placeholder="请输入详细收货地址"
            />
          </el-form-item>
        </el-form>
      </div>

      <!-- 订单总额 -->
      <div class="total-section">
        <span class="total-label">订单总额：</span>
        <span class="total-amount">¥{{ formatPrice(orderTotal) }}</span>
      </div>

      <!-- 支付方式选择 -->
      <div class="form-section">
        <h2 class="section-title">支付方式</h2>
        <el-form-item label="选择支付方式" prop="paymentMethod">
          <el-select v-model="form.paymentMethod" placeholder="请选择支付方式">
            <el-option label="支付宝" value="ALIPAY"></el-option>
            <!-- 后续可以添加更多支付方式 -->
          </el-select>
        </el-form-item>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button class="cancel-button" @click="handleCancel">取消</el-button>
        <el-button class="pay-button" @click="handlePayment">生成订单</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
//import { ElMessage, ElMessageBox } from 'element-plus'
import routes from '../../router'
import { addOrder } from '../../api/order'

interface SelectedItem {
  productId: string
  title: string
  price: number
  cover: string
  quantity: number
}

const router = routes;

// 从sessionStorage获取选中的商品
const selectedItems = ref<SelectedItem[]>([])
const formRef = ref()

// 表单数据
const form = ref({
  name: '',
  phone: '',
  address: '',
  paymentMethod: 'ALIPAY' // 设置默认的支付方式
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入收货人姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    {
      pattern: /^1\d{10}$/,
      message: '手机号格式不正确',
      trigger: 'blur'
    }
  ],
  address: [
    { required: true, message: '请输入收货地址', trigger: 'blur' }
  ]
}

// 计算订单总额
const orderTotal = computed(() => {
  return selectedItems.value.reduce((total, item) => {
    return total + (item.price * item.quantity)
  }, 0)
})

// 价格格式化
const formatPrice = (price: number) => {
  return price.toFixed(2)
}

// 处理取消
const handleCancel = () => {
  router.push('/cart') // 返回上一页
}

// 替换原有的handlePayment函数
const handlePayment = async () => {
  try {
    await formRef.value.validate()

    await ElMessageBox.confirm('确认生成订单吗？', '订单确认', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const cartItemIds = JSON.parse(sessionStorage.getItem('selectedCartItemIds') || '[]')
    // 构造订单数据
    const order = {
      itemIds: cartItemIds,
      recipient: {
        name: form.value.name,
        telephone: form.value.phone,
        location: form.value.address
      },
      method: form.value.paymentMethod
    }
    sessionStorage.removeItem('selectedCartItemIds')
    // 调用创建订单接口
    const res = await addOrder(order)
    if (res.data.code === '200') {
      ElMessage.success("订单创建成功")
      router.push('/order')
    } else {
      ElMessage.error(res.data.msg)
    }
  } catch (error) {
    ElMessage.error("创建失败")
    // 处理取消或错误
  }
}

onMounted(() => {
  // 从sessionStorage获取选中的商品
  const items = sessionStorage.getItem('selectedItems')
  sessionStorage.removeItem('selectedItems')
  if (items) {
    try {
      selectedItems.value = JSON.parse(items)
    } catch (e) {
      ElMessage.error('商品信息解析失败')
      router.push('/cart')
    }
  } else {
    ElMessage.warning('请先选择商品')
    router.push('/cart')
  }
})
</script>

<style scoped>
.cancel-button {
  background-color: #6cccf5; /* 红色背景 */
  color: #fff; /* 白色文字 */
}

.pay-button {
  background-color: #f56c6c; /* 绿色背景 */
  color: #fff; /* 白色文字 */
}

.payment-container {
  padding: 20px;
  width: 50%;
  border-radius: 15%;
  max-width: 1200px;
  margin: 0 auto;
}

.title {
  font-size: 40px;
  text-align: center;
  margin-bottom: 30px;
}

.section-title {
  font-size: 18px;
  color: #303133;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.goods-item {
  margin-bottom: 15px;
}

.goods-content {
  display: flex;
  align-items: center;
}

.goods-image {
  width: 100px;
  height: 100px;
  margin-right: 20px;
}

.goods-info {
  flex: 1;
}

.goods-title {
  margin: 0 0 10px 0;
  font-size: 16px;
}

.goods-price {
  display: flex;
  gap: 20px;
  color: #606266;
  font-size: 14px;
  justify-content: center;
}

.goods-price .total {
  color: #f56c6c;
  font-weight: 600;
}

.form-section {
  margin: 30px 0;
}

.total-section {
  text-align: right;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 4px;
  margin: 30px 0;
}

.total-label {
  font-size: 16px;
  color: #606660;
}

.total-amount {
  font-size: 24px;
  color: #f56c6c;
  font-weight: 600;
}

.action-buttons {
  text-align: right;
  margin-top: 30px;
}

.action-buttons .el-button {
  width: 120px;
  margin-left: 20px;
}

@media (max-width: 768px) {
  .goods-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .goods-image {
    margin-right: 0;
    margin-bottom: 10px;
  }

  .goods-price {
    flex-direction: column;
    gap: 8px;
  }
}
</style>