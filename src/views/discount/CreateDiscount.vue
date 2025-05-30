<template>
  <div class="create-page">
    <div class="create-container">
      <el-card class="form-card">
        <div>
          <h1>创建折扣</h1>
          <el-form
              label-position="right"
              label-width="120px"
              size="large"
              class="create-form"
              :model="discountForm"
              :rules="rules"
              ref="formRef"
          >
            <!-- 商品ID展示 -->
            <el-form-item label="商品ID" prop="productId">
              <el-input
                  v-model="discountForm.productId"
                  disabled
                  placeholder="自动获取商品ID"
              />
            </el-form-item>

            <!-- 折扣率输入 -->
            <el-form-item label="折扣率" prop="rate">
              <el-input-number
                  v-model="discountForm.rate"
                  :precision="2"
                  :step="0.1"
                  :min="0.01"
                  :max="1"
                  controls-position="right"
                  style="width: 100%"
              >
                <template #append>折</template>
              </el-input-number>
              <span class="tip-text">（示例：0.85表示85折）</span>
            </el-form-item>

            <!-- 生效时间 -->
            <el-form-item label="生效时间" prop="effectTime">
              <el-date-picker
                  v-model="discountForm.effectTime"
                  type="datetime"
                  placeholder="选择生效时间"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  style="width: 100%"
              />
            </el-form-item>

            <!-- 过期时间 -->
            <el-form-item label="过期时间" prop="expireTime">
              <el-date-picker
                  v-model="discountForm.expireTime"
                  type="datetime"
                  placeholder="选择过期时间"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  style="width: 100%"
              />
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
                返回详情
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
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { newDiscount } from '../../api/discount'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

// 扩展dayjs插件
dayjs.extend(utc)
dayjs.extend(timezone)
const route = useRoute()
const router = useRouter()

interface DiscountForm {
  productId: number
  rate: number
  effectTime: string
  expireTime: string
}

// 表单数据
const discountForm = ref<DiscountForm>({
  productId: Number(route.params.id),
  rate: 1,
  effectTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  expireTime: dayjs().add(7, 'day').format('YYYY-MM-DD HH:mm:ss')
})

// 表单验证规则
const rules: FormRules<DiscountForm> = {
  productId: [{ required: true, message: '商品ID不能为空', trigger: 'blur' }],
  rate: [
    { required: true, message: '请输入折扣率', trigger: 'blur' },
    {
      type: 'number',
      min: 0.01,
      max: 1,
      message: '折扣率应在0.01到1之间',
      trigger: ['blur', 'change']
    }
  ],
  effectTime: [
    {
      required: true,
      message: '请选择生效时间',
      trigger: 'change'
    },
    {
      validator: (_, value: string, callback) => {
        if (dayjs(value).isAfter(dayjs(discountForm.value.expireTime))) {
          callback(new Error('生效时间不能晚于过期时间'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  expireTime: [
    {
      required: true,
      message: '请选择过期时间',
      trigger: 'change'
    },
    {
      validator: (_, value: string, callback) => {
        if (dayjs(value).isBefore(dayjs(discountForm.value.effectTime))) {
          callback(new Error('过期时间不能早于生效时间'))
        } else {
          callback()
        }
      },
      trigger: 'change'
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

    const res = await newDiscount({
      ...discountForm.value,
      effectTime: dayjs(discountForm.value.effectTime)
          .utc()
          .format('YYYY-MM-DDTHH:mm:ss.SSS[+00:00]'),
      expireTime: dayjs(discountForm.value.expireTime)
          .utc()
          .format('YYYY-MM-DDTHH:mm:ss.SSS[+00:00]')
    })

    if (res.data.code === '200') {
      ElMessage.success('折扣创建成功！')
      router.push(`/products/${discountForm.value.productId}`)
    } else {
      ElMessage.error(res.data.msg || '创建失败')
    }
  } catch (error) {
    console.error('创建折扣失败:', error)
    if (error instanceof Error) {
      ElMessage.error(error.message)
    } else {
      ElMessage.error('创建失败，请重试')
    }
  } finally {
    submitting.value = false
  }
}

// 返回商品详情
const goBack = () => {
  router.go(-1)
}
</script>

<style scoped>
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
</style>