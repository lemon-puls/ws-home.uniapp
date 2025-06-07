import type { ApiRequestOptions } from './core/ApiRequestOptions'

export const request = async (options: ApiRequestOptions) => {
  const { url, method, headers, body, query } = options

  // 合并请求头
  const mergedHeaders = {
    ...globalHeaders,
    ...headers,
  }

  // 构建完整的 URL（包含查询参数）
  const queryString = query
    ? `?${new URLSearchParams(query as Record<string, string>).toString()}`
    : ''
  const fullUrl = `${url}${queryString}`

  // 发起请求
  const response = await uni.request({
    url: fullUrl,
    method: method as any,
    header: mergedHeaders as any,
    data: body,
  })

  // 处理响应
  if (response.statusCode >= 200 && response.statusCode < 300) {
    return response.data
  }

  // 处理错误
  const errorData = response.data as any
  throw new Error(errorData?.message || '请求失败')
}
