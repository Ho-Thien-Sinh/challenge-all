// Import necessary React hooks and components
import * as React from 'react';
const { useState } = React;
import { Link, useNavigate } from 'react-router-dom'
// Import Font Awesome icons for the form
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from 'react-icons/fa'
// Import authentication context
import { useAuth } from '../contexts/AuthContext'

// Main Register component
const Register: React.FC = () => {
  // State management for form inputs and UI
  const [email, setEmail] = useState('')  // Stores user's email
  const [password, setPassword] = useState('')  // Stores user's password
  const [confirmPassword, setConfirmPassword] = useState('')  // For password confirmation
  const [showPassword, setShowPassword] = useState(false)  // Toggle password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)  // Toggle confirm password visibility
  const [loading, setLoading] = useState(false)  // Loading state during form submission
  const [error, setError] = useState('')  // Error message state
  const [success, setSuccess] = useState('')  // Success message state
  
  // Get signUp function from auth context and navigation function
  const { signUp } = useAuth()
  const navigate = useNavigate()

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()  // Prevent default form submission
    setLoading(true)  // Show loading state
    setError('')  // Reset any previous errors
    setSuccess('')  // Reset any previous success messages

    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      setLoading(false)
      return
    }

    // Validate password length
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      setLoading(false)
      return
    }

    try {
      // Attempt to sign up with email and password
      const { error } = await signUp(email, password)
      if (error) {
        // Handle signup error
        setError('Email đã tồn tại hoặc có lỗi xảy ra')
      } else {
        // On successful registration, show success message and redirect to login
        setSuccess('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.')
        setTimeout(() => navigate('/login'), 3000)  // Redirect after 3 seconds
      }
    } catch (err) {
      // Handle any unexpected errors
      setError('Đã xảy ra lỗi. Vui lòng thử lại.')
    } finally {
      setLoading(false)  // Reset loading state
    }
  }

  // Render the registration form
  return (
    // Main container with responsive styling
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          {/* Registration form title */}
          <h2 className="text-3xl font-bold text-gray-900">Đăng ký</h2>
          {/* Subtitle */}
          <p className="mt-2 text-gray-600">Tạo tài khoản mới</p>
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

            {/* Success message display */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {success}
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

            {/* Password input field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                {/* Password icon */}
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                {/* Password input */}
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 pr-10 input-field"
                  placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                />
                {/* Toggle password visibility button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm password input field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                {/* Password icon */}
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                {/* Confirm password input */}
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pl-10 pr-10 input-field"
                  placeholder="Nhập lại mật khẩu"
                />
                {/* Toggle confirm password visibility button */}
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
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
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
          </form>

          {/* Link to login page for existing users */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register