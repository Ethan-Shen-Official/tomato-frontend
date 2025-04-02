<script setup lang="ts">
import {ref,computed} from "vue";
import {newUser} from "../../api/user.ts";
import {routes} from '../../router'

const username = ref('')
const name = ref('')
const role = ref('')
const tele = ref('')
const location = ref('')
const password = ref('')
const confirmPassword = ref('')
const email = ref('')
const avatar = ref('')

// 电话号码是否为空
const hasTelInput = computed(() => tele.value != '')
// 密码是否为空
const hasPasswordInput = computed(() => password.value != '')
// 重复密码是否为空
const hasConfirmPasswordInput = computed(() => confirmPassword.value != '')
// 身份是否为空
const hasIdentityChosen = computed(() => role.value != '')
// 邮箱是否为空
const hasEmail = computed(() => email.value != '')
// 用户名是否为空
const hasUsernameInput = computed(() => username.value != '')
// 真实姓名是否为空
const hasNameInput = computed(() => name.value != '')




// 电话号码格式为1开头的11位数字
const teleNumberRegex = /^1\d{10}$/;
const telLegal = computed(() => teleNumberRegex.test(tele.value))
// 重复密码的规则
const isPasswordIdentical = computed(() => password.value == confirmPassword.value)
// 邮箱格式为XXXXXX@XXXX.com
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const emailLegal = computed(() => emailRegex.test(email.value))

const registerDisabled = computed(() => {
  return !(hasUsernameInput.value && hasNameInput.value && hasIdentityChosen.value && hasPasswordInput.value && hasConfirmPasswordInput.value && isPasswordIdentical.value && (!hasEmail.value || emailLegal.value) && (!hasTelInput.value || telLegal.value))
})


// 处理文件上传
function beforeUpload(file: any) {
  const isImage = file.type.startsWith('image/');
  const isLt2M = file.size / 1024 / 1024 < 2; // 限制文件大小为2MB

  if (!isImage) {
    alert('只能上传图片文件！');
  }
  if (!isLt2M) {
    alert('上传头像图片大小不能超过 2MB!');
  }
  return isImage && isLt2M;
}

function handleUploadChange(file: any) {
  avatar.value = URL.createObjectURL(file.raw); // 创建预览
}

function handleHttpRequest() {
  return new XMLHttpRequest();
}

// 注册按钮触发
function handleRegister() {
  try {
  newUser({
    role: role.value,
    name: name.value,
    telephone: tele.value,
    password: password.value,
    location: location.value,
    username: username.value,
    email: email.value,
    avatar: '',
  }).then(res => {
    if (res.data.code === '200') {  
      ElMessage({
        message: "注册成功！请登录账号",
        type: 'success',
        center: true,
      })
      routes.push({path: "/login"})
    } else if (res.data.code === '400') {
      ElMessage({
        message: res.data.msg,
        type: 'error',
        center: true,
      })
    }
  })
} catch (error) {
    ElMessage({
      message: "出现网络问题！",
      type: 'error',
      center: true,
    })
  }
}
</script>

<template>
  <div class="register-page">
    <div class="register-container">
      <el-card class="box-card">
        <div>
          <h1>注册</h1>
          
          <el-form>
            <el-row>
              <el-col :span="7">
                <el-form-item>
                  <label for="username">用户名（必填）</label>
                  <el-input id="username" v-model="username" placeholder="请输入用户名"/>
                </el-form-item>
              </el-col>

              <el-col :span="1"></el-col>

              <el-col :span="7">
                <el-form-item>
                  <label for="name">真实姓名（必填）</label>
                  <el-input id="name" v-model="name" placeholder="请输入真实姓名"/>
                </el-form-item>
              </el-col>

              <el-col :span="1"></el-col>

              <el-col :span="8">
                <el-form-item>
                  <label for="role">身份（必选）</label>
                  <el-select id="role" v-model="role" placeholder="请选择身份" style="width: 100%">
                    <el-option value='USER' label="用户"/>
                    <el-option value='ADMIN' label="管理员"/>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 第二行 -->
            <el-row>
              <el-col :span="15">
                <el-form-item>
                  <label v-if="!hasEmail" for="email">邮箱</label>
                  <label v-else-if="!emailLegal" for="email" class="error">邮箱不合法</label>
                  <label v-else for="email">邮箱</label>
                  <el-input id="email" v-model="email" :class="{'error-input' :(hasEmail && !emailLegal)}" placeholder="请输入邮箱" />
                </el-form-item>
              </el-col>
              <el-col :span="1"></el-col>
              <el-col :span="8">
                <el-form-item label="头像上传">
                  <el-upload
                      class="avatar-uploader"
                      action="#"
                      :show-file-list="false"
                      accept="image/*"
                      :before-upload="beforeUpload"
                      :http-request="handleHttpRequest"
                      @change="handleUploadChange"
                  >
                    <img v-if="avatar" :src="avatar" alt="Avatar Preview" class="avatar-preview" />
                    <el-button v-if="!avatar">选择头像</el-button>
                  </el-upload>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="8">
                <el-form-item>
                  <label v-if="!hasTelInput" for="tele">手机号</label>
                  <label v-else-if="!telLegal" for="tele" class="error">手机号不合法</label>
                  <label v-else for="tele">手机号</label>
                  <el-input id="tele" v-model="tele" :class="{'error-input' :(hasTelInput && !telLegal)}" placeholder="请输入手机号"/>
                </el-form-item>
              </el-col>

              <el-col :span="1"></el-col>

              <el-col :span="15">
                <el-form-item>
                  <label for="location">地址</label>
                  <el-input id="location" v-model="location" placeholder="请输入地址"/>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item>
              <label for="password">密码（必填）</label>
              <el-input type="password" id="password" v-model="password" placeholder="••••••••"/>
            </el-form-item>

            <el-form-item>
              <label v-if="!hasConfirmPasswordInput">确认密码（必填）</label>
              <label v-else-if="!isPasswordIdentical" class="error">密码不一致</label>
              <label v-else>确认密码（必填）</label>
              <el-input type="password" id="confirm-password" v-model="confirmPassword" :class="{'error-input' :(hasConfirmPasswordInput && !isPasswordIdentical)}" placeholder="••••••••"/>
            </el-form-item>

            <span class="button-group">
              <el-button @click.prevent="handleRegister"
                        :disabled="registerDisabled"
                        type="primary">
                创建账户
              </el-button>

              <router-link to="/login" v-slot="{navigate}">
                <el-button @click="navigate">
                  去登录
                </el-button>
              </router-link>
            </span>
          </el-form>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.register-page {
  margin: 0;
  padding: 0;
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  overflow: auto;
}

.register-container {
  width: 100%;
  height: 100%;
  background-image: url('../../assets/background.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
}

.box-card {
  width: 70%;
  max-width: 900px;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
}

.avatar-uploader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  border: 1px dashed #d9d9d9;
  border-radius: 50%;
  cursor: pointer;
}

.avatar-preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin-top: 10px;
}

.error {
  color: red;
}

.error-input {
  --el-input-focus-border-color: red;
}

.button-group {
  padding-top: 10px;
  display: flex;
  flex-direction: row;
  gap: 30px;
  align-items: center;
  justify-content: right;
}

/* 添加响应式调整 */
@media (max-width: 768px) {
  .box-card {
    width: 90%;
    padding: 15px;
  }
}
</style>