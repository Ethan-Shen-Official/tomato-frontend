<template>
  <div class="page-bg">
    <div class="coupon-container">
      <div class="coupon-content">
        <el-card class="coupon-card">
          <div v-loading="loading">
            <!-- 头部 -->
            <div class="header-section">
              <router-link to="/dashboard" v-slot="{ navigate }">
                <el-button @click="navigate" type="primary" plain>
                  返回首页
                </el-button>
              </router-link>
              <h1 class="coupon-title">全部折扣券（{{ couponData?.length || 0 }}种）</h1>
            </div>

            <!-- 优惠券列表 -->
            <div class="coupon-items">
              <div v-for="item in couponData" :key="item.id" class="coupon-item">
                <!-- 图标 -->
                <div class="icon-section">
                  <el-icon class="coupon-icon" size="28">
                    <Ticket />
                  </el-icon>
                </div>

                <!-- 基本信息 -->
                <div class="info-section">
                  <h3 class="item-title">{{ item.title }}</h3>
                  <p class="item-desc">{{ item.description }}</p>
                </div>

                <!-- 优惠详情 -->
                <div class="detail-section">
                  <div class="detail-item">
                    <span class="detail-label">满减条件</span>
                    <span class="detail-value">¥{{ item.trigger }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">优惠金额</span>
                    <span class="detail-value">¥{{ item.discount }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">有效期</span>
                    <span class="detail-value">{{ item.lastHour }}小时</span>
                  </div>
                </div>

                <!-- 操作按钮 -->
                <div class="action-section">
                  <el-button
                      type="primary"
                      size="small"
                      @click="openAddDialog(item)"
                  >
                    加入奖池
                  </el-button>
                </div>
              </div>
            </div>

            <el-dialog
                v-model="showAddDialog"
                title="加入奖池"
                width="400px"
                :align-center="true"
                class="custom-dialog"
            >
              <div class="add-dialog-content">
                <el-form label-width="auto">
                  <el-form-item
                      label="数量："
                      label-width="80px"
                      class="form-item-custom"
                  >
                    <el-input-number
                        v-model="addForm.quantity"
                        :min="1"
                        :precision="0"
                        controls-position="right"
                        class="full-width-input"
                    />
                  </el-form-item>
                </el-form>
              </div>

              <template #footer>
                <div class="dialog-footer-btns">
                  <el-button @click="showAddDialog = false" size="medium">取消</el-button>
                  <el-button
                      type="primary"
                      :loading="adding"
                      @click="handleAddToPool"
                      size="medium"
                  >
                    确认添加
                  </el-button>
                </div>
              </template>
            </el-dialog>

            <!-- 空数据提示 -->
            <el-empty
                v-if="!loading && (!couponData || couponData.length === 0)"
                description="暂无优惠券信息"
            />
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Ticket } from '@element-plus/icons-vue'
import { getAllCouponType } from '../../api/discount.ts'
import { addNewItem } from '../../api/lottery'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(true)
const adding = ref(false)
const showAddDialog = ref(false)
const couponData = ref<any[]>([])

// 添加表单数据
const addForm = ref({
  couponId: '',
  quantity: 1
})

// 打开添加对话框
const openAddDialog = (item: any) => {
  addForm.value = {
    couponId: item.id,
    quantity: 1
  }
  showAddDialog.value = true
}

// 处理添加操作
const handleAddToPool = async () => {
  try {
    adding.value = true

    const params = {
      type: 'COUPON',
      itemId: addForm.value.couponId,
      quantity: addForm.value.quantity
    }

    const res = await addNewItem(params)
    if (res.data.code === '200') {
      ElMessage.success('添加奖池成功')
      showAddDialog.value = false
    } else {
      ElMessage.error(res.data.msg || '添加失败')
    }
  } catch (error) {
    ElMessage.error('请求失败，请稍后重试')
  } finally {
    adding.value = false
  }
}

// 获取优惠券数据
const fetchData = async () => {
  try {
    const res = await getAllCouponType()
    if (res.data.code === "200") {
      couponData.value = res.data.data
    }
  } catch (error) {
    ElMessage.error('获取优惠券数据失败')
  } finally {
    loading.value = false
  }
}

fetchData()
</script>

<style scoped>
.action-section {
  min-width: 100px;
  display: flex;
  justify-content: flex-end;
  padding-right: 20px;
}

.add-dialog-content {
  padding: 20px 30px;
}

.page-bg {
  /* 保持与奖池组件相同的背景样式 */
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

.coupon-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}

.coupon-card {
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
}

.coupon-title {
  margin: 0;
  font-size: 24px;
  color: #333;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.coupon-items {
  margin-top: 20px;
}

.coupon-item {
  display: flex;
  align-items: center;
  padding: 20px;
  margin-bottom: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  gap: 30px;
  justify-content: space-between;
}

.icon-section {
  width: 60px;
}

.info-section {
  flex: 1;
  min-width: 300px;
}

.item-title {
  margin: 0 0 8px;
  font-size: 18px;
  color: #333;
}

.item-desc {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.detail-section {
  flex: 1;
  display: flex;
  gap: 40px;
  justify-content: flex-start;
}

.detail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 100px;
}

.detail-label {
  font-size: 14px;
  color: #999;
  margin-bottom: 8px;
}

.detail-value {
  font-size: 16px;
  color: #f56c6c;
  font-weight: bold;
}

.coupon-icon {
  color: #f56c6c;
}

.full-width-input {
  width: 100%;
}

.form-item-custom {
  margin-bottom: 0;
}
</style>