<template>
  <div class="create-page">
    <div class="create-container">
      <el-card class="form-card">
        <div>
          <h1>创建商品</h1>
          <el-form label-position="right" label-width="100px" size="large" class="create-form">
            <el-form-item label="商品名称" required>
              <el-input id="title" v-model="title" required placeholder="请输入商品名"/>
            </el-form-item>

            <el-form-item label="商品价格" required>
              <el-input id="price" v-model="price" required placeholder="请输入商品价格" type="number"/>
            </el-form-item>

            <el-form-item label="商品评分" required>
              <el-input id="rate" v-model.number="rate" required placeholder="请输入评分（0-5）" type="number" step="0.1" min="0" max="5"/>
            </el-form-item>

            <el-form-item label="商品描述">
              <el-input id="description" v-model="description" placeholder="商品描述" type="textarea"/>
            </el-form-item>

            <el-form-item label="商品封面">
              <el-input
                  v-model="image"
                  placeholder="请输入图片URL"
                  clearable
              />
              <div class="image-preview" v-if="image">
                <el-image
                    :src="image"
                    fit="contain"
                    style="width: 200px; height: 200px; margin-top: 10px;"
                />
                <div class="preview-text">图片预览</div>
              </div>
            </el-form-item>

            <!-- 添加规格部分 -->
            <el-form-item label="商品规格">
              <div class="specifications-container">
                <div v-for="(spec, index) in specifications" :key="index" class="spec-item">
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
              <el-button @click.prevent="handleCreateProduct()" :disabled="createDisabled"
                         type="primary">
                创建商品
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
import {computed, ref} from 'vue'
import {Delete} from '@element-plus/icons-vue'
import {addProduct, updateStockpile} from "../../api/product.ts";
import routes from "../../router";

// 规格相关
const specifications = ref<Array<{ item: string; value: string }>>([])

// 添加规格方法
const addSpec = () => {
  specifications.value.push({item: '', value: ''})
}

// 删除规格方法
const removeSpec = (index: number) => {
  specifications.value.splice(index, 1)
}

// 输入框值
const title = ref('')
const price = ref('')
const rate = ref(0)
const description = ref('')
const image = ref('')

const hasTitleInput = computed(() => title.value !== '')
const hasPriceInput = computed(() => price.value !== '')
const hasRateInput = computed(() => rate.value >= 0 && rate.value <= 10)
const createDisabled = computed(() => {
  return !(hasTitleInput.value && hasPriceInput.value && hasRateInput.value)
})

// 创建商品按钮触发
function handleCreateProduct() {
  const newProduct = {
    title: title.value,
    price: Number(price.value),
    rate: rate.value,
    description: description.value,
    cover: image.value,
    specifications: specifications.value,
  };

  addProduct(newProduct).then(res => {
    if (res.data.code === '200') {
      const newAmmount = {
        id: res.data.data.id,
        amount: 1,
      };
      updateStockpile(newAmmount);
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
      specifications.value.splice(0)
      routes.push({path: "/all"})
    } else if (res.data.code === '400') {
      ElMessage({
        message: res.data.msg,
        type: 'error',
        center: true,
      })
    }
  })
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
  background-color: rgba(255, 255, 255, 0.95);
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

.specifications-container {
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