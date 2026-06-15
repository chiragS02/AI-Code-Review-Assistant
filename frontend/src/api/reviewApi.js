import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
})

export async function submitReview(payload, options = {}) {
  try {
    const response = await api.post('/review-code', payload, {
      signal: options.signal,
    })
    return response.data.data
  } catch (error) {
    if (axios.isCancel(error) || error.code === 'ERR_CANCELED') {
      throw error
    }

    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Request failed.'
    throw new Error(message)
  }
}
