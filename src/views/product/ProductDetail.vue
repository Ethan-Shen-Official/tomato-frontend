<template>
  <div class="product-detail-page">
    <div class="detail-container">
      <el-card class="detail-card">
        <div v-loading="loading">
          <!-- 返回按钮 -->
          <div class="back-button">
            <el-button @click="$router.go(-1)" type="primary" plain>
              返回列表
            </el-button>
          </div>

          <!-- 商品详情内容 -->
          <div v-if="product">


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

                <div class="product-header">
                  <h1 class="product-title">{{ product.title }}</h1>
                  <el-rate
                      v-model="product.rate"
                      disabled
                      :max="10"
                      :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
                      class="product-rating"
                  />
                </div>

                <div class="price-section">
                  <span class="price">¥{{ formatPrice(product.price) }}</span>
                </div>

                <!-- 添加购物车功能 -->
                <div class="cart-section" v-if="role === 'user'">
                  <div class="quantity-selector">
                    <span class="quantity-label">购买数量：</span>
                    <el-input-number
                        v-model="quantity"
                        :min="1"
                        size="default"
                        :precision="0"
                        @change="handleChange"
                    />
                    <span class="stock-info">库存 {{ stocknumber }} 件</span>
                  </div>
                  <el-button
                      type="danger"
                      class="add-cart-btn"
                      @click="handleAddToCart"
                      :disabled="quantity > stocknumber || quantity < 1"
                  >
                    🛒 加入购物车
                  </el-button>
                </div>

                <div class="detail-header">
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

                    <!-- 新增创建广告按钮 -->
                    <el-button
                        type="warning"
                        @click="createAdvertisement"
                    >
                      创建广告
                    </el-button>
                  </div>
                </div>



              </div>
            </div>

            <!-- 下半部分：商品详情 -->
            <div class="bottom-section">
              <div v-if="product.description && product.description.trim()" class="product-description">
                <h3 class="section-title">商品简介</h3>
                <div v-html="product.description" class="description-content"></div>
              </div>
              <!-- 商品描述 -->
              <div v-if="product.detail && product.detail.trim()" class="product-description">
                <h3 class="section-title">商品详情</h3>
                <div v-html="product.detail" class="description-content"></div>
              </div>

              <!-- 商品规格 -->
              <div v-if="product.specifications?.length" class="product-specs">
                <h3 class="section-title">商品规格</h3>
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

              <!-- 商品评论 -->
              <div class="comment-section">
                <div class="comment-header">
                  <h3 class="section-title">用户评价（{{ comments.length }}条）</h3>
                  <el-button
                      type="primary"
                      class="add-comment-btn"
                      @click="showCommentDialog"
                      v-if="role === 'user'"
                  >
                    ✍️ 添加书评
                  </el-button>
                </div>
                <div class="comment-list" v-if="comments.length > 0">
                  <div v-for="comment in comments" :key="comment.id" class="comment-item">
                    <div class="comment-inner">
                      <!-- 左边：用户头像 -->
                      <el-avatar :src="comment.avatar" class="user-avatar" />

                      <!-- 右边：评论内容区域 -->
                      <div class="comment-details">
                        <!-- 用户名 + 评分 + 时间 -->
                        <div class="user-header">
                          <span class="username">{{ comment.username }}</span>

                          <span class="create-time">{{ formatTime(comment.createTime) }}</span>
                        </div>
                        <!-- 评论内容 -->
                        <div class="rate-container">
                          <el-rate
                              v-model="comment.rating"
                              disabled
                              :max="5"
                              allow-half
                              :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
                          />
                        </div>
                        <div class="comment-content">
                          {{ comment.content }}
                        </div>
                        <div class="comment-actions">
                          <el-button
                              v-if="role === 'admin' || (role === 'user' && comment.username === currentUsername)"
                              type="danger"
                              size="small"
                              @click="handleDeleteComment(comment.id)"
                              class="delete-btn"
                          >
                            删除
                          </el-button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 空状态 -->
              <el-empty
                  v-if="!loading && comments.length === 0"
                  description="暂无用户评价，快来发表第一个评论吧～"
                  class="empty-comments"
              />
            </div>

          </div>

          <!-- 添加评论对话框 -->
          <el-dialog
              v-model="commentDialogVisible"
              title="发表书评"
              width="600px"
              align-center
              center
          >
            <el-form
                :model="commentForm"
                :rules="commentRules"
                ref="commentFormRef"
                label-position="left"
                class="comment-form"
            >
              <el-form-item label="评分：" prop="rating" class="form-item">
                <el-rate
                    v-model="commentForm.rating"
                    :max="5"
                    allow-half
                    show-score
                    :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
                />
              </el-form-item>

              <el-form-item label="评论内容：" prop="content" class="form-item">
                <el-input
                    v-model="commentForm.content"
                    type="textarea"
                    :rows="4"
                    placeholder="请输入您的评价"
                    maxlength="500"
                    show-word-limit
                    class="wide-textarea"
                />
              </el-form-item>
            </el-form>

            <template #footer>
              <el-button @click="commentDialogVisible = false">取 消</el-button>
              <el-button
                  type="primary"
                  @click="SubmitComment"
                  :loading="submitting"
              >
                提交评论
              </el-button>
            </template>
          </el-dialog>

          <!-- 更新库存对话框 -->
          <el-dialog
              v-model="stockDialogVisible"
              title="更新库存"
              width="30%"
              align-center
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
import { getProductById,updateStockpile,getStockpile } from '../../api/product.ts'
import { addToCart } from '../../api/cart.ts'
import { ElMessage } from 'element-plus'
import {routes} from '../../router'
const route = useRoute()
const loading = ref(true)
const product = ref<any>(null)
import { getComments,submitComment,deleteComment } from '../../api/comment.ts'
import dayjs from 'dayjs'


// 获取当前登录用户名
const currentUsername = computed(() => sessionStorage.getItem('username') || '')


const createAdvertisement = () => {
  routes.push({
    path: '/create_ad', // 根据实际路由配置调整
    query: {
      productId: product.value.id // 传递当前商品ID
    }
  })
}

// 新增评论相关数据
const comments = ref<any[]>([])

// 时间格式化方法
const formatTime = (timeStr: string) => {
  return dayjs(timeStr).format('YYYY-MM-DD HH:mm')
}

// 新增评论相关逻辑
const commentDialogVisible = ref(false)
const commentForm = ref({
  rating: 0,
  content: ''
})
const commentFormRef = ref()
const submitting = ref(false)

// 验证规则
const commentRules = {
  rating: [
    {
      required: true,
      validator: (_: unknown, value: number, callback: (error?: Error) => void) => {
        if (value <= 0) {
          callback(new Error('请选择评分'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  content: [
    {
      required: true,
      message: '请输入评论内容',
      trigger: 'blur'
    },
    {
      min: 1,
      message: '评论内容不能为空',
      trigger: 'blur'
    },
    {
      validator: (_: unknown, value: string, callback: (error?: Error) => void) => {
        if (!value || !value.trim() || !/\S/.test(value)) {
          callback(new Error('评论内容不能为空或全是空格'))
        } else {
          callback()
        }
      },
      trigger: ['blur', 'change']
    }
  ]
}

// 显示评论对话框
const showCommentDialog = () => {
  commentForm.value = { rating: 0, content: '' }
  commentDialogVisible.value = true
}

// 提交评论
const SubmitComment = async () => {
  submitting.value = true
  try {
    // 表单验证
    await commentFormRef.value.validate()

    // 构造提交数据
    const commentData = {
      productId: product.value.id,
      rating: commentForm.value.rating,
      content: commentForm.value.content
    }

    // 调用API
    const res = await submitComment(commentData)

    if (res.data.code === '200') {
      ElMessage.success('评论提交成功！')
      // 刷新评论列表
      const commentRes = await getComments(product.value.id)
      comments.value = commentRes.data.data
      commentDialogVisible.value = false
    } else {
      ElMessage.error(res.data.msg || '评论提交失败')
    }
  } catch (error) {
    if (error instanceof Error) {
      ElMessage.error('验证失败：' + error.message)
    } else {
      ElMessage.error('评论提交失败，请稍后重试')
    }
  } finally {
    submitting.value = false
  }
}

// 删除评论处理函数
const handleDeleteComment = async (commentId: string) => {
  try {
    const confirm = await ElMessageBox.confirm(
        '确定要删除这条评论吗？',
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
    )

    if (confirm) {
      const res = await deleteComment(commentId)
      if (res.data.code === '200') {
        ElMessage.success('评论删除成功')
        // 刷新评论列表
        const commentRes = await getComments(product.value.id)
        comments.value = commentRes.data.data
      } else {
        ElMessage.error(res.data.msg || '删除失败')
      }
    }
  } catch (error) {
    if (error !== 'cancel') { // 忽略取消操作
      ElMessage.error('删除评论失败，请稍后重试')
    }
  }
}


const handleChange = (value: number | undefined) => {
  console.log(value)
}
// 购物车相关逻辑
const quantity = ref(1)

const handleAddToCart = async () => {
  try {
    // 二次验证库存
    if (quantity.value > stocknumber.value) {
      ElMessage.warning('库存不足')
      return
    }

    const res = await addToCart({
      productId: product.value.id,
      quantity: quantity.value
    })

    if (res.data.code === '200') {
      ElMessage.success({
        message: '成功加入购物车',
        duration: 1000,
        showClose: true
      })
      // 清空选择数量
      quantity.value = 1
    } else {
      ElMessage.error(res.data.msg || '添加购物车失败')
    }
  } catch (error) {
    ElMessage.error('网络请求失败')
    console.error('添加购物车错误:', error)
  }
}

const stocknumber = ref(0)
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
      stocknumber.value = stockAmount.value
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
    const ress = await getStockpile(route.params.id as string)
    if (res.data.code === '200') {
      product.value = res.data.data
    } else {
      ElMessage.error(res.data.msg || '获取商品详情失败')
    }

    if (ress.data.code === '200') {
      stocknumber.value = ress.data.data.amount
    } else {
      ElMessage.error(res.data.msg || '获取库存失败')
    }

    // 获取评论数据
    const commentRes = await getComments(product.value.id)
    if (commentRes.data.code === '200') {
      comments.value = commentRes.data.data
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
/* 添加表单样式 */
/* 调整评论对话框的表单项布局 */
:deep(.comment-form) {
  .el-form-item {
    display: block; /* 改为块级布局 */
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }

    .el-form-item__label {
      display: block;
      text-align: left;
      margin-bottom: 8px;
      font-size: 14px;
      color: #606266;
      width: 100% !important; /* 覆盖element默认宽度 */
    }

    .el-form-item__content {
      display: block;
      width: 100%;

      .el-rate {
        display: flex;
        justify-content: flex-start;
        margin-top: 4px;
      }

      .el-textarea {
        width: 100%;

        :deep(.el-textarea__inner) {
          width: 100%;
          resize: vertical;
        }
      }
    }
  }
}





/* 新增评论头部样式 */
.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.add-comment-btn {
  height: 32px;
  padding: 0 15px;
}

/* 新增评论样式 */
.comment-section {
  margin-top: 40px;
  padding: 20px 0;
  border-top: 1px solid #ebeef5;
}

.section-title {
  font-size: 18px;
  color: #303133;
  margin-bottom: 20px;
}



.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.user-avatar {
  margin-right: 15px;
  width: 40px;
  height: 40px;
}

.user-meta {
  flex: 1;
}

.delete-btn {
  padding: 10px 20px;
  font-size: 14px;
  border-radius: 4px;
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  justify-content: flex-end; /* 添加此行，让子元素靠右 */
}

.rating-time {
  display: flex;
  align-items: center;
  margin-top: 5px;
}

.time {
  font-size: 12px;
  color: #909399;
  margin-left: 15px;
}

/* 每条评论的整体布局 */
.comment-item {
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

/* 横向布局：头像在左，内容在右 */
.comment-inner {
  display: flex;
}

/* 头像样式 */
.user-avatar {
  width: 50px;
  height: 50px;
  margin-right: 15px;
  flex-shrink: 0; /* 防止缩小 */
}

/* 内容区域，垂直排列 */
.comment-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 用户名 + 时间一行，左对齐 */
.user-header {
  display: flex;
  justify-content: space-between; /* 左右分布：用户名左，时间右 */
  align-items: center;
  margin-bottom: 1px;
}

/* 用户名样式 */
.username {
  font-weight: bold;
  font-size: 14px;
}

/* 时间样式 */
.create-time {
  font-size: 12px;
  color: #999;
  white-space: nowrap; /* 避免换行 */
}

/* 这里改为让评分容器左对齐 */
.rate-container {
  display: flex;       /* 横向布局，左对齐 */
  justify-content: flex-start; /* 左对齐，不居中 */
  margin-bottom: 8px;
}

/* 评论内容，左对齐，并整齐显示 */
.comment-content {
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  text-align: left; /* 确保左对齐 */
}

.empty-comments {
  margin: 20px 0;
  padding: 40px 0;
}

:deep(.el-rate) {
  --el-rate-icon-size: 28px;
  margin-top: 5px;
}

/* 调整表单样式 */
:deep(.el-form-item__label) {
  font-weight: 500;
  padding-bottom: 8px !important;
}

/* 调整评分组件样式 */
:deep(.comment-rating .el-rate__icon) {
  font-size: 16px;
  margin-right: 2px;
}

.description-content {
  text-align: left; /* 文本左对齐 */
  line-height: 1.6; /* 行高调整 */
  color: #303133; /* 文本颜色 */
  margin-top: 10px; /* 顶部边距 */
}
/* 新增购物车样式 */
.cart-section {
  margin: 0;
  padding: 20px;
  background: rgba(245, 247, 250, 0.8);
  border-radius: 8px;
}

.quantity-selector {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.quantity-label {
  font-size: 14px;
  color: #606266;
  margin-right: 15px;
}

.stock-info {
  margin-left: 20px;
  font-size: 13px;
  color: #909399;
}

.add-cart-btn {
  width: 100%;
  height: 45px;
  font-size: 16px;
  letter-spacing: 1px;
}

:deep(.el-input-number) {
  width: 120px;
}

:deep(.el-input-number .el-input__inner) {
  text-align: center;
}

.product-detail-page {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  overflow: auto;

}

.detail-container {
  width: 100%;
  min-height: 100vh; /* 让容器至少和视口一样高，内容多了还能增长 */
  background-image: url('../../assets/OIP-C.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: scroll;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 100px; /* 添加顶部内边距，内容在header下方显示 */
  padding-bottom: 20px;
}

.detail-card {
  width: 70%;
  max-width: 1200px;
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
  font-size: 30px;
  color: #303133;
  margin: 0;
  flex-grow: 1;
  padding-bottom: 40px;
}

.action-buttons {
  padding-top: 20px;
  display: flex;
  gap: 30px;
  margin-left: 190px;
}

.detail-content {
  display: flex;
  gap: 40px;
  margin-top: 20px;
}

.detail-image {
  flex: 0 0 30%;
  min-width: 100px;
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

  padding: 20px;
  border-radius: 8px;
}

.price {
  font-size: 32px;
  color: #f56c6c;
  font-weight: 600;
}

/* 优化商品描述和规格的标题样式 */
.product-description .section-title,
.section-title {
  text-align: left; /* 左对齐 */
  margin-bottom: 10px; /* 添加一定的底部间距 */
}

.specs {
  background: rgba(245, 247, 250, 0.8);
  padding: 20px;
  border-radius: 8px;
}

.product-specs {
  width: 40%; /* 设置宽度为40% */
  border-radius: 8px; /* 圆角 */
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
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(5px);
}

:deep(.el-dialog__header) {
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-input__inner) {
  background: rgba(245, 247, 250, 0.8);
}
</style>



