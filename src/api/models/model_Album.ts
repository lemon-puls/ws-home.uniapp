/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { model_AlbumMedia } from './model_AlbumMedia'
import type { model_User } from './model_User'
export type model_Album = {
  cover_img?: string
  create_time?: string
  description?: string
  id?: number
  medias?: Array<model_AlbumMedia>
  name?: string
  photo_count?: number
  start_time?: string
  total_size?: number
  update_time?: string
  user?: model_User
  user_id?: number
  video_count?: number
}
