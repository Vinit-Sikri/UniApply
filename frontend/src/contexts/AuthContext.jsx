import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/profile')
      setUser(response.data.user)
    } catch (error) {
      localStorage.removeItem('token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', response.data.token)
      setUser(response.data.user)
      toast.success('Login successful')
      return response.data
    } catch (error) {
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map(err => err.message || err.msg).join(', ')
        toast.error(errorMessages || 'Validation failed')
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error)
      } else {
        toast.error('Login failed. Please check your credentials and try again.')
      }
      console.error('Login error:', error.response?.data || error)
      throw error
    }
  }

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData)
      localStorage.setItem('token', response.data.token)
      setUser(response.data.user)
      toast.success('Registration successful')
      return response.data
    } catch (error) {
      // Handle network errors
      if (!error.response) {
        const apiUrl = import.meta.env.VITE_API_URL || '/api'
        console.error('Network Error Details:', {
          message: error.message,
          code: error.code,
          apiUrl: apiUrl,
          userMessage: error.userMessage
        })
        
        let errorMessage = 'Network error. ';
        if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
          errorMessage += 'Unable to connect to the server. ';
          errorMessage += 'Please check:\n';
          errorMessage += '1. Backend server is running\n';
          errorMessage += '2. API URL is correct\n';
          errorMessage += '3. Internet connection is active';
        } else {
          errorMessage += error.message || 'Please try again later.'
        }
        
        toast.error(errorMessage, { duration: 6000 })
        throw error
      }
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map(err => err.message || err.msg).join(', ')
        toast.error(errorMessages || 'Validation failed')
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error)
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Registration failed. Please try again.')
      }
      console.error('Registration error:', error.response?.data || error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    navigate('/login')
    toast.success('Logged out successfully')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

