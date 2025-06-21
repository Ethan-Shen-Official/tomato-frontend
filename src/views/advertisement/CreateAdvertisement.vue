<template>
  <div class="create-page">
    <div class="create-container">
      <el-card class="form-card">
        <div>
          <h1>创建广告</h1>
          <el-form label-position="right" label-width="100px" size="large" class="create-form">
            <el-form-item label="广告标题">
              <el-input id="title" v-model="adData.title" required placeholder="请输入广告标题"/>
            </el-form-item>

            <el-form-item label="广告内容">
              <el-input
                  id="content"
                  v-model="adData.content"
                  placeholder="请输入广告内容"
                  type="textarea"
                  :rows="4"
              />
            </el-form-item>

            <el-form-item label="关联产品ID">
              <el-input
                  id="productId"
                  v-model="adData.productId"
                  required
                  placeholder="请输入关联产品ID"
                  type="text"
                  disabled
              />
            </el-form-item>

            <el-form-item label="广告图片">
              <el-input
                  v-model="adData.imgUrl"
                  placeholder="请输入图片URL"
                  clearable
              />
              <div class="image-preview" v-if="adData.imgUrl">
                <el-image
                    :src="adData.imgUrl"
                    fit="contain"
                    style="width: 200px; height: 200px; margin-top: 10px;"
                />
                <div class="preview-text">图片预览</div>
              </div>
            </el-form-item>

            <span class="button-group">
              <el-button
                  @click.prevent="handleCreateAd"
                  :disabled="createDisabled"
                  type="primary">
                创建广告
              </el-button>

              <el-button @click="goBack">返回</el-button>
            </span>
          </el-form>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { newAd } from '../../api/advertisement.ts'
import { useRoute } from 'vue-router'
import routes from "../../router";

// 创建路由实例以访问查询参数
const route = useRoute();

// 广告数据
const adData = ref({
  title: '',
  content: '',
  imgUrl: '',
  productId: route.query.productId?.toString() || '' // 初始化时直接获取
})

// 表单验证计算属性
const createDisabled = computed(() => {
  return !(
      adData.value.title.trim() &&
      adData.value.productId.trim() &&
      adData.value.imgUrl.trim()
  )
})

const goBack = () => {
  routes.go(-1)
}

// 创建广告处理
const handleCreateAd = async () => {
  try {
    const response = await newAd(adData.value)
    if (response.data.code === '200') {
      ElMessage.success('广告创建成功！')
      resetForm()
      routes.push({
        path: '/all',
      })
    } else {
      ElMessage.error(response.data.msg || '创建广告失败')
    }
  } catch (error) {
    ElMessage.error('请求失败，请检查网络连接')
  }
}

// 重置表单
const resetForm = () => {
  adData.value = {
    title: '',
    content: '',
    imgUrl: '',
    productId: route.query.productId?.toString() || ''
  }
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
  width: 70%;
  max-width: 900px;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.75);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
}

.button-group {
  padding-top: 10px;
  display: flex;
  flex-direction: row;
  gap: 30px;
  align-items: center;
  justify-content: right;
}

.image-preview {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.preview-text {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}
</style>