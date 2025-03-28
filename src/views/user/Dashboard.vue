<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getUserInfo, updateInfo } from '../../api/user.ts';
import { ElMessage } from 'element-plus';
import { routes } from '../../router';
import { parseRole } from '../../utils';

// 登录状态
const isLoggedIn = ref(false);

// 用户信息
const username = ref('');
const name = ref('');
const role = ref('');
const tele = ref('');
const location = ref('');
const email = ref('');
const avatar_url = ref('');

// 控制右侧显示内容
const activePanel = ref('profile'); // 'profile', 'updateInfo', 'changePassword'

// 更新信息表单
const updateForm = ref({
  username: '',
  name: '',
  tele: '',
  email: '',
  location: '',
  avatar_url: ''
});

// 更改密码表单
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// 密码确认校验
const passwordsMatch = ref(true);

// 前往登录页面
const ToLogin = () => {
  routes.push('/login');
};

// 加载用户信息
onMounted(async () => {
  try {
    // 检查用户是否登录
    const storedUsername = sessionStorage.getItem('username');
    const token = sessionStorage.getItem('token');
    
    if (isLoggedIn.value = true) {
      // 可以在这里加载真实用户数据
      // 这里使用模拟数据
      username.value = "admin";
      name.value = '张三';
      role.value = 'admin';
      tele.value = '13800138000';
      location.value = '南京市栖霞区仙林大道163号';
      email.value = 'zhangsan@example.com';
      avatar_url.value = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png';
      
      // 初始化更新表单
      updateForm.value = {
        username: username.value,
        name: name.value,
        tele: tele.value,
        email: email.value,
        location: location.value,
        avatar_url: avatar_url.value
      };
    }
  } catch (error) {
    console.error('获取用户信息失败', error);
    ElMessage.error('获取用户信息失败');
  }
});

const handleUpdateInfo = async () => {
  try {
    const response = await updateInfo({
      username: username.value,
      name: updateForm.value.name,
      tele: updateForm.value.tele,
      email: updateForm.value.email,
      location: updateForm.value.location,
      avatar_url: updateForm.value.avatar_url,
    });

    if (response.data && response.data.code === '200') {
      ElMessage.success('信息更新成功');
      
      // 更新显示的用户信息
      name.value = updateForm.value.name;
      tele.value = updateForm.value.tele;
      email.value = updateForm.value.email;
      location.value = updateForm.value.location;
      avatar_url.value = updateForm.value.avatar_url;
      
      activePanel.value = 'profile'; // 返回个人资料页
    } else {
      ElMessage.error(response.data.msg || '更新失败');
    }
  } catch (error) {
    console.error('更新用户信息失败', error);
    ElMessage.error('更新用户信息失败');
  }
};

const handleChangePassword = async () => {
  // 校验两次输入的密码是否一致
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordsMatch.value = false;
    return;
  }
  
  passwordsMatch.value = true;
  
  try {
    const response = await updateInfo({
      username: username.value,
      password: passwordForm.value.newPassword
    });

    if (response.data && response.data.code === '200') {
      ElMessage.success('密码修改成功');
      // 清空密码表单
      passwordForm.value.oldPassword = '';
      passwordForm.value.newPassword = '';
      passwordForm.value.confirmPassword = '';
      activePanel.value = 'profile'; // 返回个人资料页
    } else {
      ElMessage.error(response.data.msg || '密码修改失败');
    }
  } catch (error) {
    console.error('修改密码失败', error);
    ElMessage.error('修改密码失败');
  }
};

const formatRole = (role: string) => {
  return parseRole(role);
};
</script>

<template>
  <div class="dashboard-container">
    <!-- 左侧用户信息卡片 -->
    <div class="sidecard">
      <!-- 已登录状态 -->
      <template v-if="isLoggedIn">
        <div class="user-profile">
          <div class="avatar-container">
            <img :src="avatar_url" alt="用户头像" class="user-avatar">
          </div>
          <h2>{{ name }}</h2>
          <div class="user-info">
            <p><strong>用户名:</strong> {{ username }}</p>
            <p><strong>角色:</strong> {{ formatRole(role) }}</p>
            <p v-if="email"><strong>邮箱:</strong> {{ email }}</p>
            <p v-if="tele"><strong>电话:</strong> {{ tele }}</p>
            <p v-if="location"><strong>地址:</strong> {{ location }}</p>
          </div>
        </div>
        
        <div class="action-buttons">
          <el-row>
            <el-button 
              type="primary" 
              @click="activePanel = 'updateInfo'"
              :class="{ active: activePanel === 'updateInfo' }">
              更新信息
            </el-button>
          </el-row>
          <el-row>
            <el-button 
              type="warning" 
              @click="activePanel = 'changePassword'"
              :class="{ active: activePanel === 'changePassword' }">
              更改密码
            </el-button>
          </el-row>
        </div>
      </template>
      
      <!-- 未登录状态 -->
      <template v-else>
        <div class="not-logged-in">
          <el-icon class="login-icon"><UserFilled /></el-icon>
          <h2>未登录</h2>
          <p>请登录后查看个人信息</p>
          <el-button type="primary" @click="ToLogin" class="login-button">
            前往登录
          </el-button>
        </div>
      </template>
    </div>
    
    <!-- 右侧内容区域 -->
    <div class="content-area">
      <!-- 未登录状态提示 -->
      <div v-if="!isLoggedIn" class="welcome-panel">
        <h1>欢迎来到TomaTo书城</h1>
        <p>登录后可以享受更多功能和个性化服务</p>
        
        <div class="login-benefits">
          <el-card class="box-card">
            <template #header>
              <div class="card-header">
                <span>会员特权</span>
              </div>
            </template>
            <div class="text item">
              <ul>
                <li>收藏喜欢的图书</li>
                <li>享受会员折扣价</li>
                <li>查看购买历史</li>
                <li>获取专属推荐</li>
              </ul>
            </div>
          </el-card>
          
          <el-card class="box-card">
            <template #header>
              <div class="card-header">
                <span>快速登录</span>
              </div>
            </template>
            <div class="text item">
              点击下方按钮快速前往登录页面，如果没有账号，可以选择注册新账户。
            </div>
            <div class="button-area">
              <el-button type="primary" @click="ToLogin">
                立即登录
              </el-button>
              <el-button @click="routes.push('/register')">
                注册账户
              </el-button>
            </div>
          </el-card>
        </div>
      </div>
      
      <!-- 以下内容只在已登录状态显示 -->
      <template v-else>
        <!-- 默认页面 - 欢迎信息 -->
        <div v-if="activePanel === 'profile'" class="welcome-panel">
          <h1>欢迎回来，{{ name }}！</h1>
          <p>您可以在左侧选择操作来更新您的个人信息或更改密码。</p>
          
          <div class="feature-cards">
            <el-card class="box-card">
              <template #header>
                <div class="card-header">
                  <span>账户安全</span>
                </div>
              </template>
              <div class="text item">
                定期更改您的密码可以提高账户安全性。
              </div>
              <div class="button-area">
                <el-button type="primary" plain @click="activePanel = 'changePassword'">
                  更改密码
                </el-button>
              </div>
            </el-card>
            
            <el-card class="box-card">
              <template #header>
                <div class="card-header">
                  <span>个人资料</span>
                </div>
              </template>
              <div class="text item">
                保持您的个人信息更新，以获得更好的服务体验。
              </div>
              <div class="button-area">
                <el-button type="primary" plain @click="activePanel = 'updateInfo'">
                  更新信息
                </el-button>
              </div>
            </el-card>
          </div>
        </div>
        
        <!-- 更新信息表单 -->
        <div v-if="activePanel === 'updateInfo'" class="form-panel">
          <h2>更新个人信息</h2>
          <el-form label-position="top">
            <el-form-item label="用户名">
              <el-input v-model="username" disabled />
              <div class="form-tip">用户名不可更改</div>
            </el-form-item>
            
            <el-form-item label="姓名">
              <el-input v-model="updateForm.name" placeholder="请输入您的真实姓名" />
            </el-form-item>
            
            <el-form-item label="电话号码">
              <el-input v-model="updateForm.tele" placeholder="请输入您的电话号码" />
            </el-form-item>
            
            <el-form-item label="邮箱">
              <el-input v-model="updateForm.email" placeholder="请输入您的邮箱地址" />
            </el-form-item>
            
            <el-form-item label="地址">
              <el-input v-model="updateForm.location" placeholder="请输入您的地址" />
            </el-form-item>
            
            <el-form-item label="头像URL">
              <el-input v-model="updateForm.avatar_url" placeholder="请输入头像图片URL" />
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="handleUpdateInfo">保存更改</el-button>
              <el-button @click="activePanel = 'profile'">取消</el-button>
            </el-form-item>
          </el-form>
        </div>
        
        <!-- 更改密码表单 -->
        <div v-if="activePanel === 'changePassword'" class="form-panel">
          <h2>更改密码</h2>
          <el-form label-position="top">
            <el-form-item label="当前密码">
              <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入当前密码" show-password />
            </el-form-item>
            
            <el-form-item label="新密码">
              <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" show-password />
            </el-form-item>
            
            <el-form-item label="确认新密码" :error="!passwordsMatch ? '两次输入的密码不一致' : ''">
              <el-input 
                v-model="passwordForm.confirmPassword" 
                type="password" 
                placeholder="请再次输入新密码" 
                show-password
                @input="passwordsMatch = passwordForm.newPassword === passwordForm.confirmPassword" />
            </el-form-item>
            
            <el-form-item>
              <el-button 
                type="primary" 
                @click="handleChangePassword"
                :disabled="!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword">
                保存更改
              </el-button>
              <el-button @click="activePanel = 'profile'">取消</el-button>
            </el-form-item>
          </el-form>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  display: flex;
  height: calc(95vh - 60px);
  margin-top: 60px;
  background-color: #f5f7fa;
}

.sidecard {
  width: 300px;
  background-color: white;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.user-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}

.avatar-container {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 15px;
}

.user-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-profile h2 {
  margin: 10px 0;
  font-size: 1.5rem;
  color: #303133;
}

.user-info {
  width: 100%;
}

.user-info p {
  margin: 8px 0;
  color: #606266;
  word-break: break-word;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 20px;
  align-items: center; 
  width: 100%;
}

.action-buttons .el-button {
  width: 80%; 
  max-width: 200px;
}

.action-buttons .active {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.content-area {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  width: calc(100% - 340px); /* 300px侧边栏 + 40px总padding */
  min-height: calc(95vh - 60px); /* 与dashboard-container高度一致 */
  box-sizing: border-box;
  display: flex;
  justify-content: center; /* 所有面板内容居中 */
}

/* 所有面板的通用样式 - 使用固定宽度 */
.welcome-panel, .form-panel {
  width: 800px; /* 固定宽度，确保一致性 */
  max-width: 90%;
  margin: 0;  /* 移除外边距，由content-area的flex居中控制 */
  padding: 30px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  min-height: calc(95vh - 120px); /* 确保足够高度 */
}

/* 调整卡片容器宽度 */
.feature-cards {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
  width: 100%;
}

/* 调整卡片大小，使用百分比宽度 */
.box-card {
  width: 45%; /* 改为百分比宽度 */
  max-width: 320px;
}

/* 修复表单元素宽度 */
.el-form-item {
  width: 100%;
}

.el-input {
  width: 100%;
}

@media (max-width: 768px) {
  .dashboard-container {
    flex-direction: column;
  }

  .sidecard {
    width: 100%;
    margin-bottom: 20px;
  }

  .content-area {
    width: 100%; /* 在小屏幕上占据全宽 */
    min-height: 500px; /* 确保小屏幕上仍有足够高度 */
  }

  .feature-cards {
    flex-direction: column;
    align-items: center;
  }
}

/* 添加未登录状态的样式 */
.not-logged-in {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 30px;
  text-align: center;
}

.login-icon {
  font-size: 60px;
  color: #909399;
  margin-bottom: 20px;
}

.not-logged-in h2 {
  font-size: 24px;
  color: #303133;
  margin-bottom: 10px;
}

.not-logged-in p {
  color: #606266;
  margin-bottom: 30px;
}

.login-button {
  width: 80%;
  max-width: 200px;
}

.login-benefits {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 40px;
  width: 100%;
}

.login-benefits .box-card {
  width: 45%;
  max-width: 320px;
}

.login-benefits ul {
  text-align: left;
  padding-left: 20px;
}

.login-benefits li {
  margin-bottom: 10px;
  color: #606266;
}

/* 确保样式在登录状态下也有一致性 */
.welcome-panel, .form-panel {
  width: 800px; /* 固定宽度，确保一致性 */
  max-width: 90%;
  margin: 0;  /* 移除外边距，由content-area的flex居中控制 */
  padding: 30px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  min-height: calc(95vh - 120px); /* 确保足够高度 */
}
</style>