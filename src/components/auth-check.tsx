"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Shield } from "lucide-react"

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if we're on the login page
    if (pathname === "/login") {
      setIsChecking(false)
      setIsAuthenticated(true)
      return
    }

    // Check authentication status
    const checkAuth = () => {
      // TODO: Replace with real authentication check using Supabase
      const isAuth = localStorage.getItem("admin_authenticated") === "true"
      
      if (!isAuth) {
        router.push("/login")
      } else {
        setIsAuthenticated(true)
      }
      setIsChecking(false)
    }

    checkAuth()
  }, [router, pathname])

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-100 via-white to-neutral-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-neutral-900 border-t-transparent rounded-full mx-auto mb-4"
          />
          <div className="flex items-center gap-2 text-neutral-900">
            <Shield className="w-5 h-5" />
            <p className="text-lg font-medium">Verifying authentication...</p>
          </div>
        </motion.div>
      </div>
    )
  }

  if (!isAuthenticated && pathname !== "/login") {
    return null
  }

  return <>{children}</>
}
