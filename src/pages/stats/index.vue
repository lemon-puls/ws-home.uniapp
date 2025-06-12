<template>
  <view class="stats-page">
    <!-- 背景动画 -->
    <view class="bg-animation">
      <view class="circle circle-1"></view>
      <view class="circle circle-2"></view>
      <view class="circle circle-3"></view>
    </view>

    <scroll-view scroll-y class="main-scroll">
      <!-- 顶部统计卡片 -->
      <view class="stats-cards">
        <view class="stats-card" v-for="(card, index) in statsCards" :key="index">
          <view class="card-icon">
            <wd-icon :name="card.icon" size="32px" :color="card.color"></wd-icon>
          </view>
          <view class="card-content">
            <view class="card-title">{{ card.title }}</view>
            <view class="card-value">{{ card.value }}</view>
          </view>
          <view class="card-bg" :style="{ background: card.gradient }"></view>
        </view>
      </view>

      <!-- 文件类型分布图表 -->
      <view class="chart-section">
        <view class="chart-card">
          <view class="chart-header">
            <view class="chart-title">文件类型分布</view>
            <view class="chart-legend">
              <view class="legend-item">
                <view class="dot image"></view>
                <text>图片</text>
              </view>
              <view class="legend-item">
                <view class="dot video"></view>
                <text>视频</text>
              </view>
            </view>
          </view>
          <view class="chart-content">
            <view
              class="pie-chart"
              :style="{
                background: `conic-gradient(
                #018d71 0% ${imagePercentage}%,
                #ff9500 ${imagePercentage}% 100%
              )`,
              }"
            >
              <view class="pie-center">
                <text class="total-count">{{ stats.totalMedia }}</text>
              </view>
            </view>
            <view class="chart-details">
              <view class="detail-item">
                <view class="detail-label">
                  <view class="dot image"></view>
                  <text>图片</text>
                </view>
                <view class="detail-value">
                  <text class="count">{{ stats.imageCount }}</text>
                  <text class="percentage">{{ imagePercentage }}%</text>
                </view>
              </view>
              <view class="detail-item">
                <view class="detail-label">
                  <view class="dot video"></view>
                  <text>视频</text>
                </view>
                <view class="detail-value">
                  <text class="count">{{ stats.videoCount }}</text>
                  <text class="percentage">{{ videoPercentage }}%</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 存储空间分布图表 -->
        <view class="chart-card">
          <view class="chart-header">
            <view class="chart-title">存储空间分布</view>
            <view class="chart-legend">
              <view class="legend-item">
                <view class="dot image"></view>
                <text>图片</text>
              </view>
              <view class="legend-item">
                <view class="dot video"></view>
                <text>视频</text>
              </view>
            </view>
          </view>
          <view class="chart-content">
            <view
              class="pie-chart"
              :style="{
                background: `conic-gradient(
                #018d71 0% ${imageSizePercentage}%,
                #ff9500 ${imageSizePercentage}% 100%
              )`,
              }"
            >
              <view class="pie-center">
                <text class="total-count">{{ formatSize(stats.totalSize) }}</text>
              </view>
            </view>
            <view class="chart-details">
              <view class="detail-item">
                <view class="detail-label">
                  <view class="dot image"></view>
                  <text>图片</text>
                </view>
                <view class="detail-value">
                  <text class="count">{{ formatSize(stats.imageSize) }}</text>
                  <text class="percentage">{{ imageSizePercentage }}%</text>
                </view>
              </view>
              <view class="detail-item">
                <view class="detail-label">
                  <view class="dot video"></view>
                  <text>视频</text>
                </view>
                <view class="detail-value">
                  <text class="count">{{ formatSize(stats.videoSize) }}</text>
                  <text class="percentage">{{ videoSizePercentage }}%</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 相册空间占用列表 -->
      <view class="album-list">
        <view class="list-header">
          <text class="list-title">相册文件分布</text>
          <text class="list-subtitle">共 {{ stats.totalAlbums }} 个相册</text>
        </view>
        <view class="list-content">
          <view
            class="album-item"
            v-for="(album, index) in albumStats"
            :key="album.id"
            :style="{ animationDelay: index * 0.1 + 's' }"
            @tap="goToAlbumDetail(album.id)"
          >
            <view class="album-info">
              <text class="album-name">{{ album.name }}</text>
              <view class="album-meta">
                <text class="album-count">
                  {{ album.photoCount }}个图片，{{ album.videoCount }}个视频
                </text>
                <view class="album-size">{{ formatSize(album.totalSize) }}</view>
              </view>
            </view>
            <view class="progress-labels">
              <text class="progress-label image">图片 {{ formatSize(album.photoSize) }}</text>
              <text class="progress-label video">视频 {{ formatSize(album.videoSize) }}</text>
            </view>
            <view
              class="progress-bar-bg"
              :style="{
                background: `linear-gradient(90deg, #018d71 0%, #018d71 ${((album.photoSize / (album.photoSize + album.videoSize)) * 100).toFixed(2)}%, #ff9500 ${((album.photoSize / (album.photoSize + album.videoSize)) * 100).toFixed(2)}%, #ff9500 100%)`,
              }"
            ></view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { AlbumStats } from '@/types/album'
import { formatSize } from '@/utils/format'
import { usePageAuth } from '@/hooks/usePageAuth'
import { Service } from '@/api'

usePageAuth()

interface AlbumStat {
  id: number
  name: string
  photoCount: number
  videoCount: number
  photoSize: number
  videoSize: number
  totalSize: number
}

interface AlbumStatsResponse {
  totalAlbums: number
  totalPhotos: number
  totalVideos: number
  totalSize: number
  photoSize: number
  videoSize: number
  albums: AlbumStat[]
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

// 计算百分比
const imagePercentage = computed(() => {
  if (stats.value.totalMedia === 0) return 0
  return Math.round((stats.value.imageCount / stats.value.totalMedia) * 100)
})

const videoPercentage = computed(() => {
  if (stats.value.totalMedia === 0) return 0
  return Math.round((stats.value.videoCount / stats.value.totalMedia) * 100)
})

const imageSizePercentage = computed(() => {
  if (stats.value.totalSize === 0) return 0
  return Math.round((stats.value.imageSize / stats.value.totalSize) * 100)
})

const videoSizePercentage = computed(() => {
  if (stats.value.totalSize === 0) return 0
  return Math.round((stats.value.videoSize / stats.value.totalSize) * 100)
})

// 统计卡片数据
const statsCards = computed(() => [
  {
    title: '相册总数',
    value: stats.value.totalAlbums,
    icon: 'album',
    color: '#018d71',
    gradient: 'linear-gradient(135deg, rgba(1, 141, 113, 0.1), rgba(0, 184, 148, 0.1))',
  },
  {
    title: '文件总数',
    value: stats.value.totalMedia,
    icon: 'image',
    color: '#ff4757',
    gradient: 'linear-gradient(135deg, rgba(255, 71, 87, 0.1), rgba(255, 107, 129, 0.1))',
  },
  {
    title: '存储空间',
    value: formatSize(stats.value.totalSize), // 直接使用MB单位
    icon: 'info',
    color: '#2e86de',
    gradient: 'linear-gradient(135deg, rgba(46, 134, 222, 0.1), rgba(84, 160, 255, 0.1))',
  },
])

// 获取统计数据
const fetchStats = async () => {
  try {
    const res = (await Service.getAlbumStats()) as unknown as IResData<AlbumStatsResponse>
    if (res.code === 0 && res.data) {
      const data = res.data
      stats.value = {
        totalAlbums: data.totalAlbums,
        totalMedia: data.totalPhotos + data.totalVideos,
        totalSize: data.totalSize, // 直接使用MB单位
        imageCount: data.totalPhotos,
        videoCount: data.totalVideos,
        imageSize: data.photoSize, // 直接使用MB单位
        videoSize: data.videoSize, // 直接使用MB单位
      }
      albumStats.value = data.albums
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    uni.showToast({
      title: '获取统计数据失败',
      icon: 'none',
    })
  }
}

const goToAlbumDetail = (id: number) => {
  uni.navigateTo({
    url: `/pages/album/detail?id=${id}`,
  })
}

onMounted(() => {
  fetchStats()
})
</script>

<style lang="scss">
.stats-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f6f8fd 0%, #f1f4f9 100%);
  position: relative;
  overflow: hidden;
}

.bg-animation {
  position: fixed;
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
    width: 200rpx;
    height: 200rpx;
    top: -50rpx;
    right: -50rpx;
    animation-delay: 0s;
  }

  .circle-2 {
    width: 150rpx;
    height: 150rpx;
    bottom: 20%;
    left: -30rpx;
    animation-delay: -2s;
  }

  .circle-3 {
    width: 180rpx;
    height: 180rpx;
    bottom: -50rpx;
    right: 15%;
    animation-delay: -4s;
  }
}

.main-scroll {
  position: relative;
  z-index: 2;
  height: 100vh;
  padding: 20rpx;
  box-sizing: border-box;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15rpx;
  margin-bottom: 20rpx;
}

.stats-card {
  position: relative;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20rpx;
  padding: 20rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);

  .card-icon {
    margin-bottom: 12rpx;
  }

  .card-content {
    position: relative;
    z-index: 1;
  }

  .card-title {
    font-size: 24rpx;
    color: #666;
    margin-bottom: 8rpx;
  }

  .card-value {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }

  .card-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0.5;
    z-index: 0;
  }
}

.chart-section {
  margin-bottom: 20rpx;
}

.chart-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20rpx;
  padding: 20rpx;
  margin-bottom: 15rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;

    .chart-title {
      font-size: 28rpx;
      font-weight: bold;
      color: #333;
    }

    .chart-legend {
      display: flex;
      gap: 15rpx;

      .legend-item {
        display: flex;
        align-items: center;
        gap: 6rpx;

        .dot {
          width: 12rpx;
          height: 12rpx;
          border-radius: 50%;

          &.image {
            background: linear-gradient(135deg, #018d71, #00b894);
          }

          &.video {
            background: linear-gradient(135deg, #ff9500, #ffb142);
          }
        }

        text {
          font-size: 22rpx;
          color: #666;
        }
      }
    }
  }

  .chart-content {
    .pie-chart {
      position: relative;
      width: 240rpx;
      height: 240rpx;
      margin: 0 auto 20rpx;
      border-radius: 50%;
      background: #f5f5f5;

      .pie-center {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100rpx;
        height: 100rpx;
        background: #fff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
        z-index: 2;

        .total-count {
          font-size: 20rpx;
          font-weight: bold;
          color: #333;
          white-space: nowrap;
          text-align: center;
          width: 100%;
        }

        .total-label {
          font-size: 22rpx;
          color: #666;
        }
      }
    }

    .chart-details {
      .detail-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15rpx;

        &:last-child {
          margin-bottom: 0;
        }

        .detail-label {
          display: flex;
          align-items: center;
          gap: 6rpx;

          .dot {
            width: 12rpx;
            height: 12rpx;
            border-radius: 50%;

            &.image {
              background: linear-gradient(135deg, #018d71, #00b894);
            }

            &.video {
              background: linear-gradient(135deg, #ff9500, #ffb142);
            }
          }

          text {
            font-size: 24rpx;
            color: #333;
          }
        }

        .detail-value {
          display: flex;
          align-items: center;
          gap: 10rpx;

          .count {
            font-size: 24rpx;
            font-weight: bold;
            color: #333;
          }

          .percentage {
            font-size: 22rpx;
            color: #666;
          }
        }
      }
    }

    .bar-chart {
      .bar-group {
        margin-bottom: 20rpx;

        &:last-child {
          margin-bottom: 0;
        }

        .bar-label {
          font-size: 24rpx;
          color: #333;
          margin-bottom: 10rpx;
        }

        .bar-container {
          height: 36rpx;
          background: #f5f5f5;
          border-radius: 18rpx;
          overflow: hidden;

          .bar {
            height: 100%;
            border-radius: 18rpx;
            display: flex;
            align-items: center;
            padding: 0 15rpx;
            transition: width 0.6s ease-out;

            &.image {
              background: linear-gradient(135deg, #018d71, #00b894);
            }

            &.video {
              background: linear-gradient(135deg, #ff9500, #ffb142);
            }

            .bar-value {
              color: #fff;
              font-size: 22rpx;
              font-weight: 500;
            }
          }
        }
      }
    }
  }
}

.album-list {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20rpx;
  padding: 20rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);

  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;

    .list-title {
      font-size: 28rpx;
      font-weight: bold;
      color: #333;
    }

    .list-subtitle {
      font-size: 22rpx;
      color: #666;
    }
  }

  .album-item {
    display: flex;
    flex-direction: column;
    padding: 20rpx 24rpx 16rpx 24rpx;
    background: #fff;
    border-radius: 16rpx;
    margin-bottom: 18rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
  }

  .album-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .album-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .progress-labels {
    display: flex;
    justify-content: space-between;
    font-size: 20rpx;
    margin: 8rpx 0 4rpx 0;
    padding: 0 2rpx;
  }

  .progress-bar-bg {
    width: 100%;
    height: 12rpx;
    border-radius: 8rpx;
    position: relative;
    overflow: hidden;
    margin-bottom: 8rpx;
  }

  .album-size {
    font-size: 24rpx;
    color: #666;
    margin-left: 24rpx;
    white-space: nowrap;
  }

  .album-name {
    font-size: 28rpx;
    font-weight: bold;
    color: #222;
    margin-right: 16rpx;
  }

  .album-count {
    font-size: 18rpx;
    color: #888;
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15rpx);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
