import apiClient from './apiClient.js'

export async function fetchSuccessStories() {
  const { data } = await apiClient.get('/api/success-stories')
  return data?.data // { images: [...], reels: [...] }
}

export async function fetchSuccessStoryImages() {
  const { data } = await apiClient.get('/api/success-stories/images')
  return data?.data || []
}

export async function fetchSuccessStoryReels() {
  const { data } = await apiClient.get('/api/success-stories/reels')
  return data?.data || []
}

export default { fetchSuccessStories, fetchSuccessStoryImages, fetchSuccessStoryReels }
