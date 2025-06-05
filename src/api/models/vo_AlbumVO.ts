/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { vo_AlbumMediaVO } from './vo_AlbumMediaVO'
import type { vo_UserVO } from './vo_UserVO'
export type vo_AlbumVO = {
  cover_img?: string
  create_time?: string
  description?: string
  id?: number
  medias?: Array<vo_AlbumMediaVO>
  name?: string
  photo_count?: number
  start_time?: string
  total_size?: number
  update_time?: string
  user?: vo_UserVO
  user_id?: number
  video_count?: number
}
