<template>
  <view class="album-page">
    <view class="header">
      <view class="title">我的相册</view>
      <view class="create-btn" @tap="handleCreateAlbum">
        <wd-icon name="add" size="20px" color="#ffffff"></wd-icon>
      </view>
    </view>

    <scroll-view scroll-y class="album-list" @refresherrefresh="onRefresh" refresher-enabled>
      <view class="album-grid">
        <view
          v-for="album in albums"
          :key="album.id"
          class="album-item"
          @tap="handleAlbumClick(album)"
        >
          <view class="album-cover-wrapper">
            <image
              :src="album.coverUrl || '/static/default-cover.png'"
              mode="aspectFill"
              class="album-cover"
            />
            <view class="album-stats">
              <view class="stat-item">
                <wd-icon name="image" size="14px" color="#ffffff"></wd-icon>
                <text class="count">{{ album.photoCount }}</text>
              </view>
              <view class="stat-item">
                <wd-icon name="video" size="14px" color="#ffffff"></wd-icon>
                <text class="count">{{ album.videoCount }}</text>
              </view>
            </view>
          </view>
          <view class="album-info">
            <text class="album-title">{{ album.name }}</text>
            <text class="album-desc" v-if="album.description">{{ album.description }}</text>
            <text class="update-time">{{ formatDate(album.updatedAt) }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 新建相册弹窗 -->
    <view v-if="showCreatePopup" class="popup-mask" @tap="handleCancel">
      <view class="create-popup" @tap.stop>
        <view class="popup-header">
          <text class="popup-title">新建相册</text>
          <wd-icon name="close" size="24px" color="#999999" @click="handleCancel"></wd-icon>
        </view>
        <view class="popup-content">
          <view class="input-group">
            <text class="input-label">相册名称</text>
            <input v-model="newAlbum.title" placeholder="请输入相册名称" class="input" />
          </view>
          <view class="input-group">
            <text class="input-label">相册描述</text>
            <textarea
              v-model="newAlbum.description"
              placeholder="请输入相册描述（选填）"
              class="textarea"
            />
          </view>
        </view>
        <view class="popup-footer">
          <button class="cancel-btn" @tap="handleCancel">取消</button>
          <button class="confirm-btn" @tap="handleConfirm">创建</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Service } from '@/api/services/Service'
import { formatDate } from '@/utils/date'
import { usePageAuth } from '@/hooks/usePageAuth'

interface Album {
  id: number
  name: string
  description: string
  coverUrl: string
  mediaCount: number
  updatedAt: string
  photoCount: number
  videoCount: number
  totalSize: number
  startTime: string
}

interface AlbumListResponse {
  code: number
  msg: string
  data: {
    total: number
    page: number
    limit: number
    records: Array<{
      id: number
      name: string
      description: string
      cover_img: string
      update_time: string
      photo_count: number
      video_count: number
      total_size: number
      start_time: string
    }>
  }
}

const albums = ref<Album[]>([])
const showCreatePopup = ref(false)
const newAlbum = ref({
  title: '',
  description: '',
})

usePageAuth()

// 获取相册列表
const fetchAlbums = async () => {
  try {
    const response = (await Service.getAlbumList({
      page: 1,
      limit: 20,
    })) as unknown as AlbumListResponse

    if (response?.code === 0 && response?.data?.records) {
      albums.value = response.data.records.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        coverUrl: item.cover_img || '',
        mediaCount: (Number(item.photo_count) || 0) + (Number(item.video_count) || 0),
        updatedAt: item.update_time,
        photoCount: Number(item.photo_count) || 0,
        videoCount: Number(item.video_count) || 0,
        totalSize: Number(item.total_size) || 0,
        startTime: item.start_time,
      }))
    }
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
  showCreatePopup.value = true
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
    await Service.postAlbum({
      body: {
        name: newAlbum.value.title,
        description: newAlbum.value.description,
      },
    })
    uni.showToast({
      title: '创建成功',
      icon: 'success',
    })
    showCreatePopup.value = false
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
  showCreatePopup.value = false
}

// 点击相册
const handleAlbumClick = (album: Album) => {
  uni.navigateTo({
    url: `/pages/album/detail?id=${album.id}`,
  })
}

// 下拉刷新
const onRefresh = async () => {
  await fetchAlbums()
  uni.stopPullDownRefresh()
}

onMounted(() => {
  fetchAlbums()
})
</script>

<style lang="scss">
.album-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 30rpx;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40rpx;
  padding: 0 10rpx;

  .title {
    font-size: 40rpx;
    font-weight: 600;
    color: #333;
  }

  .create-btn {
    width: 80rpx;
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #018d71, #00b894);
    color: #fff;
    border-radius: 50%;
    box-shadow: 0 4rpx 12rpx rgba(1, 141, 113, 0.2);
    transition: all 0.3s ease;

    &:active {
      transform: scale(0.95);
    }

    .iconfont {
      font-size: 40rpx;
    }
  }
}

.album-list {
  height: calc(100vh - 140rpx);
}

.album-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30rpx;
  padding-bottom: 40rpx;
}

.album-item {
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.98);
  }
}

.album-cover-wrapper {
  position: relative;
  width: 100%;
  height: 360rpx;
  overflow: hidden;

  .album-cover {
    width: 100%;
    height: 100%;
    transition: transform 0.3s ease;
  }

  .album-stats {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20rpx;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
    color: #fff;
    font-size: 24rpx;
    display: flex;
    gap: 20rpx;

    .stat-item {
      display: flex;
      align-items: center;
      gap: 8rpx;
      background: rgba(0, 0, 0, 0.3);
      padding: 6rpx 12rpx;
      border-radius: 20rpx;

      .iconfont {
        font-size: 28rpx;
      }

      .count {
        font-size: 24rpx;
      }
    }
  }
}

.album-info {
  padding: 24rpx;

  .album-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 12rpx;
    @extend .ellipsis-1 !optional;
  }

  .album-desc {
    font-size: 26rpx;
    color: #666;
    margin-bottom: 16rpx;
    @extend .ellipsis-2 !optional;
  }

  .update-time {
    font-size: 24rpx;
    color: #999;
  }
}

.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.create-popup {
  background-color: #fff;
  border-radius: 24rpx;
  width: 680rpx;
  overflow: hidden;
  animation: popup-in 0.3s ease;

  @keyframes popup-in {
    from {
      transform: scale(0.8);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  .popup-header {
    padding: 30rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1rpx solid #eee;

    .popup-title {
      font-size: 36rpx;
      font-weight: 600;
      color: #333;
    }

    .popup-close {
      font-size: 48rpx;
      color: #999;
      padding: 0 20rpx;
    }
  }

  .popup-content {
    padding: 30rpx;

    .input-group {
      margin-bottom: 30rpx;

      .input-label {
        font-size: 28rpx;
        color: #333;
        margin-bottom: 16rpx;
        display: block;
      }

      .input {
        width: 100%;
        height: 88rpx;
        background: #f8f9fa;
        border-radius: 12rpx;
        padding: 0 24rpx;
        font-size: 28rpx;
        color: #333;
      }

      .textarea {
        width: 100%;
        height: 200rpx;
        background: #f8f9fa;
        border-radius: 12rpx;
        padding: 24rpx;
        font-size: 28rpx;
        color: #333;
      }
    }
  }

  .popup-footer {
    padding: 30rpx;
    display: flex;
    gap: 20rpx;
    border-top: 1rpx solid #eee;

    button {
      flex: 1;
      height: 88rpx;
      border-radius: 12rpx;
      font-size: 32rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0;
    }

    .cancel-btn {
      background: #f8f9fa;
      color: #666;
    }

    .confirm-btn {
      background: linear-gradient(135deg, #018d71, #00b894);
      color: #fff;
    }
  }
}

// 工具类
.ellipsis-1 {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ellipsis-2 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
