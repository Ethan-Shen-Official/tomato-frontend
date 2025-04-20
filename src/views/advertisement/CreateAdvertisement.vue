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
              <el-upload
                  v-model:file-list="imageFileList"
                  :limit="1"
                  :on-change="handleImageChange"
                  :on-exceed="handleExceed"
                  class="upload-demo"
                  list-type="picture"
                  :http-request="uploadHttpRequest"
                  drag>
                <el-icon class="el-icon--upload">
                  <upload-filled/>
                </el-icon>
                <div class="el-upload__text">
                  将图片拖到此处或<em>单击此处</em>上传。仅允许上传一份文件。
                </div>
              </el-upload>
            </el-form-item>

            <span class="button-group">
              <el-button
                  @click.prevent="handleCreateAd"
                  :disabled="createDisabled"
                  type="primary">
                创建广告
              </el-button>

              <router-link to="/all" v-slot="{navigate}">
                <el-button @click="navigate">
                  返回主页
                </el-button>
              </router-link>
            </span>
          </el-form>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { UploadFilled } from "@element-plus/icons-vue"
import { ElMessage } from 'element-plus'
import { newAd } from '../../api/ad' // 请确认路径是否正确
import { uploadimg } from "../../api/tool.ts";
import { useRoute } from 'vue-router'; // 从 vue-router 导入 useRoute
import {routes} from "../../router";

// 创建路由实例以访问查询参数
const route = useRoute();

// 广告数据
const adData = ref({
  title: '',
  content: '',
  imgUrl: 'https://example.com/ad2.jpg',
  productId: route.query.productId?.toString() || '' // 初始化时直接获取
})

// 图片上传相关
const imageFileList = ref([])

// 表单验证计算属性
const createDisabled = computed(() => {
  return !(
      adData.value.title.trim() &&
      adData.value.productId.trim() &&
      adData.value.imgUrl
  )
})

// 创建广告处理
const handleCreateAd = async () => {
  try {
    const response = await newAd(adData.value)
    if (response.data.code === '200') {
      ElMessage.success('广告创建成功！')
      resetForm()
      // 这里可以添加路由跳转逻辑
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

// 图片上传处理
const handleImageChange = (file: any) => {
  imageFileList.value = [file]
  const formData = new FormData()
  formData.append('file', file.raw)
  uploadimg(formData).then(res => {
    adData.value.imgUrl = res.data.result
  })
}

// 重置表单
const resetForm = () => {
  adData.value = {
    title: '',
    content: '',
    imgUrl: '',
    productId: ''
  }
  imageFileList.value = []
}

const handleExceed = () => {
  ElMessage.warning('仅可上传 1 个文件')
}

const uploadHttpRequest = () => {
  return new XMLHttpRequest()
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
  background-image: url('../../assets/background1.jpg');
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
</style>