<template>
  <div class="create-product">
    <div class="page-header">
      <h1>创建商品</h1>
      <el-card class="form-card">
        <el-form label-position="right" label-width="100px" size="large" class="create-form">
          <el-form-item label="商品名称">
            <el-input id="title" v-model="title" required placeholder="请输入商品名"/>
          </el-form-item>

          <el-form-item label="商品价格">
            <el-input id="price" v-model="price" required placeholder="请输入商品价格" type="number"/>
          </el-form-item>

          <el-form-item label="商品评分">
            <el-input id="rate" v-model.number="rate" required placeholder="请输入评分（0-10）" type="number" step="0.1" min="0" max="10"/>
          </el-form-item>

          <el-form-item label="商品描述">
            <el-input id="description" v-model="description" placeholder="商品描述" type="textarea"/>
          </el-form-item>

          <el-form-item label="商品封面">
            <el-upload
                v-model:file-list="imageFileList"
                :limit="1"
                :on-change="handleChange"
                :on-exceed="handleExceed"
                class="upload-demo"
                list-type="picture"
                :http-request="uploadHttpRequest"
                drag>
              <el-icon class="el-icon--upload">
                <upload-filled/>
              </el-icon>
              <div class="el-upload__text">
                将文件拖到此处或<em>单击此处</em>上传。仅允许上传一份文件。
              </div>
            </el-upload>
          </el-form-item>

          <el-form-item>
            <el-button @click.prevent="handleCreateProduct()" :disabled="createDisabled"
                       type="primary">
              创建商品
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue'
import {routes} from '../../router'
import {UploadFilled} from "@element-plus/icons-vue"

// 输入框值
const title = ref('')
const price = ref('')
const rate = ref(0)
const description = ref('')
const imageFileList = ref([])
const image = ref('')

const hasTitleInput = computed(() => title.value !== '')
const hasPriceInput = computed(() => price.value !== '')
const hasRateInput = computed(() => rate.value >= 0 && rate.value <= 10)
const hasImageFile = computed(() => image.value !== '')
const createDisabled = computed(() => {
  return !(hasTitleInput.value && hasPriceInput.value && hasRateInput.value && hasImageFile.value)
})

// 创建商品按钮触发
function handleCreateProduct() {
  const newProduct = {
    title: title.value,
    price: price.value,
    rate: rate.value,
    description: description.value,
    cover: image.value
  };
  createProduct(newProduct).then(res => {
    if (res.data.code === '000') {
      ElMessage({
        message: '创建商品成功！',
        type: 'success',
        center: true,
      })
      title.value = ''
      price.value = ''
      rate.value = 0
      description.value = ''
      image.value = ''
      imageFileList.value.splice(0)
    } else if (res.data.code === '400') {
      ElMessage({
        message: res.data.msg,
        type: 'error',
        center: true,
      })
    }
  })
}

function handleChange(file: any, fileList: any) {
  imageFileList.value = fileList
  let formData = new FormData()
  formData.append('file', file.raw)
  uploadImage(formData).then(res => {
    image.value = res.data.result
  })
}

function handleExceed() {
  ElMessage.warning(`仅可上传 1 个文件`);
}

function uploadHttpRequest() {
  return new XMLHttpRequest()
}

function toBackPage() {
  router.push("/dashboard")
}
</script>

<style scoped>

</style>