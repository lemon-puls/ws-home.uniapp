<route lang="json5">
{
  style: {
    navigationBarTitleText: '我的',
  },
}
</route>

<template>
  <view class="profile-container">
    <!-- 背景动画 -->
    <view class="bg-animation">
      <view class="circle circle-1"></view>
      <view class="circle circle-2"></view>
      <view class="circle circle-3"></view>
    </view>

    <scroll-view scroll-y class="main-scroll">
      <!-- 用户信息区域 -->
      <view class="user-info-section">
        <!-- #ifdef MP-WEIXIN -->
        <button class="avatar-button" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
          <wd-img :src="userStore.userInfo.avatar" width="80px" height="80px" radius="50%"></wd-img>
        </button>
        <!-- #endif -->
        <!-- #ifndef MP-WEIXIN -->
        <view class="avatar-wrapper" @click="run">
          <wd-img :src="userStore.userInfo.avatar" width="100%" height="100%" radius="50%"></wd-img>
        </view>
        <!-- #endif -->
        <view class="user-details">
          <!-- #ifdef MP-WEIXIN -->
          <input
            type="nickname"
            class="weui-input"
            placeholder="请输入昵称"
            v-model="userStore.userInfo.username"
          />
          <!-- #endif -->
          <!-- #ifndef MP-WEIXIN -->
          <view class="username">{{ userStore.userInfo.username }}</view>
          <!-- #endif -->
          <view class="user-id">ID: {{ userStore.userInfo.id }}</view>
          <view class="user-created">
            {{
              userStore.userInfo.create_time
                ? formatCreateTime(userStore.userInfo.create_time)
                : '未知注册时间'
            }}
          </view>
        </view>
      </view>

      <!-- 额外用户详情 -->
      <view class="extra-info-section">
        <view class="info-item" v-if="userStore.userInfo.phone">
          <wd-icon name="phone" size="20px" color="#666"></wd-icon>
          <text class="info-label">电话:</text>
          <text class="info-value">{{ userStore.userInfo.phone }}</text>
        </view>
        <view class="info-item" v-if="userStore.userInfo.email">
          <wd-icon name="mail" size="20px" color="#666"></wd-icon>
          <text class="info-label">邮箱:</text>
          <text class="info-value">{{ userStore.userInfo.email }}</text>
        </view>
        <view class="info-item" v-if="userStore.userInfo.gender !== undefined">
          <wd-icon name="user-filled" size="20px" color="#666"></wd-icon>
          <text class="info-label">性别:</text>
          <text class="info-value">{{ formatGender(userStore.userInfo.gender) }}</text>
        </view>
        <view class="info-item" v-if="userStore.userInfo.age">
          <wd-icon name="date" size="20px" color="#666"></wd-icon>
          <text class="info-label">年龄:</text>
          <text class="info-value">{{ userStore.userInfo.age }}</text>
        </view>
      </view>

      <!-- 登录/退出登录按钮 -->
      <view class="logout-button-wrapper">
        <wd-button type="error" v-if="hasLogin" block @click="handleLogout">退出登录</wd-button>
        <wd-button type="primary" v-else block @click="handleLogin">登录</wd-button>
      </view>
    </scroll-view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useUserStore } from '@/store'
import { useToast } from 'wot-design-uni'
import { uploadFileUrl, useUpload } from '@/utils/uploadFile'
import { IUploadSuccessInfo } from '@/api/login.typings'
import { usePageAuth } from '@/hooks/usePageAuth'

const userStore = useUserStore()

const toast = useToast()
const hasLogin = ref(false)

usePageAuth()

onShow((options) => {
  hasLogin.value = !!uni.getStorageSync('token')
  console.log('个人中心onShow', hasLogin.value, options)

  hasLogin.value && userStore.getUserInfo()
})

// 格式化性别
const formatGender = (gender: number | undefined) => {
  if (gender === 1) return '男'
  if (gender === 2) return '女'
  return '未知'
}

// 格式化创建时间
const formatCreateTime = (time: string) => {
  const date = new Date(time)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
}

// #ifndef MP-WEIXIN
// 上传头像
const { run } = useUpload<IUploadSuccessInfo>(
  uploadFileUrl.USER_AVATAR,
  {},
  {
    onSuccess: (res) => userStore.getUserInfo(),
  },
)
// #endif

// 微信小程序下登录
const handleLogin = async () => {
  uni.navigateTo({ url: '/pages/login/index' })
}

// #ifdef MP-WEIXIN

// 微信小程序下选择头像事件
const onChooseAvatar = (e: any) => {
  console.log('选择头像', e.detail)
  const { avatarUrl } = e.detail
  const { run } = useUpload<IUploadSuccessInfo>(
    uploadFileUrl.USER_AVATAR,
    {},
    {
      onSuccess: (res) => userStore.getUserInfo(),
    },
    avatarUrl,
  )
  run()
}
// #endif
// #ifdef MP-WEIXIN
// 微信小程序下设置用户名
const getUserInfo = (e: any) => {
  console.log(e.detail)
}
// #endif

// 退出登录
const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        // 清空用户信息
        userStore.logout()
        hasLogin.value = false
        // 执行退出登录逻辑
        toast.success('退出登录成功')
        // #ifdef MP-WEIXIN
        // 微信小程序，去首页
        // uni.reLaunch({ url: '/pages/index/index' })
        // #endif
        // #ifndef MP-WEIXIN
        // 非微信小程序，去登录页
        // uni.reLaunch({ url: '/pages/login/index' })
        // #endif
      }
    },
  })
}
</script>

<style lang="scss" scoped>
/* 基础样式 */
.profile-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f6f8fd 0%, #f1f4f9 100%);
  position: relative;
  overflow: hidden;
}

.bg-animation {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 1;

  .circle {
    position: absolute;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(1, 141, 113, 0.1), rgba(0, 184, 148, 0.1));
    animation: float 8s infinite ease-in-out;
  }

  .circle-1 {
    width: 250rpx;
    height: 250rpx;
    top: -80rpx;
    right: -80rpx;
    animation-delay: 0s;
  }

  .circle-2 {
    width: 180rpx;
    height: 180rpx;
    bottom: 15%;
    left: -40rpx;
    animation-delay: -2s;
  }

  .circle-3 {
    width: 220rpx;
    height: 220rpx;
    bottom: -70rpx;
    right: 10%;
    animation-delay: -4s;
  }
}

.main-scroll {
  position: relative;
  z-index: 2;
  height: 100vh;
  padding: 30rpx;
  box-sizing: border-box;
}

/* 用户信息区域 */
.user-info-section {
  display: flex;
  align-items: center;
  padding: 40rpx;
  margin: 30rpx 0 20rpx;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.avatar-wrapper,
.avatar-button {
  width: 160rpx;
  height: 160rpx;
  margin-right: 40rpx;
  overflow: hidden;
  border: 4rpx solid rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;

  &:active {
    transform: scale(0.95);
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
  }
}

.user-details {
  flex: 1;
}

.username {
  margin-bottom: 12rpx;
  font-size: 38rpx;
  font-weight: 600;
  color: #333;
  letter-spacing: 0.5rpx;
}

.user-id {
  font-size: 28rpx;
  color: #666;
}

.user-created {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #999;
}

/* 额外信息区域 */
.extra-info-section {
  margin: 20rpx 0;
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.info-item {
  display: flex;
  align-items: center;
  padding: 15rpx 0;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);

  &:last-child {
    border-bottom: none;
  }

  .wd-icon {
    margin-right: 15rpx;
  }

  .info-label {
    font-size: 28rpx;
    color: #666;
    width: 100rpx;
    flex-shrink: 0;
  }

  .info-value {
    flex: 1;
    font-size: 28rpx;
    color: #333;
    text-align: right;
  }
}

/* 退出登录按钮 */
.logout-button-wrapper {
  padding: 40rpx 0;
}

:deep(.wd-button) {
  height: 88rpx;
  font-size: 32rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
  transition: all 0.3s ease;

  &.wd-button--error {
    background: linear-gradient(135deg, #ff4757, #ff6b81);
    color: #fff;
    box-shadow: 0 8rpx 20rpx rgba(255, 71, 87, 0.2);

    &:active {
      transform: translateY(2rpx);
      box-shadow: 0 4rpx 10rpx rgba(255, 71, 87, 0.3);
    }
  }

  &.wd-button--primary {
    background: linear-gradient(135deg, #018d71, #00b894);
    color: #fff;
    box-shadow: 0 8rpx 20rpx rgba(1, 141, 113, 0.2);

    &:active {
      transform: translateY(2rpx);
      box-shadow: 0 4rpx 10rpx rgba(1, 141, 113, 0.3);
    }
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20rpx);
  }
}
</style>
