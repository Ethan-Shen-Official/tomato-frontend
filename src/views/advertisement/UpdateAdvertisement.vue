<template>
  <div class="update-page">
    <div class="update-container">
      <el-card class="form-card" v-loading="loading">
        <div v-if="currentAd">
          <h1>更新广告</h1>
          <el-form label-position="right" label-width="100px" size="large" class="update-form">
            <el-form-item label="广告ID">
              <el-input v-model="currentAd.id" disabled />
            </el-form-item>

            <el-form-item label="广告标题" required>
              <el-input v-model="currentAd.title" placeholder="请输入广告标题" />
            </el-form-item>

            <el-form-item label="广告内容" required>
              <el-input
                  v-model="currentAd.content"
                  placeholder="请输入广告内容"
                  type="textarea"
                  :rows="4"
              />
            </el-form-item>

            <el-form-item label="关联产品ID" required>
              <el-input
                  v-model="currentAd.productId"
                  placeholder="请输入关联产品ID"
                  disabled
              />
            </el-form-item>

            <el-form-item label="广告图片" required>
              <el-input
                  v-model="currentAd.imgUrl"
                  placeholder="请输入图片URL"
                  clearable
              />
              <div class="image-preview">
                <div class="preview-text">当前图片：</div>
                <el-image
                    :src="currentAd.imgUrl"
                    style="width: 200px; height: 200px; margin-top: 10px;"
                    fit="contain"
                />
              </div>
            </el-form-item>

            <span class="button-group">
              <el-button
                  type="primary"
                  @click="handleUpdate"
                  :disabled="!formValid"
              >
                提交更新
              </el-button>
              <el-button
                  type="danger"
                  @click="handleDelete"
              >
                删除广告
              </el-button>
              <el-button @click="goBack">返回</el-button>
            </span>
          </el-form>
        </div>
        <el-empty v-else description="广告不存在" />
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { getAd, updateAd, deleteAd } from '../../api/advertisement'

const route = useRoute()
const router = useRouter()

interface Ad {
  id: string
  title: string
  content: string
  imgUrl: string
  productId: string
}

// 广告数据
const ads = ref<Ad[]>([])
const currentAd = ref<Ad | null>(null)
const loading = ref(true)

// 从所有广告中匹配当前广告
const findCurrentAd = () => {
  const adId = route.params.id
  currentAd.value = ads.value.find(ad => ad.id === adId) || null
}

// 获取广告列表
const fetchAds = async () => {
  try {
    const res = await getAd()
    if (res.data.code === '200') {
      ads.value = res.data.data
      findCurrentAd()
    }
  } catch (error) {
    ElMessage.error('获取广告数据失败')
  } finally {
    loading.value = false
  }
}

// 表单验证
const formValid = computed(() => {
  return currentAd.value?.title?.trim() &&
      currentAd.value?.content?.trim() &&
      currentAd.value?.imgUrl?.trim()
})

// 更新广告
const handleUpdate = async () => {
  if (!currentAd.value) return

  try {
    const res = await updateAd({
      id: currentAd.value.id,
      title: currentAd.value.title,
      content: currentAd.value.content,
      imgUrl: currentAd.value.imgUrl,
      productId: currentAd.value.productId
    })

    if (res.data.code === '200') {
      ElMessage.success('广告更新成功')
      router.push('/all')
    }
  } catch (error) {
    ElMessage.error('更新失败')
  }
}

// 删除广告
const handleDelete = async () => {
  if (!currentAd.value) return

  try {
    await ElMessageBox.confirm(
        '确定要永久删除该广告吗？此操作不可恢复！',
        '警告',
        {
          confirmButtonText: '确认删除',
          cancelButtonText: '取消',
          type: 'warning',
        }
    )

    const res = await deleteAd(currentAd.value.id)
    if (res.data.code === '200') {
      ElMessage.success('广告删除成功')
      router.push('/all')
    }
  } catch (error) {
    if (error !== 'cancel') { // 忽略取消操作
      ElMessage.error('删除失败')
    }
  }
}

const goBack = () => {
  router.go(-1)
}

onMounted(() => {
  fetchAds()
})
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
</style>