import type { RequestOptions } from '@/api/core/request'

// 基础配置
const baseConfig = {
  baseURL: 'http://localhost:8080', // 替换为您的实际API地址
  timeout: 120000,
  header: {
    'Content-Type': 'application/json',
  },
}

// 请求拦截器
const requestInterceptor = (config: RequestOptions) => {
  // 获取token
  const token = uni.getStorageSync('token')
  if (token) {
    config.header = {
      ...config.header,
      Authorization: `Bearer ${token}`,
    }
  }
  return config
}

// 响应拦截器
const responseInterceptor = (response: any) => {
  if (response.statusCode === 200) {
    return response.data
  }

  // 处理401错误
  if (response.statusCode === 401) {
    uni.removeStorageSync('token')
    uni.showToast({
      title: '登录已过期，请重新登录',
      icon: 'none',
    })
    // 跳转到登录页
    setTimeout(() => {
      uni.navigateTo({
        url: '/pages/login/index',
      })
    }, 1500)
    return Promise.reject(new Error('登录已过期'))
  }

  return Promise.reject(response)
}

// 统一请求方法
export const request = (options: RequestOptions) => {
  const config = requestInterceptor({
    ...baseConfig,
    ...options,
  })

  return new Promise((resolve, reject) => {
    uni.request({
      ...config,
      url: config.baseURL + config.url,
      success: (res) => {
        resolve(responseInterceptor(res))
      },
      fail: (err) => {
        uni.showToast({
          title: '网络请求失败',
          icon: 'none',
        })
        reject(err)
      },
    })
  })
}

export default request
