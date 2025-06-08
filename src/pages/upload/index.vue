<template>
  <view class="upload-page">
    <view class="upload-area" @tap="handleChooseMedia">
      <view class="upload-content">
        <text class="iconfont icon-upload"></text>
        <text class="upload-text">点击选择图片或视频</text>
        <text class="upload-tip">支持多选，最多9个文件</text>
      </view>
    </view>

    <view class="media-list" v-if="mediaList.length > 0">
      <view class="media-item" v-for="(media, index) in mediaList" :key="index">
        <image
          v-if="media.type === 'image'"
          :src="media.path"
          mode="aspectFill"
          class="media-preview"
        />
        <video v-else :src="media.path" class="media-preview" />
        <view class="media-info">
          <text class="name">{{ media.name }}</text>
          <text class="size">{{ formatSize(media.size) }}</text>
        </view>
        <view class="delete-btn" @tap.stop="handleDelete(index)">
          <text class="iconfont icon-delete"></text>
        </view>
      </view>
    </view>

    <view class="upload-options">
      <view class="option-item">
        <text class="label">压缩图片</text>
        <switch :checked="compressImage" @change="handleCompressChange" />
      </view>
      <view class="option-item">
        <text class="label">压缩视频</text>
        <switch :checked="compressVideo" @change="handleCompressChange" />
      </view>
    </view>

    <view class="upload-btn" @tap="handleUpload" :class="{ disabled: mediaList.length === 0 }">
      开始上传
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { formatSize } from '@/utils/format'
import { usePageAuth } from '@/hooks/usePageAuth'

interface MediaItem {
  path: string
  name: string
  size: number
  type: 'image' | 'video'
}

const mediaList = ref<MediaItem[]>([])
const compressImage = ref(true)
const compressVideo = ref(true)
const albumId = ref('')

usePageAuth()

// 选择媒体文件
const handleChooseMedia = async () => {
  try {
    const res = await uni.chooseMedia({
      count: 9 - mediaList.value.length,
      mediaType: ['image', 'video'],
      sourceType: ['album', 'camera'],
      sizeType: ['original', 'compressed'],
      camera: 'back',
    })

    const newMediaList = res.tempFiles.map((file) => ({
      path: file.tempFilePath,
      name: file.tempFilePath.split('/').pop() || '',
      size: file.size,
      type: file.tempFilePath.includes('image') ? 'image' : 'video',
    }))

    mediaList.value = [...mediaList.value, ...newMediaList]
  } catch (error) {
    console.error('选择媒体文件失败:', error)
  }
}

// 删除媒体文件
const handleDelete = (index: number) => {
  mediaList.value.splice(index, 1)
}

// 压缩选项变更
const handleCompressChange = (e: any) => {
  const { type, value } = e.detail
  if (type === 'image') {
    compressImage.value = value
  } else {
    compressVideo.value = value
  }
}

// 上传文件
const handleUpload = async () => {
  if (mediaList.value.length === 0) return

  try {
    uni.showLoading({
      title: '上传中...',
    })

    // TODO: 调用API上传文件
    // 1. 获取上传凭证
    // 2. 上传到存储服务
    // 3. 保存文件信息到数据库

    uni.hideLoading()
    uni.showToast({
      title: '上传成功',
      icon: 'success',
    })

    // 返回上一页
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: '上传失败',
      icon: 'none',
    })
  }
}

// 获取相册ID
onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  albumId.value = currentPage.$page?.options?.albumId || ''
})
</script>

<style lang="scss">
.upload-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 30rpx;
}

.upload-area {
  background-color: #fff;
  border-radius: 12rpx;
  height: 300rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30rpx;

  .upload-content {
    text-align: center;

    .iconfont {
      font-size: 80rpx;
      color: #999;
      margin-bottom: 20rpx;
    }

    .upload-text {
      font-size: 28rpx;
      color: #333;
      margin-bottom: 10rpx;
    }

    .upload-tip {
      font-size: 24rpx;
      color: #999;
    }
  }
}

.media-list {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;
}

.media-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #eee;

  &:last-child {
    border-bottom: none;
  }

  .media-preview {
    width: 120rpx;
    height: 120rpx;
    border-radius: 8rpx;
    margin-right: 20rpx;
  }

  .media-info {
    flex: 1;

    .name {
      font-size: 26rpx;
      color: #333;
      margin-bottom: 10rpx;
      @extend .ellipsis !optional;
    }

    .size {
      font-size: 24rpx;
      color: #999;
    }
  }

  .delete-btn {
    padding: 20rpx;

    .iconfont {
      font-size: 40rpx;
      color: #ff4d4f;
    }
  }
}

.upload-options {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;

  .option-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #eee;

    &:last-child {
      border-bottom: none;
    }

    .label {
      font-size: 28rpx;
      color: #333;
    }
  }
}

.upload-btn {
  background-color: #018d71;
  color: #fff;
  text-align: center;
  padding: 24rpx 0;
  border-radius: 12rpx;
  font-size: 32rpx;

  &.disabled {
    background-color: #ccc;
  }
}
</style>
