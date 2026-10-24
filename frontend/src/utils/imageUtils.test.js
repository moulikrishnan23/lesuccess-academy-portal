import { describe, expect, it } from 'vitest'
import { getCourseLogo, getImageUrl, optimizeCloudinaryUrl } from './imageUtils.js'

const RAW = 'https://res.cloudinary.com/mknetwyg/image/upload/v1790163474/lesuccess/team/UmaDevi.png'

describe('optimizeCloudinaryUrl', () => {
  it('adds format and quality optimisation to an untransformed upload', () => {
    expect(optimizeCloudinaryUrl(RAW)).toBe(
      'https://res.cloudinary.com/mknetwyg/image/upload/f_auto,q_auto/v1790163474/lesuccess/team/UmaDevi.png',
    )
  })

  it('adds a downscale-only width limit when a width is given', () => {
    expect(optimizeCloudinaryUrl(RAW, 800)).toBe(
      'https://res.cloudinary.com/mknetwyg/image/upload/f_auto,q_auto,c_limit,w_800/v1790163474/lesuccess/team/UmaDevi.png',
    )
  })

  it('leaves a URL that already has a transformation alone', () => {
    const transformed = 'https://res.cloudinary.com/x/image/upload/c_fill,w_200/v1/a.jpg'
    expect(optimizeCloudinaryUrl(transformed, 800)).toBe(transformed)
  })

  it('leaves videos and non-Cloudinary URLs alone', () => {
    const video = 'https://res.cloudinary.com/x/video/upload/v1/intro.mp4'
    const other = 'https://example.com/image/upload/v1/a.jpg'
    expect(optimizeCloudinaryUrl(video, 800)).toBe(video)
    expect(optimizeCloudinaryUrl(other, 800)).toBe(other)
  })

  it('treats a folder name as a path, not a transformation', () => {
    const url = 'https://res.cloudinary.com/x/image/upload/lesuccess/gallery/a.jpg'
    expect(optimizeCloudinaryUrl(url)).toBe(
      'https://res.cloudinary.com/x/image/upload/f_auto,q_auto/lesuccess/gallery/a.jpg',
    )
  })
})

describe('getImageUrl', () => {
  it('optimises Cloudinary URLs and passes the width through', () => {
    expect(getImageUrl(RAW, '', { width: 400 })).toContain('/upload/f_auto,q_auto,c_limit,w_400/')
  })

  it('keeps local static paths unchanged', () => {
    expect(getImageUrl('/home/team/dummy.png', '', { width: 400 })).toBe('/home/team/dummy.png')
  })
})

describe('getCourseLogo', () => {
  it('requests a logo-sized Cloudinary image', () => {
    expect(getCourseLogo({ iconUrl: RAW })).toContain('c_limit,w_160/')
  })
})
