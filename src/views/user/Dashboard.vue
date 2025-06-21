<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getUserInfo, updateInfo } from '../../api/user.ts';
import { ElMessage } from 'element-plus';
import routes from '../../router';
import { parseRole } from '../../utils';
import {addNewItem} from "../../api/lottery.ts";
import { PrizeType } from '../../utils/type.ts';
import { UserFilled } from '@element-plus/icons-vue'

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
const password = ref('');

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
        oldPassword: password.value,
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
      password.value = res.data.data.password;
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
      password: updateForm.value.newPassword || ''
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
            password.value = res.data.data.password;
            updateForm.value.oldPassword = password.value;
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

const adding = ref(false)
const showAddDialog = ref(false)

// 添加表单数据
const addForm = ref({
  type: '',
  couponId: 1,
  quantity: 1
})

// 打开添加对话框
const openAddDialog = () => {
  addForm.value = {
    type: 'CREDIT',
    couponId: 1,
    quantity: 1
  }
  showAddDialog.value = true
}

// 处理添加操作
const handleAddToPool = async () => {
  try {
    adding.value = true

    const params = {
      type: addForm.value.type as PrizeType,
      itemId: addForm.value.couponId.toString(),
      quantity: addForm.value.quantity
    }

    const res = await addNewItem(params)
    if (res.data.code === '200') {
      ElMessage.success('添加奖池成功')
      showAddDialog.value = false
    } else {
      ElMessage.error(res.data.msg || '添加失败')
    }
  } catch (error) {
    ElMessage.error('请求失败，请稍后重试')
  } finally {
    adding.value = false
  }
}
</script>

<template>
  <div class="page">
    <div class="container">
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
                <p v-if="tele"><strong>电话:</strong> {{ tele }}</p>
              </div>
            </div>

            <div class="action-buttons">
              <el-row>
                <div v-if="role === 'admin'">
                  <el-button
                      type="primary"
                      @click="$router.push('/create_coupon')"
                      style="margin-top: 10px"
                      class="admin-button">
                    创建折扣券
                  </el-button>

                  <el-button
                      type="primary"
                      @click="$router.push('/all_coupons')"
                      style="margin-top: 35px"
                      class="admin-button-red">
                    查看全部折扣券
                  </el-button>

                  <el-button
                      type="primary"
                      @click="openAddDialog()"
                      style="margin-top: 35px"
                      class="admin-button-yellow">
                    积分奖池
                  </el-button>
                </div>
              </el-row>
            </div>

            <el-dialog
                v-model="showAddDialog"
                title="加入奖池"
                width="400px"
                :align-center="true"
                class="custom-dialog"
            >
              <div class="add-dialog-content">
                <el-form label-width="auto">
                  <el-form-item
                      label="积分："
                      label-width="80px"
                      class="form-item-custom"
                  >
                    <el-input-number
                        v-model="addForm.couponId"
                        :min="1"
                        :precision="0"
                        controls-position="right"
                        class="full-width-input"
                    />
                  </el-form-item>

                  <el-form-item
                      label="数量："
                      label-width="80px"
                      class="form-item-custom"
                  >
                    <el-input-number
                        v-model="addForm.quantity"
                        :min="1"
                        :precision="0"
                        controls-position="right"
                        class="full-width-input"
                    />
                  </el-form-item>
                </el-form>
              </div>

              <template #footer>
                <div class="dialog-footer-btns">
                  <el-button @click="showAddDialog = false" size="default">取消</el-button>
                  <el-button
                      type="primary"
                      :loading="adding"
                      @click="handleAddToPool"
                      size="default"
                  >
                    确认添加
                  </el-button>
                </div>
              </template>
            </el-dialog>
          </template>

          <!-- 未登录状态 -->
          <template v-else>
            <div class="not-logged-in">
              <el-icon class="login-icon"><UserFilled /></el-icon>
              <h2>未登录</h2>
              <p>请登录后查看个人信息</p>


              <!-- 新增查看全部商品按钮 -->
              <el-button
                  type="success"
                  @click="$router.push('/all')"
                  style="margin-top: 10px"
                  class="login-button">
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
              <div class="panel-header">
                <h1>欢迎回来，{{ name }}！</h1>
                <el-button
                    type="primary"
                    @click="activePanel = 'updateInfo'">
                  更新个人信息
                </el-button>
              </div>

              <el-card class="info-card">
                <div class="info-item">
                  <strong>地址:</strong> {{ location || '暂无' }}
                </div>
                <div class="info-item">
                  <strong>邮箱:</strong> {{ email || '暂无' }}
                </div>
              </el-card>

              <!-- 新增查看全部商品按钮 -->
              <el-button
                  type="success"
                  @click="$router.push('/all')"
                  style="margin-top: 20px; width: 200px;">
                查看全部商品
              </el-button>
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
                  <div style="display: flex; justify-content: flex-end; gap: 20px; margin-top: 10px;">
                    <el-button
                        type="primary"
                        @click="handleUpdate"
                        :disabled="!!((hasTeleInput && !telLegal) || (hasEmailInput && !emailLegal) || (updateForm.newPassword && !passwordsMatch))"
                        class="update-button">
                      保存更改
                    </el-button>
                    <el-button @click="activePanel = 'profile'" class="update-button">取消</el-button>
                  </div>

                </el-form-item>
              </el-form>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>


</template>

<style scoped>
.page {
  margin: 0;
  padding: 0;
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  overflow: auto;
}

.container {
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
  padding: 30px 20px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e6e6e6;
}

.user-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 30px;
  margin-bottom: 30px;
  border-bottom: 1px solid #eee;
}

.avatar-container {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 50px;
}

.user-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-profile h2 {
  margin: 15px 0;
  font-size: 1.5rem;
  color: #303133;
}

.user-info {
  width: 100%;
  text-align: center;
}

.user-info p {
  margin: 50px 0;
  color: #606266;
  word-break: break-word;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;

}

.admin-button {
  width: 100%;
  max-width: 180px;

  margin-left: 0 !important;
  margin-right: 0 !important;
}


.admin-button-red {
  width: 100%;
  max-width: 180px;
  background-color: #f56c6c;
  margin-left: 0 !important;
  margin-right: 0 !important;
}

.admin-button-yellow {
  width: 100%;
  max-width: 180px;
  background-color: #e6a23c;
  margin-left: 0 !important;
  margin-right: 0 !important;
}
.content-area {
  flex: 1;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  width: 900px;
  min-height: calc(95vh - 60px);
  box-sizing: border-box;
  display: flex;
  background-color: white;

}



.welcome-panel {
  width: 100%;
  margin: 0;
  padding: 30px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  min-height: calc(95vh - 120px);
}

.form-panel {
  width: 100%;
  margin: 0;
  padding: 30px;
  background-color: white;
  border-radius: 4px;

  min-height: calc(95vh - 120px);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.info-card {
  margin-top: 20px;
  padding: 20px;
  box-shadow: none !important; /* 添加这行来移除阴影 */
  border: none !important;
}

.info-item {
  margin: 15px 0 50px;
  font-size: 16px;
  text-align: left;
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
  width: 100%;
  max-width: 180px;
  margin-bottom: 20px;
  margin-left: 0 !important;
  margin-right: 0 !important;
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

.full-width-input {
  width: 100%;
}

.form-item-custom {
  margin-bottom: 15px;
}

@media (max-width: 768px) {
  .dashboard-container {
    flex-direction: column;
  }

  .sidecard {
    width: 100%;
    margin-bottom: 20px;
    border-right: none;
    border-bottom: 1px solid #e6e6e6;
  }

  .content-area {
    width: 100%;
    min-height: 500px;
  }

  .login-benefits {
    flex-direction: column;
    align-items: center;
  }

  .panel-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .panel-header .el-button {
    margin-top: 15px;
    width: 100%;
  }
}

.update-button {
  margin: 20px 0 30px;
}
</style>