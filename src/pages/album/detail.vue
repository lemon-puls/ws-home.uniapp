<template>
  <view class="album-detail">
    <!-- 相册信息 -->
    <view class="album-info">
      <image :src="albumInfo.cover_img" mode="aspectFill" class="cover-image" />
      <view class="info-content">
        <text class="album-name">{{ albumInfo.name }}</text>
        <text class="album-desc" v-if="albumInfo.description">{{ albumInfo.description }}</text>
        <view class="album-stats">
          <view class="stat-item">
            <wd-icon name="image" size="14px" color="#666"></wd-icon>
            <text class="count">{{ albumInfo.photo_count }}</text>
          </view>
          <view class="stat-item">
            <wd-icon name="video" size="14px" color="#666"></wd-icon>
            <text class="count">{{ albumInfo.video_count }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 媒体列表 -->
    <scroll-view
      scroll-y
      class="media-list"
      @scrolltolower="loadMore"
      refresher-enabled
      @refresherrefresh="onRefresh"
    >
      <view class="media-grid">
        <view
          v-for="media in mediaList"
          :key="media.id"
          class="media-item"
          @tap="handleMediaClick(media)"
        >
          <image v-if="media.type === 0" :src="media.url" mode="aspectFill" class="media-image" />
          <video v-else :src="media.url" class="media-video" :poster="media.meta?.poster" />
          <view class="media-type" v-if="media.type === 1">
            <wd-icon name="video" size="14px" color="#ffffff"></wd-icon>
          </view>
        </view>
      </view>
      <view class="loading" v-if="loading">加载中...</view>
      <view class="no-more" v-if="noMore">没有更多了</view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Service } from '@/api/services/Service'
import { onLoad } from '@dcloudio/uni-app'

interface ApiResponse<T> {
  code: number
  msg: string
  data: T
}

interface AlbumInfo {
  id: number
  name: string
  description: string
  cover_img: string
  photo_count: number
  video_count: number
  total_size: number
  create_time: string
  update_time: string
  start_time: string
  user: {
    id: number
    userName: string
    avatar: string
  }
}

interface MediaItem {
  id: number
  url: string
  type: number // 0: 图片, 1: 视频
  size: number
  create_time: string
  meta?: {
    poster?: string
  }
}

const albumId = ref<number>(0)
const albumInfo = ref<AlbumInfo>({} as AlbumInfo)
const mediaList = ref<MediaItem[]>([])
const cursor = ref<string>('')
const loading = ref(false)
const noMore = ref(false)

// 获取页面参数
onLoad((options) => {
  if (options.id) {
    albumId.value = Number(options.id)
    console.log('albumId:', albumId.value)
    fetchAlbumInfo()
    fetchMediaList()
  } else {
    uni.showToast({
      title: '相册ID不存在',
      icon: 'none',
    })
  }
})

// 获取相册详情
const fetchAlbumInfo = async () => {
  try {
    const response = (await Service.getAlbum({
      id: albumId.value.toString(),
    })) as unknown as ApiResponse<AlbumInfo>

    if (response?.code === 0) {
      albumInfo.value = response.data
    }
  } catch (error) {
    uni.showToast({
      title: '获取相册信息失败',
      icon: 'none',
    })
  }
}

// 获取媒体列表
const fetchMediaList = async (isLoadMore = false) => {
  if (loading.value || (noMore.value && isLoadMore)) return

  loading.value = true
  try {
    const response = (await Service.postAlbumMediaList({
      body: {
        album_id: albumId.value,
        cursor: isLoadMore ? cursor.value : '',
        is_raw: false,
        pageSize: 20,
      },
    })) as unknown as ApiResponse<{
      data: MediaItem[]
      cursor: string
      isLast: boolean
    }>

    if (response?.code === 0) {
      const { data, cursor: newCursor, isLast } = response.data
      if (isLoadMore) {
        mediaList.value.push(...data)
      } else {
        mediaList.value = data
      }
      cursor.value = newCursor
      noMore.value = isLast
    }
  } catch (error) {
    uni.showToast({
      title: '获取媒体列表失败',
      icon: 'none',
    })
  } finally {
    loading.value = false
  }
}

// 加载更多
const loadMore = () => {
  fetchMediaList(true)
}

// 下拉刷新
const onRefresh = async () => {
  noMore.value = false
  cursor.value = ''
  await Promise.all([fetchAlbumInfo(), fetchMediaList()])
  uni.stopPullDownRefresh()
}

// 点击媒体
const handleMediaClick = (media: MediaItem) => {
  // TODO: 实现媒体预览
}
</script>

<style lang="scss">
.album-detail {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.album-info {
  background-color: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;

  .cover-image {
    width: 100%;
    height: 400rpx;
    border-radius: 16rpx;
    margin-bottom: 24rpx;
  }

  .info-content {
    .album-name {
      font-size: 36rpx;
      font-weight: 600;
      color: #333;
      margin-bottom: 16rpx;
      display: block;
    }

    .album-desc {
      font-size: 28rpx;
      color: #666;
      margin-bottom: 24rpx;
      display: block;
    }

    .album-stats {
      display: flex;
      gap: 24rpx;

      .stat-item {
        display: flex;
        align-items: center;
        gap: 8rpx;
        background: #f8f9fa;
        padding: 8rpx 16rpx;
        border-radius: 24rpx;

        .count {
          font-size: 24rpx;
          color: #666;
        }
      }
    }
  }
}

.media-list {
  height: calc(100vh - 600rpx);
  padding: 0 30rpx;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
  padding-bottom: 40rpx;
}

.media-item {
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  border-radius: 12rpx;
  overflow: hidden;
  background-color: #fff;

  .media-image,
  .media-video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .media-type {
    position: absolute;
    top: 12rpx;
    right: 12rpx;
    background: rgba(0, 0, 0, 0.5);
    padding: 6rpx 12rpx;
    border-radius: 20rpx;
  }
}

.loading,
.no-more {
  text-align: center;
  padding: 20rpx 0;
  color: #999;
  font-size: 24rpx;
}
</style>
