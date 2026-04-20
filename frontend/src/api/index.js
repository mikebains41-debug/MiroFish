import axios from 'axios'
import i18n from '../i18n'

// Create axios instance
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',  // ✅ You already fixed this
  timeout: 300000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// ✅ ADD THIS BACK (if missing):
export const requestWithRetry = async (requestFn, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await requestFn()
    } catch (error) {
      if (i === retries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}

// Request interceptor
service.interceptors.request.use(
  config => {
    config.headers['Accept-Language'] = i18n.global.locale.value
    return config
  },
  error => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
service.interceptors.response.use(
  response => {
    const res = response.data
    
    if (!res.success && res.success !== undefined) {
      console.error('API Error:', res.error || res.message || 'Unknown error')
      return Promise.reject(new Error(res.error || res.message || 'Error'))
    }
    
    return res
  },
  error => {
    console.error('Response error:', error)
    return Promise.reject(error)
  }
)

// ✅ EXPORT BOTH:
export default service
export { service }
