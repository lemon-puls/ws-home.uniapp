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
          <text class="subtitle">我的相册空间</text>
        </view>
      </view>

      <!-- 图片展示区域 -->
      <view class="photo-showcase">
        <view class="showcase-title">
          <text class="title">精选回忆</text>
          <text class="subtitle">记录美好瞬间</text>
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
              <image :src="photo.url" mode="aspectFill" class="photo-image" />
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
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// 展示图片数据
const showcasePhotos = ref([
  {
    url: '/static/showcase/photo1.jpg',
    title: '春日花语',
    description: '记录春天的美好时光',
  },
  {
    url: '/static/showcase/photo2.jpg',
    title: '夏日海滩',
    description: '阳光、沙滩、海浪',
  },
  {
    url: '/static/showcase/photo3.jpg',
    title: '秋日落叶',
    description: '金黄的季节',
  },
  {
    url: '/static/showcase/photo4.jpg',
    title: '冬日雪景',
    description: '银装素裹的世界',
  },
])

const navigateToAlbum = () => {
  uni.navigateTo({
    url: '/pages/album/index',
  })
}
</script>

<style lang="scss">
.home-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f6f8fd 0%, #f1f4f9 100%);
  position: relative;
  overflow: hidden;
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
    background: linear-gradient(135deg, rgba(1, 141, 113, 0.1), rgba(0, 184, 148, 0.1));
    animation: float 8s infinite ease-in-out;
  }

  .circle-1 {
    width: 300rpx;
    height: 300rpx;
    top: -100rpx;
    right: -100rpx;
    animation-delay: 0s;
  }

  .circle-2 {
    width: 200rpx;
    height: 200rpx;
    bottom: 20%;
    left: -50rpx;
    animation-delay: -2s;
  }

  .circle-3 {
    width: 250rpx;
    height: 250rpx;
    bottom: -100rpx;
    right: 20%;
    animation-delay: -4s;
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
    width: 180rpx;
    height: 180rpx;
    margin-bottom: 40rpx;
    filter: drop-shadow(0 4rpx 8rpx rgba(0, 0, 0, 0.1));
  }

  .welcome-text {
    text-align: center;

    .title {
      font-size: 48rpx;
      font-weight: 600;
      color: #333;
      margin-bottom: 16rpx;
      display: block;
    }

    .subtitle {
      font-size: 36rpx;
      color: #018d71;
      font-weight: 500;
      display: block;
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

    .title {
      font-size: 36rpx;
      font-weight: 600;
      color: #333;
      margin-bottom: 8rpx;
      display: block;
    }

    .subtitle {
      font-size: 24rpx;
      color: #666;
      display: block;
    }
  }

  .photo-swiper {
    height: 400rpx;
    border-radius: 24rpx;
    overflow: hidden;
    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
  }

  .swiper-item {
    padding: 10rpx;
  }

  .photo-card {
    width: 100%;
    height: 100%;
    border-radius: 20rpx;
    overflow: hidden;
    position: relative;
    animation: slideUp 0.8s ease-out forwards;
    opacity: 0;

    .photo-image {
      width: 100%;
      height: 100%;
      transition: transform 0.3s ease;
    }

    .photo-info {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 30rpx;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
      color: #fff;
      transform: translateY(100%);
      transition: transform 0.3s ease;

      .photo-title {
        font-size: 32rpx;
        font-weight: 600;
        margin-bottom: 8rpx;
        display: block;
      }

      .photo-desc {
        font-size: 24rpx;
        opacity: 0.9;
        display: block;
      }
    }

    &:hover {
      .photo-image {
        transform: scale(1.05);
      }

      .photo-info {
        transform: translateY(0);
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
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 24rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;

  .menu-icon {
    width: 80rpx;
    height: 80rpx;
    background: linear-gradient(135deg, #018d71, #00b894);
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 24rpx;

    .iconfont {
      font-size: 40rpx;
      color: #fff;
    }
  }

  .menu-info {
    flex: 1;

    .menu-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
      margin-bottom: 8rpx;
      display: block;
    }

    .menu-desc {
      font-size: 24rpx;
      color: #666;
      display: block;
    }
  }

  .icon-arrow-right {
    font-size: 32rpx;
    color: #999;
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
    font-size: 40rpx;
    animation: float 3s infinite ease-in-out;
  }

  .icon-1 {
    bottom: 0;
    right: 0;
    animation-delay: 0s;
  }

  .icon-2 {
    bottom: 60rpx;
    right: 60rpx;
    animation-delay: -1s;
  }

  .icon-3 {
    bottom: 120rpx;
    right: 20rpx;
    animation-delay: -2s;
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

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30rpx);
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
</style>
