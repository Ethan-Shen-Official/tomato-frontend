<script setup lang="ts">
import {ElForm, ElFormItem} from "element-plus"
import {ref, computed} from 'vue'
import {routes} from '../../router'
import {handlelogin, getUserInfo} from "../../api/user.ts"

const username = ref('')
const password = ref('')

// 用户名是否为空
const hasTelInput = computed(() => username.value != '')
// 密码是否为空
const hasPasswordInput = computed(() => password.value != '')

// 登录按钮可用性
const loginDisabled = computed(() => {
  return !(hasTelInput.value && hasPasswordInput.value)
})

// 登录按钮触发
function handleLogin() {
  handlelogin({
    username: username.value,
    password: password.value
  }).then(res => {
    if (res.data.code === '000') {
      ElMessage({
        message: "登录成功！",
        type: 'success',
        center: true,
      })
      const token = res.data.result
      sessionStorage.setItem('token', token)

      getUserInfo().then(res => {
        sessionStorage.setItem('name', res.data.result.name)
        sessionStorage.setItem('role', res.data.result.role)
        routes.push({path: "/dashboard"})
      })
    } else if (res.data.code === '400') {
      ElMessage({
        message: res.data.msg,
        type: 'error',
        center: true,
      })
      password.value = ''
    }
  })
}
</script>

<template>
  <el-main class="main">
    <el-card class="box-card">
      <div>
        <h1>登录</h1>
        <el-form>
          <el-form-item>
            <label for="username">用户名</label>
            <el-input id="tele" type="text" v-model="username"
                      required
                      placeholder="请输入手机号"/>
          </el-form-item>

          <el-form-item>
            <label for="password">账户密码</label>
            <el-input id="password" type="password" v-model="password"
                      required
                      placeholder="••••••••"/>
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
  </el-main>
</template>

<style scoped>
.main {
  width: 100%;
  height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.box-card {
  width: 60%;
  padding: 10px;
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
</style>