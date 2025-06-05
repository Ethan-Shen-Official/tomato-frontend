<template>
  <el-header class="custom-header" height="60">
    <div class="header-container">
      <!-- 商城标题 -->
      <div class="header-left">
        <router-link to="/home" class="no-link">
          <h1 class="header-text">TomaTo 书城</h1>
        </router-link>
      </div>

      <!-- 右侧菜单 -->
      <div class="header-right">
        <!-- 盲盒图标 -->
        <router-link to="/blindbox" class="header-icon-link" v-if="username">
          <div class="icon-container">
            <el-icon :size="24" color="#333333"><Box /></el-icon>
          </div>
          <span class="icon-text">盲盒</span>
        </router-link>

        <!-- 抽奖图标 -->
        <router-link to="/lottery" class="header-icon-link" v-if="username">
          <div class="icon-container">
            <el-icon :size="24" color="#333333"><Present /></el-icon>
          </div>
          <span class="icon-text">抽奖</span>
        </router-link>

        <!-- 订单图标 -->
        <router-link to="/order" class="header-icon-link" v-if="role === 'user'">
          <div class="icon-container">
            <el-icon :size="24" color="#333333"><Tickets /></el-icon>
          </div>
          <span class="icon-text">订单</span>
        </router-link>

        <!-- 购物车图标 -->
        <router-link to="/cart" class="header-icon-link" v-if="role === 'user'">
          <div class="icon-container">
            <el-badge :value="cartCount" :max="99" class="cart-badge" v-if="cartCount > 0">
              <el-icon :size="24" color="#333333"><ShoppingCart /></el-icon>
            </el-badge>
            <el-icon v-else :size="24" color="#333333"><ShoppingCart /></el-icon>
          </div>
          <span class="icon-text">购物车</span>
        </router-link>

        <!-- 用户图标/头像 -->
        <router-link to="/dashboard" class="header-icon-link">
          <div class="icon-container" :class="{ 'avatar-container': avatar_url }">
            <img v-if="avatar_url" :src="avatar_url" alt="用户头像" class="user-avatar">
            <el-icon v-else :size="24" color="#333333"><User /></el-icon>
          </div>
          <span class="icon-text">{{ username }}</span>
        </router-link>
        
        <!-- 退出图标 -->
        <div class="header-icon-link" @click="handleLogout">
          <div class="icon-container">
            <el-icon :size="24" color="#333333"><SwitchButton /></el-icon>
          </div>
          <span class="icon-text">退出</span>
        </div>
      </div>
    </div>
  </el-header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getUserInfo } from '../api/user'
import { ShoppingCart, User, SwitchButton, Tickets, Present, Box } from '@element-plus/icons-vue'
import { isLogin } from '../utils'
import { getCartItems } from '../api/cart'
//import { routes } from '../router'

// 用户信息
const avatar_url = ref('')
const username = sessionStorage.getItem('username')
const role = sessionStorage.getItem('role')

// 购物车商品数量
const cartCount = ref(0)

// 处理登出
const handleLogout = () => {
  // 清除token
  sessionStorage.removeItem('token')
  sessionStorage.removeItem('username')
  sessionStorage.removeItem('role')
  //刷新页面
  window.location.reload()
}

// 在组件挂载后获取用户信息
onMounted (() => {
  if (isLogin()) {
    getCartItems().then((res) => {
      if (res.data.code === '200') {
        cartCount.value = res.data.data.total
      } else {
        ElMessage.error(res.data.msg)
      }
    }).catch((error) => {
      console.error('获取购物车商品数量失败', error)
    })

    getUserInfo(username||'').then((res) => {
      if (res.data.code === '200') {
        avatar_url.value = res.data.data.avatar
      } else {
        ElMessage.error('获取用户信息失败')
      }
    }).catch((error) => {
      console.error('获取用户信息失败', error)
    })
  }
})

</script>

<style scoped>
.custom-header {
  background-color:#F2F3F4;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 0;
  width: 100%; /* 提示浏览器该属性会变化 */
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-text {
  color: #F53636;
  font-size: 3rem;
  font-weight: 600;
  margin: 0;
}

.no-link {
  text-decoration: none;
}

.icon-container {
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 5px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

/* 头像特殊样式，在有头像时应用 */
.avatar-container {
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.user-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.header-icon-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #333333;
  padding: 5px 8px;
  border-radius: 8px;
  transition: background-color 0.2s;
  cursor: pointer;
}

.header-icon-link:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.icon-text {
  color: #333333;
  margin-left: 5px;
  font-size: 1rem;
}

.user-link {
  display: flex;
  align-items: center;
}

:deep(.el-badge__content.is-fixed) {
  top: 8px;
  right: 8px;
}

@media (max-width: 768px) {
  .header-container {
    padding: 0 10px;
  }
  
  .icon-text, .user-name {
    display: none;
  }
  
  .header-right {
    gap: 10px;
  }
}
</style>