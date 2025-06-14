<route lang="json5" type="page">
{
  style: {
    navigationBarTitleText: '登录',
    navigationStyle: 'custom',
  },
}
</route>
<template>
  <view class="login-container">
    <!-- 背景装饰元素 -->
    <view class="bg-decoration bg-circle-1"></view>
    <view class="bg-decoration bg-circle-2"></view>
    <view class="bg-decoration bg-circle-3"></view>

    <view class="login-header">
      <image class="login-logo" :src="appLogo" mode="aspectFit"></image>
      <view class="login-title">{{ appTitle }}</view>
    </view>
    <view class="login-form">
      <view class="welcome-text">欢迎登录</view>
      <view class="login-desc">请输入您的账号和密码</view>
      <view class="login-input-group">
        <view class="input-wrapper">
          <wd-input
            v-model="loginForm.username"
            prefix-icon="user"
            placeholder="请输入用户名"
            clearable
            class="login-input"
            :border="false"
            required
          ></wd-input>
          <view class="input-bottom-line"></view>
        </view>
        <view class="input-wrapper">
          <wd-input
            v-model="loginForm.password"
            prefix-icon="lock-on"
            placeholder="请输入密码"
            clearable
            show-password
            class="login-input"
            :border="false"
            required
          ></wd-input>
          <view class="input-bottom-line"></view>
        </view>
        <!-- 验证码区域 -->
        <view class="input-wrapper captcha-wrapper">
          <wd-input
            v-if="captcha.captchaEnabled"
            v-model="loginForm.code"
            prefix-icon="secured"
            placeholder="请输入验证码"
            clearable
            class="login-input captcha-input"
            :border="false"
            required
          >
            <template #suffix>
              <image
                class="captcha-image"
                :src="'data:image/gif;base64,' + captcha.image"
                mode="aspectFit"
                @click="refreshCaptcha"
              ></image>
            </template>
          </wd-input>
          <view class="input-bottom-line"></view>
        </view>
      </view>
      <!-- 登录按钮组 -->
      <view class="login-buttons">
        <!-- 账号密码登录按钮 -->
        <wd-button
          type="primary"
          size="large"
          block
          @click="handleAccountLogin"
          class="account-login-btn"
        >
          <wd-icon name="right" size="18px" class="login-icon"></wd-icon>
          登录
        </wd-button>
        <!-- 微信小程序一键登录按钮 -->
        <!-- #ifdef MP-WEIXIN -->
        <view class="divider">
          <view class="divider-line"></view>
          <view class="divider-text">或</view>
          <view class="divider-line"></view>
        </view>
        <wd-button
          type="info"
          size="large"
          block
          plain
          @click="handleWechatLogin"
          class="wechat-login-btn"
        >
          微信一键登录
        </wd-button>
        <!-- #endif -->
      </view>
    </view>
    <!-- 隐私协议勾选 -->
    <view class="privacy-agreement">
      <wd-checkbox
        v-model="agreePrivacy"
        shape="square"
        class="privacy-checkbox"
        active-color="var(--wot-color-theme, #1989fa)"
      >
        <view class="agreement-text">
          我已阅读并同意
          <text class="agreement-link" @click.stop="handleAgreement('user')">《用户协议》</text>
          和
          <text class="agreement-link" @click.stop="handleAgreement('privacy')">《隐私政策》</text>
        </view>
      </wd-checkbox>
    </view>
    <view class="login-footer"></view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/store/user'
import { isMpWeixin } from '@/utils/platform'
import { getCode, ILoginForm } from '@/api/login'
import { toast } from '@/utils/toast'
import { isTableBar } from '@/utils/index'
import { ICaptcha } from '@/api/login.typings'
const redirectRoute = ref('')

// 获取环境变量
const appTitle = ref(import.meta.env.VITE_APP_TITLE || 'WS Home')
const appLogo = ref(import.meta.env.VITE_APP_LOGO || '/static/logo.svg')

// 初始化store
const userStore = useUserStore()
// 路由位置
// 验证码图片
const captcha = ref<ICaptcha>({
  captchaEnabled: false,
  uuid: '',
  image: '',
})
// 登录表单数据
const loginForm = ref<ILoginForm>({
  username: '',
  password: '',
  code: '',
  uuid: '',
})
// 隐私协议勾选状态
const agreePrivacy = ref(true)
const showPhoneBtn = ref(false)
let tempUserProfile: any = null

// 页面加载完毕时触发
onLoad((option) => {
  // 一进来就刷新验证码
  captcha.value.captchaEnabled && refreshCaptcha()
  // 获取跳转路由
  if (option.redirect) {
    redirectRoute.value = option.redirect
  }
})

// 账号密码登录
const handleAccountLogin = async () => {
  if (!agreePrivacy.value) {
    toast.error('请阅读同意协议')
    return
  }
  // 表单验证
  if (!loginForm.value.username) {
    toast.error('请输入用户名')
    return
  }
  if (!loginForm.value.password) {
    toast.error('请输入密码')
    return
  }
  if (captcha.value.captchaEnabled && !loginForm.value.code) {
    toast.error('请输入验证码')
    return
  }
  // 执行登录
  await userStore.login(loginForm.value)
  // 跳转到首页或重定向页面
  let targetUrl = redirectRoute.value || '/pages/index/index'
  targetUrl = decodeURIComponent(targetUrl)
  if (!targetUrl.startsWith('/')) {
    targetUrl = '/' + targetUrl
  }
  if (isTableBar(targetUrl)) {
    uni.switchTab({ url: targetUrl })
  } else {
    uni.redirectTo({ url: targetUrl })
  }
}

// 微信登录
const handleWechatLogin = async () => {
  if (!isMpWeixin) {
    toast.info('请在微信小程序中使用此功能')
    return
  }
  if (!agreePrivacy.value) {
    toast.error('请先阅读并同意用户协议和隐私政策')
    return
  }
  // 获取用户信息
  try {
    tempUserProfile = await uni.getUserProfile({
      desc: '用于完善会员资料',
    })
    // 直接走微信登录
    await userStore.wxLogin()
    // 跳转
    let targetUrl = redirectRoute.value || '/pages/index/index'
    targetUrl = decodeURIComponent(targetUrl)
    if (!targetUrl.startsWith('/')) {
      targetUrl = '/' + targetUrl
    }
    if (isTableBar(targetUrl)) {
      uni.switchTab({ url: targetUrl })
    } else {
      uni.redirectTo({ url: targetUrl })
    }
  } catch (e) {
    toast.error('授权失败')
    return
  }
}

// 刷新验证码
const refreshCaptcha = () => {
  // 获取验证码
  getCode().then((res) => {
    const { data } = res
    loginForm.value.uuid = data.uuid
    captcha.value = data
  })
}

// 处理协议点击
const handleAgreement = (type: 'user' | 'privacy') => {
  const title = type === 'user' ? '用户协议' : '隐私政策'
  // showToast(`查看${title}`)
  // 实际项目中可以跳转到对应的协议页面
  // uni.navigateTo({
  //   url: `/pages/agreement/${type}`
  // })
}
</script>

<style lang="scss" scoped>
/* 验证码输入框样式 */
.captcha-wrapper {
  .captcha-input {
    :deep(.wd-input__suffix) {
      margin-right: 0;
      padding-right: 0;
    }
  }

  .captcha-image {
    width: 140rpx;
    height: 44rpx;
    margin-left: 20rpx;
    border-radius: 8rpx;
    cursor: pointer;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.8);

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(to bottom, rgba(255, 255, 255, 0.2), transparent);
      pointer-events: none;
    }

    &:active {
      opacity: 0.8;
      transform: scale(0.96);
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
    }
  }
}

.login-container {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 0 50rpx;
  background: linear-gradient(135deg, #f6f9fc 0%, #eef2f7 100%);
  position: relative;
  overflow: hidden;
}

/* 背景装饰元素 */
.bg-decoration {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(46, 134, 222, 0.15), rgba(84, 160, 255, 0.15));
  z-index: 0;
  pointer-events: none;
  animation: float-effect 15s infinite ease-in-out;
  backdrop-filter: blur(10px);
}

.bg-circle-1 {
  width: 500rpx;
  height: 500rpx;
  top: -200rpx;
  right: -200rpx;
  opacity: 0.6;
  animation-delay: 0s;
}

.bg-circle-2 {
  width: 400rpx;
  height: 400rpx;
  bottom: 15%;
  left: -150rpx;
  opacity: 0.4;
  animation-delay: -5s;
}

.bg-circle-3 {
  width: 300rpx;
  height: 300rpx;
  bottom: -100rpx;
  right: 10%;
  opacity: 0.3;
  background: linear-gradient(135deg, rgba(46, 134, 222, 0.15), rgba(84, 160, 255, 0.15));
  animation-delay: -10s;
}

.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 120rpx;
  animation: slideInTop 1s cubic-bezier(0.4, 0, 0.2, 1);

  .login-logo {
    width: 200rpx;
    height: 200rpx;
    border-radius: 40rpx;
    //box-shadow: 0 15rpx 50rpx rgba(0, 0, 0, 0.1);
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    transform-origin: center;

    &:active {
      transform: scale(0.92) rotate(-5deg);
      box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.08);
    }
  }

  .login-title {
    margin-top: 30rpx;
    font-size: 46rpx;
    font-weight: 600;
    background: linear-gradient(135deg, #333333, #666666);
    -webkit-background-clip: text;
    color: transparent;
    letter-spacing: 2rpx;
    text-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.05);
  }
}

.login-form {
  flex: 1;
  margin-top: 80rpx;
  animation: fadeInScale 1s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both;

  .welcome-text {
    margin-bottom: 15rpx;
    font-size: 48rpx;
    font-weight: 600;
    background: linear-gradient(135deg, #333333, #666666);
    -webkit-background-clip: text;
    color: transparent;
    text-align: center;
    letter-spacing: 1rpx;
  }

  .login-desc {
    margin-bottom: 60rpx;
    font-size: 28rpx;
    color: #888888;
    text-align: center;
    letter-spacing: 0.5rpx;
  }

  .login-input-group {
    margin-bottom: 60rpx;
    position: relative;
    z-index: 1;

    .input-wrapper {
      position: relative;
      margin-bottom: 45rpx;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      border-radius: 16rpx;
      overflow: hidden;
      background-color: rgba(255, 255, 255, 0.95);
      box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.04);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.8);

      &:last-child {
        margin-bottom: 0;
      }

      .login-input {
        padding: 24rpx 40rpx;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;

        :deep(.wd-input__inner) {
          font-size: 30rpx;
          color: #333333;
          letter-spacing: 0.5rpx;
          padding-left: 20rpx;
          transition: all 0.3s ease;
          height: 44rpx;
          line-height: 44rpx;

          &::placeholder {
            color: #999999;
            font-size: 28rpx;
            transition: all 0.3s ease;
          }
        }

        :deep(.wd-input__prefix) {
          margin-right: 30rpx;
          color: #999999;
          transition: all 0.3s ease;
          font-size: 36rpx;
          display: flex;
          align-items: center;
          height: 44rpx;
        }

        :deep(.wd-input__suffix) {
          margin-left: 30rpx;
          padding-left: 20rpx;
          display: flex;
          align-items: center;
          height: 44rpx;
        }

        &:focus-within {
          background-color: rgba(255, 255, 255, 0.98);
          box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.08);
          transform: translateY(-6rpx);

          :deep(.wd-input__inner) {
            color: #333333;

            &::placeholder {
              color: #bbbbbb;
              transform: translateX(10rpx);
            }
          }

          :deep(.wd-input__prefix) {
            color: #1989fa;
            transform: scale(1.1);
          }
        }

        &:hover {
          background-color: rgba(255, 255, 255, 0.98);
          box-shadow: 0 8rpx 28rpx rgba(0, 0, 0, 0.06);
        }
      }

      .input-bottom-line {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 3rpx;
        background: linear-gradient(to right, #2e86de, #54a0ff);
        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        transform: scaleX(0);
        opacity: 0.9;
        transform-origin: left;
      }

      &:focus-within .input-bottom-line {
        transform: scaleX(1);
        height: 4rpx;
        box-shadow: 0 0 8rpx rgba(251, 194, 235, 0.4);
      }

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent);
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
      }

      &:focus-within::before {
        opacity: 1;
      }
    }
  }

  .login-buttons {
    display: flex;
    flex-direction: column;
    gap: 35rpx;

    .account-login-btn {
      height: 96rpx;
      margin-top: 15rpx;
      font-size: 32rpx;
      font-weight: 500;
      letter-spacing: 1rpx;
      border-radius: 48rpx;
      background: linear-gradient(135deg, #2e86de 0%, #54a0ff 100%);
      box-shadow: 0 12rpx 30rpx rgba(46, 134, 222, 0.3);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      position: relative;
      overflow: hidden;

      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent);
        opacity: 0;
        transition: opacity 0.4s ease;
      }

      &:active {
        transform: scale(0.97) translateY(2rpx);
        box-shadow: 0 6rpx 20rpx rgba(251, 194, 235, 0.2);

        &::after {
          opacity: 1;
        }
      }

      .login-icon {
        margin-right: 8rpx;
        opacity: 0.9;
        transition: all 0.4s ease;
      }
    }

    .divider {
      display: flex;
      align-items: center;
      margin: 25rpx 0;

      .divider-line {
        flex: 1;
        height: 1px;
        background: linear-gradient(to right, transparent, #e0e0e0, transparent);
      }

      .divider-text {
        padding: 0 25rpx;
        font-size: 24rpx;
        color: #999999;
      }
    }

    .wechat-login-btn {
      height: 96rpx;
      font-size: 32rpx;
      color: #07c160;
      border-color: #07c160;
      border-radius: 48rpx;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      background-color: rgba(7, 193, 96, 0.05);
      position: relative;
      overflow: hidden;

      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent);
        opacity: 0;
        transition: opacity 0.4s ease;
      }

      &:active {
        transform: scale(0.97) translateY(2rpx);
        background-color: rgba(7, 193, 96, 0.08);

        &::after {
          opacity: 1;
        }
      }
    }
  }
}

.privacy-agreement {
  display: flex;
  justify-content: center;
  margin: 30rpx 0 35rpx;
  animation: fadeIn 1s cubic-bezier(0.4, 0, 0.2, 1) 0.4s both;

  .privacy-checkbox {
    display: flex;
    align-items: center;

    :deep(.wd-checkbox__label) {
      font-size: 26rpx;
    }
  }

  .agreement-text {
    font-size: 26rpx;
    line-height: 1.6;
    color: #888888;

    .agreement-link {
      padding: 0 4rpx;
      font-weight: 500;
      color: #2e86de;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 1px;
        background-color: currentColor;
        transform: scaleX(0);
        transition: transform 0.3s ease;
        transform-origin: right;
      }

      &:active {
        opacity: 0.8;
        transform: scale(0.98);

        &::after {
          transform: scaleX(1);
          transform-origin: left;
        }
      }
    }
  }
}

.login-footer {
  padding: 50rpx 0;
  margin-top: auto;
}

/* 优化动画效果 */
@keyframes float-effect {
  0%,
  100% {
    transform: translateY(0) translateX(0) rotate(0deg) scale(1);
  }
  25% {
    transform: translateY(-30rpx) translateX(30rpx) rotate(5deg) scale(1.05);
  }
  50% {
    transform: translateY(0) translateX(0) rotate(0deg) scale(1);
  }
  75% {
    transform: translateY(30rpx) translateX(-30rpx) rotate(-5deg) scale(0.95);
  }
}

@keyframes slideInTop {
  from {
    opacity: 0;
    transform: translateY(-60rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.92);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
