/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { common_Response } from '../models/common_Response'
import type { dto_AddMediaToAlbumDTO } from '../models/dto_AddMediaToAlbumDTO'
import type { dto_AlbumAddDTO } from '../models/dto_AlbumAddDTO'
import type { dto_BatchDeleteObjectsReq } from '../models/dto_BatchDeleteObjectsReq'
import type { dto_CursorListAlbumMediaDTO } from '../models/dto_CursorListAlbumMediaDTO'
import type { dto_GetPresignedURLReq } from '../models/dto_GetPresignedURLReq'
import type { dto_LoginDTO } from '../models/dto_LoginDTO'
import type { dto_RegisterDTO } from '../models/dto_RegisterDTO'
import type { dto_UpdateUserDTO } from '../models/dto_UpdateUserDTO'
import type { vo_GetPresignedURLVO } from '../models/vo_GetPresignedURLVO'
import type { CancelablePromise } from '../core/CancelablePromise'
import { OpenAPI } from '../core/OpenAPI'
import { request as __request } from '../core/request'
export class Service {
  /**
   * 添加相册
   * 添加相册
   * @returns void
   * @throws ApiError
   */
  public static postAlbum({
    body,
  }: {
    /**
     * 相册信息
     */
    body: dto_AlbumAddDTO
  }): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/album',
      body: body,
    })
  }
  /**
   * 获取相册列表
   * 获取相册列表
   * @returns void
   * @throws ApiError
   */
  public static getAlbumList({
    page,
    limit,
    userId,
    orderBy,
    order,
    name,
  }: {
    /**
     * 页码
     */
    page: number
    /**
     * 每页数量
     */
    limit: number
    /**
     * 用户ID
     */
    userId?: string
    /**
     * 排序字段
     */
    orderBy?: string
    /**
     * 排序方式
     */
    order?: string
    /**
     * 相册名称
     */
    name?: string
  }): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/album/list',
      query: {
        user_id: userId,
        page: page,
        limit: limit,
        order_by: orderBy,
        order: order,
        name: name,
      },
    })
  }
  /**
   * 添加图片到相册
   * 添加图片到相册
   * @returns void
   * @throws ApiError
   */
  public static postAlbumMedia({
    body,
  }: {
    /**
     * 图片信息(包含url、大小等)
     */
    body: dto_AddMediaToAlbumDTO
  }): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/album/media',
      body: body,
    })
  }
  /**
   * 从相册中移除图片
   * 从相册中移除图片
   * @returns void
   * @throws ApiError
   */
  public static deleteAlbumMedia({
    ids,
  }: {
    /**
     * 相册ID
     */
    ids: string
  }): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/album/media',
      query: {
        ids: ids,
      },
    })
  }
  /**
   * 获取相册图片列表
   * 获取相册图片列表
   * @returns void
   * @throws ApiError
   */
  public static postAlbumMediaList({
    body,
  }: {
    /**
     * 查询条件
     */
    body: dto_CursorListAlbumMediaDTO
  }): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/album/media/list',
      body: body,
    })
  }
  /**
   * 更新所有图片大小
   * 从COS获取并更新所有图片的实际大小(MB)
   * @returns void
   * @throws ApiError
   */
  public static postAlbumMediaSize(): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/album/media/size',
    })
  }
  /**
   * 获取用户相册统计信息
   * 获取用户的总相册数、总照片数、总照片大小
   * @returns void
   * @throws ApiError
   */
  public static getAlbumStats(): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/album/stats',
    })
  }
  /**
   * 获取相册详情
   * 获取相册详情
   * @returns void
   * @throws ApiError
   */
  public static getAlbum({
    id,
  }: {
    /**
     * 相册ID
     */
    id: string
  }): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/album/{id}',
      path: {
        id: id,
      },
    })
  }
  /**
   * 删除相册
   * 删除相册及其所有照片
   * @returns void
   * @throws ApiError
   */
  public static deleteAlbum({
    id,
  }: {
    /**
     * 相册ID
     */
    id: string
  }): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/album/{id}',
      path: {
        id: id,
      },
    })
  }
  /**
   * 批量删除对象
   * 批量删除指定的对象
   * @returns common_Response 成功
   * @throws ApiError
   */
  public static postCosBatchDelete({
    data,
  }: {
    /**
     * 请求参数
     */
    data: dto_BatchDeleteObjectsReq
  }): CancelablePromise<common_Response> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/cos/batch-delete',
      body: data,
    })
  }
  /**
   * 获取预签名URL
   * 获取文件上传或下载的预签名URL
   * @returns any 成功
   * @throws ApiError
   */
  public static postCosPresignedUrl({
    data,
  }: {
    /**
     * 请求参数
     */
    data: dto_GetPresignedURLReq
  }): CancelablePromise<
    common_Response & {
      data?: vo_GetPresignedURLVO
    }
  > {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/cos/presigned-url',
      body: data,
    })
  }
  /**
   * 更新用户信息
   * 更新用户信息(包括密码)
   * @returns void
   * @throws ApiError
   */
  public static putUser({
    body,
  }: {
    /**
     * 用户信息
     */
    body: dto_UpdateUserDTO
  }): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/user',
      body: body,
    })
  }
  /**
   * 获取当前登录用户信息
   * 获取当前登录用户的详细信息
   * @returns void
   * @throws ApiError
   */
  public static getUserCurrent(): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/user/current',
    })
  }
  /**
   * 用户登录
   * 用户登录(支持手机号密码登录和微信小程序登录)
   * @returns void
   * @throws ApiError
   */
  public static postUserLogin({
    body,
  }: {
    /**
     * 登录信息(code:微信登录, phone+password:账号密码登录)
     */
    body: dto_LoginDTO
  }): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/user/login',
      body: body,
    })
  }
  /**
   * 获取用户详情
   * 获取用户详情
   * @returns void
   * @throws ApiError
   */
  public static getUserOne({
    userId,
  }: {
    /**
     * 用户ID
     */
    userId: string
  }): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/user/one',
      query: {
        userId: userId,
      },
    })
  }
  /**
   * 刷新访问令牌
   * 使用刷新令牌获取新的访问令牌
   * @returns void
   * @throws ApiError
   */
  public static postUserRefresh({
    authorization,
  }: {
    /**
     * Bearer 刷新令牌
     */
    authorization: string
  }): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/user/refresh',
      headers: {
        Authorization: authorization,
      },
    })
  }
  /**
   * 用户注册
   * 用户注册
   * @returns void
   * @throws ApiError
   */
  public static postUserRegister({
    body,
  }: {
    /**
     * 用户注册信息
     */
    body: dto_RegisterDTO
  }): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/user/register',
      body: body,
    })
  }
}
