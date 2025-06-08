/**
 * by 菲鸽 on 2024-03-06
 * 路由拦截，通常也是登录拦截
 * 可以设置路由白名单，或者黑名单，看业务需要选哪一个
 * 我这里应为大部分都可以随便进入，所以使用黑名单
 */
import { useUserStore } from '@/store'
import { needLoginPages as _needLoginPages, getNeedLoginPages, getLastPage } from '@/utils'

// TODO Check
const loginRoute = import.meta.env.VITE_LOGIN_URL

const isLogined = () => {
  const userStore = useUserStore()
  return !!userStore.userInfo.username
}

const isDev = import.meta.env.DEV

// 白名单登录拦截器 - 只有登录页允许未登录访问，其他页面必须登录
const navigateToInterceptor = {
  invoke({ url }: { url: string }) {
    console.log('全局路由拦截器')

    // 只允许登录页未登录访问
    const loginPath = loginRoute.startsWith('/') ? loginRoute : `/${loginRoute}`
    let path = url.split('?')[0]
    // 处理相对路径
    if (!path.startsWith('/')) {
      const currentPath = getLastPage().route
      const normalizedCurrentPath = currentPath.startsWith('/') ? currentPath : `/${currentPath}`
      const baseDir = normalizedCurrentPath.substring(0, normalizedCurrentPath.lastIndexOf('/'))
      path = `${baseDir}/${path}`
    }
    // 如果是登录页，允许访问
    if (path === loginPath) {
      return true
    }
    // 只要不是登录页，必须已登录
    const userStore = useUserStore()
    if (userStore.isLogined()) {
      return true
    }
    // 未登录，跳转到登录页
    const redirectRoute = `${loginRoute}?redirect=${encodeURIComponent(url)}`
    uni.redirectTo({ url: redirectRoute })
    return false
  },
}

export const routeInterceptor = {
  install() {
    uni.addInterceptor('navigateTo', navigateToInterceptor)
    uni.addInterceptor('reLaunch', navigateToInterceptor)
    uni.addInterceptor('redirectTo', navigateToInterceptor)
    uni.addInterceptor('switchTab', navigateToInterceptor)
  },
}
