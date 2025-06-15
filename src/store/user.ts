import {
  login as _login,
  getUserInfo as _getUserInfo,
  wxLogin as _wxLogin,
  logout as _logout,
  getWxCode,
} from '@/api/login'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { toast } from '@/utils/toast'
import { IUserInfoVo } from '@/api/login.typings'
import { Service } from '@/api'
import { useToast } from 'wot-design-uni'
import { uploadFileUrl, useUpload } from '@/utils/uploadFile'
import { IUploadSuccessInfo } from '@/api/login.typings'
import { vo_UserVO } from '@/api'

// 初始化状态
const userInfoState: IUserInfoVo = {
  id: 0,
  username: '',
  avatar: '/static/images/default-avatar.png',
  token: '',
}

export const useUserStore = defineStore(
  'user',
  () => {
    // 定义用户信息
    const userInfo = ref<IUserInfoVo>({ ...userInfoState })
    // 设置用户信息
    const setUserInfo = (val: IUserInfoVo) => {
      console.log('设置用户信息', val)
      userInfo.value = val
    }
    // 删除用户信息
    const removeUserInfo = () => {
      userInfo.value = { ...userInfoState }
      uni.removeStorageSync('userInfo')
      uni.removeStorageSync('accessToken')
      uni.removeStorageSync('refreshToken')
    }
    /**
     * 用户登录
     * @param credentials 登录参数
     * @returns R<IUserLogin>
     */
    const login = async (credentials: {
      phone: string
      password: string
      code: string
      uuid: string
    }) => {
      const res = await Service.postUserLogin({
        body: credentials,
      })
      // 保存 accessToken 和 refreshToken
      if (res?.data) {
        const { accessToken, refreshToken, userVO } = res.data
        uni.setStorageSync('accessToken', accessToken)
        uni.setStorageSync('refreshToken', refreshToken)

        console.log('微信登录成功', userVO)
        // 将 accessToken 存到 userInfo 里，便于拦截器读取
        setUserInfo({ ...userVO, token: accessToken })
      }
      toast.success('登录成功')
      return res
    }
    /**
     * 获取用户信息
     */
    const getUserInfo = () => {
      return userInfo
    }
    /**
     * 退出登录 并 删除用户信息
     */
    const logout = async () => {
      removeUserInfo()
      toast.success('退出登录成功')
    }
    /**
     * 微信登录
     */
    const wxLogin = async () => {
      // 获取微信小程序登录的code
      const data = await getWxCode()
      console.log('微信登录code', data)

      const res = await login(data)

      // 登录后不再调用 getUserInfo
      // getUserInfo()
      return res
    }

    const isLogined = () => {
      if (uni.getStorageSync('accessToken')) {
        return true
      }
      return false
    }

    /**
     * 更新用户信息
     * @param data 要更新的用户信息
     */
    const updateUserInfo = async (data: { userName?: string; avatar?: string }) => {
      try {
        await Service.putUser({
          body: {
            userName: data.username,
            avatar: data.avatar,
          },
        })
        // 更新成功后重新获取用户信息
        const res = await Service.getUserCurrent()
        if (res.code != 0) {
          console.error('获取用户信息失败:', res)
          throw new Error('获取用户信息失败')
        }
        setUserInfo({ ...userInfo.value, ...res.data })
      } catch (error) {
        console.error('更新用户信息失败:', error)
        throw error
      }
    }

    return {
      userInfo,
      login,
      wxLogin,
      getUserInfo,
      setUserInfo,
      logout,
      isLogined,
      updateUserInfo,
    }
  },
  {
    persist: true,
  },
)
