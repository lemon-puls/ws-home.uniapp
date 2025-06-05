<template>
  <view class="stats-page">
    <view class="stats-cards">
      <view class="stats-card">
        <view class="card-title">相册总数</view>
        <view class="card-value">{{ stats.totalAlbums }}</view>
      </view>
      <view class="stats-card">
        <view class="card-title">文件总数</view>
        <view class="card-value">{{ stats.totalMedia }}</view>
      </view>
      <view class="stats-card">
        <view class="card-title">存储空间</view>
        <view class="card-value">{{ formatSize(stats.totalSize) }}</view>
      </view>
    </view>

    <view class="stats-charts">
      <view class="chart-card">
        <view class="chart-title">文件类型分布</view>
        <view class="chart-content">
          <view class="chart-item">
            <view class="item-label">
              <view class="dot image"></view>
              <text>图片</text>
            </view>
            <view class="item-value">{{ stats.imageCount }}</view>
          </view>
          <view class="chart-item">
            <view class="item-label">
              <view class="dot video"></view>
              <text>视频</text>
            </view>
            <view class="item-value">{{ stats.videoCount }}</view>
          </view>
        </view>
      </view>

      <view class="chart-card">
        <view class="chart-title">存储空间分布</view>
        <view class="chart-content">
          <view class="chart-item">
            <view class="item-label">
              <view class="dot image"></view>
              <text>图片</text>
            </view>
            <view class="item-value">{{ formatSize(stats.imageSize) }}</view>
          </view>
          <view class="chart-item">
            <view class="item-label">
              <view class="dot video"></view>
              <text>视频</text>
            </view>
            <view class="item-value">{{ formatSize(stats.videoSize) }}</view>
          </view>
        </view>
      </view>
    </view>

    <view class="album-list">
      <view class="list-title">相册空间占用</view>
      <view class="list-content">
        <view class="album-item" v-for="album in albumStats" :key="album.id">
          <view class="album-info">
            <text class="album-name">{{ album.title }}</text>
            <text class="album-count">{{ album.mediaCount }}个文件</text>
          </view>
          <view class="album-size">{{ formatSize(album.size) }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { AlbumStats } from '@/types/album'
import { formatSize } from '@/utils/format'

interface AlbumStat {
  id: string
  title: string
  mediaCount: number
  size: number
}

const stats = ref<AlbumStats>({
  totalAlbums: 0,
  totalMedia: 0,
  totalSize: 0,
  imageCount: 0,
  videoCount: 0,
  imageSize: 0,
  videoSize: 0,
})

const albumStats = ref<AlbumStat[]>([])

// 获取统计数据
const fetchStats = async () => {
  try {
    // TODO: 调用API获取统计数据
  } catch (error) {
    uni.showToast({
      title: '获取统计数据失败',
      icon: 'none',
    })
  }
}

// 获取相册统计
const fetchAlbumStats = async () => {
  try {
    // TODO: 调用API获取相册统计
  } catch (error) {
    uni.showToast({
      title: '获取相册统计失败',
      icon: 'none',
    })
  }
}

onMounted(() => {
  fetchStats()
  fetchAlbumStats()
})
</script>

<style lang="scss">
.stats-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 30rpx;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.stats-card {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  text-align: center;

  .card-title {
    font-size: 26rpx;
    color: #666;
    margin-bottom: 10rpx;
  }

  .card-value {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
  }
}

.stats-charts {
  margin-bottom: 30rpx;
}

.chart-card {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;

  .chart-title {
    font-size: 28rpx;
    font-weight: bold;
    margin-bottom: 20rpx;
  }

  .chart-content {
    .chart-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;

      &:last-child {
        margin-bottom: 0;
      }

      .item-label {
        display: flex;
        align-items: center;

        .dot {
          width: 16rpx;
          height: 16rpx;
          border-radius: 50%;
          margin-right: 10rpx;

          &.image {
            background-color: #018d71;
          }

          &.video {
            background-color: #ff9500;
          }
        }

        text {
          font-size: 26rpx;
          color: #333;
        }
      }

      .item-value {
        font-size: 26rpx;
        color: #666;
      }
    }
  }
}

.album-list {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 30rpx;

  .list-title {
    font-size: 28rpx;
    font-weight: bold;
    margin-bottom: 20rpx;
  }

  .album-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #eee;

    &:last-child {
      border-bottom: none;
    }

    .album-info {
      .album-name {
        font-size: 26rpx;
        color: #333;
        margin-bottom: 10rpx;
      }

      .album-count {
        font-size: 24rpx;
        color: #999;
      }
    }

    .album-size {
      font-size: 26rpx;
      color: #666;
    }
  }
}
</style>
