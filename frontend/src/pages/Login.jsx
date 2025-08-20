import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'

library.add(fas)

const Login = () => {
  const [values, setValues] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const navigate = useNavigate()
  const { login } = useAuth()

  const handleChanges = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value })
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleSumbit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const result = await login(values.username, values.password)
      
      if (result.success) {
        navigate('/')
      } else {
        setError(result.error || 'Login failed')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4'>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className='relative bg-white/95 backdrop-blur-sm p-8 lg:p-10 rounded-2xl shadow-2xl w-full max-w-md border border-white/20'>
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className='flex flex-row justify-center items-center gap-4'>
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FontAwesomeIcon icon={['fas', 'shield-alt']} className="text-white text-2xl" />
            </div>
            <h1 className='text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2'>
              AAF CMS
            </h1>
          </div>
          <p className='text-gray-600'>Welcome back! Please sign in to your account.</p>
        </div>
        
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg animate-shake">
            <div className="flex items-center">
              <FontAwesomeIcon icon={['fas', 'exclamation-triangle']} className="text-red-400 mr-3" />
              <span className="text-red-700 text-sm font-medium">{error}</span>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSumbit} className="space-y-6">
          {/* Username Field */}
          <div className="space-y-2">
            <label htmlFor="username" className='block text-gray-700 font-semibold text-sm'>
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={['fas', 'user']} className="text-gray-400" />
              </div>
              <input 
                type="text" 
                id="username"
                placeholder='Enter your username' 
                className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white'
                name="username" 
                value={values.username}
                onChange={handleChanges}
                disabled={loading}
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className='block text-gray-700 font-semibold text-sm'>
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={['fas', 'lock']} className="text-gray-400" />
              </div>
              <input 
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder='Enter your password' 
                className='w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white'
                name="password" 
                value={values.password}
                onChange={handleChanges}
                disabled={loading}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                <FontAwesomeIcon 
                  icon={['fas', showPassword ? 'eye-slash' : 'eye']} 
                  className="text-gray-400 hover:text-gray-600 transition-colors" 
                />
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={loading || !values.username || !values.password}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <FontAwesomeIcon icon={['fas', 'sign-in-alt']} />
                <span>Sign In</span>
              </div>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Secure access to AAF Content Management System
          </p>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}

export default Login
