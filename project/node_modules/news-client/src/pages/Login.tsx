// Import necessary React hooks and components
import * as React from 'react';
const { useState } = React;
import { Link, useNavigate } from 'react-router-dom'
// Import Font Awesome icons for the form
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from 'react-icons/fa'
// Import authentication context
import { useAuth } from '../contexts/AuthContext'

// Main Login component
const Login: React.FC = () => {
  // State management for form inputs and UI
  const [email, setEmail] = useState('')  // Stores user's email
  const [password, setPassword] = useState('')  // Stores user's password
  const [showPassword, setShowPassword] = useState(false)  // Toggle password visibility
  const [loading, setLoading] = useState(false)  // Loading state during form submission
  const [error, setError] = useState('')  // Error message state
  
  // Get signIn function from auth context and navigation function
  const { signIn } = useAuth()
  const navigate = useNavigate()

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()  // Prevent default form submission
    setLoading(true)  // Show loading state
    setError('')  // Reset any previous errors

    try {
      // Attempt to sign in with email and password
      const { error } = await signIn(email, password)
      if (error) {
        // Handle sign in error
        setError('Email hoặc mật khẩu không đúng')
      } else {
        // On successful login, redirect to home page
        navigate('/')
      }
    } catch (err) {
      // Handle any unexpected errors
      setError('Đã xảy ra lỗi. Vui lòng thử lại.')
    } finally {
      setLoading(false)  // Reset loading state
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Đăng nhập</h2>
          <p className="mt-2 text-gray-600">Truy cập vào tài khoản của bạn</p>
        </div>
      </div>

      {/* Form container */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Form element with submit handler */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error message display */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Email input field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                {/* Email icon */}
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                {/* Email input */}
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 input-field"
                  placeholder="Nhập email của bạn"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 pr-10 input-field"
                  placeholder="Nhập mật khẩu"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* Show loading state if form is submitting */}
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          {/* Link to registration page for new users */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login