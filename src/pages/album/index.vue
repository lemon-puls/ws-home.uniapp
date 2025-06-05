<template>
  <view class="album-page">
    <view class="header">
      <view class="title">我的相册</view>
      <view class="create-btn" @tap="handleCreateAlbum">
        <text class="iconfont icon-add"></text>
        <text>新建相册</text>
      </view>
    </view>

    <scroll-view scroll-y class="album-list">
      <view class="album-grid">
        <view
          v-for="album in albums"
          :key="album.id"
          class="album-item"
          @tap="handleAlbumClick(album)"
        >
          <image
            :src="album.coverUrl || '/static/default-cover.png'"
            mode="aspectFill"
            class="album-cover"
          />
          <view class="album-info">
            <text class="album-title">{{ album.title }}</text>
            <text class="album-desc">{{ album.description }}</text>
            <view class="album-meta">
              <text class="media-count">{{ album.mediaCount }}个文件</text>
              <text class="update-time">{{ formatDate(album.updatedAt) }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 新建相册弹窗 -->
    <uni-popup ref="createPopup" type="center">
      <view class="create-popup">
        <view class="popup-title">新建相册</view>
        <input v-model="newAlbum.title" placeholder="请输入相册名称" class="input" />
        <textarea v-model="newAlbum.description" placeholder="请输入相册描述" class="textarea" />
        <view class="popup-btns">
          <button @tap="handleCancel">取消</button>
          <button @tap="handleConfirm" type="primary">确定</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Album } from '@/types/album'
import { formatDate } from '@/utils/date'

const albums = ref<Album[]>([])
const createPopup = ref()
const newAlbum = ref({
  title: '',
  description: '',
})

// 获取相册列表
const fetchAlbums = async () => {
  try {
    // TODO: 调用API获取相册列表
    albums.value = []
  } catch (error) {
    uni.showToast({
      title: '获取相册列表失败',
      icon: 'none',
    })
  }
}

// 创建相册
const handleCreateAlbum = () => {
  newAlbum.value = {
    title: '',
    description: '',
  }
  createPopup.value.open()
}

// 确认创建
const handleConfirm = async () => {
  if (!newAlbum.value.title) {
    uni.showToast({
      title: '请输入相册名称',
      icon: 'none',
    })
    return
  }

  try {
    // TODO: 调用API创建相册
    createPopup.value.close()
    fetchAlbums()
  } catch (error) {
    uni.showToast({
      title: '创建相册失败',
      icon: 'none',
    })
  }
}

// 取消创建
const handleCancel = () => {
  createPopup.value.close()
}

// 点击相册
const handleAlbumClick = (album: Album) => {
  uni.navigateTo({
    url: `/pages/album/detail?id=${album.id}`,
  })
}

onMounted(() => {
  fetchAlbums()
})
</script>

<style lang="scss">
.album-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;

  .title {
    font-size: 36rpx;
    font-weight: bold;
  }

  .create-btn {
    display: flex;
    align-items: center;
    padding: 10rpx 20rpx;
    background-color: #018d71;
    color: #fff;
    border-radius: 8rpx;

    .iconfont {
      margin-right: 10rpx;
    }
  }
}

.album-list {
  height: calc(100vh - 120rpx);
}

.album-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  padding-bottom: 40rpx;
}

.album-item {
  background-color: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.album-cover {
  width: 100%;
  height: 300rpx;
}

.album-info {
  padding: 20rpx;

  .album-title {
    font-size: 28rpx;
    font-weight: bold;
    margin-bottom: 10rpx;
  }

  .album-desc {
    font-size: 24rpx;
    color: #666;
    margin-bottom: 10rpx;
    @extend .ellipsis-2 !optional;
  }

  .album-meta {
    display: flex;
    justify-content: space-between;
    font-size: 22rpx;
    color: #999;

    .media-count {
      margin-right: 20rpx;
    }
  }
}

.create-popup {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  width: 600rpx;

  .popup-title {
    font-size: 32rpx;
    font-weight: bold;
    text-align: center;
    margin-bottom: 30rpx;
  }

  .input {
    border: 1rpx solid #eee;
    border-radius: 8rpx;
    padding: 20rpx;
    margin-bottom: 20rpx;
  }

  .textarea {
    border: 1rpx solid #eee;
    border-radius: 8rpx;
    padding: 20rpx;
    height: 200rpx;
    margin-bottom: 30rpx;
  }

  .popup-btns {
    display: flex;
    justify-content: space-between;

    button {
      width: 45%;
      margin: 0;
    }
  }
}
</style>
