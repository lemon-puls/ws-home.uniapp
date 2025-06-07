<template>
  <view class="video-player">
    <view class="video-container">
      <video
        id="myVideo"
        :src="videoUrl"
        class="video"
        controls
        autoplay
        show-center-play-btn
        show-fullscreen-btn
        show-play-btn
        show-progress
        object-fit="contain"
        enable-progress-gesture
        enable-play-gesture
        show-mute-btn
        @error="handleError"
        @play="handlePlay"
        @pause="handlePause"
        @ended="handleEnded"
      ></video>
    </view>
  </view>
</template>

<script setup lang="ts">
console.log('视频播放页面组件加载')
import { ref, onMounted, onUnmounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const videoUrl = ref('')
const videoContext = ref<any>(null)

onLoad((options) => {
  console.log('视频播放页接收到参数:', options)
  if (options.url) {
    videoUrl.value = decodeURIComponent(options.url)
    console.log('视频URL:', videoUrl.value)
  } else {
    console.warn('未接收到视频URL参数')
    uni.showToast({
      title: '视频地址缺失',
      icon: 'none',
    })
  }
})

onMounted(() => {
  // 获取视频上下文
  videoContext.value = uni.createVideoContext('myVideo')
  console.log('视频上下文:', videoContext.value)
})

onUnmounted(() => {
  // 页面卸载时停止播放
  if (videoContext.value) {
    videoContext.value.stop()
  }
})

// 错误处理
const handleError = (err: any) => {
  console.error('视频播放错误:', err)
  uni.showToast({
    title: '视频播放失败',
    icon: 'none',
  })
}

// 播放事件
const handlePlay = () => {
  console.log('视频开始播放')
}

// 暂停事件
const handlePause = () => {
  console.log('视频暂停播放')
}

// 播放结束事件
const handleEnded = () => {
  console.log('视频播放结束')
  // 可以选择自动返回上一页
  // uni.navigateBack()
}
</script>

<style lang="scss">
.video-player {
  width: 100vw;
  height: 100vh;
  background-color: #000000;
  display: flex;
  align-items: center;
  justify-content: center;

  .video-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .video {
    width: 100%;
    height: 100%;
  }
}
</style>
