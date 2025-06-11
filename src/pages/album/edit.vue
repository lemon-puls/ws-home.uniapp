<template>
  <view class="album-edit-page">
    <!-- 背景动画 -->
    <view class="bg-animation">
      <view class="circle circle-1"></view>
      <view class="circle circle-2"></view>
      <view class="circle circle-3"></view>
    </view>

    <view class="header">
      <view class="title-wrapper">
        <text class="title">{{ isEdit ? '编辑相册' : '新建相册' }}</text>
        <text class="subtitle">{{ isEdit ? '修改相册信息' : '创建新的相册' }}</text>
      </view>
    </view>

    <scroll-view scroll-y class="edit-content">
      <view class="form-container">
        <!-- 封面图片 -->
        <view class="cover-section">
          <text class="section-title">相册封面</text>
          <view class="cover-upload" @tap="handleUploadCover">
            <image
              v-if="formData.cover_img"
              :src="formData.cover_img"
              mode="aspectFill"
              class="cover-preview"
            />
            <view v-else class="upload-placeholder">
              <wd-icon name="image" size="48px" color="#999999"></wd-icon>
              <text>点击上传封面</text>
            </view>
          </view>
        </view>

        <!-- 基本信息 -->
        <view class="form-section">
          <text class="section-title">基本信息</text>
          <view class="input-group">
            <text class="input-label required">相册名称</text>
            <input
              v-model="formData.name"
              placeholder="请输入相册名称"
              class="input"
              maxlength="50"
            />
            <text class="input-count">{{ formData.name.length }}/50</text>
          </view>

          <view class="input-group">
            <text class="input-label">相册描述</text>
            <textarea
              v-model="formData.description"
              placeholder="请输入相册描述（选填）"
              class="textarea"
              maxlength="1000"
              auto-height
            />
            <text class="input-count">{{ formData.description.length }}/1000</text>
          </view>

          <view class="input-group">
            <text class="input-label">开始时间</text>
            <picker
              mode="date"
              :value="formData.start_time"
              @change="handleDateChange"
              class="date-picker"
            >
              <view class="picker-value">
                {{ formatDisplayDate(formData.start_time) }}
              </view>
            </picker>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部按钮 -->
    <view class="footer">
      <button class="cancel-btn" @tap="handleCancel">取消</button>
      <button class="confirm-btn" @tap="handleConfirm" :disabled="!isFormValid">
        {{ isEdit ? '保存' : '创建' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Service } from '@/api/services/Service'
import { formatDate } from '@/utils/date'
import { useUserStore } from '@/store'

const props = defineProps<{
  id?: number
}>()

const isEdit = computed(() => !!props.id)

const formData = ref({
  name: '',
  description: '',
  cover_img: '',
  start_time: '',
})

const compressImage = ref(true)

const userStore = useUserStore()

// 表单验证
const isFormValid = computed(() => {
  return formData.value.name.trim().length > 0
})

// 处理上传封面
const handleUploadCover = async () => {
  try {
    const chooseRes = (await uni.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['original', 'compressed'],
      camera: 'back',
    })) as unknown as UniApp.ChooseMediaSuccessCallbackResult

    if (!chooseRes.tempFiles || chooseRes.tempFiles.length === 0) {
      return
    }

    const file = chooseRes.tempFiles[0]
    let uploadFilePath = file.tempFilePath

    // 如果需要压缩
    if (compressImage.value) {
      try {
        const compressRes = await uni.compressImage({
          src: file.tempFilePath,
          quality: 50,
        })
        uploadFilePath = compressRes.tempFilePath
        const fileInfo = await uni.getFileInfo({ filePath: compressRes.tempFilePath })
        console.log(
          '压缩前大小:',
          (file.size / 1024 / 1024).toFixed(2) + 'M',
          '压缩后大小:',
          (fileInfo.size / 1024 / 1024).toFixed(2) + 'M',
        )
      } catch (err) {
        console.warn('图片压缩失败，使用原图', err)
      }
    }

    const fileKey = `album/cover/${Date.now()}_${uploadFilePath.split('/').pop()}`

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
            'Content-Type': 'image/jpeg',
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
      formData.value.cover_img = downloadRes.data.url
      uni.showToast({
        title: '上传成功',
        icon: 'success',
      })
    } catch (error) {
      console.error('上传失败:', error)
      uni.showToast({
        title: '上传失败',
        icon: 'none',
      })
    }
  } catch (error) {
    console.error('上传失败:', error)
    uni.showToast({
      title: '上传失败',
      icon: 'none',
    })
  }
}

// 日期选择
const handleDateChange = (e: any) => {
  const date = new Date(e.detail.value)
  // 设置时间为当天的0点
  date.setHours(0, 0, 0, 0)
  formData.value.start_time = date.toISOString()
}

// 格式化日期显示
const formatDisplayDate = (dateStr: string) => {
  if (!dateStr) return '请选择开始时间'
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 获取相册详情
const fetchAlbumDetail = async () => {
  if (!props.id) return

  try {
    const res = await Service.getAlbum({
      id: props.id,
    })

    if (res.code === 0 && res.data) {
      formData.value = {
        cover_img: res.data.cover_img || '',
        name: res.data.name,
        description: res.data.description || '',
        start_time: res.data.start_time || '',
        user_id: res.data.user_id,
      }
    }
  } catch (error) {
    uni.showToast({
      title: '获取相册详情失败',
      icon: 'none',
    })
  }
}

// 取消
const handleCancel = () => {
  uni.navigateBack()
}

// 确认
const handleConfirm = async () => {
  if (!isFormValid.value) {
    uni.showToast({
      title: '请输入相册名称',
      icon: 'none',
    })
    return
  }

  try {
    const data = {
      ...formData.value,
      user_id: userStore.userInfo.userId,
    }

    if (isEdit.value) {
      data.id = Number(props.id)
    }

    const res = await Service.postAlbum({
      body: data,
    })

    if (res.code === 0) {
      uni.showToast({
        title: isEdit.value ? '修改成功' : '创建成功',
        icon: 'success',
      })

      // 发送刷新事件
      uni.$emit('refreshAlbumList')

      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    } else {
      uni.showToast({
        title: res.msg || (isEdit.value ? '修改失败' : '创建失败'),
        icon: 'none',
      })
    }
  } catch (error) {
    uni.showToast({
      title: isEdit.value ? '修改失败' : '创建失败',
      icon: 'none',
    })
  }
}

onMounted(() => {
  if (isEdit.value) {
    fetchAlbumDetail()
  }
})
</script>

<style lang="scss">
.album-edit-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f4ff 0%, #e6f0ff 100%);
  padding: 30rpx;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
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
    background: linear-gradient(135deg, rgba(64, 156, 255, 0.08), rgba(32, 128, 255, 0.08));
    animation: float 12s infinite ease-in-out;
    backdrop-filter: blur(10px);
  }

  .circle-1 {
    width: 400rpx;
    height: 400rpx;
    top: -150rpx;
    right: -150rpx;
    animation-delay: 0s;
    opacity: 0.8;
  }

  .circle-2 {
    width: 300rpx;
    height: 300rpx;
    bottom: 20%;
    left: -100rpx;
    animation-delay: -4s;
    opacity: 0.6;
  }

  .circle-3 {
    width: 350rpx;
    height: 350rpx;
    bottom: -150rpx;
    right: 20%;
    animation-delay: -8s;
    opacity: 0.7;
  }
}

.header {
  position: relative;
  z-index: 2;
  margin-bottom: 50rpx;
  padding: 0 10rpx;

  .title-wrapper {
    .title {
      font-size: 48rpx;
      font-weight: 700;
      color: #2c3e50;
      display: block;
      text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
    }

    .subtitle {
      font-size: 28rpx;
      color: #5d6d7e;
      margin-top: 12rpx;
      display: block;
      opacity: 0.8;
    }
  }
}

.edit-content {
  position: relative;
  z-index: 2;
  flex: 1;
  margin: 0;
  padding: 0;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.form-container {
  padding: 40rpx 30rpx calc(140rpx + 120rpx);
  width: 100%;
  max-width: 1200rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cover-section {
  margin-bottom: 50rpx;
  width: 100%;
  max-width: 800rpx;

  .section-title {
    font-size: 34rpx;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 24rpx;
    display: block;
  }
}

.cover-upload {
  width: 100%;
  height: 460rpx;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.08);
  position: relative;
  box-sizing: border-box;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:active {
    transform: scale(0.98);
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
  }

  .cover-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .upload-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f8f9fa 0%, #f1f4f9 100%);
    color: #7f8c8d;
    transition: all 0.3s ease;

    &:active {
      background: linear-gradient(135deg, #f1f4f9 0%, #e9ecef 100%);
    }

    text {
      margin-top: 24rpx;
      font-size: 30rpx;
      font-weight: 500;
    }
  }
}

.form-section {
  background: #fff;
  border-radius: 50rpx;
  padding: 48rpx;
  box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 800rpx;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.12);
  }

  .section-title {
    font-size: 34rpx;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 36rpx;
    display: block;
  }
}

.input-group {
  margin-bottom: 36rpx;
  position: relative;
  width: 100%;

  &:last-child {
    margin-bottom: 0;
  }

  .input-label {
    font-size: 30rpx;
    color: #2c3e50;
    margin-bottom: 16rpx;
    display: block;
    font-weight: 500;

    &.required::before {
      content: '*';
      color: #e74c3c;
      margin-right: 8rpx;
    }
  }

  .input {
    width: 100%;
    height: 96rpx;
    background: #f8f9fa;
    border-radius: 16rpx;
    padding: 0 28rpx;
    font-size: 30rpx;
    color: #2c3e50;
    box-sizing: border-box;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 2rpx solid transparent;

    &:focus {
      background: #fff;
      border-color: #3498db;
      box-shadow: 0 0 0 4rpx rgba(52, 152, 219, 0.1);
    }
  }

  .textarea {
    width: 100%;
    min-height: 220rpx;
    background: #f8f9fa;
    border-radius: 16rpx;
    padding: 28rpx;
    font-size: 30rpx;
    color: #2c3e50;
    box-sizing: border-box;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 2rpx solid transparent;

    &:focus {
      background: #fff;
      border-color: #3498db;
      box-shadow: 0 0 0 4rpx rgba(52, 152, 219, 0.1);
    }
  }

  .input-count {
    position: absolute;
    right: 28rpx;
    bottom: 28rpx;
    font-size: 26rpx;
    color: #95a5a6;
  }

  .date-picker {
    width: 100%;
    height: 96rpx;
    background: #f8f9fa;
    border-radius: 16rpx;
    padding: 0 28rpx;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 2rpx solid transparent;

    &:active {
      background: #f1f4f9;
      border-color: #3498db;
    }

    .picker-value {
      font-size: 30rpx;
      color: #2c3e50;
    }
  }
}

.footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 24rpx 30rpx calc(24rpx + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 -8rpx 24rpx rgba(0, 0, 0, 0.06);
  display: flex;
  gap: 24rpx;
  z-index: 10;

  button {
    flex: 1;
    height: 96rpx;
    border-radius: 16rpx;
    font-size: 32rpx;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &[disabled] {
      opacity: 0.6;
    }

    &:active {
      transform: scale(0.98);
    }
  }

  .cancel-btn {
    background: #f8f9fa;
    color: #5d6d7e;
    border: 2rpx solid #e9ecef;

    &:active {
      background: #f1f4f9;
    }
  }

  .confirm-btn {
    background: linear-gradient(135deg, #3498db, #2980b9);
    color: #fff;
    box-shadow: 0 8rpx 16rpx rgba(52, 152, 219, 0.2);

    &:active {
      box-shadow: 0 4rpx 8rpx rgba(52, 152, 219, 0.2);
    }
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-30rpx) rotate(5deg);
  }
}
</style>
