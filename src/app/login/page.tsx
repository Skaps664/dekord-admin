"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, Mail, Lock, Shield } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<"login" | "2fa">("login")
  const [showPassword, setShowPassword] = useState(false)
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })
  const [twoFACode, setTwoFACode] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    // TODO: Implement real authentication with Supabase
    // For now, fake validation
    if (loginData.email && loginData.password) {
      setStep("2fa")
    } else {
      setError("Please enter email and password")
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

  const handleTwoFASubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const code = twoFACode.join("")
    
    // TODO: Implement real 2FA verification with Supabase
    // For now, fake validation (any 6-digit code works)
    if (code.length === 6) {
      // Store auth state (fake for now)
      localStorage.setItem("admin_authenticated", "true")
      router.push("/")
    } else {
      setError("Please enter the complete 6-digit code")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-100 via-white to-neutral-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
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
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-neutral-900 text-white py-3 rounded-lg font-medium hover:bg-neutral-800 transition-colors shadow-lg hover:shadow-xl"
                    style={{ color: 'white' }}
                  >
                    <span className="text-white">Continue</span>
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

                {/* Testing Info */}
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-xs text-green-800 font-medium mb-2">Testing Mode:</p>
                  <p className="text-xs text-green-700">
                    • Enter any valid email format<br />
                    • Enter any password<br />
                    • Then enter any 6-digit code for 2FA
                  </p>
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
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-neutral-900 py-3 rounded-lg font-medium hover:bg-neutral-800 transition-colors shadow-lg hover:shadow-xl"
                    style={{ color: '#ffffff' }}
                  >
                    Verify & Login
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

                {/* Help Text */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-xs text-blue-700">
                    <strong>For testing:</strong> Any 6-digit code will work. In production, this will be connected to your authenticator app.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
