<template>
  <div class="create-page">
    <div class="create-container">
      <el-card class="form-card">
        <div>
          <h1>创建折扣券</h1>
          <el-form
              label-position="right"
              label-width="120px"
              size="large"
              class="create-form"
              :model="couponForm"
              :rules="rules"
              ref="formRef"
          >
            <!-- 优惠券标题 -->
            <el-form-item label="名称" prop="title">
              <el-input
                  v-model="couponForm.title"
                  placeholder="请输入折扣券名称"
                  clearable
              />
            </el-form-item>

            <!-- 优惠券描述 -->
            <el-form-item label="描述" prop="description">
              <el-input
                  v-model="couponForm.description"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入折扣券使用说明"
                  maxlength="200"
                  show-word-limit
              />
            </el-form-item>

            <!-- 使用条件 -->
            <el-form-item label="满减条件" prop="trigger">
              <el-input-number
                  v-model="couponForm.trigger"
                  :min="0"
                  :precision="0"
                  :step="10"
                  controls-position="right"
                  style="width: 100%"
              >
                <template #append>元</template>
              </el-input-number>
              <span class="tip-text">（订单满指定金额可用，0表示无门槛）</span>
            </el-form-item>

            <!-- 优惠金额 -->
            <el-form-item label="优惠金额" prop="discount">
              <el-input-number
                  v-model="couponForm.discount"
                  :min="0"
                  :precision="0"
                  :step="5"
                  controls-position="right"
                  style="width: 100%"
              >
                <template #append>元</template>
              </el-input-number>
            </el-form-item>

            <!-- 有效时长 -->
            <el-form-item label="有效时长" prop="lastHour">
              <el-input-number
                  v-model="couponForm.lastHour"
                  :min="1"
                  :precision="0"
                  controls-position="right"
                  style="width: 100%"
              >
                <template #append>小时</template>
              </el-input-number>
              <span class="tip-text">（领取后生效时长）</span>
            </el-form-item>

            <div class="button-group">
              <el-button
                  type="primary"
                  @click="submitForm"
                  :loading="submitting"
              >
                立即创建
              </el-button>
              <el-button @click="goBack">
                返回
              </el-button>
            </div>
          </el-form>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance } from 'element-plus'
import { createCouponType } from '../../api/discount.ts'

const router = useRouter()

interface CouponForm {
  title: string
  description: string
  trigger: number
  discount: number
  lastHour: number
}

// 表单数据
const couponForm = ref<CouponForm>({
  title: '',
  description: '',
  trigger: 0,
  discount: 0,
  lastHour: 24
})

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入折扣券名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在2到20个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入折扣券描述', trigger: 'blur' },
    { min: 5, max: 200, message: '长度在5到200个字符', trigger: 'blur' }
  ],
  trigger: [
    {
      type: 'number' as const,
      min: 0,
      message: '金额不能小于0',
      trigger: ['blur', 'change']
    }
  ],
  discount: [
    { required: true, message: '请输入优惠金额', trigger: 'blur' },
    {
      type: 'number' as const,
      min: 0,
      message: '金额不能小于0',
      trigger: ['blur', 'change']
    }
  ],
  lastHour: [
    { required: true, message: '请输入有效时长', trigger: 'blur' },
    {
      type: 'number' as const,
      min: 1,
      message: '有效时长不能小于1小时',
      trigger: ['blur', 'change']
    }
  ]
}

const formRef = ref<FormInstance>()
const submitting = ref(false)

// 提交表单
const submitForm = async () => {
  try {
    submitting.value = true
    await formRef.value?.validate()

    const res = await createCouponType({
      ...couponForm.value,
      trigger: Number(couponForm.value.trigger),
      discount: Number(couponForm.value.discount)
    })

    if (res.data.code === '200') {
      ElMessage.success('优惠券创建成功！')
      router.push('/dashboard')
    } else {
      ElMessage.error(res.data.msg || '创建失败')
    }
  } catch (error) {
    console.error('创建优惠券失败:', error)
  } finally {
    submitting.value = false
  }
}

// 返回
const goBack = () => {
  router.go(-1)
}
</script>

<style scoped>
/* 保持原有样式不变 */
.create-page {
  margin: 0;
  padding: 0;
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  overflow: auto;
}

.create-container {
  width: 100%;
  height: 100%;
  background-image: url('../../assets/OIP-C.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-card {
  width: 50%;
  max-width: 600px;
  padding: 30px;
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #303133;
}

.button-group {
  margin-top: 40px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.tip-text {
  font-size: 12px;
  color: #909399;
  margin-left: 10px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

/* 调整输入框宽度 */
:deep(.el-input-number) {
  width: 100%;
}
</style>