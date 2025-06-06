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
  <view class="content">
    <image class="logo" src="/static/logo.png" />
    <view class="text-area">
      <text class="title">{{ title }}</text>
    </view>
    <view class="menu-list">
      <view class="menu-item" @tap="navigateToAlbum">
        <text class="iconfont icon-album"></text>
        <text>我的相册</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const title = ref('Hello')

const navigateToAlbum = () => {
  uni.navigateTo({
    url: '/pages/album/index',
  })
}
</script>

<style lang="scss">
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.logo {
  height: 200rpx;
  width: 200rpx;
  margin-top: 200rpx;
  margin-bottom: 50rpx;
}

.text-area {
  display: flex;
  justify-content: center;
  margin-bottom: 50rpx;
}

.title {
  font-size: 36rpx;
  color: #8f8f94;
}

.menu-list {
  width: 100%;
  padding: 0 40rpx;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background-color: #fff;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

  .iconfont {
    font-size: 40rpx;
    margin-right: 20rpx;
    color: #018d71;
  }

  text {
    font-size: 32rpx;
    color: #333;
  }
}
</style>
