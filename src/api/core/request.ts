/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import { ApiError } from './ApiError'
import type { ApiRequestOptions } from './ApiRequestOptions'
import type { ApiResult } from './ApiResult'
import { CancelablePromise } from './CancelablePromise'
import type { OnCancel } from './CancelablePromise'
import type { OpenAPIConfig } from './OpenAPI'

export const isDefined = <T>(
  value: T | null | undefined,
): value is Exclude<T, null | undefined> => {
  return value !== undefined && value !== null
}

export const isString = (value: any): value is string => {
  return typeof value === 'string'
}

export const isStringWithValue = (value: any): value is string => {
  return isString(value) && value !== ''
}

export const isBlob = (value: any): value is Blob => {
  return (
    typeof value === 'object' &&
    typeof value.type === 'string' &&
    typeof value.stream === 'function' &&
    typeof value.arrayBuffer === 'function' &&
    typeof value.constructor === 'function' &&
    typeof value.constructor.name === 'string' &&
    /^(Blob|File)$/.test(value.constructor.name) &&
    /^(Blob|File)$/.test(value[Symbol.toStringTag])
  )
}

export const isSuccess = (status: number): boolean => {
  return status >= 200 && status < 300
}

export const base64 = (str: string): string => {
  try {
    return btoa(str)
  } catch (err) {
    // @ts-ignore
    return Buffer.from(str).toString('base64')
  }
}

export const getQueryString = (params: Record<string, any>): string => {
  const qs: string[] = []

  const append = (key: string, value: any) => {
    qs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
  }

  const process = (key: string, value: any) => {
    if (isDefined(value)) {
      if (Array.isArray(value)) {
        value.forEach((v) => {
          process(key, v)
        })
      } else if (typeof value === 'object') {
        Object.entries(value).forEach(([k, v]) => {
          process(`${key}[${k}]`, v)
        })
      } else {
        append(key, value)
      }
    }
  }

  Object.entries(params).forEach(([key, value]) => {
    process(key, value)
  })

  if (qs.length > 0) {
    return `?${qs.join('&')}`
  }

  return ''
}

const getUrl = (config: OpenAPIConfig, options: ApiRequestOptions): string => {
  const encoder = config.ENCODE_PATH || encodeURI

  const path = options.url
    .replace('{api-version}', config.VERSION)
    .replace(/{(.*?)}/g, (substring: string, group: string) => {
      if (options.path?.hasOwnProperty(group)) {
        return encoder(String(options.path[group]))
      }
      return substring
    })

  const url = `${config.BASE}${path}`
  if (options.query) {
    return `${url}${getQueryString(options.query)}`
  }
  return url
}

export const getHeaders = async (
  config: OpenAPIConfig,
  options: ApiRequestOptions,
): Promise<Record<string, string>> => {
  const [token, username, password, additionalHeaders] = await Promise.all([
    resolve(options, config.TOKEN),
    resolve(options, config.USERNAME),
    resolve(options, config.PASSWORD),
    resolve(options, config.HEADERS),
  ])

  const headers = Object.entries({
    Accept: 'application/json',
    ...additionalHeaders,
    ...options.headers,
  })
    .filter(([_, value]) => isDefined(value))
    .reduce(
      (headers, [key, value]) => ({
        ...headers,
        [key]: String(value),
      }),
      {} as Record<string, string>,
    )

  if (isStringWithValue(token)) {
    headers['Authorization'] = `Bearer ${token}`
  }

  if (isStringWithValue(username) && isStringWithValue(password)) {
    const credentials = base64(`${username}:${password}`)
    headers['Authorization'] = `Basic ${credentials}`
  }

  if (options.body !== undefined) {
    if (options.mediaType) {
      headers['Content-Type'] = options.mediaType
    } else if (isBlob(options.body)) {
      headers['Content-Type'] = options.body.type || 'application/octet-stream'
    } else if (isString(options.body)) {
      headers['Content-Type'] = 'text/plain'
    } else {
      headers['Content-Type'] = 'application/json'
    }
  }

  return headers
}

export const getRequestBody = (options: ApiRequestOptions): any => {
  if (options.body) {
    return options.body
  }
  return undefined
}

type Resolver<T> = (options: ApiRequestOptions) => Promise<T>

export const resolve = async <T>(
  options: ApiRequestOptions,
  resolver?: T | Resolver<T>,
): Promise<T | undefined> => {
  if (typeof resolver === 'function') {
    return (resolver as Resolver<T>)(options)
  }
  return resolver
}

export const sendRequest = async <T>(
  config: OpenAPIConfig,
  options: ApiRequestOptions,
  url: string,
  body: any,
  headers: Record<string, string>,
  onCancel: OnCancel,
): Promise<{ status: number; statusText: string; data: T; headers: Record<string, string> }> => {
  return new Promise((resolve, reject) => {
    console.log('Request config:', {
      url,
      method: options.method,
      headers,
      body,
    })

    const requestTask = uni.request({
      url,
      data: body,
      header: {
        'Content-Type': 'application/json',
        Authorization:
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo2MDY5NTc0MzQwNDg1MTIsImlzcyI6Im5vdm8iLCJleHAiOjE3NDkyNjg5NjQsIm5iZiI6MTc0OTI2NzE2NCwiaWF0IjoxNzQ5MjY3MTY0fQ.-T7lL90qfpGuNHD3bDCgmz8h5pUPjagzltJb0DLFJGQ',
        ...headers,
      },
      method: options.method as any,
      success: (res) => {
        console.log('Response headers:', res.header)
        resolve({
          status: res.statusCode,
          statusText: res.errMsg,
          data: res.data as T,
          headers: res.header || {},
        })
      },
      fail: (err) => {
        console.error('Request failed:', err)
        reject(err)
      },
    })

    onCancel(() => {
      requestTask.abort()
    })
  })
}

export const getResponseHeader = (
  response: { headers: Record<string, string> },
  responseHeader?: string,
): string | undefined => {
  if (responseHeader) {
    const content = response.headers[responseHeader]
    if (isString(content)) {
      return content
    }
  }
  return undefined
}

export const getResponseBody = (response: { data: any }): any => {
  return response.data
}

export const catchErrorCodes = (options: ApiRequestOptions, result: ApiResult): void => {
  const errors: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    ...options.errors,
  }

  const error = errors[result.status]
  if (error) {
    throw new ApiError(options, result, error)
  }

  if (!result.ok) {
    const errorStatus = result.status ?? 'unknown'
    const errorStatusText = result.statusText ?? 'unknown'
    const errorBody = (() => {
      try {
        return JSON.stringify(result.body, null, 2)
      } catch (e) {
        return undefined
      }
    })()

    throw new ApiError(
      options,
      result,
      `Generic Error: status: ${errorStatus}; status text: ${errorStatusText}; body: ${errorBody}`,
    )
  }
}

/**
 * Request method
 * @param config The OpenAPI configuration object
 * @param options The request options from the service
 * @returns CancelablePromise<T>
 * @throws ApiError
 */
export const request = <T>(
  config: OpenAPIConfig,
  options: ApiRequestOptions,
): CancelablePromise<T> => {
  return new CancelablePromise(async (resolve, reject, onCancel) => {
    try {
      const url = getUrl(config, options)
      const body = getRequestBody(options)
      const headers = await getHeaders(config, options)

      if (!onCancel.isCancelled) {
        const response = await sendRequest<T>(config, options, url, body, headers, onCancel)
        const responseBody = getResponseBody(response)
        const responseHeader = getResponseHeader(response, options.responseHeader)

        const result: ApiResult = {
          url,
          ok: isSuccess(response.status),
          status: response.status,
          statusText: response.statusText,
          body: responseHeader ?? responseBody,
        }

        catchErrorCodes(options, result)

        resolve(result.body)
      }
    } catch (error) {
      reject(error)
    }
  })
}

export interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
  baseURL?: string
  timeout?: number
  query?: Record<string, any>
}
