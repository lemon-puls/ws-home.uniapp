<template>
  <view class="video-player">
    <view class="video-container">
      <video
        id="myVideo"
        :src="videoUrl"
        class="video"
        controls
        width="100%"
        height="100%"
        object-fit="contain"
        playsinline
        x5-video-player-type="h5"
        x5-video-player-fullscreen="true"
        x5-video-orientation="portraint"
        custom-cache="false"
        show-center-play-btn
        show-play-btn
        show-progress
        enable-play-gesture
        show-fullscreen-btn
        show-mute-btn
        @error="handleError"
        @play="handlePlay"
        @pause="handlePause"
        @ended="handleEnded"
        @waiting="handleWaiting"
        @timeupdate="handleTimeUpdate"
      ></video>
    </view>
  </view>
</template>

<script setup lang="ts">
import { usePageAuth } from '@/hooks/usePageAuth'
usePageAuth()

console.log('视频播放页面组件加载')
import { ref, onMounted, onUnmounted } from 'vue'
import { onLoad, onShow, onHide } from '@dcloudio/uni-app'

const videoUrl = ref('')
const videoContext = ref<any>(null)
const isPlaying = ref(false)

onLoad((options) => {
  console.log('视频播放页接收到参数:', options)
  if (options.url) {
    videoUrl.value = decodeURIComponent(options.url)
    console.log('视频URL (onLoad):', videoUrl.value)
  } else {
    console.warn('未接收到视频URL参数')
    uni.showToast({
      title: '视频地址缺失',
      icon: 'none',
    })
  }
})

onShow(() => {
  if (!videoContext.value) {
    videoContext.value = uni.createVideoContext('myVideo')
    console.log('onShow中获取视频上下文:', videoContext.value)
  }
  if (videoUrl.value && videoContext.value) {
    console.log('尝试播放视频 (onShow)，当前URL:', videoUrl.value)
    videoContext.value.src = videoUrl.value
    setTimeout(() => {
      videoContext.value.play()
      console.log('onShow中显式调用 videoContext.play() in setTimeout')
    }, 100)
  }
})

onHide(() => {
  if (videoContext.value) {
    videoContext.value.pause()
    console.log('onHide中调用 videoContext.pause()')
  }
})

onUnmounted(() => {
  if (videoContext.value) {
    videoContext.value.stop()
    console.log('onUnmounted中调用 videoContext.stop()')
  }
})

// 错误处理
const handleError = (err: any) => {
  console.error('视频播放错误:', err.detail)
  uni.showToast({
    title: '视频播放失败: ' + (err.detail?.errMsg || '未知错误'),
    icon: 'none',
    duration: 3000,
  })
}

// 播放事件
const handlePlay = () => {
  console.log('视频开始播放')
  isPlaying.value = true
}

// 暂停事件
const handlePause = () => {
  console.log('视频暂停播放')
  isPlaying.value = false
}

// 播放结束事件
const handleEnded = () => {
  console.log('视频播放结束')
  isPlaying.value = false
}

// 缓冲事件
const handleWaiting = () => {
  console.log('视频缓冲中')
  uni.showLoading({
    title: '加载中...',
    mask: true,
  })
}

// 播放进度更新
const handleTimeUpdate = (e: any) => {
  if (isPlaying.value) {
    uni.hideLoading()
  }
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
