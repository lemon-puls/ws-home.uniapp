import type { OpenAPIConfig } from './generated/core/OpenAPI'

export const request: OpenAPIConfig['request'] = async (options) => {
  const { url, method, headers, body, params } = options

  // 构建完整的 URL（包含查询参数）
  const queryString = params
    ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
    : ''
  const fullUrl = `${url}${queryString}`

  // 发起请求
  const response = await uni.request({
    url: fullUrl,
    method: method as any,
    header: headers as any,
    data: body,
  })

  // 处理响应
  if (response.statusCode >= 200 && response.statusCode < 300) {
    return response.data
  }

  // 处理错误
  throw new Error(response.data?.message || '请求失败')
}
