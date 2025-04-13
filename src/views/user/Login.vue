<script setup lang="ts">
import {ElForm, ElFormItem} from "element-plus"
import {ref, computed} from 'vue'
import {routes} from '../../router'
import {handlelogin, getUserInfo} from "../../api/user.ts"

const username = ref('')
const password = ref('')

const hasUsernameInput = computed(() => username.value != '')

const hasPasswordInput = computed(() => password.value != '')

const loginDisabled = computed(() => {
  return !(hasUsernameInput.value && hasPasswordInput.value)
})


function handleLogin() {
  handlelogin({
    username: username.value,
    password: password.value
  }).then(async res => {
    if (res.data.code === '200') {
      ElMessage({
        message: "登录成功！",
        type: 'success',
        center: true,
      })
      const token = res.data.data
      sessionStorage.setItem('token', token)
      sessionStorage.setItem('username', username.value)
      const userRes = await getUserInfo(username.value)
      sessionStorage.setItem('role', userRes.data.data.role)
      routes.push({path: "/dashboard"})
    } else if (res.data.code === '400') {
      ElMessage({
        message: res.data.msg,
        type: 'error',
        center: true,
      })
      password.value = ''
    }
  })
  .catch(() => {
    ElMessage({
      message: "登录失败，请稍后再试",
      type: 'error',
      center: true,
    })
  })
  
}

</script>

<template>
  <div class="login-page">
    <div class="login-container">
      <el-card class="box-card">
        <div>
          <h1>登录</h1>
          <el-form>
            <el-form-item>
              <label for="username">用户名</label>
              <el-input id="tele" type="text" v-model="username"
                        required
                        placeholder="请输入用户名"/>
            </el-form-item>

            <el-form-item>
              <label for="password">账户密码</label>
              <el-input id="password" type="password" v-model="password"
                        required
                        placeholder="•••••••••••••"/>
            </el-form-item>

            <span class="button-group">
              <el-button @click.prevent="handleLogin" :disabled="loginDisabled"
                         type="primary">登入</el-button>
              <router-link to="/register" v-slot="{navigate}">
                <el-button @click="navigate">去注册</el-button>
              </router-link>
            </span>
          </el-form>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  margin: 0;
  padding: 0;
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  overflow: auto;
}

.login-container {
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
  width: 400px;
  max-width: 80%;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
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
  justify-content: flex-end;
}

/* 添加响应式调整 */
@media (max-width: 768px) {
  .box-card {
    width: 90%;
    padding: 15px;
  }
}
</style>