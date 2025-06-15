<!-- 使用 type="home" 属性设置首页，其他页面不需要设置，默认为page；推荐使用json5，更强大，且允许注释 -->
<route lang="json5" type="home">
{
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '首页',
  },
}
</route>
<template>
  <view class="home-page">
    <!-- 背景动画 -->
    <view class="bg-animation">
      <view class="circle circle-1"></view>
      <view class="circle circle-2"></view>
      <view class="circle circle-3"></view>
    </view>

    <!-- 主要内容 -->
    <view class="content">
      <view class="welcome-section">
        <image class="logo" src="/static/logo.png" mode="aspectFit" />
        <view class="welcome-text">
          <text class="title">欢迎来到</text>
          <text class="subtitle">我们的相册空间</text>
        </view>
      </view>

      <!-- 图片展示区域 -->
      <view class="photo-showcase">
        <view class="showcase-title">
          <text class="title">精选回忆</text>
          <text class="subtitle">记录美好瞬间</text>
          <view class="refresh-btn" @tap="handleRefresh">
            <text>🔄</text>
          </view>
        </view>
        <swiper
          class="photo-swiper"
          :indicator-dots="true"
          :autoplay="true"
          :interval="3000"
          :duration="500"
          :circular="true"
          indicator-color="rgba(255, 255, 255, 0.6)"
          indicator-active-color="#ffffff"
        >
          <swiper-item v-for="(photo, index) in showcasePhotos" :key="index" class="swiper-item">
            <view class="photo-card" :style="{ animationDelay: index * 0.2 + 's' }">
              <image
                :src="photo.url"
                mode="aspectFill"
                class="photo-image"
                :webp="true"
                :show-menu-by-longpress="true"
                :show-loading="true"
                loading="lazy"
              />
              <view class="photo-info">
                <text class="photo-title">{{ photo.title }}</text>
                <text class="photo-desc">{{ photo.description }}</text>
              </view>
            </view>
          </swiper-item>
        </swiper>
      </view>

      <view class="menu-list">
        <view class="menu-item" @tap="navigateToAlbum" hover-class="menu-item-hover">
          <view class="menu-icon">
            <text class="iconfont icon-album"></text>
          </view>
          <view class="menu-info">
            <text class="menu-title">我的相册</text>
            <text class="menu-desc">记录美好时光</text>
          </view>
          <text class="iconfont icon-arrow-right"></text>
        </view>
      </view>

      <!-- 装饰元素 -->
      <view class="decoration">
        <view class="floating-icon icon-1">📸</view>
        <view class="floating-icon icon-2">🎨</view>
        <view class="floating-icon icon-3">✨</view>
      </view>

      <!-- 哆啦A梦动画 -->
      <view class="doraemon-container">
        <image
          class="doraemon-image"
          src="/static/images/doraemon.png"
          mode="aspectFit"
          @tap="handleDoraemonTap"
        />
        <view class="speech-bubble" :class="{ show: showSpeech }">
          <view class="bubble-content">
            <text class="greeting">你好！</text>
            <text class="name">我是哆啦A梦~</text>
            <view class="bubble-decoration">
              <view class="star star-1">⭐</view>
              <view class="star star-2">✨</view>
              <view class="star star-3">🌟</view>
            </view>
          </view>
        </view>
      </view>

      <!-- 蜡笔小新动画 -->
      <view class="crayon-container">
        <image
          class="crayon-image"
          src="/static/images/crayon.png"
          mode="aspectFit"
          @tap="handleCrayonTap"
        />
        <view class="crayon-bubble" :class="{ show: showCrayonSpeech }">
          <view class="bubble-content">
            <text class="greeting">动感超人！</text>
            <text class="name">我是野原新之助~</text>
            <view class="bubble-decoration">
              <view class="star star-1">💫</view>
              <view class="star star-2">⚡</view>
              <view class="star star-3">💥</view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { Service } from '@/api'

// 展示图片数据
const showcasePhotos = ref<
  Array<{
    url: string
    title: string
    description: string
  }>
>([])

// 预设的标题和描述
const presetTitles = [
  '美好时光',
  '精彩瞬间',
  '温馨回忆',
  '珍贵时刻',
  '难忘片段',
  '生活点滴',
  '精彩故事',
  '美好记忆',
]

const presetDescriptions = [
  '记录生活中的美好',
  '珍藏难忘的瞬间',
  '留住温馨的回忆',
  '定格珍贵的时刻',
  '收藏难忘的片段',
  '记录生活的点滴',
  '讲述精彩的故事',
  '保存美好的记忆',
]

// 获取随机展示图片
const fetchShowcasePhotos = async () => {
  try {
    const res = (await Service.getAlbumMediaRandom()) as unknown as IResData<string[]>
    if (res.code === 0 && res.data) {
      // 将URL数组转换为带有标题和描述的对象数组
      showcasePhotos.value = res.data.map((url, index) => ({
        url,
        title: presetTitles[index % presetTitles.length],
        description: presetDescriptions[index % presetDescriptions.length],
      }))
    }
  } catch (error) {
    console.error('获取展示图片失败:', error)
    uni.showToast({
      title: '获取展示图片失败',
      icon: 'none',
    })
  }
}

// 页面加载时获取展示图片
onMounted(() => {
  fetchShowcasePhotos()
})

const navigateToAlbum = () => {
  uni.navigateTo({
    url: '/pages/album/index',
  })
}

// 处理刷新
const handleRefresh = async () => {
  uni.showLoading({
    title: '刷新中...',
  })
  await fetchShowcasePhotos()
  uni.hideLoading()
}

// 控制对话气泡显示
const showSpeech = ref(false)

// 处理哆啦A梦点击事件
const handleDoraemonTap = () => {
  // 显示对话气泡
  showSpeech.value = true

  // 3秒后隐藏对话气泡
  setTimeout(() => {
    showSpeech.value = false
  }, 3000)
}

// 控制蜡笔小新对话气泡显示
const showCrayonSpeech = ref(false)

// 处理蜡笔小新点击事件
const handleCrayonTap = () => {
  // 显示对话气泡
  showCrayonSpeech.value = true

  // 3秒后隐藏对话气泡
  setTimeout(() => {
    showCrayonSpeech.value = false
  }, 3000)
}
</script>

<style lang="scss">
.home-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f6f8fd 0%, #f1f4f9 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 50% 50%, rgba(46, 134, 222, 0.05) 0%, transparent 70%);
    pointer-events: none;
  }
}

.bg-animation {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 1;

  .circle {
    position: absolute;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(46, 134, 222, 0.1), rgba(84, 160, 255, 0.1));
    animation: float 8s infinite ease-in-out;
    backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .circle-1 {
    width: 400rpx;
    height: 400rpx;
    top: -150rpx;
    right: -150rpx;
    animation-delay: 0s;
    box-shadow: 0 0 100rpx rgba(46, 134, 222, 0.1);
  }

  .circle-2 {
    width: 300rpx;
    height: 300rpx;
    bottom: 20%;
    left: -100rpx;
    animation-delay: -2s;
    box-shadow: 0 0 80rpx rgba(46, 134, 222, 0.1);
  }

  .circle-3 {
    width: 350rpx;
    height: 350rpx;
    bottom: -150rpx;
    right: 20%;
    animation-delay: -4s;
    box-shadow: 0 0 90rpx rgba(46, 134, 222, 0.1);
  }
}

.content {
  position: relative;
  z-index: 2;
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.welcome-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
  animation: fadeInUp 1s ease-out;

  .logo {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 40rpx;
    filter: drop-shadow(0 8rpx 16rpx rgba(0, 0, 0, 0.15));
    transition: transform 0.3s ease;

    &:active {
      transform: scale(0.95);
    }
  }

  .welcome-text {
    text-align: center;

    .title {
      font-size: 52rpx;
      font-weight: 700;
      color: #333;
      margin-bottom: 16rpx;
      display: block;
      text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
    }

    .subtitle {
      font-size: 40rpx;
      color: #2e86de;
      font-weight: 600;
      display: block;
      background: linear-gradient(135deg, #2e86de, #54a0ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }
}

.photo-showcase {
  margin: 40rpx 0;
  padding: 0 20rpx;
  animation: fadeIn 1s ease-out;

  .showcase-title {
    margin-bottom: 30rpx;
    padding: 0 20rpx;
    display: flex;
    align-items: center;
    position: relative;

    .title {
      font-size: 40rpx;
      font-weight: 700;
      color: #333;
      margin-bottom: 8rpx;
      display: block;
      text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
    }

    .subtitle {
      font-size: 26rpx;
      color: #666;
      display: block;
    }

    .refresh-btn {
      position: absolute;
      right: 20rpx;
      top: 50%;
      transform: translateY(-50%);
      padding: 16rpx;
      font-size: 36rpx;
      line-height: 1;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 50%;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;

      &:active {
        transform: translateY(-50%) scale(0.95);
        box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
      }
    }
  }

  .photo-swiper {
    height: 450rpx;
    border-radius: 32rpx;
    overflow: hidden;
    box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.15);
    transform: translateY(0);
    transition: transform 0.3s ease;

    &:active {
      transform: translateY(4rpx);
    }
  }

  .swiper-item {
    width: 100%;
    height: 100%;
  }

  .photo-card {
    width: 100%;
    height: 100%;
    border-radius: 32rpx;
    overflow: hidden;
    position: relative;
    animation: slideUp 0.8s ease-out forwards;
    opacity: 0;

    .photo-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }

    .photo-info {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 40rpx;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
      color: #fff;
      transform: translateY(0);
      transition: all 0.3s ease;

      .photo-title {
        font-size: 36rpx;
        font-weight: 700;
        margin-bottom: 12rpx;
        display: block;
        text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
      }

      .photo-desc {
        font-size: 26rpx;
        opacity: 0.95;
        display: block;
        text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.3);
      }
    }

    &:active {
      .photo-image {
        transform: scale(1.08);
      }
    }
  }
}

.menu-list {
  margin-top: 20rpx;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 40rpx;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 32rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);

  .menu-icon {
    width: 90rpx;
    height: 90rpx;
    background: linear-gradient(135deg, #2e86de, #54a0ff);
    border-radius: 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 24rpx;
    box-shadow: 0 8rpx 20rpx rgba(46, 134, 222, 0.2);

    .iconfont {
      font-size: 44rpx;
      color: #fff;
      text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
    }
  }

  .menu-info {
    flex: 1;

    .menu-title {
      font-size: 36rpx;
      font-weight: 700;
      color: #333;
      margin-bottom: 8rpx;
      display: block;
    }

    .menu-desc {
      font-size: 26rpx;
      color: #666;
      display: block;
    }
  }

  .icon-arrow-right {
    font-size: 36rpx;
    color: #999;
    transition: transform 0.3s ease;
  }

  &:active {
    transform: scale(0.98);
    box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.08);

    .icon-arrow-right {
      transform: translateX(4rpx);
    }
  }
}

.menu-item-hover {
  transform: scale(0.98);
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.decoration {
  position: fixed;
  bottom: 40rpx;
  right: 40rpx;
  z-index: 3;

  .floating-icon {
    position: absolute;
    font-size: 44rpx;
    animation: float 3s infinite ease-in-out;
    filter: drop-shadow(0 4rpx 8rpx rgba(0, 0, 0, 0.1));
  }

  .icon-1 {
    bottom: 0;
    right: 0;
    animation-delay: 0s;
  }

  .icon-2 {
    bottom: 70rpx;
    right: 70rpx;
    animation-delay: -1s;
  }

  .icon-3 {
    bottom: 140rpx;
    right: 20rpx;
    animation-delay: -2s;
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20rpx) rotate(5deg);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.doraemon-container {
  position: fixed;
  left: 40rpx;
  top: 140rpx;
  z-index: 10;
  width: 200rpx;
  height: 200rpx;
  animation: floatDoraemon 3s infinite ease-in-out;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  -webkit-user-select: none;

  .doraemon-image {
    width: 100%;
    height: 100%;
    filter: drop-shadow(0 4rpx 8rpx rgba(0, 0, 0, 0.2));
    -webkit-tap-highlight-color: transparent;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
  }

  .speech-bubble {
    position: absolute;
    top: -20rpx;
    left: 220rpx;
    transform: scale(0);
    background: rgba(255, 255, 255, 0.4);
    padding: 30rpx 40rpx;
    min-width: 200rpx;
    border-radius: 30rpx;
    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.05);
    opacity: 0;
    transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    pointer-events: none;
    backdrop-filter: blur(2px);
    border: 1rpx solid rgba(255, 255, 255, 0.3);
    overflow: visible;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), transparent);
      z-index: 0;
      border-radius: 30rpx;
    }

    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: -12rpx;
      transform: translateY(-50%);
      width: 24rpx;
      height: 24rpx;
      background: rgba(255, 255, 255, 0.4);
      border-radius: 4rpx;
      transform: translateY(-50%) rotate(45deg);
      border-left: 1rpx solid rgba(255, 255, 255, 0.3);
      border-bottom: 1rpx solid rgba(255, 255, 255, 0.3);
      box-shadow: -4rpx 4rpx 8rpx rgba(0, 0, 0, 0.05);
      backdrop-filter: blur(2px);
    }

    .bubble-content {
      position: relative;
      z-index: 1;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12rpx;

      .greeting {
        font-size: 40rpx;
        color: #2e86de;
        font-weight: 700;
        display: block;
        text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
        animation: bounceIn 0.5s ease-out;
      }

      .name {
        font-size: 32rpx;
        color: #666;
        font-weight: 500;
        display: block;
        text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.1);
        animation: fadeInUp 0.5s ease-out 0.2s both;
      }

      .bubble-decoration {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;

        .star {
          position: absolute;
          font-size: 28rpx;
          animation: twinkle 1.5s infinite ease-in-out;
        }

        .star-1 {
          top: 15rpx;
          left: 30rpx;
          animation-delay: 0s;
        }

        .star-2 {
          top: 25rpx;
          right: 30rpx;
          animation-delay: 0.3s;
        }

        .star-3 {
          bottom: 15rpx;
          left: 50%;
          transform: translateX(-50%);
          animation-delay: 0.6s;
        }
      }
    }

    &.show {
      transform: scale(1);
      opacity: 1;
    }
  }
}

@keyframes floatDoraemon {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-10rpx) rotate(2deg);
  }
  75% {
    transform: translateY(10rpx) rotate(-2deg);
  }
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.1);
  }
  80% {
    opacity: 1;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes twinkle {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

.crayon-container {
  position: fixed;
  left: 40rpx;
  bottom: 0rpx;
  z-index: 10;
  width: 140rpx;
  height: 140rpx;
  animation: floatCrayon 3s infinite ease-in-out;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  -webkit-user-select: none;

  .crayon-image {
    width: 100%;
    height: 100%;
    filter: drop-shadow(0 4rpx 8rpx rgba(0, 0, 0, 0.2));
    -webkit-tap-highlight-color: transparent;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
  }

  .crayon-bubble {
    position: absolute;
    top: -20rpx;
    left: 160rpx;
    transform: scale(0);
    background: rgba(255, 255, 255, 0.4);
    padding: 20rpx 30rpx;
    min-width: 180rpx;
    border-radius: 24rpx;
    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.05);
    opacity: 0;
    transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    pointer-events: none;
    backdrop-filter: blur(2px);
    border: 1rpx solid rgba(255, 255, 255, 0.3);
    overflow: visible;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), transparent);
      z-index: 0;
      border-radius: 24rpx;
    }

    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: -10rpx;
      transform: translateY(-50%);
      width: 20rpx;
      height: 20rpx;
      background: rgba(255, 255, 255, 0.4);
      border-radius: 4rpx;
      transform: translateY(-50%) rotate(45deg);
      border-left: 1rpx solid rgba(255, 255, 255, 0.3);
      border-bottom: 1rpx solid rgba(255, 255, 255, 0.3);
      box-shadow: -4rpx 4rpx 8rpx rgba(0, 0, 0, 0.05);
      backdrop-filter: blur(2px);
    }

    &.show {
      transform: scale(1);
      opacity: 1;
    }

    .bubble-content {
      position: relative;
      z-index: 1;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8rpx;

      .greeting {
        font-size: 32rpx;
        color: #ff6b6b;
        font-weight: 700;
        display: block;
        text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
        animation: bounceIn 0.5s ease-out;
      }

      .name {
        font-size: 26rpx;
        color: #666;
        font-weight: 500;
        display: block;
        text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.1);
        animation: fadeInUp 0.5s ease-out 0.2s both;
      }

      .bubble-decoration {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;

        .star {
          position: absolute;
          font-size: 24rpx;
          animation: twinkle 1.5s infinite ease-in-out;
        }

        .star-1 {
          top: 12rpx;
          left: 24rpx;
          animation-delay: 0s;
        }

        .star-2 {
          top: 20rpx;
          right: 24rpx;
          animation-delay: 0.3s;
        }

        .star-3 {
          bottom: 12rpx;
          left: 50%;
          transform: translateX(-50%);
          animation-delay: 0.6s;
        }
      }
    }
  }
}

@keyframes floatCrayon {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-6rpx) rotate(2deg);
  }
  75% {
    transform: translateY(6rpx) rotate(-2deg);
  }
}
</style>
