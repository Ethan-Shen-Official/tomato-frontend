<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getUserInfo, updateInfo } from '../../api/user.ts';
import { ElMessage } from 'element-plus';
import { routes } from '../../router';
import { parseRole } from '../../utils';

// 登录状态
const isLoggedIn = ref(true);

function checkLogin() {
  const token = sessionStorage.getItem('token');
  if (!token) {
    isLoggedIn.value = false;
  }
}

// 用户信息
const username = sessionStorage.getItem('username');
const name = ref('');
const role = ref('');
const tele = ref('');
const location = ref('');
const email = ref('');
const avatar_url = ref('');

const teleNumberRegex = /^1\d{10}$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// 修改为计算属性，使其能动态监测输入值
const hasTeleInput = computed(() => updateForm.value.tele !== '');
const hasEmailInput = computed(() => updateForm.value.email !== '');

// 电话号码合法性检验
const telLegal = computed(() => {
  if (!hasTeleInput.value) return true;
  return teleNumberRegex.test(updateForm.value.tele);
});

// 邮箱合法性检验
const emailLegal = computed(() => {
  if (!hasEmailInput.value) return true;
  return emailRegex.test(updateForm.value.email);
});

// 控制右侧显示内容value 为{'profile', 'updateInfo'}中的一个, 默认为'profile'
const activePanel = ref('profile'); 

// 统一更新表单
const updateForm = ref({
  name: '',
  tele: '',
  email: '',
  location: '',
  avatar: '',
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const passwordsMatch = ref(true);

// 前往登录页面
const ToLogin = () => {
  routes.push('/login');
};

// 前往注册页面
const ToRegister = () => {
  routes.push('/register');
};

// 加载用户信息
onMounted(async () => {
  try {
    checkLogin();
    if (isLoggedIn.value === true) {
        getCurUser();
        // 初始化更新表单
        updateForm.value = {
          name: name.value,
          tele: tele.value,
          email: email.value,
          location: location.value,
          avatar: avatar_url.value,
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
    }
  } catch (error) {
    console.error('获取用户信息失败', error);
    ElMessage.error('连接失败');
  }
});

function getCurUser() {
  getUserInfo(username || '').then(res => {
      if (res.data.code === '200') {
        name.value = res.data.data.name;
        tele.value = res.data.data.tele;
        email.value = res.data.data.email;
        location.value = res.data.data.location;
        avatar_url.value = res.data.data.avatar;
        role.value = res.data.data.role;
      } else if (res.data.code === '400') {
        ElMessage.error(res.data.msg);
      }
    });
}

const handleUpdate = async () => {
  // 检查密码是否匹配（如果有输入新密码）
  if (updateForm.value.newPassword && updateForm.value.newPassword !== updateForm.value.confirmPassword) {
    passwordsMatch.value = false;
    ElMessage.error('两次输入的密码不一致');
    return;
  }
  passwordsMatch.value = true;
  try {
    // 准备更新数据，使用当前值作为未填写字段的默认值
    const updateData = {
      username: username || '',
      role: role || 'USER',
      name: updateForm.value.name || name.value,
      telephone: updateForm.value.tele || tele.value,
      email: updateForm.value.email || email.value,
      location: updateForm.value.location || location.value,
      avatar: updateForm.value.avatar || avatar_url.value,
      password: updateForm.value.newPassword || '123456'
    };

    // 如果没有更改任何内容，则提示用户
    if (
      updateData.name === name.value &&
      updateData.telephone === tele.value &&
      updateData.email === email.value &&
      updateData.location === location.value &&
      updateData.avatar === avatar_url.value &&
      !updateData.password
    ) {
      ElMessage({
        message: "未检测到任何修改",
        type: 'info',
        center: true
      });
      return;
    }

    updateInfo({
        username: username || '',
        name: updateData.name,
        role: role.value,
        telephone: updateData.telephone,
        email: updateData.email,
        location: updateData.location,
        avatar: updateData.avatar,
        password: updateData.password,
      }
    ).then(res => {
      if (res.data.code === '200') {
        ElMessage({
          message: res.data.msg,
          type: 'success',
          center: true,
        });
        
        getUserInfo(username || '').then(res => {
          if (res.data.code === '200') {
            name.value = res.data.data.name;
            tele.value = res.data.data.tele;
            email.value = res.data.data.email;
            location.value = res.data.data.location;
            avatar_url.value = res.data.data.avatar;
            
            updateForm.value.oldPassword = '';
            updateForm.value.newPassword = '';
            updateForm.value.confirmPassword = '';
          } else if (res.data.code === '400') {
            ElMessage.error(res.data.msg);
          }
        });
        
        activePanel.value = 'profile';
      } else if (res.data.code === '400') {
        ElMessage({
          message: res.data.msg,
          type: 'error',
          center: true,
        });
      }
    });
  } catch (error) {
    console.error('更新用户信息失败', error);
    ElMessage.error('更新用户信息失败');
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
            <p><strong>身份:</strong> {{ formatRole(role || '') }}</p>
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
              更新个人信息
            </el-button>

            <div v-if="role === 'admin'">
              <el-button
                  type="primary"
                  @click="$router.push('/create_coupon')"
                  style="margin-top: 10px">
                创建折扣券
              </el-button>
            </div>
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

          <!-- 新增查看全部商品按钮 -->
          <el-button
              type="success"
              @click="$router.push('/all')"
              style="margin-top: 10px">
            查看全部商品
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
            <el-header class="card-header">
                <span>会员特权</span>
            </el-header>
            <div class="text-item">
              <ul>
                <li>购买中意的图书</li>
                <li>查看订单状态</li>
                <li>查看购物车</li>
                <li>更多个性化推荐</li>
              </ul>
            </div>
          </el-card>
          
          <el-card class="box-card">
            <el-header class="card-header">
                <span>快速登录</span>
            </el-header>
            <ul class="text-item">
                <li>
              请
              <span class="text-link" @click="ToLogin">登录</span>
              以享受更多功能
            </li>
                <li>
                如果您还没有账号，可以点击此处
              <span class="text-link" @click="ToRegister">注册</span>
              新账户。
            </li>
        </ul>
          </el-card>
        </div>
      </div>
      
      <!-- 以下内容只在已登录状态显示 -->
      <template v-else>
        <!-- 默认页面 - 欢迎信息 -->
        <div v-if="activePanel === 'profile'" class="welcome-panel">
          <h1>欢迎回来，{{ name }}！</h1>
          <p>您可以在左侧选择操作来更新您的个人信息。</p>
          
          <div class="feature-cards">
            <el-card class="box-card">
              <el-header class="card-header">
                  <span>账户管理</span>
              </el-header>
              <ul class="text-item">
                <li>您可以更新您的基本信息，如姓名、电话、邮箱等。</li>
                <li>定期更改您的密码可以提高账户安全性。</li>
              </ul>
              <div class="button-area">
                <el-button type="primary" plain @click="activePanel = 'updateInfo'">
                  更新个人信息
                </el-button>

                <!-- 新增查看全部商品按钮 -->
                <el-button
                    type="success"
                    @click="$router.push('/all')"
                    style="margin-top: 10px">
                  查看全部商品
                </el-button>


              </div>
            </el-card>
          </div>
        </div>
        
        <!-- 统一的更新信息表单 -->
        <div v-if="activePanel === 'updateInfo'" class="form-panel">
          <h2>个人信息管理</h2>
          <el-form label-position="top">
            <h3>基本信息</h3>
            <el-form-item label="用户名">
              <el-input v-model="username" disabled />
              <div class="form-tip">用户名不可更改</div>
            </el-form-item>
            
            <el-form-item label="姓名">
              <el-input v-model="updateForm.name" placeholder="请输入您的真实姓名" />
              <div class="form-tip">不填写则保持当前值: {{ name }}</div>
            </el-form-item>
            
            <el-form-item label="电话号码">
              <label v-if="!hasTeleInput">电话号码</label>
              <label v-else-if="!telLegal" class="error">电话号码不合法（请输入1开头的11位数字）</label>
              <label v-else>电话号码</label>
              <el-input 
                v-model="updateForm.tele" 
                :class="{'error-input': (hasTeleInput && !telLegal)}"
                placeholder="请输入您的电话号码" />
              <div class="form-tip">不填写则保持当前值: {{ tele || '暂无' }}</div>
            </el-form-item>

            <el-form-item label="邮箱">
              <label v-if="!hasEmailInput">邮箱</label>
              <label v-else-if="!emailLegal" class="error">邮箱格式不正确</label>
              <label v-else>邮箱</label>
              <el-input 
                v-model="updateForm.email" 
                :class="{'error-input': (hasEmailInput && !emailLegal)}"
                placeholder="请输入您的邮箱地址" />
              <div class="form-tip">不填写则保持当前值: {{ email || '暂无' }}</div>
            </el-form-item>
            
            <el-form-item label="地址">
              <el-input v-model="updateForm.location" placeholder="请输入您的地址" />
              <div class="form-tip">不填写则保持当前值: {{ location || '暂无' }}</div>
            </el-form-item>
            
            <el-form-item label="头像URL">
              <el-input v-model="updateForm.avatar" placeholder="请输入头像图片URL" />
              <div class="form-tip">不填写则保持当前头像</div>
            </el-form-item>
            
            <el-divider>密码管理</el-divider>
            
            <h3>修改密码 (可选)</h3>
            <div class="form-tip password-tip">修改密码，如不想修改请填写原本密码，不得留空</div>
            
            <el-form-item label="当前密码">
              <el-input v-model="updateForm.oldPassword" type="password" placeholder="请输入当前密码" show-password />
            </el-form-item>
            
            <el-form-item label="新密码">
              <el-input v-model="updateForm.newPassword" type="password" placeholder="请输入新密码" show-password />
            </el-form-item>
            
            <el-form-item label="确认新密码" :error="!passwordsMatch ? '两次输入的密码不一致' : ''">
              <el-input 
                v-model="updateForm.confirmPassword" 
                type="password" 
                placeholder="请再次输入新密码" 
                show-password
                @input="passwordsMatch = updateForm.newPassword === updateForm.confirmPassword" />
            </el-form-item>
            
            <el-form-item>
              <el-button 
                type="primary" 
                @click="handleUpdate"
                :disabled="!!((hasTeleInput && !telLegal) || (hasEmailInput && !emailLegal) || (updateForm.newPassword && !passwordsMatch))">
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
  width: calc(100% - 340px); 
  min-height: calc(95vh - 60px); 
  box-sizing: border-box;
  display: flex;
  justify-content: center; 
}

.welcome-panel, .form-panel {
  width: 800px; 
  max-width: 90%;
  margin: 0;  
  padding: 30px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  min-height: calc(95vh - 120px); 
}

.feature-cards {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
  width: 100%;
}

.box-card {
  width: 45%; 
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
    width: 100%; 
    min-height: 500px; 
  }

  .feature-cards {
    flex-direction: column;
    align-items: center;
  }
}

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

.welcome-panel, .form-panel {
  width: 800px; /* 固定宽度，确保一致性 */
  max-width: 90%;
  margin: 0;  /* 移除外边距，由content-area的flex居中控制 */
  padding: 30px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  min-height: calc(95vh - 120px); 
}

.text-link {
  color: #409EFF;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition: color 0.2s;
}

.text-link:hover {
  color: #66b1ff;
  text-decoration: underline;
}

.button-area {
  margin-top: 15px;
  text-align: right;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 22px;
  font-style: normal;
  font-weight: 500;
}

.text-item {
  margin-bottom: 12px;
  color: #606266;
  line-height: 1.6;
}

.text-item:last-child {
  margin-bottom: 0;
}

.text-item ul {
  padding-left: 20px;
  margin: 10px 0;
}

.text-item li {
  text-align: left;
  margin-bottom: 8px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.password-tip {
  margin-bottom: 16px;
  font-size: 14px;
}

h3 {
  font-size: 18px;
  margin-bottom: 16px;
  color: #303133;
  font-weight: 500;
}

.el-divider {
  margin: 30px 0;
}

.error {
  color: red;
}

.error-input {
  --el-input-focus-border-color: red;
  border-color: red;
}
</style>