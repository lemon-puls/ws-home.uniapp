<template>
  <view class="video-player">
    <view class="video-container">
      <video
        id="myVideo"
        :src="videoUrl"
        class="video"
        controls
        :poster="videoUrl"
        width="100%"
        height="100%"
        object-fit="cover"
        playsinline
        x5-video-player-type="h5"
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
      ></video>
    </view>
  </view>
</template>

<script setup lang="ts">
console.log('视频播放页面组件加载')
import { ref, onMounted, onUnmounted } from 'vue'
import { onLoad, onShow, onHide } from '@dcloudio/uni-app'

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

onShow(() => {
  if (!videoContext.value) {
    videoContext.value = uni.createVideoContext('myVideo')
    console.log('onShow中获取视频上下文:', videoContext.value)
  }
  if (videoUrl.value && videoContext.value) {
    // 确保src已设置，并延迟播放以提高兼容性
    // videoContext.value.src = videoUrl.value; // 如果:src绑定有效，此处不需要显式设置
    setTimeout(() => {
      videoContext.value.play()
      console.log('onShow中显式调用 videoContext.play() in setTimeout')
    }, 100) // 100毫秒延时
  }
})

onHide(() => {
  // 页面隐藏时暂停播放
  if (videoContext.value) {
    videoContext.value.pause()
    console.log('onHide中调用 videoContext.pause()')
  }
})

onUnmounted(() => {
  // 页面卸载时停止播放
  if (videoContext.value) {
    videoContext.value.stop()
    console.log('onUnmounted中调用 videoContext.stop()')
  }
})

// 错误处理
const handleError = (err: any) => {
  console.error('视频播放错误:', err.detail)
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
  // display: flex;
  // align-items: center;
  // justify-content: center;

  .video-container {
    width: 100%;
    height: 100%;
    // display: flex;
    // align-items: center;
    // justify-content: center;
  }

  .video {
    width: 100%;
    height: 100%;
  }
}
</style>
