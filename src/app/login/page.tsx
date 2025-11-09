"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, Mail, Lock, Shield, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

const ADMIN_CREDENTIALS = {
  email: "sudais@dekord.online",
  password: "YOutuber123!@#",
  twoFA: "456456"
}

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<"login" | "2fa">("login")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })
  const [twoFACode, setTwoFACode] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Verify email and password
    if (
      loginData.email === ADMIN_CREDENTIALS.email &&
      loginData.password === ADMIN_CREDENTIALS.password
    ) {
      setStep("2fa")
      setLoading(false)
    } else {
      setError("Invalid email or password")
      setLoading(false)
    }
  }

  const handleTwoFAInput = (index: number, value: string) => {
    if (value.length > 1) return // Only allow single digit
    
    const newCode = [...twoFACode]
    newCode[index] = value
    setTwoFACode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`2fa-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleTwoFAKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !twoFACode[index] && index > 0) {
      const prevInput = document.getElementById(`2fa-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleTwoFASubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const code = twoFACode.join("")
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Verify 2FA code
    if (code === ADMIN_CREDENTIALS.twoFA) {
      try {
        // Authenticate via API
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: loginData.email,
            password: loginData.password,
            twoFA: code
          })
        })

        if (response.ok) {
          // Redirect to dashboard
          router.push('/')
          router.refresh()
        } else {
          setError("Authentication failed. Please try again.")
          setLoading(false)
        }
      } catch (err) {
        setError("An error occurred. Please try again.")
        setLoading(false)
      }
    } else {
      setError("Invalid 2FA code. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-100 via-white to-neutral-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* @ts-ignore - Framer Motion type compatibility with React 19 */}
        <AnimatePresence mode="wait">
          {step === "login" ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-neutral-200"
            >
              {/* Header */}
              <div className="bg-neutral-900 p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg"
                >
                  <Lock className="w-10 h-10 text-neutral-900" />
                </motion.div>
                <h1 className="text-3xl font-bold text-white mb-2">Admin Login</h1>
                <p className="text-neutral-200 text-sm">dekord Admin Panel</p>
              </div>

              {/* Form */}
              <div className="p-8">
                <form onSubmit={handleLogin} className="space-y-5">
                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                      <input
                        type="email"
                        id="email"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all outline-none"
                        placeholder="admin@dekord.online"
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="w-full pl-11 pr-12 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all outline-none"
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className="w-full bg-neutral-900 text-white py-3 rounded-lg font-medium hover:bg-neutral-800 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ color: 'white' }}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-white">Verifying...</span>
                      </>
                    ) : (
                      <span className="text-white">Continue</span>
                    )}
                  </motion.button>
                </form>

                {/* Security Notice */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900 mb-1">Secure Login</p>
                      <p className="text-xs text-blue-700">
                        Two-factor authentication is required for all admin accounts.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="2fa"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-neutral-200"
            >
              {/* Header */}
              <div className="bg-neutral-900 p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg"
                >
                  <Shield className="w-10 h-10 text-neutral-900" />
                </motion.div>
                <h1 className="text-3xl font-bold text-white mb-2">Two-Factor Auth</h1>
                <p className="text-neutral-200 text-sm">Enter the 6-digit code</p>
              </div>

              {/* Form */}
              <div className="p-8">
                <form onSubmit={handleTwoFASubmit} className="space-y-6">
                  <div>
                    <p className="text-center text-sm text-neutral-600 mb-4">
                      Enter the code from your authenticator app
                    </p>
                    
                    {/* 2FA Code Inputs */}
                    <div className="flex gap-2 justify-center">
                      {twoFACode.map((digit, index) => (
                        <input
                          key={index}
                          id={`2fa-${index}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleTwoFAInput(index, e.target.value)}
                          onKeyDown={(e) => handleTwoFAKeyDown(index, e)}
                          className="w-12 h-14 text-center text-2xl font-bold border-2 border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 transition-all outline-none"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className="w-full bg-neutral-900 py-3 rounded-lg font-medium hover:bg-neutral-800 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ color: '#ffffff' }}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span style={{ color: '#ffffff' }}>Authenticating...</span>
                      </>
                    ) : (
                      <span style={{ color: '#ffffff' }}>Verify & Login</span>
                    )}
                  </motion.button>

                  {/* Back Button */}
                  <button
                    type="button"
                    onClick={() => setStep("login")}
                    className="w-full text-neutral-600 hover:text-neutral-900 text-sm font-medium transition-colors"
                  >
                    ← Back to Login
                  </button>
                </form>

                
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
