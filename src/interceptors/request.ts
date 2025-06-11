/* eslint-disable no-param-reassign */
import qs from 'qs'
import { useUserStore } from '@/store'
import { platform } from '@/utils/platform'
import { getEnvBaseUrl } from '@/utils'
import { IUserInfoVo } from '@/api/login.typings'
import { Service } from '@/api/services/Service'
import type { common_Response } from '@/api/models/common_Response'

export type CustomRequestOptions = UniApp.RequestOptions & {
  query?: Record<string, any>
  /** 出错时是否隐藏错误提示 */
  hideErrorToast?: boolean
} & IUniUploadFileOptions // 添加uni.uploadFile参数类型

// 请求基准地址
const baseUrl = getEnvBaseUrl()

// 标记是否正在刷新token
let isRefreshing = false
let refreshPromise = null
let requestQueue = []

// 拦截器配置
const httpInterceptor = {
  // 拦截前触发
  invoke(options: CustomRequestOptions) {
    // 接口请求支持通过 query 参数配置 queryString
    if (options.query) {
      const queryStr = qs.stringify(options.query)
      if (options.url.includes('?')) {
        options.url += `&${queryStr}`
      } else {
        options.url += `?${queryStr}`
      }
    }
    // 非 http 开头需拼接地址
    if (!options.url.startsWith('http')) {
      // #ifdef H5
      if (JSON.parse(__VITE_APP_PROXY__)) {
        // 自动拼接代理前缀
        options.url = import.meta.env.VITE_APP_PROXY_PREFIX + options.url
      } else {
        options.url = baseUrl + options.url
      }
      // #endif
      // 非H5正常拼接
      // #ifndef H5
      options.url = baseUrl + options.url
      // #endif
    }
    // 1. 请求超时
    options.timeout = 10000 // 10s
    // 2. （可选）添加小程序端请求头标识
    options.header = {
      platform, // 可选，与 uniapp 定义的平台一致，告诉后台来源
      ...options.header,
    }
    // 3. 添加 token 请求头标识
    // 优先从 accessToken 读取
    const accessToken = uni.getStorageSync('accessToken')
    if (accessToken) {
      console.log('设置请求头 accessToken', accessToken)
      options.header.Authorization = `Bearer ${accessToken}`
    } else {
      const userStore = useUserStore()
      const { token } = userStore.userInfo as unknown as IUserInfoVo
      if (token) {
        options.header.Authorization = `Bearer ${token}`
      }
    }

    // 响应拦截（仅在 request 拦截器里处理，uploadFile 不处理401重试）
    if (options.method && options.method.toUpperCase() !== 'UPLOADFILE') {
      const originalSuccess = options.success
      const originalFail = options.fail
      const originalComplete = options.complete

      options.success = async (res: any) => {
        if (res.statusCode === 401 || (res.data && res.data.code === 401) || res.data.code === 4) {
          console.log('token失效，尝试刷新token')
          try {
            await handleRefreshToken()
            // 刷新成功，重试原请求
            const retryOptions = { ...options }
            delete retryOptions.success
            delete retryOptions.fail
            delete retryOptions.complete

            const retryRes = await new Promise((resolve, reject) => {
              uni.request({
                ...retryOptions,
                success: (res) => resolve(res),
                fail: (err) => reject(err),
              })
            })

            originalSuccess && originalSuccess(retryRes as any)
            originalComplete && originalComplete(retryRes as any)
          } catch (e) {
            console.log('刷新token失败', e)
            // 刷新失败，清除用户信息并跳转登录
            const userStore = useUserStore()
            userStore.logout()
            uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
            setTimeout(() => {
              uni.redirectTo({ url: '/pages/login/index' })
            }, 1500)
            originalFail && originalFail(e as any)
            originalComplete && originalComplete(e as any)
          }
        } else {
          originalSuccess && originalSuccess(res)
          originalComplete && originalComplete(res)
        }
      }

      options.fail = (err) => {
        originalFail && originalFail(err)
        originalComplete && originalComplete(err)
      }
    }
  },
}

// 刷新token逻辑
async function handleRefreshToken() {
  if (isRefreshing) {
    return refreshPromise
  }
  isRefreshing = true
  const refreshToken = uni.getStorageSync('refreshToken')
  console.log('refreshToken:', refreshToken)
  refreshPromise = new Promise((resolve, reject) => {
    if (!refreshToken) {
      reject(new Error('无refreshToken'))
      return
    }

    Service.postUserRefresh({ authorization: `Bearer ${refreshToken}` })
      .then((res: any) => {
        console.log('刷新token成功', res)
        if (res && res.data && res.code === 0) {
          const { accessToken, refreshToken: newRefreshToken, userVO } = res.data
          uni.setStorageSync('accessToken', accessToken)
          uni.setStorageSync('refreshToken', newRefreshToken)
          console.log('更新token成功', accessToken, newRefreshToken)
          // 更新 pinia userInfo
          const userStore = useUserStore()
          userStore.setUserInfo({ ...userVO, token: accessToken } as IUserInfoVo)
          resolve(accessToken)
        } else {
          reject(new Error('刷新token失败'))
        }
      })
      .catch(reject)
      .finally(() => {
        isRefreshing = false
        refreshPromise = null
      })
  })
  return refreshPromise
}

export const requestInterceptor = {
  install() {
    // 拦截 request 请求
    uni.addInterceptor('request', httpInterceptor)
    // 拦截 uploadFile 文件上传
    uni.addInterceptor('uploadFile', httpInterceptor)
  },
}
