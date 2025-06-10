/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { vo_AlbumStatsItemVO } from './vo_AlbumStatsItemVO'
export type vo_AlbumStatsVO = {
  /**
   * 相册统计列表
   */
  albums?: Array<vo_AlbumStatsItemVO>
  /**
   * 图片总大小(MB)
   */
  photoSize?: number
  /**
   * 总相册数
   */
  totalAlbums?: number
  /**
   * 总照片数
   */
  totalPhotos?: number
  /**
   * 总大小(MB)
   */
  totalSize?: number
  /**
   * 总视频数
   */
  totalVideos?: number
  /**
   * 视频总大小(MB)
   */
  videoSize?: number
}
