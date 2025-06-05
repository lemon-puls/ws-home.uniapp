<template>
  <view class="album-detail">
    <view class="header">
      <view class="album-info">
        <image
          :src="album.coverUrl || '/static/default-cover.png'"
          mode="aspectFill"
          class="cover"
        />
        <view class="info">
          <text class="title">{{ album.title }}</text>
          <text class="desc">{{ album.description }}</text>
          <view class="meta">
            <text class="count">{{ album.mediaCount }}个文件</text>
            <text class="time">更新于 {{ formatDate(album.updatedAt) }}</text>
          </view>
        </view>
      </view>
      <view class="actions">
        <button class="action-btn" @tap="handleEdit">
          <text class="iconfont icon-edit"></text>
          <text>编辑</text>
        </button>
        <button class="action-btn" @tap="handleUpload">
          <text class="iconfont icon-upload"></text>
          <text>上传</text>
        </button>
      </view>
    </view>

    <view class="filter-bar">
      <view
        class="filter-item"
        :class="{ active: currentType === 'all' }"
        @tap="handleTypeFilter('all')"
      >
        全部
      </view>
      <view
        class="filter-item"
        :class="{ active: currentType === 'image' }"
        @tap="handleTypeFilter('image')"
      >
        图片
      </view>
      <view
        class="filter-item"
        :class="{ active: currentType === 'video' }"
        @tap="handleTypeFilter('video')"
      >
        视频
      </view>
    </view>

    <scroll-view scroll-y class="media-list">
      <view class="media-grid">
        <view
          v-for="media in filteredMedia"
          :key="media.id"
          class="media-item"
          @tap="handleMediaClick(media)"
        >
          <image
            v-if="media.type === 'image'"
            :src="media.url"
            mode="aspectFill"
            class="media-preview"
          />
          <video v-else :src="media.url" class="media-preview" />
          <view class="media-info">
            <text class="size">{{ formatSize(media.size) }}</text>
            <text v-if="media.compressed" class="compressed">已压缩</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 编辑相册弹窗 -->
    <uni-popup ref="editPopup" type="center">
      <view class="edit-popup">
        <view class="popup-title">编辑相册</view>
        <input v-model="editForm.title" placeholder="请输入相册名称" class="input" />
        <textarea v-model="editForm.description" placeholder="请输入相册描述" class="textarea" />
        <view class="popup-btns">
          <button @tap="handleEditCancel">取消</button>
          <button @tap="handleEditConfirm" type="primary">确定</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Album, MediaFile } from '@/types/album'
import { formatDate } from '@/utils/date'
import { formatSize } from '@/utils/format'

const album = ref<Album>({
  id: '',
  title: '',
  description: '',
  coverUrl: '',
  mediaCount: 0,
  createdAt: '',
  updatedAt: '',
})

const mediaList = ref<MediaFile[]>([])
const currentType = ref<'all' | 'image' | 'video'>('all')
const editPopup = ref()
const editForm = ref({
  title: '',
  description: '',
})

// 过滤后的媒体列表
const filteredMedia = computed(() => {
  if (currentType.value === 'all') return mediaList.value
  return mediaList.value.filter((media) => media.type === currentType.value)
})

// 获取相册详情
const fetchAlbumDetail = async (id: string) => {
  try {
    // TODO: 调用API获取相册详情
  } catch (error) {
    uni.showToast({
      title: '获取相册详情失败',
      icon: 'none',
    })
  }
}

// 获取媒体列表
const fetchMediaList = async (albumId: string) => {
  try {
    // TODO: 调用API获取媒体列表
  } catch (error) {
    uni.showToast({
      title: '获取媒体列表失败',
      icon: 'none',
    })
  }
}

// 类型筛选
const handleTypeFilter = (type: 'all' | 'image' | 'video') => {
  currentType.value = type
}

// 编辑相册
const handleEdit = () => {
  editForm.value = {
    title: album.value.title,
    description: album.value.description,
  }
  editPopup.value.open()
}

// 确认编辑
const handleEditConfirm = async () => {
  if (!editForm.value.title) {
    uni.showToast({
      title: '请输入相册名称',
      icon: 'none',
    })
    return
  }

  try {
    // TODO: 调用API更新相册
    editPopup.value.close()
    fetchAlbumDetail(album.value.id)
  } catch (error) {
    uni.showToast({
      title: '更新相册失败',
      icon: 'none',
    })
  }
}

// 取消编辑
const handleEditCancel = () => {
  editPopup.value.close()
}

// 上传媒体
const handleUpload = () => {
  uni.navigateTo({
    url: `/pages/upload/index?albumId=${album.value.id}`,
  })
}

// 点击媒体
const handleMediaClick = (media: MediaFile) => {
  if (media.type === 'image') {
    uni.previewImage({
      urls: [media.url],
    })
  } else {
    uni.navigateTo({
      url: `/pages/media/player?url=${encodeURIComponent(media.url)}`,
    })
  }
}

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const albumId = currentPage.$page?.options?.id

  if (albumId) {
    fetchAlbumDetail(albumId)
    fetchMediaList(albumId)
  }
})
</script>

<style lang="scss">
.album-detail {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  background-color: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;

  .album-info {
    display: flex;
    margin-bottom: 30rpx;

    .cover {
      width: 200rpx;
      height: 200rpx;
      border-radius: 12rpx;
      margin-right: 30rpx;
    }

    .info {
      flex: 1;

      .title {
        font-size: 32rpx;
        font-weight: bold;
        margin-bottom: 10rpx;
      }

      .desc {
        font-size: 26rpx;
        color: #666;
        margin-bottom: 20rpx;
      }

      .meta {
        font-size: 24rpx;
        color: #999;

        .count {
          margin-right: 20rpx;
        }
      }
    }
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 20rpx;

    .action-btn {
      display: flex;
      align-items: center;
      padding: 10rpx 20rpx;
      background-color: #f5f5f5;
      border-radius: 8rpx;
      font-size: 26rpx;

      .iconfont {
        margin-right: 10rpx;
      }
    }
  }
}

.filter-bar {
  display: flex;
  background-color: #fff;
  padding: 20rpx 30rpx;
  margin-bottom: 20rpx;

  .filter-item {
    padding: 10rpx 30rpx;
    font-size: 26rpx;
    color: #666;
    border-radius: 30rpx;
    margin-right: 20rpx;

    &.active {
      background-color: #018d71;
      color: #fff;
    }
  }
}

.media-list {
  height: calc(100vh - 400rpx);
  padding: 0 20rpx;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
  padding-bottom: 40rpx;
}

.media-item {
  position: relative;
  border-radius: 12rpx;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

  .media-preview {
    width: 100%;
    height: 200rpx;
  }

  .media-info {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 10rpx;
    background-color: rgba(0, 0, 0, 0.5);
    color: #fff;
    font-size: 22rpx;
    display: flex;
    justify-content: space-between;

    .compressed {
      color: #4cd964;
    }
  }
}

.edit-popup {
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
