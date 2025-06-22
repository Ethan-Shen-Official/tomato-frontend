<template>
  <div class="update-page">
    <div class="update-container">
      <el-card class="form-card">
        <div>
          <h1>编辑商品</h1>
          <el-form label-position="right" label-width="100px" size="large" class="update-form">
            <el-form-item label="商品名称" required>
              <el-input id="title" v-model="formData.title" required placeholder="请输入商品名"/>
            </el-form-item>

            <el-form-item label="商品价格" required>
              <el-input id="price" v-model="formData.price" required placeholder="请输入商品价格" type="number"/>
            </el-form-item>

            <el-form-item label="商品评分" required>
              <el-input
                  id="rate"
                  v-model.number="formData.rate"
                  required
                  placeholder="请输入评分（0-10）"
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
              />
            </el-form-item>

            <el-form-item label="商品描述">
              <el-input
                  id="description"
                  v-model="formData.description"
                  placeholder="商品描述"
                  type="textarea"
                  :rows="4"
              />
            </el-form-item>

            <el-form-item label="商品封面">
              <el-input
                  v-model="formData.cover"
                  placeholder="请输入图片URL"
                  clearable
              />
              <div class="image-preview">
                <div class="preview-text">当前封面：</div>
                <el-image
                    :src="formData.cover"
                    style="width: 200px; height: 200px; margin-top: 10px;"
                    fit="contain"
                />
                <div class="preview-link" v-if="formData.cover">
                  <a :href="formData.cover" target="_blank">查看原图</a>
                </div>
              </div>
            </el-form-item>

            <!-- 规格编辑部分 -->
            <el-form-item label="商品规格">
              <div class="specifications-container">
                <div v-for="(spec, index) in formData.specifications" :key="index" class="spec-item">
                  <el-input
                      v-model="spec.item"
                      placeholder="规格名称"
                      style="width: 200px; margin-right: 10px"
                  />
                  <el-input
                      v-model="spec.value"
                      placeholder="规格值"
                      style="width: 200px; margin-right: 10px"
                  />
                  <el-button
                      type="danger"
                      circle
                      :icon="Delete"
                      @click="removeSpec(index)"
                  />
                </div>
                <el-button type="primary" @click="addSpec" style="margin-top: 10px">
                  添加规格
                </el-button>
              </div>
            </el-form-item>

            <span class="button-group">
              <el-button
                  type="primary"
                  @click.prevent="handleUpdateProduct"
                  :disabled="updateDisabled"
                  :loading="submitting"
              >
                {{ submitting ? '提交中...' : '更新商品' }}
              </el-button>

              <el-button @click="$router.go(-1)">
                返回
              </el-button>
            </span>
          </el-form>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Delete } from '@element-plus/icons-vue'
import { getProductById, updateProduct } from '../../api/product'
import { ElMessage } from 'element-plus'
import type { UpdateInfo } from '../../api/product'

const route = useRoute()
const submitting = ref(false)

// 表单数据结构
const formData = ref<UpdateInfo>({
  id: '',
  title: '',
  price: 0,
  rate: 0,
  description: '',
  cover: '',
  specifications: []
})

// 初始化加载商品数据
onMounted(async () => {
  try {
    const productId = route.params.id as string
    const res = await getProductById(productId)

    if (res.data.code === '200') {
      const product = res.data.data
      formData.value = {
        id: product.id,
        title: product.title,
        price: product.price,
        rate: product.rate,
        description: product.description,
        cover: product.cover,
        specifications: product.specifications || []
      }
    }
  } catch (error) {
    ElMessage.error('获取商品信息失败')
  }
})

// 表单验证
const updateDisabled = computed(() => {
  return !(
      formData.value.title?.trim() &&
      formData.value.price !== undefined &&
      formData.value.rate !== undefined &&
      formData.value.rate >= 0 &&
      formData.value.rate <= 10
  )
})

// 处理规格操作
const addSpec = () => {
  formData.value.specifications?.push({ item: '', value: '' })
}

const removeSpec = (index: number) => {
  formData.value.specifications?.splice(index, 1)
}

// 提交更新
const handleUpdateProduct = async () => {
  submitting.value = true

  try {
    // 清理空规格
    const validSpecs = formData.value.specifications?.filter(
        spec => spec.item.trim() && spec.value.trim()
    )

    const updateInfo: UpdateInfo = {
      ...formData.value,
      specifications: validSpecs
    }

    const res = await updateProduct(updateInfo)

    if (res.data.code === '200') {
      ElMessage.success('商品更新成功')
      setTimeout(() => {
        window.location.href = `/products/${formData.value.id}`
      }, 1500)
    } else {
      ElMessage.error(res.data.msg || '更新失败')
    }
  } catch (error) {
    ElMessage.error('请求失败，请检查网络')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.update-page {
  margin: 0;
  padding: 0;
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  overflow: auto;
  background-image: url('../../assets/OIP-C.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: scroll;
}

.update-container {
  width: 100%;
  height: 100vh;

  display: flex;
  align-items: center;
  justify-content: center;
}

.form-card {
  width: 70%;
  max-width: 900px;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  margin-top: 300px;
}

.button-group {
  padding-top: 10px;
  display: flex;
  flex-direction: row;
  gap: 30px;
  align-items: center;
  justify-content: right;
}

.specifications-container {
  border: 1px solid #ebeef5;
  padding: 15px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.spec-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.image-preview {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.preview-text {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.preview-link {
  margin-top: 5px;
}

.preview-link a {
  color: #409eff;
  text-decoration: none;
  font-size: 12px;
}

/* 表单元素样式 */
.update-form :deep(.el-form-item__label) {
  color: #333;
  font-weight: 500;
}

.update-form :deep(.el-input__inner) {
  background-color: rgba(255, 255, 255, 0.8);
}

.update-form :deep(.el-textarea__inner) {
  background-color: rgba(255, 255, 255, 0.8);
  min-height: 80px;
}
</style>