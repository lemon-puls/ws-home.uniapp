<template>
  <view class="album-detail">
    <!-- 背景动画 -->
    <view class="bg-animation">
      <view class="circle circle-1"></view>
      <view class="circle circle-2"></view>
      <view class="circle circle-3"></view>
    </view>

    <!-- 使用scroll-view包裹整个内容 -->
    <scroll-view
      scroll-y
      class="main-scroll"
      @scrolltolower="loadMore"
      lower-threshold="100"
      @refresherrefresh="onRefresh"
      refresher-enabled
      :refresher-triggered="refreshing"
    >
      <!-- 相册信息 -->
      <view class="album-info">
        <view class="info-header">
          <view class="author-info">
            <image :src="albumInfo.user?.avatar" mode="aspectFill" class="avatar" />
            <view class="user-info">
              <text class="username">{{ albumInfo.user?.userName || '未知用户' }}</text>
              <text class="create-time">创建于 {{ formatDate(albumInfo.create_time) }}</text>
            </view>
          </view>
        </view>

        <view class="info-content">
          <view class="title-section">
            <view class="title-wrapper">
              <text v-if="!isEditingTitle" class="title" @tap="startEditTitle">
                {{ albumInfo.name }}
              </text>
              <input
                v-else
                v-model="editingTitle"
                class="title-input"
                @blur="saveTitle"
                @confirm="saveTitle"
                :focus="isEditingTitle"
              />
              <wd-icon
                v-if="!isEditingTitle"
                name="edit"
                size="16px"
                color="#576b95"
                @click="startEditTitle"
              ></wd-icon>
            </view>
            <view class="description-wrapper">
              <text
                v-if="albumInfo.description && !isEditingDescription"
                class="description"
                :class="{ 'description-collapsed': !isDescriptionExpanded }"
                @tap="toggleDescription"
              >
                {{ albumInfo.description }}
              </text>
              <textarea
                v-else
                v-model="editingDescription"
                class="description-textarea"
                :focus="isEditingDescription"
                @blur="saveDescription"
                @confirm="saveDescription"
                maxlength="1000"
                auto-height
              />
              <view v-if="albumInfo.description" class="description-actions">
                <text v-if="!isEditingDescription" class="expand-btn" @tap="toggleDescription">
                  {{ isDescriptionExpanded ? '收起' : '展开' }}
                </text>
                <text v-if="isEditingDescription" class="input-count">
                  {{ editingDescription.length }}/1000
                </text>
                <wd-icon
                  v-if="!isEditingDescription"
                  name="edit"
                  size="16px"
                  color="#576b95"
                  @click="startEditDescription"
                ></wd-icon>
              </view>
            </view>
          </view>

          <view class="stats-section">
            <view class="stat-card">
              <view class="stat-icon">
                <wd-icon name="image" size="24px" color="#ff4757"></wd-icon>
              </view>
              <view class="stat-info">
                <text class="stat-value">{{ albumInfo.photo_count }}</text>
                <text class="stat-label">照片</text>
              </view>
            </view>
            <view class="stat-card">
              <view class="stat-icon">
                <wd-icon name="video" size="24px" color="#2e86de"></wd-icon>
              </view>
              <view class="stat-info">
                <text class="stat-value">{{ albumInfo.video_count }}</text>
                <text class="stat-label">视频</text>
              </view>
            </view>
            <view class="stat-card">
              <view class="stat-icon">
                <wd-icon name="folder" size="24px" color="#07c160"></wd-icon>
              </view>
              <view class="stat-info">
                <text class="stat-value">{{ formatSize(albumInfo.total_size) }}</text>
                <text class="stat-label">总大小</text>
              </view>
            </view>
          </view>

          <view class="time-section" v-if="albumInfo.start_time">
            <wd-icon name="calendar" size="16px" color="#576b95"></wd-icon>
            <text class="time-range">{{ formatDateSimple(albumInfo.start_time) }}</text>
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
            <view class="button-group">
              <button class="upload-btn original" @tap="handleUploadOriginal">
                <wd-icon name="upload" size="14px" color="#ffffff"></wd-icon>
                <text>原图</text>
              </button>
              <button class="upload-btn compressed" @tap="handleUploadCompressed">
                <wd-icon name="upload" size="14px" color="#ffffff"></wd-icon>
                <text>压缩</text>
              </button>
              <button class="edit-btn" @tap="toggleEdit">
                <wd-icon :name="isEditing ? 'check' : 'edit'" size="14px" color="#ffffff"></wd-icon>
                <text>{{ isEditing ? '完成' : '编辑' }}</text>
              </button>
              <button v-if="isEditing" class="delete-btn" @tap="handleDeleteSelected">
                <wd-icon name="delete" size="14px" color="#ffffff"></wd-icon>
                <text>删除</text>
              </button>
            </view>
          </view>
        </view>

        <!--        &lt;!&ndash; 图片压缩开关 &ndash;&gt;-->
        <!--        <view class="compress-switch-bar">-->
        <!--          <view class="compress-label">-->
        <!--            <wd-icon name="compress" size="18px" color="#07c160"></wd-icon>-->
        <!--            <text>图片压缩</text>-->
        <!--          </view>-->
        <!--          <switch-->
        <!--            :checked="compressImage"-->
        <!--            @change="(e) => (compressImage = e.detail.value)"-->
        <!--            color="#07c160"-->
        <!--          />-->
        <!--          <text class="compress-tip">-->
        <!--            {{ compressImage ? '上传前自动压缩图片，节省空间' : '上传原图，保留最佳画质' }}-->
        <!--          </text>-->
        <!--        </view>-->

        <!-- 媒体列表 -->
        <view class="media-list">
          <view class="media-grid">
            <view
              v-for="(media, index) in mediaList"
              :key="media.id"
              class="media-item"
              :class="{ selected: selectedImages.includes(media.id) }"
              @tap="() => handleMediaClick(media)"
              :style="{ animationDelay: index * 0.1 + 's' }"
            >
              <image
                v-if="media.type === 0"
                :src="media.url"
                mode="aspectFill"
                class="media-image"
                lazy-load
                :fade-show="true"
                @error="(e) => handleImageError(e, media)"
                @load="(e) => handleImageLoad(e, media)"
                :webp="true"
                :show-menu-by-longpress="true"
                :show-loading="true"
                loading="lazy"
              />
              <view v-else class="media-video-container">
                <image
                  :src="media.meta?.poster || media.url"
                  mode="aspectFill"
                  class="media-video-poster"
                />
                <video
                  :src="media.url"
                  class="media-video"
                  object-fit="cover"
                  :enable-progress-gesture="false"
                  :show-center-play-btn="false"
                  :show-play-btn="false"
                  :controls="false"
                  :show-fullscreen-btn="false"
                  :show-progress="false"
                  :enable-play-gesture="false"
                  :show-mute-btn="false"
                  title="视频"
                  @error="(e) => console.error('视频加载错误:', e)"
                ></video>
                <view class="media-type">
                  <wd-icon name="video" size="14px" color="#ffffff"></wd-icon>
                </view>
              </view>
              <view class="media-overlay">
                <text class="view-more">点击查看</text>
              </view>
            </view>
          </view>
          <view class="loading" v-if="loading">
            <wd-icon name="loading" size="24px" color="#07c160"></wd-icon>
            <text>加载中...</text>
          </view>
          <view class="no-more" v-if="noMore">
            <text>没有更多了</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Service } from '@/api/services/Service'
import { onLoad } from '@dcloudio/uni-app'
import { formatDate, formatDateSimple } from '@/utils/date'
import type { dto_AlbumMediaAddDTO } from '@/api/models/dto_AlbumMediaAddDTO'
import type { dto_MediaMetaDTO } from '@/api/models/dto_MediaMetaDTO'
import { usePageAuth } from '@/hooks/usePageAuth'
import { formatSize } from '../../utils/format'

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
// const compressImage = ref<boolean>(true) // 新增：图片压缩开关
const scrollTop = ref(0)
const refreshing = ref(false)
const isDescriptionExpanded = ref(false)
const isEditingTitle = ref(false)
const isEditingDescription = ref(false)
const editingTitle = ref('')
const editingDescription = ref('')

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

// 添加图片加载状态管理
const imageLoadStatus = ref<Record<number, boolean>>({})

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
  if (loading.value) {
    return
  }

  if (noMore.value && isLoadMore) {
    return
  }

  loading.value = true

  try {
    const response = (await Service.postAlbumMediaList({
      body: {
        album_id: albumId.value,
        cursor: isLoadMore ? cursor.value : '',
        is_raw:
          imageType.value === 'raw' ? true : imageType.value === 'compressed' ? false : undefined,
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
  if (!loading.value && !noMore.value) {
    fetchMediaList(true)
  }
}

// 下拉刷新
const onRefresh = async () => {
  refreshing.value = true
  cursor.value = ''
  noMore.value = false
  await fetchMediaList()
  refreshing.value = false
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

// 上传原图
const handleUploadOriginal = async () => {
  await handleUploadWithSizeType('original')
}
// 上传压缩图
const handleUploadCompressed = async () => {
  await handleUploadWithSizeType('compressed')
}

// 修改上传逻辑，确保请求失败时也能清理已上传的 COS 对象
const handleUploadWithSizeType = async (sizeType: 'original' | 'compressed') => {
  try {
    const chooseRes = (await uni.chooseMedia({
      // 最多可以选择的文件个数，这里设置为50个
      // 注意：实际可选择的文件数量可能受设备性能、系统限制等因素影响
      count: 50,

      // 选择文件的类型
      // ['image'] - 仅图片
      // ['video'] - 仅视频
      // ['image', 'video'] - 图片和视频都可以选择
      mediaType: ['image', 'video'],

      // 选择文件的来源
      // ['album'] - 仅从相册选择
      // ['camera'] - 仅使用相机拍摄
      // ['album', 'camera'] - 可以从相册选择或使用相机拍摄
      sourceType: ['album', 'camera'],

      // 所选的图片的尺寸
      // ['original'] - 原图
      // ['compressed'] - 压缩图
      // 这里根据传入的 sizeType 参数决定是原图还是压缩图
      sizeType: [sizeType],

      // 使用后置摄像头
      // 'back' - 后置摄像头
      // 'front' - 前置摄像头
      // 仅在 sourceType 包含 'camera' 时有效
      camera: 'back',
    })) as unknown as UniApp.ChooseMediaSuccessCallbackResult

    if (!chooseRes.tempFiles || chooseRes.tempFiles.length === 0) {
      return
    }

    // 批量上传文件
    const uploadPromises = chooseRes.tempFiles.map(async (file) => {
      const uploadFilePath = file.tempFilePath
      const isRaw = sizeType === 'original'

      const fileKey = `ws-home/ablum/${albumId.value}/${Date.now()}_${uploadFilePath.split('/').pop()}`

      try {
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

        // 读取文件内容
        const fileContent = await new Promise<ArrayBuffer>((resolve, reject) => {
          uni.getFileSystemManager().readFile({
            filePath: uploadFilePath,
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
              'Content-Type': uploadFilePath.includes('image') ? 'image/jpeg' : 'video/mp4',
            },
            sslVerify: false, // 关闭证书验证
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
              let errorMsg = '上传失败'
              if (err.errMsg) {
                if (err.errMsg.includes('ERR_CERT_AUTHORITY_INVALID')) {
                  errorMsg = '证书验证失败，请检查服务器证书配置'
                } else if (err.errMsg.includes('timeout')) {
                  errorMsg = '上传超时，请检查网络连接'
                } else if (err.errMsg.includes('fail')) {
                  errorMsg = '网络请求失败，请检查网络连接'
                }
              }
              reject(new Error(errorMsg))
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

        return {
          url: downloadRes.data.url,
          size: Number((file.size / 1024 / 1024).toFixed(2)), // 转换为MB并保留两位小数
          type: mediaType,
          is_raw: isRaw, // 由按钮决定
          meta: mediaMeta,
          key: fileKey, // 保存 COS 对象 key，用于清理
        } as dto_AlbumMediaAddDTO
      } catch (error) {
        console.error('单个文件上传失败:', error)
        // 返回错误信息，而不是抛出错误，避免中断整个流程
        return { error, key: fileKey }
      }
    })

    // 等待所有文件上传完成，即使部分文件失败
    const uploadResults = await Promise.all(uploadPromises)

    // 过滤出成功上传的文件
    const successResults = uploadResults.filter((item) => !item.error) as dto_AlbumMediaAddDTO[]
    // 过滤出失败的文件
    const failedResults = uploadResults.filter((item) => item.error) as {
      error: Error
      key: string
    }[]

    // 如果有成功上传的文件，保存到数据库
    if (successResults.length > 0) {
      try {
        const saveRes = (await Service.postAlbumMedia({
          body: {
            album_id: albumId.value,
            medias: successResults,
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
        } else {
          // 如果保存失败，清理已上传的 COS 对象
          const keys = successResults.map((item) => item.key)
          await Service.postCosBatchDelete({
            data: {
              keys,
            },
          })
          throw new Error(saveRes.msg || '保存失败')
        }
      } catch (error) {
        // 如果请求失败，清理已上传的 COS 对象
        const keys = successResults.map((item) => item.key)
        await Service.postCosBatchDelete({
          data: {
            keys,
          },
        })
        throw error
      }
    }

    // 如果有失败的文件，清理已上传的 COS 对象
    if (failedResults.length > 0) {
      const keys = failedResults.map((item) => item.key)
      await Service.postCosBatchDelete({
        data: {
          keys,
        },
      })
      throw new Error('部分文件上传失败')
    }
  } catch (error) {
    console.error('上传失败:', error)
    let errorMsg = '上传失败'
    if (error instanceof Error) {
      errorMsg = error.message
    }
    uni.showToast({
      title: errorMsg,
      icon: 'none',
      duration: 3000,
    })
  } finally {
    uni.hideLoading()
  }
}

// 处理滚动
const handleScroll = (e: any) => {
  scrollTop.value = e.detail.scrollTop
}
//
// // 格式化文件大小
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

// 切换描述展开/收起
const toggleDescription = () => {
  isDescriptionExpanded.value = !isDescriptionExpanded.value
}

// 开始编辑标题
const startEditTitle = () => {
  editingTitle.value = albumInfo.value.name
  isEditingTitle.value = true
}

// 保存标题
const saveTitle = async () => {
  if (editingTitle.value.trim() === '') {
    uni.showToast({
      title: '相册名称不能为空',
      icon: 'none',
    })
    return
  }

  try {
    const res = await Service.postAlbum({
      body: {
        id: albumId.value,
        name: editingTitle.value,
        description: albumInfo.value.description,
        start_time: albumInfo.value.start_time,
        cover_img: albumInfo.value.cover_img,
      },
    })

    if (res.code === 0) {
      albumInfo.value.name = editingTitle.value
      uni.showToast({
        title: '修改成功',
        icon: 'success',
      })
    } else {
      uni.showToast({
        title: res.msg || '修改失败',
        icon: 'none',
      })
    }
  } catch (error) {
    uni.showToast({
      title: '修改失败',
      icon: 'none',
    })
  } finally {
    isEditingTitle.value = false
  }
}

// 开始编辑描述
const startEditDescription = () => {
  editingDescription.value = albumInfo.value.description || ''
  isEditingDescription.value = true
}

// 保存描述
const saveDescription = async () => {
  try {
    const res = await Service.postAlbum({
      body: {
        id: albumId.value,
        name: albumInfo.value.name,
        cover_img: albumInfo.value.cover_img,
        description: editingDescription.value,
        start_time: albumInfo.value.start_time,
      },
    })

    if (res.code === 0) {
      albumInfo.value.description = editingDescription.value
      uni.showToast({
        title: '修改成功',
        icon: 'success',
      })
    } else {
      uni.showToast({
        title: res.msg || '修改失败',
        icon: 'none',
      })
    }
  } catch (error) {
    uni.showToast({
      title: '修改失败',
      icon: 'none',
    })
  } finally {
    isEditingDescription.value = false
  }
}

// 处理图片加载错误
const handleImageError = (e: any, media: MediaItem) => {
  console.error('图片加载失败:', media.url, e)
  imageLoadStatus.value[media.id] = false
  // 可以在这里设置一个默认图片
  media.url = '/static/images/error-image.png'
}

// 处理图片加载成功
const handleImageLoad = (e: any, media: MediaItem) => {
  console.log('图片加载成功:', media.url)
  imageLoadStatus.value[media.id] = true
}

usePageAuth()
</script>

<style lang="scss">
.album-detail {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #f6f8fd 0%, #f1f4f9 100%);
  overflow: hidden;
  position: relative;
}

.main-scroll {
  flex: 1;
  height: 100%;
  position: relative;
  z-index: 2;
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

.album-info {
  position: relative;
  z-index: 2;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 30rpx;
  margin: 20rpx;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);

  .info-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;

    .author-info {
      display: flex;
      align-items: center;
      gap: 20rpx;

      .avatar {
        width: 88rpx;
        height: 88rpx;
        border-radius: 44rpx;
        border: 4rpx solid rgba(255, 255, 255, 0.8);
        box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
      }

      .user-info {
        display: flex;
        flex-direction: column;
        gap: 8rpx;

        .username {
          font-size: 32rpx;
          font-weight: 600;
          color: #333;
        }

        .create-time {
          font-size: 24rpx;
          color: #666;
        }
      }
    }
  }

  .info-content {
    .title-section {
      margin-bottom: 30rpx;

      .title-wrapper {
        display: flex;
        align-items: center;
        gap: 16rpx;
        margin-bottom: 12rpx;

        .title {
          font-size: 40rpx;
          font-weight: 600;
          color: #333;
          flex: 1;
        }

        .title-input {
          flex: 1;
          font-size: 40rpx;
          font-weight: 600;
          color: #333;
          background: #f8f9fa;
          border-radius: 12rpx;
          padding: 12rpx 20rpx;
          border: 2rpx solid #3498db;
        }
      }

      .description-wrapper {
        position: relative;

        .description {
          font-size: 28rpx;
          color: #666;
          line-height: 1.6;
          transition: all 0.3s ease;

          &.description-collapsed {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        }

        .description-textarea {
          width: 100%;
          min-height: 160rpx;
          font-size: 28rpx;
          color: #333;
          line-height: 1.6;
          padding: 0;
          background: transparent;
        }

        .description-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 16rpx;
          margin-top: 12rpx;

          .expand-btn {
            font-size: 26rpx;
            color: #576b95;
            padding: 4rpx 12rpx;
            border-radius: 20rpx;
            background: rgba(87, 107, 149, 0.1);
          }

          .input-count {
            font-size: 24rpx;
            color: #999;
          }
        }
      }
    }

    .stats-section {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20rpx;
      margin-bottom: 30rpx;

      .stat-card {
        background: rgba(255, 255, 255, 0.8);
        border-radius: 16rpx;
        padding: 20rpx;
        display: flex;
        align-items: center;
        gap: 16rpx;
        box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

        .stat-icon {
          width: 64rpx;
          height: 64rpx;
          border-radius: 16rpx;
          background: rgba(46, 134, 222, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-info {
          display: flex;
          flex-direction: column;
          gap: 4rpx;

          .stat-value {
            font-size: 32rpx;
            font-weight: 600;
            color: #333;
          }

          .stat-label {
            font-size: 24rpx;
            color: #666;
          }
        }
      }
    }

    .time-section {
      display: flex;
      align-items: center;
      gap: 8rpx;
      padding: 16rpx 0;
      border-top: 2rpx solid rgba(0, 0, 0, 0.05);

      .time-range {
        font-size: 26rpx;
        color: #576b95;
      }
    }
  }
}

.media-section {
  position: relative;
  z-index: 2;
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  margin: 0 20rpx 20rpx;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
  overflow: hidden;

  .top-bar {
    position: sticky;
    top: 0;
    z-index: 3;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    padding: 24rpx;
    border-bottom: 2rpx solid rgba(0, 0, 0, 0.05);

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 16rpx;
      margin-bottom: 20rpx;

      .filter-options {
        display: flex;
        gap: 16rpx;

        .filter-option {
          flex: 1;
          height: 72rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8rpx;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 36rpx;
          transition: all 0.3s ease;

          text {
            font-size: 26rpx;
            color: #666;
          }

          &.active {
            background: linear-gradient(135deg, #2e86de, #54a0ff);
            box-shadow: 0 4rpx 12rpx rgba(46, 134, 222, 0.2);

            text {
              color: #fff;
            }
          }

          &:active {
            transform: scale(0.98);
          }
        }
      }
    }

    .action-group {
      display: flex;
      gap: 16rpx;

      button {
        flex: 1;
        height: 72rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8rpx;
        border-radius: 36rpx;
        border: none;
        font-size: 26rpx;
        transition: all 0.3s ease;

        &.delete-btn {
          background: linear-gradient(135deg, #ff4757, #ff6b81);
          color: #fff;
        }

        &.upload-btn {
          background: linear-gradient(135deg, #2e86de, #54a0ff);
          color: #fff;
        }

        &.edit-btn {
          background: linear-gradient(135deg, #2e86de, #54a0ff);
          color: #fff;
        }

        &:active {
          transform: scale(0.98);
        }
      }
    }
  }

  .compress-switch-bar {
    position: sticky;
    top: 180rpx;
    z-index: 3;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    margin: 20rpx;
    padding: 20rpx;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    gap: 16rpx;

    .compress-label {
      display: flex;
      align-items: center;
      gap: 8rpx;
      font-size: 28rpx;
      color: #2e86de;
      font-weight: 500;
    }

    .compress-tip {
      flex: 1;
      font-size: 24rpx;
      color: #666;
    }
  }

  .media-list {
    position: relative;
    padding: 16rpx;

    .media-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16rpx;
      padding-bottom: 32rpx;

      .media-item {
        position: relative;
        aspect-ratio: 1;
        border-radius: 16rpx;
        overflow: hidden;
        background: #f7f7f7;
        animation: slideUp 0.6s ease-out forwards;
        opacity: 0;

        &.selected {
          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border: 4rpx solid #de2e2e;
            border-radius: 16rpx;
            box-shadow: 0 0 20rpx rgba(46, 134, 222, 0.3);
            z-index: 5;
          }
        }

        .media-image,
        .media-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .media-video-container {
          width: 100%;
          height: 100%;
          position: relative;
          background-color: #000000;
          overflow: hidden;

          .media-video-poster {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            z-index: 1;
          }

          .media-video {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            z-index: 2;
          }

          .media-type {
            position: absolute;
            top: 12rpx;
            right: 12rpx;
            background: rgba(0, 0, 0, 0.5);
            padding: 6rpx 12rpx;
            border-radius: 20rpx;
            backdrop-filter: blur(4px);
            z-index: 3;
          }
        }

        .media-overlay {
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
          z-index: 4;

          .view-more {
            color: #fff;
            font-size: 28rpx;
            padding: 12rpx 24rpx;
            border: 2rpx solid #fff;
            border-radius: 30rpx;
            backdrop-filter: blur(4px);
          }
        }

        &:active {
          .media-image,
          .media-video {
            transform: scale(1.05);
          }

          .media-overlay {
            opacity: 1;
          }
        }
      }
    }

    .loading,
    .no-more {
      padding: 30rpx 0;
      text-align: center;
      color: #999;
      font-size: 26rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8rpx;
    }
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

.media-image {
  width: 100%;
  height: 100%;
  will-change: transform;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
}

.button-group {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
}

.upload-btn,
.edit-btn,
.delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.upload-btn.original {
  background-color: #4caf50;
  color: white;
}

.upload-btn.compressed {
  background-color: #2196f3;
  color: white;
}

.edit-btn {
  background-color: #ff9800;
  color: white;
}

.delete-btn {
  background-color: #f44336;
  color: white;
}
</style>
