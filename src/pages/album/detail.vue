<template>
  <view class="album-detail">
    <!-- 相册信息 -->
    <view class="album-info">
      <view class="info-header">
        <view class="author-info">
          <image :src="albumInfo.user?.avatar" mode="aspectFill" class="avatar" />
          <text class="username">{{ albumInfo.user?.userName || '未知用户' }}</text>
        </view>
      </view>

      <view class="info-content">
        <view class="title-section">
          <text class="title">{{ albumInfo.name }}</text>
        </view>

        <view class="stats-section">
          <view class="media-count">
            <view class="count-item">
              <wd-icon name="image" size="14px" color="#ff4757"></wd-icon>
              <text class="count">{{ albumInfo.photo_count }}</text>
            </view>
            <view class="count-item">
              <wd-icon name="video" size="14px" color="#2e86de"></wd-icon>
              <text class="count">{{ albumInfo.video_count }}</text>
            </view>
          </view>
          <text class="total-size">{{ albumInfo.total_size }} MB</text>
        </view>

        <view class="time-section">
          <text class="time-range" v-if="albumInfo.start_time">
            日期：{{ formatDateSimple(albumInfo.start_time) }}
          </text>
          <text class="create-time">创建：{{ formatDate(albumInfo.create_time) }}</text>
        </view>

        <view class="desc-section">
          <text class="description">{{ albumInfo.description }}</text>
        </view>
      </view>
    </view>

    <!-- 媒体列表 -->
    <view class="media-section">
      <!-- 顶部工具栏 -->
      <view class="top-bar">
        <view class="filter-group">
          <view class="filter-item">
            <view class="filter-options">
              <view
                v-for="item in filterTypeOptions"
                :key="item.value"
                :class="['filter-option', filterType === item.value ? 'active' : '']"
                @tap="handleFilterTypeChange(item.value)"
              >
                <wd-icon
                  :name="item.icon"
                  size="14px"
                  :color="filterType === item.value ? '#ffffff' : '#666666'"
                ></wd-icon>
                <text>{{ item.label }}</text>
              </view>
            </view>
          </view>

          <view class="filter-item">
            <view class="filter-options">
              <view
                v-for="item in imageTypeOptions"
                :key="item.value"
                :class="['filter-option', imageType === item.value ? 'active' : '']"
                @tap="handleImageTypeChange(item.value)"
              >
                <wd-icon
                  :name="item.icon"
                  size="14px"
                  :color="imageType === item.value ? '#ffffff' : '#666666'"
                ></wd-icon>
                <text>{{ item.label }}</text>
              </view>
            </view>
          </view>
        </view>

        <view class="action-group">
          <button v-if="isEditing" class="delete-btn" @tap="handleDeleteSelected">删除选定</button>
          <button class="upload-btn" @tap="handleUpload">上传</button>
          <button class="edit-btn" @tap="toggleEdit">{{ isEditing ? '完成' : '编辑' }}</button>
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
            :class="{ selected: selectedImages.includes(media.id) }"
            @tap="() => handleMediaClick(media)"
          >
            <image v-if="media.type === 0" :src="media.url" mode="aspectFill" class="media-image" />
            <view v-else class="media-video-container">
              <video
                :src="media.url"
                class="media-video"
                :poster="media.url"
                object-fit="cover"
                show-center-play-btn
                show-play-btn
                controls
                :initial-time="0"
                enable-progress-gesture
                show-fullscreen-btn
                show-progress
                enable-play-gesture
                show-mute-btn
                title="视频"
              ></video>
              <view class="media-type">
                <wd-icon name="video" size="14px" color="#ffffff"></wd-icon>
              </view>
            </view>
          </view>
        </view>
        <view class="loading" v-if="loading">加载中...</view>
        <view class="no-more" v-if="noMore">没有更多了</view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Service } from '@/api/services/Service'
import { onLoad } from '@dcloudio/uni-app'
import { formatDate, formatDateSimple } from '@/utils/date'
import type { dto_AlbumMediaAddDTO } from '@/api/models/dto_AlbumMediaAddDTO'
import type { dto_MediaMetaDTO } from '@/api/models/dto_MediaMetaDTO'

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
const isEditing = ref(false)
const selectedImages = ref<number[]>([])
const filterType = ref('all')
const imageType = ref('compressed')

// 筛选类型选项
const filterTypeOptions = [
  { label: '全部', value: 'all', icon: 'grid' },
  { label: '图片', value: 'image', icon: 'image' },
  { label: '视频', value: 'video', icon: 'video' },
]

// 图片类型选项
const imageTypeOptions = [
  { label: '全部', value: 'all', icon: 'grid' },
  { label: '压缩', value: 'compressed', icon: 'compress' },
  { label: '原图', value: 'raw', icon: 'image' },
]

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
        is_raw: imageType.value === 'raw',
        pageSize: 20,
        type: filterType.value === 'image' ? 0 : filterType.value === 'video' ? 1 : undefined,
      },
    })) as unknown as ApiResponse<{ data: MediaItem[]; cursor: string; isLast: boolean }>

    if (response?.code === 0) {
      const { data, cursor: newCursor, isLast } = response.data
      if (isLoadMore) {
        mediaList.value.push(...data)
      } else {
        mediaList.value = data
      }
      console.log('媒体列表数据:', JSON.parse(JSON.stringify(mediaList.value)))
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
  cursor.value = ''
  noMore.value = false
  await fetchMediaList()
  uni.stopPullDownRefresh()
}

// 切换编辑模式
const toggleEdit = () => {
  isEditing.value = !isEditing.value
  if (!isEditing.value) {
    selectedImages.value = []
  }
}

// 处理媒体点击
const handleMediaClick = (media: MediaItem) => {
  console.log('handleMediaClick 触发, 媒体对象:', JSON.parse(JSON.stringify(media)))
  console.log('媒体类型:', media.type)
  console.log('媒体URL:', media.url)

  if (isEditing.value) {
    const index = selectedImages.value.indexOf(media.id)
    if (index > -1) {
      selectedImages.value.splice(index, 1)
    } else {
      selectedImages.value.push(media.id)
    }
  } else {
    // 实现媒体预览
    if (media.type === 0) {
      // 图片预览
      const imageList = mediaList.value.filter((item) => item.type === 0).map((item) => item.url)
      const currentIndex = imageList.findIndex((url) => url === media.url)

      uni.previewImage({
        urls: imageList,
        current: currentIndex,
        success: () => {
          console.log('预览成功')
        },
        fail: (err) => {
          console.error('预览失败:', err)
          uni.showToast({
            title: '预览失败',
            icon: 'none',
          })
        },
      })
    } else {
      // 视频预览
      console.log('准备跳转到视频播放页，视频URL:', media.url)
      uni.navigateTo({
        url: `/pages/video/player?url=${encodeURIComponent(media.url)}`,
        success: () => {
          console.log('打开视频播放器成功')
        },
        fail: (err) => {
          console.error('打开视频播放器失败:', err)
          uni.showToast({
            title: '打开视频失败',
            icon: 'none',
          })
        },
      })
      console.log('uni.navigateTo 调用已执行')
    }
  }
}

// 处理删除选中
const handleDeleteSelected = async () => {
  if (selectedImages.value.length === 0) {
    uni.showToast({
      title: '请先选择要删除的媒体',
      icon: 'none',
    })
    return
  }

  try {
    const response = (await Service.deleteAlbumMedia({
      ids: selectedImages.value.join(','),
    })) as unknown as ApiResponse<null>

    if (response?.code === 0) {
      uni.showToast({
        title: '删除成功',
        icon: 'success',
      })
      // 从列表中移除已删除的媒体
      mediaList.value = mediaList.value.filter((media) => !selectedImages.value.includes(media.id))
      selectedImages.value = []
      // 重新获取相册信息以更新计数
      fetchAlbumInfo()
    }
  } catch (error) {
    uni.showToast({
      title: '删除失败',
      icon: 'none',
    })
  }
}

// 处理筛选类型变化
const handleFilterTypeChange = (type: string) => {
  filterType.value = type
  cursor.value = ''
  noMore.value = false
  fetchMediaList()
}

// 处理图片类型变化
const handleImageTypeChange = (type: string) => {
  imageType.value = type
  cursor.value = ''
  noMore.value = false
  fetchMediaList()
}

// 处理上传
const handleUpload = async () => {
  try {
    const chooseRes = (await uni.chooseMedia({
      count: 9,
      mediaType: ['image', 'video'],
      sourceType: ['album', 'camera'],
      sizeType: ['original', 'compressed'],
      camera: 'back',
    })) as unknown as UniApp.ChooseMediaSuccessCallbackResult

    if (!chooseRes.tempFiles || chooseRes.tempFiles.length === 0) {
      return
    }

    uni.showLoading({
      title: '上传中...',
    })

    // 批量上传文件
    const uploadPromises = chooseRes.tempFiles.map(async (file) => {
      const fileKey = `album/${albumId.value}/${Date.now()}_${file.tempFilePath.split('/').pop()}`

      // 获取预签名URL
      const presignedRes = (await Service.postCosPresignedUrl({
        data: {
          key: fileKey,
          type: 'upload',
        },
      })) as unknown as ApiResponse<{ url: string; key: string }>

      if (presignedRes.code !== 0 || !presignedRes.data) {
        throw new Error('获取上传 URL 失败')
      }

      try {
        // 读取文件内容
        const fileContent = await new Promise<ArrayBuffer>((resolve, reject) => {
          uni.getFileSystemManager().readFile({
            filePath: file.tempFilePath,
            success: (res) => resolve(res.data as ArrayBuffer),
            fail: (err) => {
              console.error('读取文件失败:', err)
              reject(new Error('读取文件失败'))
            },
          })
        })

        // 使用request直接发送文件内容
        const uploadResult = await new Promise((resolve, reject) => {
          uni.request({
            url: presignedRes.data.url,
            method: 'PUT',
            data: fileContent,
            header: {
              'Content-Type': file.tempFilePath.includes('image') ? 'image/jpeg' : 'video/mp4',
            },
            success: (res) => {
              console.log('上传响应:', res)
              if (res.statusCode >= 200 && res.statusCode < 300) {
                resolve(res)
              } else {
                reject(new Error(`上传失败: ${res.statusCode}, ${JSON.stringify(res.data)}`))
              }
            },
            fail: (err) => {
              console.error('上传请求失败:', err)
              reject(new Error(`上传失败: ${JSON.stringify(err)}`))
            },
          })
        })

        console.log('上传成功:', uploadResult)

        // 获取文件访问路径
        const downloadRes = (await Service.postCosPresignedUrl({
          data: {
            key: fileKey,
            type: 'download',
          },
        })) as unknown as ApiResponse<{ url: string; key: string }>

        if (downloadRes.code !== 0) {
          throw new Error(downloadRes.msg || '获取访问地址失败')
        }

        console.log('downloadRes:', downloadRes)

        const mediaType = file.fileType === 'image' ? 0 : 1 // 0 for image, 1 for video
        const mediaMeta: dto_MediaMetaDTO = {}
        // 小程序 chooseMedia 返回的 tempFiles[i].thumbTempFilePath 仅视频有此属性
        // if (mediaType === 1 && file.thumbTempFilePath) {
        //   mediaMeta.poster = file.thumbTempFilePath;
        // }

        return {
          url: downloadRes.data.url,
          size: file.size,
          type: mediaType,
          is_raw: false,
          meta: mediaMeta,
        } as dto_AlbumMediaAddDTO
      } catch (error) {
        console.error('单个文件上传失败:', error)
        throw error
      }
    })

    // 等待所有文件上传完成
    const uploadResults = await Promise.all(uploadPromises)

    // 保存所有文件信息到数据库
    const saveRes = (await Service.postAlbumMedia({
      body: {
        album_id: albumId.value,
        medias: uploadResults,
      },
    })) as unknown as ApiResponse<null>

    if (saveRes.code === 0) {
      uni.showToast({
        title: '上传成功',
        icon: 'success',
      })
      // 刷新列表
      fetchMediaList()
      fetchAlbumInfo()
    }
  } catch (error) {
    console.error('上传失败:', error)
    uni.showToast({
      title: '上传失败',
      icon: 'none',
    })
  } finally {
    uni.hideLoading()
  }
}
</script>

<style lang="scss">
.album-detail {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f7f7f7;
}

.album-info {
  background-color: #ffffff;
  padding: 24rpx;
  margin-bottom: 20rpx;

  .info-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;

    .author-info {
      display: flex;
      align-items: center;
      gap: 16rpx;

      .avatar {
        width: 80rpx;
        height: 80rpx;
        border-radius: 40rpx;
        border: 2rpx solid #f0f0f0;
      }

      .username {
        font-size: 28rpx;
        font-weight: 500;
        color: #333333;
      }
    }
  }

  .info-content {
    .title-section {
      margin-bottom: 24rpx;

      .title {
        font-size: 36rpx;
        font-weight: 600;
        color: #333333;
      }
    }

    .stats-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;
      padding: 16rpx 0;
      border-bottom: 2rpx solid #f5f5f5;

      .media-count {
        display: flex;
        gap: 24rpx;

        .count-item {
          display: flex;
          align-items: center;
          gap: 8rpx;

          .count {
            font-size: 26rpx;
            font-weight: 500;
          }
        }
      }

      .total-size {
        font-size: 26rpx;
        color: #666666;
      }
    }

    .time-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20rpx;
      font-size: 24rpx;

      .time-range {
        color: #576b95;
      }

      .create-time {
        color: #999999;
      }
    }

    .desc-section {
      font-size: 26rpx;
      color: #666666;
      line-height: 1.6;
      padding: 16rpx 0;
      border-top: 2rpx solid #f5f5f5;
    }
  }
}

.media-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;

  .top-bar {
    padding: 24rpx;
    border-bottom: 2rpx solid #f5f5f5;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #ffffff;
    position: sticky;
    top: 0;
    z-index: 100;

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 16rpx;
      flex: 1;
      margin-right: 24rpx;

      .filter-item {
        .filter-options {
          display: flex;
          gap: 16rpx;

          .filter-option {
            flex: 1;
            height: 64rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8rpx;
            background-color: #f7f7f7;
            border-radius: 32rpx;
            transition: all 0.3s ease;
            padding: 0 24rpx;

            text {
              font-size: 24rpx;
              color: #666666;
            }

            &.active {
              background-color: #07c160;

              text {
                color: #ffffff;
              }
            }

            &:active {
              transform: scale(0.98);
            }
          }
        }
      }
    }

    .action-group {
      display: flex;
      gap: 16rpx;

      button {
        font-size: 24rpx;
        padding: 0 32rpx;
        height: 64rpx;
        line-height: 64rpx;
        border-radius: 32rpx;
        border: none;

        &.delete-btn {
          background-color: #ff4d4f;
          color: #ffffff;
        }

        &.upload-btn {
          background-color: #2e86de;
          color: #ffffff;
        }

        &.edit-btn {
          background-color: #07c160;
          color: #ffffff;
        }

        &:active {
          transform: scale(0.98);
        }
      }
    }
  }

  .media-list {
    flex: 1;
    padding: 16rpx;

    .media-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 16rpx;

      .media-item {
        width: calc(33.33% - 11rpx);
        aspect-ratio: 1;
        position: relative;
        border-radius: 12rpx;
        overflow: hidden;
        background-color: #f7f7f7;

        &.selected {
          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border: 4rpx solid #07c160;
            border-radius: 12rpx;
            box-shadow: 0 0 20rpx rgba(7, 193, 96, 0.3);
            z-index: 1;
          }
        }

        .media-image,
        .media-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          background-color: #000000;
        }

        .media-video-container {
          width: 100%;
          height: 100%;
          position: relative;
          background-color: #000000;
        }

        .media-type {
          position: absolute;
          top: 12rpx;
          right: 12rpx;
          background-color: rgba(0, 0, 0, 0.5);
          padding: 6rpx 12rpx;
          border-radius: 20rpx;
          display: flex;
          align-items: center;
          gap: 4rpx;
          z-index: 2;
        }
      }
    }

    .loading,
    .no-more {
      text-align: center;
      padding: 32rpx;
      color: #999999;
      font-size: 24rpx;
    }
  }
}

// 添加下拉刷新样式
.refresher {
  background-color: #f7f7f7;
}

// 添加加载动画
@keyframes loading {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading {
  &::before {
    content: '';
    display: inline-block;
    width: 24rpx;
    height: 24rpx;
    border: 4rpx solid #07c160;
    border-top-color: transparent;
    border-radius: 50%;
    margin-right: 12rpx;
    animation: loading 0.8s linear infinite;
  }
}
</style>
