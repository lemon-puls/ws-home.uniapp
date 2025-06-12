<template>
  <view class="album-page">
    <!-- 背景动画 -->
    <view class="bg-animation">
      <view class="circle circle-1"></view>
      <view class="circle circle-2"></view>
      <view class="circle circle-3"></view>
    </view>

    <view class="header">
      <view class="title-wrapper">
        <text class="title">我的相册</text>
        <text class="subtitle">记录美好时光</text>
      </view>
      <view class="create-btn" @tap="handleCreateAlbum" hover-class="btn-hover">
        <wd-icon name="add" size="20px" color="#ffffff"></wd-icon>
      </view>
    </view>

    <scroll-view
      scroll-y
      class="album-list"
      @refresherrefresh="onRefresh"
      refresher-enabled
      @scrolltolower="onScrollToLower"
    >
      <view class="album-grid">
        <view
          v-for="(album, index) in albums"
          :key="album.id"
          class="album-item"
          @tap="handleAlbumClick(album)"
          @longpress="handleLongPress(album)"
          :style="{ animationDelay: index * 0.1 + 's' }"
        >
          <view class="album-cover-wrapper">
            <image
              :src="album.coverUrl || '/static/default-cover.png'"
              mode="aspectFill"
              class="album-cover"
            />
            <view class="album-stats">
              <view class="stats-left">
                <view class="stat-item">
                  <wd-icon name="image" size="14px" color="#ffffff"></wd-icon>
                  <text class="count">{{ album.photoCount }}</text>
                </view>
                <view class="stat-item">
                  <wd-icon name="video" size="14px" color="#ffffff"></wd-icon>
                  <text class="count">{{ album.videoCount }}</text>
                </view>
              </view>
              <view class="stat-item">
                <wd-icon name="info" size="14px" color="#ffffff"></wd-icon>
                <text class="count">{{ formatSize(album.totalSize) }}</text>
              </view>
            </view>
            <view class="album-overlay">
              <text class="view-more">查看详情</text>
            </view>
          </view>
          <view class="album-info">
            <text class="album-title">{{ album.name }}</text>
            <text class="album-desc" v-if="album.description">{{ album.description }}</text>
            <view class="album-footer">
              <text class="update-time">{{ formatDate(album.updatedAt) }}</text>
            </view>
          </view>
        </view>
      </view>
      <!-- 底部加载状态 -->
      <view class="load-more">
        <view v-if="isLoading" class="loading">
          <wd-icon name="loading" size="24px" color="#999999"></wd-icon>
          <text>加载中...</text>
        </view>
        <view v-else-if="!hasMore && albums.length > 0" class="no-more">
          <text>没有更多了</text>
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

    <!-- 操作菜单弹窗 -->
    <view v-if="showActionMenu" class="action-menu-mask" @tap="closeActionMenu">
      <view class="action-menu" :class="{ 'menu-show': showActionMenu }" @tap.stop>
        <view class="menu-item" @tap="handleEdit">
          <wd-icon name="edit" size="24px" color="#2e86de"></wd-icon>
          <text>编辑相册</text>
        </view>
        <view class="menu-item delete" @tap="handleDelete">
          <wd-icon name="delete" size="24px" color="#ff4d4f"></wd-icon>
          <text>删除相册</text>
        </view>
      </view>
    </view>

    <!-- 编辑相册弹窗 -->
    <view v-if="showEditPopup" class="popup-mask" @tap="closeEditPopup">
      <view class="create-popup" @tap.stop>
        <view class="popup-header">
          <text class="popup-title">编辑相册</text>
          <wd-icon name="close" size="24px" color="#999999" @click="closeEditPopup"></wd-icon>
        </view>
        <view class="popup-content">
          <view class="input-group">
            <text class="input-label">相册名称</text>
            <input v-model="editAlbum.title" placeholder="请输入相册名称" class="input" />
          </view>
          <view class="input-group">
            <text class="input-label">相册描述</text>
            <textarea
              v-model="editAlbum.description"
              placeholder="请输入相册描述（选填）"
              class="textarea"
            />
          </view>
        </view>
        <view class="popup-footer">
          <button class="cancel-btn" @tap="closeEditPopup">取消</button>
          <button class="confirm-btn" @tap="confirmEdit">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Service } from '@/api/services/Service'
import { formatDate } from '@/utils/date'
import { usePageAuth } from '@/hooks/usePageAuth'
import { formatSize } from '../../utils/format'

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

// 添加分页相关状态
const currentPage = ref(1)
const pageSize = ref(20)
const hasMore = ref(true)
const isLoading = ref(false)

const showActionMenu = ref(false)
const showEditPopup = ref(false)
const currentAlbum = ref<Album | null>(null)
const editAlbum = ref({
  title: '',
  description: '',
})

usePageAuth()

// 获取相册列表
const fetchAlbums = async (isLoadMore = false) => {
  if (isLoading.value || (!isLoadMore && !hasMore.value)) return

  try {
    isLoading.value = true
    const response = (await Service.getAlbumList({
      page: currentPage.value,
      limit: pageSize.value,
    })) as unknown as AlbumListResponse

    if (response?.code === 0 && response?.data?.records) {
      const newAlbums = response.data.records.map((item) => ({
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

      if (isLoadMore) {
        albums.value = [...albums.value, ...newAlbums]
      } else {
        albums.value = newAlbums
      }

      // 判断是否还有更多数据
      hasMore.value = newAlbums.length === pageSize.value
      if (hasMore.value) {
        currentPage.value++
      }
    }
  } catch (error) {
    uni.showToast({
      title: '获取相册列表失败',
      icon: 'none',
    })
  } finally {
    isLoading.value = false
  }
}

// 重置列表
const resetList = () => {
  currentPage.value = 1
  hasMore.value = true
  albums.value = []
  fetchAlbums()
}

// 创建相册
const handleCreateAlbum = () => {
  uni.navigateTo({
    url: '/pages/album/edit',
  })
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
  resetList()
  uni.stopPullDownRefresh()
}

// 滚动到底部加载更多
const onScrollToLower = () => {
  if (hasMore.value && !isLoading.value) {
    fetchAlbums(true)
  }
}

// 长按相册
const handleLongPress = (album: Album) => {
  currentAlbum.value = album
  showActionMenu.value = true
}

// 关闭操作菜单
const closeActionMenu = () => {
  showActionMenu.value = false
  currentAlbum.value = null
}

// 处理编辑
const handleEdit = () => {
  if (!currentAlbum.value) return
  uni.navigateTo({
    url: `/pages/album/edit?id=${currentAlbum.value.id}`,
  })
  closeActionMenu()
}

// 关闭编辑弹窗
const closeEditPopup = () => {
  showEditPopup.value = false
  editAlbum.value = {
    title: '',
    description: '',
  }
}

// 确认编辑
const confirmEdit = async () => {
  if (!currentAlbum.value || !editAlbum.value.title) {
    uni.showToast({
      title: '请输入相册名称',
      icon: 'none',
    })
    return
  }

  try {
    await Service.putAlbum({
      id: currentAlbum.value.id,
      body: {
        name: editAlbum.value.title,
        description: editAlbum.value.description,
      },
    })
    uni.showToast({
      title: '修改成功',
      icon: 'success',
    })
    closeEditPopup()
    fetchAlbums()
  } catch (error) {
    uni.showToast({
      title: '修改相册失败',
      icon: 'none',
    })
  }
}

// 处理删除
const handleDelete = () => {
  if (!currentAlbum.value) return
  uni.showModal({
    title: '确认删除',
    content: '删除后无法恢复，是否确认删除？',
    confirmColor: '#ff4d4f',
    success: async (res) => {
      if (res.confirm) {
        try {
          await Service.deleteAlbum({
            id: currentAlbum.value!.id,
          })
          uni.showToast({
            title: '删除成功',
            icon: 'success',
          })
          closeActionMenu()
          resetList()
        } catch (error) {
          uni.showToast({
            title: '删除相册失败',
            icon: 'none',
          })
        }
      }
    },
  })
}

// 格式化文件大小
// const formatSize = (size: number) => {
//   if (size < 1024) {
//     return size + 'B'
//   } else if (size < 1024 * 1024) {
//     return (size / 1024).toFixed(1) + 'KB'
//   } else if (size < 1024 * 1024 * 1024) {
//     return (size / (1024 * 1024)).toFixed(1) + 'MB'
//   } else {
//     return (size / (1024 * 1024 * 1024)).toFixed(1) + 'GB'
//   }
// }

onMounted(() => {
  fetchAlbums()
  // 监听刷新事件
  uni.$on('refreshAlbumList', () => {
    resetList()
  })
})

// 在组件卸载时移除事件监听
onUnmounted(() => {
  uni.$off('refreshAlbumList')
})
</script>

<style lang="scss">
.album-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f6f8fd 0%, #f1f4f9 100%);
  padding: 30rpx;
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
    background: linear-gradient(135deg, rgba(46, 134, 222, 0.1), rgba(84, 160, 255, 0.1));
    animation: float 8s infinite ease-in-out;
  }

  .circle-1 {
    width: 300rpx;
    height: 300rpx;
    top: -100rpx;
    right: -100rpx;
    animation-delay: 0s;
  }

  .circle-2 {
    width: 200rpx;
    height: 200rpx;
    bottom: 20%;
    left: -50rpx;
    animation-delay: -2s;
  }

  .circle-3 {
    width: 250rpx;
    height: 250rpx;
    bottom: -100rpx;
    right: 20%;
    animation-delay: -4s;
  }
}

.header {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40rpx;
  padding: 0 10rpx;

  .title-wrapper {
    .title {
      font-size: 40rpx;
      font-weight: 600;
      color: #333;
      display: block;
    }

    .subtitle {
      font-size: 24rpx;
      color: #666;
      margin-top: 8rpx;
      display: block;
    }
  }

  .create-btn {
    width: 80rpx;
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #2e86de, #54a0ff);
    color: #fff;
    border-radius: 50%;
    box-shadow: 0 4rpx 12rpx rgba(46, 134, 222, 0.2);
    transition: all 0.3s ease;
  }

  .btn-hover {
    transform: scale(0.95);
    box-shadow: 0 2rpx 8rpx rgba(46, 134, 222, 0.15);
  }
}

.album-list {
  position: relative;
  z-index: 2;
  height: calc(100vh - 180rpx);
}

.album-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30rpx;
  padding-bottom: 40rpx;
}

.album-item {
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  animation: slideUp 0.6s ease-out forwards;
  opacity: 0;

  &:active {
    transform: scale(0.98);

    .album-cover {
      transform: scale(1.05);
    }

    .album-overlay {
      opacity: 1;
    }
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
    transition: transform 0.5s ease;
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
    justify-content: space-between;
    align-items: center;
    transform: translateY(0);
    transition: transform 0.3s ease;

    .stats-left {
      display: flex;
      gap: 20rpx;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 8rpx;
      background: rgba(0, 0, 0, 0.3);
      padding: 6rpx 12rpx;
      border-radius: 20rpx;
      backdrop-filter: blur(4px);

      .count {
        font-size: 24rpx;
      }
    }
  }

  .album-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;

    .view-more {
      color: #fff;
      font-size: 28rpx;
      padding: 12rpx 24rpx;
      border: 2rpx solid #fff;
      border-radius: 30rpx;
      backdrop-filter: blur(4px);
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

  .album-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .update-time {
      font-size: 24rpx;
      color: #999;
    }
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
      background: linear-gradient(135deg, #2e86de, #54a0ff);
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

.load-more {
  padding: 30rpx 0;
  text-align: center;

  .loading,
  .no-more {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10rpx;
    color: #999999;
    font-size: 24rpx;
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20rpx);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.action-menu-mask {
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
  animation: fadeIn 0.3s ease;
}

.action-menu {
  background-color: #fff;
  border-radius: 24rpx;
  width: 400rpx;
  overflow: hidden;
  transform: scale(0.8);
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &.menu-show {
    transform: scale(1);
    opacity: 1;
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 20rpx;
    padding: 30rpx;
    font-size: 32rpx;
    color: #333;
    transition: all 0.3s ease;

    &:active {
      background-color: #f5f5f5;
    }

    &.delete {
      color: #ff4d4f;
      border-top: 1rpx solid #eee;
    }

    text {
      flex: 1;
    }

    .wd-icon {
      color: #2e86de;
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
